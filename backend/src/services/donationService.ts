import { db } from '../db';
import { matchingEngine } from './matchingEngine';
import { Donation, DonationStatus } from '../../../shared/src/types';
import { SYSTEM_DEFAULTS } from '../../../shared/src/constants';

export class DonationService {
  createDonation(donorId: string, donorName: string, input: {
    category: string;
    description: string;
    quantity: number;
    unit: string;
    pickup: { lat: number; lng: number; address: string };
    availableFromUtc: string;
    expiryUtc: string;
    handlingInstructions?: string;
    requiredCapabilities: any[];
    mode?: 'VOLUNTEER' | 'OPEN_GATE';
  }): Donation {
    const now = new Date();
    const expiry = new Date(input.expiryUtc);

    // Minimum lead time check
    const minLeadMs = SYSTEM_DEFAULTS.MIN_EXPIRY_LEAD_MINUTES * 60 * 1000;
    if (expiry.getTime() < now.getTime() + minLeadMs) {
      throw {
        code: 'VALIDATION_ERROR',
        message: `Expiry must be at least ${SYSTEM_DEFAULTS.MIN_EXPIRY_LEAD_MINUTES} minutes into the future`,
      };
    }

    const donationId = `don_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = now.toISOString();

    const donation: Donation = {
      id: donationId,
      donorId,
      donorName,
      category: input.category,
      description: input.description,
      quantity: input.quantity,
      unit: input.unit,
      allocatedQty: 0,
      deliveredQty: 0,
      pickup: input.pickup,
      availableFromUtc: input.availableFromUtc,
      expiryUtc: input.expiryUtc,
      handlingInstructions: input.handlingInstructions,
      requiredCapabilities: input.requiredCapabilities || [],
      mode: input.mode || 'VOLUNTEER',
      status: input.mode === 'OPEN_GATE' ? 'OPEN_GATE' : 'PUBLISHED',
      createdAtUtc: nowIso,
      updatedAtUtc: nowIso,
    };

    db.donations.set(donation.id, donation);

    db.addAuditLog({
      actorKind: 'user',
      actorId: donorId,
      action: 'DONATION_CREATED',
      entityType: 'donation',
      entityId: donation.id,
      afterState: donation,
      reason: 'Donor posted new surplus listing',
    });

    db.addEvent({
      donationId: donation.id,
      type: 'donation.created',
      actor: donorId,
      payload: { quantity: donation.quantity, category: donation.category, mode: donation.mode },
    });

    // If volunteer delivery mode, immediately trigger matching engine
    if (donation.mode === 'VOLUNTEER') {
      matchingEngine.matchDonation(donation.id);
    }

    return donation;
  }

  updateExpiry(donationId: string, newExpiryUtc: string, userId: string): Donation {
    const donation = db.donations.get(donationId);
    if (!donation) throw { code: 'NOT_FOUND', message: 'Donation not found' };

    // INV-9: Declared expiry/use-by is never extended (only permitted to shorten for food safety)
    const currentExpiry = new Date(donation.expiryUtc).getTime();
    const newExpiry = new Date(newExpiryUtc).getTime();

    if (newExpiry > currentExpiry) {
      throw {
        code: 'EXPIRY_EXTENSION_FORBIDDEN',
        message: 'Declared expiry or use-by date cannot be extended after posting',
      };
    }

    donation.expiryUtc = newExpiryUtc;
    donation.updatedAtUtc = new Date().toISOString();

    db.addAuditLog({
      actorKind: 'user',
      actorId: userId,
      action: 'DONATION_EXPIRY_REDUCED',
      entityType: 'donation',
      entityId: donation.id,
      afterState: { expiryUtc: newExpiryUtc },
      reason: 'Shortened safe expiry window',
    });

    return donation;
  }
}

export const donationService = new DonationService();
