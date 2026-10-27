import { Api, SimApi } from './client';
import { getSeedData } from './seed';
import {
  User,
  Donation,
  DeliveryTask,
  ReceivingSite,
  OpenGateListing,
  LedgerEntry,
  LeaderboardRank,
  Notification,
  AuditLog,
  DeliveryEvent,
  Role,
  Capability,
  SiteStatus,
  DonationStatus,
} from './types';
import { mockRealtime } from '../realtime/mockRealtime';

export class MockApi implements Api {
  private users: Map<string, User> = new Map();
  private sites: Map<string, ReceivingSite> = new Map();
  private donations: Map<string, Donation> = new Map();
  private tasks: Map<string, DeliveryTask> = new Map();
  private openGateListings: Map<string, OpenGateListing> = new Map();
  private ledger: LedgerEntry[] = [];
  private notifs: Notification[] = [];
  private auditLogs: AuditLog[] = [];
  private deliveryEvents: DeliveryEvent[] = [];
  private currentUser: User;
  private riderAvail: Map<string, any> = new Map();
  private nextEventId = 1;

  constructor() {
    this.init();
    this.currentUser = this.users.get('admin1') || Array.from(this.users.values())[0];
  }

  private init() {
    this.users.clear();
    this.sites.clear();
    this.donations.clear();
    this.tasks.clear();
    this.openGateListings.clear();
    this.ledger = [];
    this.notifs = [];
    this.auditLogs = [];
    this.deliveryEvents = [];

    const seed = getSeedData();
    for (const u of seed.users) this.users.set(u.id, u);
    for (const s of seed.sites) this.sites.set(s.id, s);
    for (const d of seed.donations) this.donations.set(d.id, d);

    // Initial rider profiles
    ['rider1', 'rider2', 'rider3', 'rider4'].forEach((rId) => {
      this.riderAvail.set(rId, {
        userId: rId,
        isAvailable: true,
        capacityQty: 40,
        capacityUnit: 'meals',
        hasColdBag: rId === 'rider1' || rId === 'rider3',
        radiusKm: 15,
      });
    });

    this.currentUser = this.users.get('donor1')!;
  }

  async serverNow(): Promise<string> {
    return new Date().toISOString();
  }

  async me(): Promise<User> {
    return this.currentUser;
  }

  async login(email: string): Promise<User> {
    const user = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found with this email');
    this.currentUser = user;
    return user;
  }

  async register(input: { displayName: string; email: string; role: Role; helperOptIn?: boolean }): Promise<User> {
    const newUser: User = {
      id: `user_${Date.now()}`,
      displayName: input.displayName,
      email: input.email,
      roles: [input.role],
      activeRole: input.role,
      helperOptIn: input.helperOptIn,
    };
    this.users.set(newUser.id, newUser);
    this.currentUser = newUser;
    return newUser;
  }

  async setAvailability(a: any): Promise<void> {
    this.riderAvail.set(this.currentUser.id, a);
  }

  async getAvailability(): Promise<any> {
    return this.riderAvail.get(this.currentUser.id) || null;
  }

  async listDonations(q?: { mine?: boolean; status?: DonationStatus }): Promise<Donation[]> {
    let list = Array.from(this.donations.values());
    if (q?.status) list = list.filter((d) => d.status === q.status);
    if (q?.mine) list = list.filter((d) => d.donorId === this.currentUser.id);
    list.sort((a, b) => new Date(a.expiryUtc).getTime() - new Date(b.expiryUtc).getTime());
    return list;
  }

  async getDonation(id: string): Promise<{ donation: Donation; tasks: DeliveryTask[]; events: DeliveryEvent[] }> {
    const donation = this.donations.get(id);
    if (!donation) throw new Error('Donation not found');
    const tasks = Array.from(this.tasks.values()).filter((t) => t.donationId === id);
    const events = this.deliveryEvents.filter((e) => e.donationId === id);
    return { donation, tasks, events };
  }

