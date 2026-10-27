import { db } from '../db';
import { OpenGateListing } from '../../../shared/src/types';

export class OpenGateService {
  switchToOpenGate(donationId: string, input: { opensAtUtc: string; closesAtUtc: string; instructions?: string; venue?: string }): OpenGateListing {
    const donation = db.donations.get(donationId);
    if (!donation) throw { code: 'NOT_FOUND', message: 'Donation not found' };

    donation.mode = 'OPEN_GATE';
    donation.status = 'OPEN_GATE';
    donation.updatedAtUtc = new Date().toISOString();

    const listingId = `gate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const remainingQty = donation.quantity - donation.deliveredQty;

    const listing: OpenGateListing = {
      id: listingId,
      donationId,
      venue: input.venue || donation.pickup.address,
      lat: donation.pickup.lat,
      lng: donation.pickup.lng,
      opensAtUtc: input.opensAtUtc,
      closesAtUtc: input.closesAtUtc,
      remainingQty,
      totalQty: remainingQty,
      unit: donation.unit,
      instructions: input.instructions || 'Direct walk-in collection for individuals and families in need.',
      status: 'ACTIVE',
      createdAtUtc: new Date().toISOString(),
    };

    db.openGateListings.set(listing.id, listing);

    db.addAuditLog({
      actorKind: 'user',
      actorId: donation.donorId,
      action: 'SWITCH_TO_OPEN_GATE',
      entityType: 'open_gate',
      entityId: listing.id,
      afterState: listing,
      reason: 'Switched distribution mode to walk-in Open Gate',
    });

    db.addEvent({
      donationId: donation.id,
      type: 'openGate.updated',
      payload: { listingId: listing.id, remainingQty },
    });

    return listing;
  }

  recordHandout(listingId: string, quantity: number, notes?: string): OpenGateListing {
    const listing = db.openGateListings.get(listingId);
    if (!listing) throw { code: 'NOT_FOUND', message: 'Open Gate listing not found' };
    if (listing.status !== 'ACTIVE') {
      throw { code: 'LISTING_CLOSED', message: 'This Open Gate window has closed' };
    }

    if (quantity > listing.remainingQty) {
      throw { code: 'VALIDATION_ERROR', message: `Cannot record handout of ${quantity}; only ${listing.remainingQty} remaining` };
    }

    listing.remainingQty -= quantity;
    if (listing.remainingQty === 0) {
      listing.status = 'CLOSED';
    }

    const donation = db.donations.get(listing.donationId);
    if (donation) {
      donation.deliveredQty += quantity;
      if (listing.remainingQty === 0) {
        donation.status = 'COMPLETED';
      }
      donation.updatedAtUtc = new Date().toISOString();
    }

    db.addEvent({
      donationId: listing.donationId,
      type: 'openGate.handout',
      payload: { listingId, quantity, remainingQty: listing.remainingQty, notes },
    });

    return listing;
  }
}

export const openGateService = new OpenGateService();
