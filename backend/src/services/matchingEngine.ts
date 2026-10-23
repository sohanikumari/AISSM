import { db } from '../db';
import { routeEstimator } from './routeEstimator';
import {
  Donation,
  DeliveryTask,
  ReceivingSite,
  RejectionReason,
  Capability,
} from '../../../shared/src/types';
import { ITEM_CATEGORIES, SYSTEM_DEFAULTS } from '../../../shared/src/constants';

export interface MatchingResult {
  donationId: string;
  tasksCreated: DeliveryTask[];
  allocatedQuantity: number;
  remainingQuantity: number;
  status: Donation['status'];
  rejectionReasons: RejectionReason[];
  note: string;
}

export class MatchingEngine {
  /**
   * Run matching for a donation.
   * Enforces INV-1, INV-3, INV-4, INV-5, INV-6.
   */
  matchDonation(donationId: string): MatchingResult {
    const donation = db.donations.get(donationId);
    if (!donation) {
      throw new Error(`Donation ${donationId} not found`);
    }

    if (donation.status === 'COMPLETED' || donation.status === 'CANCELLED' || donation.status === 'EXPIRED_UNDELIVERED') {
      return {
        donationId,
        tasksCreated: [],
        allocatedQuantity: donation.allocatedQty,
        remainingQuantity: donation.quantity - donation.allocatedQty,
        status: donation.status,
        rejectionReasons: [],
        note: `Donation is already in terminal state ${donation.status}`,
      };
    }

    const itemCategory = ITEM_CATEGORIES.find((c) => c.code === donation.category);
    const requiredCapabilities: Capability[] = [
      ...(itemCategory?.requiredCapabilities || []),
      ...(donation.requiredCapabilities || []),
    ];

    const unallocatedQty = donation.quantity - donation.allocatedQty;
    if (unallocatedQty <= 0) {
      donation.status = 'ALLOCATED';
      donation.updatedAtUtc = new Date().toISOString();
      return {
        donationId,
        tasksCreated: [],
        allocatedQuantity: donation.allocatedQty,
        remainingQuantity: 0,
        status: 'ALLOCATED',
        rejectionReasons: [],
        note: 'All quantity already allocated',
      };
    }

    // Sort sites by proximity / ETA from pickup location
    const eligibleSites: { site: ReceivingSite; unmetDemand: number; etaMinutes: number }[] = [];
    const rejections: RejectionReason[] = [];

    const now = new Date();
    const expiryTime = new Date(donation.expiryUtc).getTime();
    const safetyBufferMs = SYSTEM_DEFAULTS.SAFETY_BUFFER_MINUTES * 60 * 1000;

    for (const site of db.sites.values()) {
      // 1. Site Status Check
      if (site.status !== 'OPEN') {
        rejections.push({
          siteId: site.id,
          code: 'SITE_NOT_OPEN',
          description: `Site "${site.name}" is currently ${site.status}`,
        });
        continue;
      }

      // 2. Verification Check
      if (site.verification !== 'VERIFIED') {
        rejections.push({
          siteId: site.id,
          code: 'SITE_NOT_VERIFIED',
          description: `Site "${site.name}" verification is ${site.verification}`,
        });
        continue;
      }

      // 3. Category Accepted Check
      if (!site.acceptedCategories.includes(donation.category)) {
        rejections.push({
          siteId: site.id,
          code: 'CATEGORY_NOT_ACCEPTED',
          description: `Site "${site.name}" does not accept category ${donation.category}`,
        });
        continue;
      }

      // 4. Safety Capabilities Check (INV-6)
      const missingCapabilities = requiredCapabilities.filter((c) => !site.capabilities[c]);
      if (missingCapabilities.length > 0) {
        rejections.push({
          siteId: site.id,
          code: 'INCOMPATIBLE_SITE',
          description: `Site "${site.name}" lacks required capabilities: ${missingCapabilities.join(', ')}`,
        });
        continue;
      }

      // 5. Unmet Demand Check (INV-5)
      const demandItem = site.demand.find((d) => d.category === donation.category);
      if (!demandItem) {
        rejections.push({
          siteId: site.id,
          code: 'NO_DEMAND_RECORD',
          description: `Site "${site.name}" has no registered demand for ${donation.category}`,
        });
        continue;
      }

      const unmet = demandItem.demandQty - demandItem.reservedQty;
      if (unmet <= 0) {
        rejections.push({
          siteId: site.id,
          code: 'DEMAND_SATISFIED',
          description: `Site "${site.name}" already has demand fully reserved/satisfied`,
        });
        continue;
      }

      // 6. ETA vs Expiry Buffer Check (INV-1)
      const estimate = routeEstimator.estimate(donation.pickup, {
        lat: site.lat,
        lng: site.lng,
        address: site.address,
      });

      const arrivalTime = now.getTime() + estimate.etaMinutes * 60 * 1000;
      if (arrivalTime > expiryTime - safetyBufferMs) {
        rejections.push({
          siteId: site.id,
          code: 'ETA_EXCEEDS_DEADLINE',
          description: `Travel time to "${site.name}" (${estimate.etaMinutes}m) violates safety buffer before expiry`,
        });
        continue;
      }

      eligibleSites.push({
        site,
        unmetDemand: unmet,
        etaMinutes: estimate.etaMinutes,
      });
    }

    // Sort eligible sites by shortest ETA
    eligibleSites.sort((a, b) => a.etaMinutes - b.etaMinutes);

    if (eligibleSites.length === 0) {
      const isCritical = (expiryTime - now.getTime()) / (60 * 1000) <= 60;
      const newStatus = isCritical ? 'EXCEPTION' : 'NEEDS_ASSISTANCE';
      donation.status = newStatus;
      donation.exceptionReason =
        rejections.length > 0
          ? `No compatible open site found within safe arrival window. Reasons: ${rejections.map((r) => r.code).join(', ')}`
          : 'No candidate sites available.';
      donation.updatedAtUtc = now.toISOString();

      db.addAuditLog({
        actorKind: 'system',
        action: 'MATCHING_FAILED',
        entityType: 'donation',
        entityId: donation.id,
        beforeState: { status: 'PUBLISHED' },
        afterState: { status: newStatus, exceptionReason: donation.exceptionReason },
        reason: donation.exceptionReason,
      });

      return {
        donationId,
        tasksCreated: [],
        allocatedQuantity: donation.allocatedQty,
        remainingQuantity: unallocatedQty,
        status: newStatus,
        rejectionReasons: rejections,
        note: donation.exceptionReason,
      };
    }

    // Determine max task size based on rider capacity standard (default 40 meals)
    const MAX_TASK_CAPACITY = 40;
    const tasksCreated: DeliveryTask[] = [];
    let currentQtyToAllocate = unallocatedQty;

    for (const eligible of eligibleSites) {
      if (currentQtyToAllocate <= 0) break;

      const site = eligible.site;
      const demandItem = site.demand.find((d) => d.category === donation.category)!;
      const availableSiteCapacity = demandItem.demandQty - demandItem.reservedQty;

      let allocToSite = Math.min(currentQtyToAllocate, availableSiteCapacity);

      // Multi-task splitting: slice into batches of up to MAX_TASK_CAPACITY
      while (allocToSite > 0) {
        const sliceQty = Math.min(allocToSite, MAX_TASK_CAPACITY);
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const estimate = routeEstimator.estimate(donation.pickup, {
          lat: site.lat,
          lng: site.lng,
          address: site.address,
        });

        const task: DeliveryTask = {
          id: taskId,
          donationId: donation.id,
          siteId: site.id,
          siteName: site.name,
          destinationLocation: { lat: site.lat, lng: site.lng, address: site.address },
          pickupLocation: donation.pickup,
          category: donation.category,
          quantity: sliceQty,
          unit: donation.unit,
          status: 'OPEN',
          expiryDeadlineUtc: donation.expiryUtc,
          etaMinutes: estimate.etaMinutes,
          etaSource: estimate.etaSource,
          requiredCapabilities,
          requiresColdBag: !!itemCategory?.requiresColdChain,
          handlingInstructions: donation.handlingInstructions,
          assignmentReason: {
            considered: db.sites.size,
            rejections,
            note: `Assigned to ${site.name} (unmet demand: ${demandItem.demandQty - demandItem.reservedQty}, ETA: ${estimate.etaMinutes}m)`,
          },
          createdAtUtc: now.toISOString(),
          updatedAtUtc: now.toISOString(),
        };

        // Update site reserved quantity in DB transaction
        demandItem.reservedQty += sliceQty;
        donation.allocatedQty += sliceQty;
        currentQtyToAllocate -= sliceQty;
        allocToSite -= sliceQty;

        db.tasks.set(task.id, task);
        tasksCreated.push(task);

        db.addEvent({
          taskId: task.id,
          donationId: donation.id,
          type: 'task.available',
          actor: 'system',
          payload: { quantity: sliceQty, siteId: site.id, siteName: site.name },
        });
      }
    }

    if (donation.allocatedQty >= donation.quantity) {
      donation.status = 'ALLOCATED';
    } else if (donation.allocatedQty > 0) {
      donation.status = 'PARTIALLY_ALLOCATED';
    } else {
      donation.status = 'NEEDS_ASSISTANCE';
    }
    donation.updatedAtUtc = now.toISOString();

    db.addAuditLog({
      actorKind: 'system',
      action: 'MATCHING_EXECUTED',
      entityType: 'donation',
      entityId: donation.id,
      afterState: {
        allocatedQty: donation.allocatedQty,
        totalQty: donation.quantity,
        tasksCreated: tasksCreated.length,
        status: donation.status,
      },
      reason: `Deterministic dispatch completed. ${tasksCreated.length} delivery tasks generated.`,
    });

    return {
      donationId,
      tasksCreated,
      allocatedQuantity: donation.allocatedQty,
      remainingQuantity: donation.quantity - donation.allocatedQty,
      status: donation.status,
      rejectionReasons: rejections,
      note: `Successfully split and allocated ${donation.allocatedQty}/${donation.quantity} ${donation.unit} across ${tasksCreated.length} tasks.`,
    };
  }
}

export const matchingEngine = new MatchingEngine();