  async createDonation(input: any): Promise<Donation> {
    const donId = `don_${Date.now()}`;
    const now = new Date().toISOString();
    const donation: Donation = {
      id: donId,
      donorId: this.currentUser.id,
      donorName: this.currentUser.displayName,
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
      targetSiteId: input.targetSiteId,
      targetSiteName: input.targetSiteName,
      createdAtUtc: now,
      updatedAtUtc: now,
    };

    this.donations.set(donation.id, donation);
    if (donation.mode === 'VOLUNTEER') {
      await this.sim.runMatching(donation.id);

      // --- Push real-time events and notifications for riders/helpers ---
      const tasksForDon = Array.from(this.tasks.values()).filter((t) => t.donationId === donation.id);
      for (const task of tasksForDon) {
        const title = `🚚 New task: ${task.quantity} ${task.unit} → ${task.siteName}`;
        const body = `${this.currentUser.displayName} posted ${donation.category.replace(/_/g, ' ')}. Claim it before it expires!`;

        // Emit socket-style event for any subscribed frontend component
        mockRealtime.emit('task.available', {
          taskId: task.id,
          donationId: donation.id,
          quantity: task.quantity,
          unit: task.unit,
          siteName: task.siteName,
          donorName: this.currentUser.displayName,
          category: donation.category,
          expiryUtc: donation.expiryUtc,
          title,
          body,
        });

        // Seed notifications for all rider / helper user ids
        const riderHelperIds = Array.from(this.users.values())
          .filter((u) => u.roles.some((r) => r === 'RIDER' || r === 'HELPER'))
          .map((u) => u.id);

        for (const uid of riderHelperIds) {
          this.notifs.unshift({
            id: `notif_${task.id}_${uid}`,
            userId: uid,
            type: 'TASK_AVAILABLE' as any,
            title,
            body,
            entityType: 'task',
            entityId: task.id,
            createdAtUtc: new Date().toISOString(),
          });
        }
      }

      // Also broadcast a donation-level event
      mockRealtime.emit('donation.created', {
        donationId: donation.id,
        donorName: this.currentUser.displayName,
        category: donation.category,
        quantity: donation.quantity,
        unit: donation.unit,
      });
    }
    return donation;
  }

  async switchToOpenGate(donationId: string, input: any): Promise<OpenGateListing> {
    const donation = this.donations.get(donationId);
    if (!donation) throw new Error('Donation not found');

    donation.mode = 'OPEN_GATE';
    donation.status = 'OPEN_GATE';
    const remaining = donation.quantity - donation.deliveredQty;

    const listing: OpenGateListing = {
      id: `gate_${Date.now()}`,
      donationId,
      venue: input.venue || donation.pickup.address,
      lat: donation.pickup.lat,
      lng: donation.pickup.lng,
      opensAtUtc: input.opensAtUtc,
      closesAtUtc: input.closesAtUtc,
      remainingQty: remaining,
      totalQty: remaining,
      unit: donation.unit,
      instructions: input.instructions || 'Direct walk-in distribution point.',
      status: 'ACTIVE',
      createdAtUtc: new Date().toISOString(),
    };

    this.openGateListings.set(listing.id, listing);
    return listing;
  }

  async availableTasks(): Promise<DeliveryTask[]> {
    const tasks = Array.from(this.tasks.values()).filter((t) => t.status === 'OPEN');
    tasks.sort((a, b) => new Date(a.expiryDeadlineUtc).getTime() - new Date(b.expiryDeadlineUtc).getTime());
    return tasks;
  }

