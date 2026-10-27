import { db } from '../db';
import { routeEstimator } from './routeEstimator';
import { DeliveryTask, RerouteProposal } from '../../../shared/src/types';
import { SYSTEM_DEFAULTS } from '../../../shared/src/constants';

export class RerouteService {
  /**
   * Called when a site status changes to FULL or CLOSED.
   * Evaluates all affected active tasks and generates proposals or failure exceptions.
   */
  handleSiteStatusChange(siteId: string): DeliveryTask[] {
    const site = db.sites.get(siteId);
    if (!site || site.status === 'OPEN') return [];

    // Find non-terminal tasks targeting this site
    const activeTasks = Array.from(db.tasks.values()).filter(
      (t) =>
        t.siteId === siteId &&
        ['CLAIMED', 'ACKNOWLEDGED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status)
    );

    const affectedTasks: DeliveryTask[] = [];

    for (const task of activeTasks) {
      const proposal = this.findFeasibleAlternate(task);
      if (proposal) {
        task.status = 'REROUTE_PROPOSED';
        task.reroute = proposal;
        task.updatedAtUtc = new Date().toISOString();

        db.addEvent({
          taskId: task.id,
          donationId: task.donationId,
          type: 'reroute.proposed',
          actor: 'system',
          payload: { originalSiteId: siteId, proposedSiteId: proposal.newSiteId, etaMinutes: proposal.etaMinutes },
        });

        db.addNotification({
          userId: task.claimedBy || 'system',
          type: 'REROUTE_PROPOSAL',
          title: `Destination Shelter Full: Reroute Suggested`,
          body: `Original site "${site.name}" is now ${site.status}. Proposed reroute to "${proposal.newSiteName}" (${proposal.etaMinutes}m ETA).`,
          entityType: 'task',
          entityId: task.id,
        });
      } else {
        // No feasible destination found (INV-1, INV-6 violation)
        task.status = 'FAILED_NO_DESTINATION';
        task.updatedAtUtc = new Date().toISOString();

        const donation = db.donations.get(task.donationId);
        if (donation) {
          donation.status = 'EXCEPTION';
          donation.exceptionReason = `Task ${task.id} destination "${site.name}" is ${site.status} and no alternate safe shelter satisfies demand, capabilities and time buffer.`;
          donation.updatedAtUtc = new Date().toISOString();
        }

        db.addEvent({
          taskId: task.id,
          donationId: task.donationId,
          type: 'task.failed_no_destination',
          actor: 'system',
          payload: { siteId, siteStatus: site.status },
        });

        db.addAuditLog({
          actorKind: 'system',
          action: 'REROUTE_FAILED_NO_DESTINATION',
          entityType: 'task',
          entityId: task.id,
          reason: `No safe, capacity-respecting alternative available for task ${task.id}`,
        });
      }

      affectedTasks.push(task);
    }

    return affectedTasks;
  }

  findFeasibleAlternate(task: DeliveryTask): RerouteProposal | null {
    const now = new Date();
    const expiryTime = new Date(task.expiryDeadlineUtc).getTime();
    const safetyBufferMs = SYSTEM_DEFAULTS.SAFETY_BUFFER_MINUTES * 60 * 1000;

    const candidates: { siteId: string; siteName: string; etaMinutes: number; headroom: number }[] = [];

    for (const site of db.sites.values()) {
      if (site.id === task.siteId) continue;
      if (site.status !== 'OPEN') continue;
      if (site.verification !== 'VERIFIED') continue;
      if (!site.acceptedCategories.includes(task.category)) continue;

      // Check capabilities (INV-6)
      const lacksCapability = task.requiredCapabilities.some((c) => !site.capabilities[c]);
      if (lacksCapability) continue;

      // Check unmet demand (INV-5)
      const demand = site.demand.find((d) => d.category === task.category);
      if (!demand) continue;
      const availableCapacity = demand.demandQty - demand.reservedQty;
      if (availableCapacity < task.quantity) continue;

      // Check arrival time against expiry deadline buffer (INV-1)
      const estimate = routeEstimator.estimate(task.pickupLocation, {
        lat: site.lat,
        lng: site.lng,
        address: site.address,
      });

      const arrivalTime = now.getTime() + estimate.etaMinutes * 60 * 1000;
      const safeDeadline = expiryTime - safetyBufferMs;
      if (arrivalTime > safeDeadline) continue;

      const headroomMinutes = Math.floor((safeDeadline - arrivalTime) / (60 * 1000));
      candidates.push({
        siteId: site.id,
        siteName: site.name,
        etaMinutes: estimate.etaMinutes,
        headroom: headroomMinutes,
      });
    }

    if (candidates.length === 0) return null;

    // Pick candidate with shortest ETA
    candidates.sort((a, b) => a.etaMinutes - b.etaMinutes);
    const top = candidates[0];

    return {
      proposalId: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      newSiteId: top.siteId,
      newSiteName: top.siteName,
      etaMinutes: top.etaMinutes,
      etaSource: 'mock',
      deadlineHeadroomMinutes: top.headroom,
      alternates: candidates.slice(1).map((c) => ({
        siteId: c.siteId,
        siteName: c.siteName,
        etaMinutes: c.etaMinutes,
      })),
      proposedAtUtc: now.toISOString(),
    };
  }

  acceptReroute(taskId: string, userId: string, proposalId: string): DeliveryTask {
    const task = db.tasks.get(taskId);
    if (!task) throw { code: 'NOT_FOUND', message: 'Task not found' };
    if (task.claimedBy !== userId) throw { code: 'FORBIDDEN', message: 'Unauthorized' };
    if (task.status !== 'REROUTE_PROPOSED' || !task.reroute) {
      throw { code: 'INVALID_STATE_TRANSITION', message: 'No pending reroute proposal for this task' };
    }
    if (task.reroute.proposalId !== proposalId) {
      throw { code: 'VALIDATION_ERROR', message: 'Proposal ID mismatch or expired' };
    }

    const newSite = db.sites.get(task.reroute.newSiteId);
    if (!newSite) throw { code: 'NOT_FOUND', message: 'Target reroute shelter not found' };

    // Release reservation on old site
    const oldSite = db.sites.get(task.siteId);
    if (oldSite) {
      const oldDemand = oldSite.demand.find((d) => d.category === task.category);
      if (oldDemand) {
        oldDemand.reservedQty = Math.max(0, oldDemand.reservedQty - task.quantity);
      }
    }

    // Reserve demand on new site
    const newDemand = newSite.demand.find((d) => d.category === task.category);
    if (newDemand) {
      newDemand.reservedQty += task.quantity;
    }

    task.siteId = newSite.id;
    task.siteName = newSite.name;
    task.destinationLocation = { lat: newSite.lat, lng: newSite.lng, address: newSite.address };
    task.etaMinutes = task.reroute.etaMinutes;
    task.status = 'IN_TRANSIT';
    task.reroute = undefined;
    task.updatedAtUtc = new Date().toISOString();

    db.addEvent({
      taskId: task.id,
      donationId: task.donationId,
      type: 'reroute.resolved',
      actor: userId,
      payload: { status: 'ACCEPTED', newSiteId: newSite.id, newSiteName: newSite.name },
    });

    return task;
  }

  declineReroute(taskId: string, userId: string, reason: string): DeliveryTask {
    const task = db.tasks.get(taskId);
    if (!task) throw { code: 'NOT_FOUND', message: 'Task not found' };
    if (task.claimedBy !== userId) throw { code: 'FORBIDDEN', message: 'Unauthorized' };

    task.status = 'FAILED_NO_DESTINATION';
    task.reroute = undefined;
    task.updatedAtUtc = new Date().toISOString();

    const donation = db.donations.get(task.donationId);
    if (donation) {
      donation.status = 'EXCEPTION';
      donation.exceptionReason = `Rider declined reroute proposal: ${reason}`;
      donation.updatedAtUtc = new Date().toISOString();
    }

    db.addEvent({
      taskId: task.id,
      donationId: task.donationId,
      type: 'reroute.resolved',
      actor: userId,
      payload: { status: 'DECLINED', reason },
    });

    return task;
  }
}

export const rerouteService = new RerouteService();
