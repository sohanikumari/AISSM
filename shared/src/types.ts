export type Role = 'DONOR' | 'RIDER' | 'HELPER' | 'NGO_OPERATOR' | 'ADMIN';

export type Urgency = 'NORMAL' | 'URGENT' | 'CRITICAL' | 'EXPIRED';

export type SiteStatus = 'OPEN' | 'FULL' | 'CLOSED';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type TaskStatus =
  | 'OPEN'
  | 'CLAIMED'
  | 'ACKNOWLEDGED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'REROUTE_PROPOSED'
  | 'DELIVERED'
  | 'DELIVERED_VERIFIED'
  | 'FAILED_NO_DESTINATION'
  | 'EXPIRED'
  | 'CANCELLED';

export type DonationStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'PARTIALLY_ALLOCATED'
  | 'ALLOCATED'
  | 'NEEDS_ASSISTANCE'
  | 'IN_PROGRESS'
  | 'OPEN_GATE'
  | 'COMPLETED'
  | 'CLOSED_WINDOW_ENDED'
  | 'EXCEPTION'
  | 'CANCELLED'
  | 'EXPIRED_UNDELIVERED';

export type DistributionMode = 'VOLUNTEER' | 'OPEN_GATE';

export type Capability =
  | 'CLEAN_WATER'
  | 'COOKING_FUEL'
  | 'REFRIGERATION'
  | 'INFANT_CARE_PROCEDURE'
  | 'DRY_STORAGE';

export type EtaSource = 'provider' | 'mock' | 'mock_fallback';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: Role[];
  activeRole: Role;
  helperOptIn?: boolean;
  phone?: string;
  token?: string;
}

export interface RiderAvailability {
  userId: string;
  isAvailable: boolean;
  capacityQty: number;
  capacityUnit: string;
  hasColdBag: boolean;
  radiusKm: number;
  currentLocation?: Location;
  windowFromUtc?: string;
  windowUntilUtc?: string;
  updatedAtUtc: string;
}

export interface ItemCategory {
  code: string;
  label: string;
  requiredCapabilities: Capability[];
  requiresColdChain: boolean;
  helperAllowed: boolean;
  handlingNotes?: string;
}

export interface SiteDemandItem {
  category: string;
  unit: string;
  demandQty: number;
  reservedQty: number;
  receivedQty: number;
}

export interface ReceivingSite {
  id: string;
  organizationId: string;
  orgName: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: SiteStatus;
  verification: VerificationStatus;
  acceptedCategories: string[];
  capabilities: Record<Capability, boolean>;
  demand: SiteDemandItem[];
  contactPhone?: string;
  contactEmail?: string;
  updatedAtUtc?: string;
}

export interface RejectionReason {
  siteId?: string;
  riderId?: string;
  code: string;
  description: string;
}

export interface AssignmentReason {
  considered: number;
  rejections: RejectionReason[];
  note: string;
  matchScore?: number;
}

export interface RerouteProposal {
  proposalId: string;
  newSiteId: string;
  newSiteName: string;
  etaMinutes: number;
  etaSource: EtaSource;
  deadlineHeadroomMinutes: number;
  alternates: { siteId: string; siteName: string; etaMinutes: number }[];
  proposedAtUtc: string;
}

export interface DeliveryTask {
  id: string;
  donationId: string;
  siteId: string;
  siteName: string;
  destinationLocation: Location;
  pickupLocation: Location;
  category: string;
  quantity: number;
  unit: string;
  status: TaskStatus;
  claimedBy?: string;
  claimedByAlias?: string;
  claimExpiresAtUtc?: string;
  pickupDeadlineUtc?: string;
  expiryDeadlineUtc: string;
  etaMinutes?: number;
  etaSource?: EtaSource;
  reroute?: RerouteProposal;
  assignmentReason?: AssignmentReason;
  handlingInstructions?: string;
  requiredCapabilities: Capability[];
  requiresColdBag?: boolean;
  pickedUpQty?: number;
  deliveredQty?: number;
  verifiedQty?: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  allocatedQty: number;
  deliveredQty: number;
  pickup: Location;
  availableFromUtc: string;
  expiryUtc: string;
  handlingInstructions?: string;
  requiredCapabilities: Capability[];
  mode: DistributionMode;
  status: DonationStatus;
  exceptionReason?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface DeliveryEvent {
  id: number;
  taskId?: string;
  donationId: string;
  type: string;
  actor?: string;
  actorRole?: Role;
  payload?: any;
  createdAtUtc: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  entityType?: 'donation' | 'task' | 'site' | 'openGate' | 'credit';
  entityId?: string;
  readAtUtc?: string;
  createdAtUtc: string;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  creditType: 'DONOR' | 'VOLUNTEER' | 'HELPER';
  eventType: string;
  amount: number;
  multiplier: number;
  subjectId: string;
  createdAtUtc: string;
  reverses?: string;
  description?: string;
}

export interface OpenGateListing {
  id: string;
  donationId: string;
  venue: string;
  lat: number;
  lng: number;
  opensAtUtc: string;
  closesAtUtc: string;
  remainingQty: number;
  totalQty: number;
  unit: string;
  directions?: string;
  instructions?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'CLOSED';
  createdAtUtc: string;
}

export interface AuditLog {
  id: string;
  actorKind: 'user' | 'system' | 'admin' | 'simulation';
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  reason?: string;
  createdAtUtc: string;
}

export interface LeaderboardRank {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  creditType: 'DONOR' | 'VOLUNTEER' | 'HELPER';
}

export interface ApiError {
  code: string;
  message: string;
  fields?: { field: string; message: string }[];
  requestId?: string;
}
