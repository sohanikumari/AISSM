import { db } from '../db';

export function runListingClosureWorker(): { closedCount: number } {
  const now = new Date();
  let count = 0;

  for (const listing of db.openGateListings.values()) {
    if (listing.status === 'ACTIVE') {
      const closesAt = new Date(listing.closesAtUtc);
      if (closesAt.getTime() <= now.getTime() || listing.remainingQty <= 0) {
        listing.status = 'CLOSED';
        count++;

        const donation = db.donations.get(listing.donationId);
        if (donation && donation.status === 'OPEN_GATE') {
          donation.status = listing.remainingQty === 0 ? 'COMPLETED' : 'CLOSED_WINDOW_ENDED';
          donation.updatedAtUtc = now.toISOString();
        }

        db.addEvent({
          donationId: listing.donationId,
          type: 'openGate.closed',
          payload: { listingId: listing.id, reason: listing.remainingQty === 0 ? 'SUPPLY_EXHAUSTED' : 'WINDOW_ENDED' },
        });
      }
    }
  }

  return { closedCount: count };
}
