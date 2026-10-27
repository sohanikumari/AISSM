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

export interface SimApi {
  seedDemo(): Promise<void>;
  runMatching(donationId?: string): Promise<any>;
  runClaimExpiry(): Promise<any>;
  runListingClosure(): Promise<any>;
  runExpirySweeper(): Promise<any>;
  setZeroVolunteers(enabled: boolean): Promise<any>;
}

export interface Api {
  serverNow(): Promise<string>;
  me(): Promise<User>;
  login(email: string): Promise<User>;
  register(input: { displayName: string; email: string; role: Role; helperOptIn?: boolean }): Promise<User>;
  setAvailability(a: { isAvailable: boolean; capacityQty: number; capacityUnit: string; hasColdBag: boolean; radiusKm: number }): Promise<void>;
  getAvailability(): Promise<any>;
  listDonations(q?: { mine?: boolean; status?: DonationStatus }): Promise<Donation[]>;
  getDonation(id: string): Promise<{ donation: Donation; tasks: DeliveryTask[]; events: DeliveryEvent[] }>;
  createDonation(input: any): Promise<Donation>;
  switchToOpenGate(donationId: string, input: { opensAtUtc: string; closesAtUtc: string; instructions?: string; venue?: string }): Promise<OpenGateListing>;
  availableTasks(): Promise<DeliveryTask[]>;
  getTask(id: string): Promise<{ task: DeliveryTask; events: DeliveryEvent[] }>;
  claimTask(id: string): Promise<DeliveryTask>;
  acknowledgeTask(id: string): Promise<DeliveryTask>;
  confirmPickup(id: string, qty: number): Promise<DeliveryTask>;
  confirmDelivery(id: string, qty: number): Promise<DeliveryTask>;
  verifyReceipt(id: string, qty: number, note?: string): Promise<{ task: DeliveryTask; credits: LedgerEntry[] }>;
  acceptReroute(taskId: string, proposalId: string): Promise<DeliveryTask>;
  declineReroute(taskId: string, reason: string): Promise<DeliveryTask>;
  listSites(q?: { category?: string; status?: SiteStatus }): Promise<ReceivingSite[]>;
  getSite(id: string): Promise<ReceivingSite>;
  setSiteStatus(id: string, status: SiteStatus, confirm?: boolean): Promise<{ site: ReceivingSite; affectedTasks: DeliveryTask[] }>;
  setSiteDemand(id: string, d: { category: string; unit: string; demandQty: number }): Promise<ReceivingSite>;
  setSiteCapability(id: string, c: Capability, available: boolean): Promise<ReceivingSite>;
  listOpenGate(): Promise<OpenGateListing[]>;
  getOpenGate(id: string): Promise<OpenGateListing>;
  recordHandout(listingId: string, qty: number): Promise<OpenGateListing>;
  notifications(): Promise<Notification[]>;
  markRead(ids: string[]): Promise<void>;
  credits(): Promise<{ totals: Record<'DONOR' | 'VOLUNTEER' | 'HELPER', number>; entries: LedgerEntry[] }>;
  leaderboard(type: 'DONOR' | 'VOLUNTEER' | 'HELPER'): Promise<LeaderboardRank[]>;
  audit(q?: any): Promise<AuditLog[]>;
  events(donationId?: string, taskId?: string): Promise<DeliveryEvent[]>;
  sim: SimApi;
}