  async getTask(id: string): Promise<{ task: DeliveryTask; events: DeliveryEvent[] }> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    const events = this.deliveryEvents.filter((e) => e.taskId === id);
    return { task, events };
  }

  async claimTask(id: string): Promise<DeliveryTask> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'OPEN') {
      const err: any = new Error('Someone else just claimed this task.');
      err.code = 'ALREADY_CLAIMED';
      throw err;
    }

    const avail = this.riderAvail.get(this.currentUser.id);
    if (avail && task.quantity > avail.capacityQty) {
      const err: any = new Error(`Quantity ${task.quantity} exceeds your capacity (${avail.capacityQty}).`);
      err.code = 'CAPACITY_EXCEEDED';
      throw err;
    }

    const now = new Date();
    task.status = 'CLAIMED';
    task.claimedBy = this.currentUser.id;
    task.claimedByAlias = this.currentUser.displayName;
    task.claimExpiresAtUtc = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    task.updatedAtUtc = now.toISOString();

    return task;
  }

  async acknowledgeTask(id: string): Promise<DeliveryTask> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    const now = new Date();
    task.status = 'ACKNOWLEDGED';
    task.pickupDeadlineUtc = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    task.updatedAtUtc = now.toISOString();
    return task;
  }

  async confirmPickup(id: string, qty: number): Promise<DeliveryTask> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    task.status = 'IN_TRANSIT';
    task.pickedUpQty = qty;
    task.updatedAtUtc = new Date().toISOString();

    const don = this.donations.get(task.donationId);
    if (don && don.status !== 'IN_PROGRESS' && don.status !== 'COMPLETED') {
      don.status = 'IN_PROGRESS';
    }
    return task;
  }

  async confirmDelivery(id: string, qty: number): Promise<DeliveryTask> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    task.status = 'DELIVERED';
    task.deliveredQty = qty;
    task.updatedAtUtc = new Date().toISOString();
    return task;
  }

  async verifyReceipt(id: string, qty: number, note?: string): Promise<{ task: DeliveryTask; credits: LedgerEntry[] }> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    task.status = 'DELIVERED_VERIFIED';
    task.verifiedQty = qty;
    task.updatedAtUtc = new Date().toISOString();

    const site = this.sites.get(task.siteId);
    if (site) {
      const d = site.demand.find((item) => item.category === task.category);
      if (d) {
        d.reservedQty = Math.max(0, d.reservedQty - task.quantity);
        d.receivedQty += qty;
      }
    }

    const don = this.donations.get(task.donationId);
    if (don) {
      don.deliveredQty += qty;
      const tasks = Array.from(this.tasks.values()).filter((t) => t.donationId === don.id);
      if (tasks.every((t) => t.status === 'DELIVERED_VERIFIED')) {
        don.status = 'COMPLETED';
      }
    }

    const entries: LedgerEntry[] = [];
    if (task.claimedBy) {
      const isHelper = this.currentUser.roles.includes('HELPER');
      const entry: LedgerEntry = {
        id: `cr_${Date.now()}`,
        userId: task.claimedBy,
        creditType: isHelper ? 'HELPER' : 'VOLUNTEER',
        eventType: 'DELIVERY_VERIFIED',
        amount: isHelper ? 38 : 15,
        multiplier: isHelper ? 1.5 : 1.0,
        subjectId: task.id,
        createdAtUtc: new Date().toISOString(),
        description: `Delivered ${qty} to ${task.siteName}`,
      };
      this.ledger.unshift(entry);
      entries.push(entry);
    }

    return { task, credits: entries };
  }

  async acceptReroute(taskId: string, proposalId: string): Promise<DeliveryTask> {
    const task = this.tasks.get(taskId);
    if (!task || !task.reroute) throw new Error('No reroute proposal');
    const targetSite = this.sites.get(task.reroute.newSiteId)!;
    task.siteId = targetSite.id;
    task.siteName = targetSite.name;
    task.destinationLocation = { lat: targetSite.lat, lng: targetSite.lng, address: targetSite.address };
    task.status = 'IN_TRANSIT';
    task.reroute = undefined;
    return task;
  }

  async declineReroute(taskId: string, reason: string): Promise<DeliveryTask> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    task.status = 'FAILED_NO_DESTINATION';
    task.reroute = undefined;
    return task;
  }

  async listSites(q?: any): Promise<ReceivingSite[]> {
    let list = Array.from(this.sites.values());
    if (q?.status) list = list.filter((s) => s.status === q.status);
    return list;
  }

  async getSite(id: string): Promise<ReceivingSite> {
    const s = this.sites.get(id);
    if (!s) throw new Error('Site not found');
    return s;
  }

  async setSiteStatus(id: string, status: SiteStatus): Promise<{ site: ReceivingSite; affectedTasks: DeliveryTask[] }> {
    const site = this.sites.get(id);
    if (!site) throw new Error('Site not found');
    site.status = status;

    const affected: DeliveryTask[] = [];
    if (status === 'FULL' || status === 'CLOSED') {
      for (const task of this.tasks.values()) {
        if (task.siteId === id && ['CLAIMED', 'ACKNOWLEDGED', 'PICKED_UP', 'IN_TRANSIT'].includes(task.status)) {
          const alternate = Array.from(this.sites.values()).find(
            (s) => s.id !== id && s.status === 'OPEN' && s.acceptedCategories.includes(task.category)
          );
          if (alternate) {
            task.status = 'REROUTE_PROPOSED';
            task.reroute = {
              proposalId: `prop_${Date.now()}`,
              newSiteId: alternate.id,
              newSiteName: alternate.name,
              etaMinutes: 18,
              etaSource: 'mock',
              deadlineHeadroomMinutes: 45,
              alternates: [],
              proposedAtUtc: new Date().toISOString(),
            };
          } else {
            task.status = 'FAILED_NO_DESTINATION';
          }
          affected.push(task);
        }
      }
    }

    return { site, affectedTasks: affected };
  }

  async setSiteDemand(id: string, d: { category: string; unit: string; demandQty: number }): Promise<ReceivingSite> {
    const s = this.sites.get(id);
    if (!s) throw new Error('Site not found');
    let item = s.demand.find((item) => item.category === d.category);
    if (item) item.demandQty = d.demandQty;
    else s.demand.push({ category: d.category, unit: d.unit, demandQty: d.demandQty, reservedQty: 0, receivedQty: 0 });
    return s;
  }

  async setSiteCapability(id: string, c: Capability, available: boolean): Promise<ReceivingSite> {
    const s = this.sites.get(id);
    if (!s) throw new Error('Site not found');
    s.capabilities[c] = available;
    return s;
  }

  async listOpenGate(): Promise<OpenGateListing[]> {
    return Array.from(this.openGateListings.values());
  }

  async getOpenGate(id: string): Promise<OpenGateListing> {
    const item = this.openGateListings.get(id);
    if (!item) throw new Error('Listing not found');
    return item;
  }

  async recordHandout(listingId: string, qty: number): Promise<OpenGateListing> {
    const item = this.openGateListings.get(listingId);
    if (!item) throw new Error('Listing not found');
    item.remainingQty = Math.max(0, item.remainingQty - qty);
    if (item.remainingQty === 0) item.status = 'CLOSED';
    return item;
  }

  async notifications(): Promise<Notification[]> {
    // Return notifications relevant to the current user
    return this.notifs.filter((n) => n.userId === this.currentUser.id);
  }

  async markRead(ids: string[]): Promise<void> {
    const now = new Date().toISOString();
    this.notifs.forEach((n) => {
      if (ids.includes(n.id)) n.readAtUtc = now;
    });
  }

  async credits(): Promise<{ totals: Record<'DONOR' | 'VOLUNTEER' | 'HELPER', number>; entries: LedgerEntry[] }> {
    const userEntries = this.ledger.filter((e) => e.userId === this.currentUser.id);
    const totals = { DONOR: 0, VOLUNTEER: 0, HELPER: 0 };
    for (const e of userEntries) totals[e.creditType] += e.amount;
    return { totals, entries: userEntries };
  }

  async leaderboard(type: 'DONOR' | 'VOLUNTEER' | 'HELPER'): Promise<LeaderboardRank[]> {
    return [
      { rank: 1, userId: 'rider1', displayName: 'Rahul (Rider 1)', score: 90, creditType: type },
      { rank: 2, userId: 'rider2', displayName: 'Priya (Rider 2)', score: 60, creditType: type },
      { rank: 3, userId: 'helper1', displayName: 'Vikas (Emergency Helper)', score: 45, creditType: type },
    ];
  }

  async audit(): Promise<AuditLog[]> {
    return this.auditLogs;
  }

  async events(): Promise<DeliveryEvent[]> {
    return this.deliveryEvents;
  }

  sim: SimApi = {
    seedDemo: async () => {
      this.init();
    },
    runMatching: async (donationId?: string) => {
      const don = this.donations.get(donationId || 'don_sharma_180');
      if (!don) return;

      // If targeted direct donation to a specific shelter, handle direct intake
      if (don.targetSiteId) {
        const targetSite = this.sites.get(don.targetSiteId);
        if (targetSite) {
          let d = targetSite.demand.find((item) => item.category === don.category);
          if (!d) {
            d = { category: don.category, unit: don.unit, demandQty: don.quantity, reservedQty: 0, receivedQty: 0 };
            targetSite.demand.push(d);
          } else if (d.demandQty < d.reservedQty + don.quantity) {
            d.demandQty = d.reservedQty + don.quantity;
          }
        }
      }

      let sitesList = Array.from(this.sites.values()).filter((s) => s.status === 'OPEN' && s.verification === 'VERIFIED');
      if (don.targetSiteId) {
        sitesList = sitesList.filter((s) => s.id === don.targetSiteId);
      }
      let remaining = don.quantity - don.allocatedQty;

      for (const site of sitesList) {
        if (remaining <= 0) break;
        const d = site.demand.find((item) => item.category === don.category);
        if (!d) continue;
        let siteAvail = d.demandQty - d.reservedQty;

        while (siteAvail > 0 && remaining > 0) {
          const slice = Math.min(40, siteAvail, remaining);
          const task: DeliveryTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            donationId: don.id,
            siteId: site.id,
            siteName: site.name,
            destinationLocation: { lat: site.lat, lng: site.lng, address: site.address },
            pickupLocation: don.pickup,
            category: don.category,
            quantity: slice,
            unit: don.unit,
            status: 'OPEN',
            expiryDeadlineUtc: don.expiryUtc,
            etaMinutes: 15,
            etaSource: 'mock',
            requiredCapabilities: don.requiredCapabilities,
            assignmentReason: { considered: sitesList.length, rejections: [], note: `Allocated to ${site.name}` },
            createdAtUtc: new Date().toISOString(),
            updatedAtUtc: new Date().toISOString(),
          };

          this.tasks.set(task.id, task);
          d.reservedQty += slice;
          don.allocatedQty += slice;
          siteAvail -= slice;
          remaining -= slice;
        }
      }

      if (don.allocatedQty >= don.quantity) don.status = 'ALLOCATED';
      else if (don.allocatedQty > 0) don.status = 'PARTIALLY_ALLOCATED';
    },
    runClaimExpiry: async () => {
      const now = new Date();
      for (const t of this.tasks.values()) {
        if (t.status === 'CLAIMED' && t.claimExpiresAtUtc && new Date(t.claimExpiresAtUtc) <= now) {
          t.status = 'OPEN';
          t.claimedBy = undefined;
          t.claimExpiresAtUtc = undefined;
        }
      }
    },
    runListingClosure: async () => {
      for (const l of this.openGateListings.values()) {
        if (l.remainingQty <= 0) l.status = 'CLOSED';
      }
    },
    runExpirySweeper: async () => {
      const now = new Date();
      for (const d of this.donations.values()) {
        if (new Date(d.expiryUtc) <= now && d.status !== 'COMPLETED') {
          d.status = 'EXPIRED_UNDELIVERED';
        }
      }
    },
    setZeroVolunteers: async (enabled: boolean) => {
      for (const r of this.riderAvail.values()) {
        r.isAvailable = !enabled;
      }
    },
  };
}

export const mockApi = new MockApi();
