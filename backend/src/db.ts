import {
  User,
  ReceivingSite,
  Donation,
  DeliveryTask,
  DeliveryEvent,
  Notification,
  LedgerEntry,
  OpenGateListing,
  AuditLog,
  RiderAvailability,
} from '../../shared/src/types';

export class Database {
  users: Map<string, User> = new Map();
  riderAvailability: Map<string, RiderAvailability> = new Map();
  sites: Map<string, ReceivingSite> = new Map();
  donations: Map<string, Donation> = new Map();
  tasks: Map<string, DeliveryTask> = new Map();
  events: DeliveryEvent[] = [];
  notifications: Notification[] = [];
  ledger: LedgerEntry[] = [];
  openGateListings: Map<string, OpenGateListing> = new Map();
  auditLogs: AuditLog[] = [];
  nextEventId = 1;

  constructor() {
    this.seed();
  }

  seed() {
    this.users.clear();
    this.riderAvailability.clear();
    this.sites.clear();
    this.donations.clear();
    this.tasks.clear();
    this.events = [];
    this.notifications = [];
    this.ledger = [];
    this.openGateListings.clear();
    this.auditLogs = [];
    this.nextEventId = 1;

    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Users
    const seedUsers: User[] = [
      {
        id: 'donor1',
        email: 'donor@sharma.org',
        displayName: 'Sharma Wedding Hall',
        roles: ['DONOR'],
        activeRole: 'DONOR',
        phone: '+91-9876543210',
      },
      {
        id: 'rider1',
        email: 'rider1@volunteer.org',
        displayName: 'Rahul (Rider 1)',
        roles: ['RIDER'],
        activeRole: 'RIDER',
        phone: '+91-9876543211',
      },
      {
        id: 'rider2',
        email: 'rider2@volunteer.org',
        displayName: 'Priya (Rider 2)',
        roles: ['RIDER'],
        activeRole: 'RIDER',
        phone: '+91-9876543212',
      },
      {
        id: 'rider3',
        email: 'rider3@volunteer.org',
        displayName: 'Amit (Rider 3)',
        roles: ['RIDER'],
        activeRole: 'RIDER',
        phone: '+91-9876543213',
      },
      {
        id: 'rider4',
        email: 'rider4@volunteer.org',
        displayName: 'Sneha (Rider 4)',
        roles: ['RIDER'],
        activeRole: 'RIDER',
        phone: '+91-9876543214',
      },
      {
        id: 'helper1',
        email: 'helper1@community.org',
        displayName: 'Vikas (Emergency Helper)',
        roles: ['HELPER'],
        activeRole: 'HELPER',
        helperOptIn: true,
        phone: '+91-9876543215',
      },
      {
        id: 'ngo1',
        email: 'operator@asha.org',
        displayName: 'Asha Shelter Operator',
        roles: ['NGO_OPERATOR'],
        activeRole: 'NGO_OPERATOR',
        phone: '+91-9876543216',
      },
      {
        id: 'ngo2',
        email: 'operator@brightfuture.org',
        displayName: 'Bright Future Operator',
        roles: ['NGO_OPERATOR'],
        activeRole: 'NGO_OPERATOR',
        phone: '+91-9876543217',
      },
      {
        id: 'ngo3',
        email: 'operator@carehome.org',
        displayName: 'Care Home Operator',
        roles: ['NGO_OPERATOR'],
        activeRole: 'NGO_OPERATOR',
        phone: '+91-9876543218',
      },
      {
        id: 'ngo4',
        email: 'operator@dryrelief.org',
        displayName: 'Dry Relief Operator',
        roles: ['NGO_OPERATOR'],
        activeRole: 'NGO_OPERATOR',
        phone: '+91-9876543219',
      },
      {
        id: 'admin1',
        email: 'admin@lastmileaid.org',
        displayName: 'System Admin',
        roles: ['ADMIN'],
        activeRole: 'ADMIN',
        phone: '+91-9876543200',
      },
    ];

    for (const u of seedUsers) {
      this.users.set(u.id, u);
    }

    // 2. Rider Availabilities
    const riderIds = ['rider1', 'rider2', 'rider3', 'rider4'];
    for (const rId of riderIds) {
      this.riderAvailability.set(rId, {
        userId: rId,
        isAvailable: true,
        capacityQty: 40,
        capacityUnit: 'meals',
        hasColdBag: rId === 'rider1' || rId === 'rider3',
        radiusKm: 15,
        currentLocation: { lat: 28.6139, lng: 77.209, address: 'Connaught Place, Central Hub' },
        updatedAtUtc: nowIso,
      });
    }

    this.riderAvailability.set('helper1', {
      userId: 'helper1',
      isAvailable: true,
      capacityQty: 20,
      capacityUnit: 'meals',
      hasColdBag: false,
      radiusKm: 5,
      currentLocation: { lat: 28.625, lng: 77.215, address: 'Barakhamba Road' },
      updatedAtUtc: nowIso,
    });

    // 3. Receiving Sites
    const seedSites: ReceivingSite[] = [
      {
        id: 'site_asha',
        organizationId: 'ngo1',
        orgName: 'Asha Community Trust',
        name: 'Asha Shelter',
        address: '12 Hospital Road, Civil Lines',
        lat: 28.6448,
        lng: 77.2167,
        status: 'OPEN',
        verification: 'VERIFIED',
        acceptedCategories: ['COOKED_MEAL', 'RAW_RATION_KIT', 'COLD_CHAIN_FOOD', 'PACKAGED_DRY_GOODS'],
        capabilities: {
          CLEAN_WATER: true,
          COOKING_FUEL: true,
          REFRIGERATION: true,
          INFANT_CARE_PROCEDURE: false,
          DRY_STORAGE: true,
        },
        demand: [
          { category: 'COOKED_MEAL', unit: 'meals', demandQty: 50, reservedQty: 0, receivedQty: 0 },
          { category: 'PACKAGED_DRY_GOODS', unit: 'boxes', demandQty: 30, reservedQty: 0, receivedQty: 0 },
        ],
        contactPhone: '+91-11-23456789',
        updatedAtUtc: nowIso,
      },
      {
        id: 'site_bright',
        organizationId: 'ngo2',
        orgName: 'Bright Future Foundation',
        name: 'Bright Future Camp',
        address: '45 Ring Road, East Sector',
        lat: 28.6304,
        lng: 77.277,
        status: 'OPEN',
        verification: 'VERIFIED',
        acceptedCategories: ['COOKED_MEAL', 'RAW_RATION_KIT', 'COLD_CHAIN_FOOD', 'PACKAGED_DRY_GOODS'],
        capabilities: {
          CLEAN_WATER: true,
          COOKING_FUEL: true,
          REFRIGERATION: false, // No fridge: strictly incompatible with cold-chain food
          INFANT_CARE_PROCEDURE: false,
          DRY_STORAGE: true,
        },
        demand: [
          { category: 'COOKED_MEAL', unit: 'meals', demandQty: 80, reservedQty: 0, receivedQty: 0 },
        ],
        contactPhone: '+91-11-23456788',
        updatedAtUtc: nowIso,
      },
      {
        id: 'site_care',
        organizationId: 'ngo3',
        orgName: 'Care Home Elderly Society',
        name: 'Care Home',
        address: '88 South Ext Block 2',
        lat: 28.5701,
        lng: 77.222,
        status: 'OPEN',
        verification: 'VERIFIED',
        acceptedCategories: ['COOKED_MEAL', 'RAW_RATION_KIT', 'COLD_CHAIN_FOOD', 'PACKAGED_DRY_GOODS'],
        capabilities: {
          CLEAN_WATER: true,
          COOKING_FUEL: true,
          REFRIGERATION: true,
          INFANT_CARE_PROCEDURE: true,
          DRY_STORAGE: true,
        },
        demand: [
          { category: 'COOKED_MEAL', unit: 'meals', demandQty: 50, reservedQty: 0, receivedQty: 0 },
        ],
        contactPhone: '+91-11-23456787',
        updatedAtUtc: nowIso,
      },
      {
        id: 'site_dry',
        organizationId: 'ngo4',
        orgName: 'Dry Relief Disaster Aid',
        name: 'Dry Relief Camp',
        address: 'Sector 19 Industrial Outer Ridge',
        lat: 28.5355,
        lng: 77.391,
        status: 'OPEN',
        verification: 'VERIFIED',
        acceptedCategories: ['RAW_RATION_KIT', 'PACKAGED_DRY_GOODS'],
        capabilities: {
          CLEAN_WATER: true,
          COOKING_FUEL: true,
          REFRIGERATION: false,
          INFANT_CARE_PROCEDURE: false,
          DRY_STORAGE: true,
        },
        demand: [
          { category: 'RAW_RATION_KIT', unit: 'kits', demandQty: 100, reservedQty: 0, receivedQty: 0 },
        ],
        contactPhone: '+91-11-23456786',
        updatedAtUtc: nowIso,
      },
    ];

    for (const s of seedSites) {
      this.sites.set(s.id, s);
    }

    // 4. Initial 180-meal Donation (PRD Section 1.1 / 5)
    const expiryDate = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    const donation1: Donation = {
      id: 'don_sharma_180',
      donorId: 'donor1',
      donorName: 'Sharma Wedding Hall',
      category: 'COOKED_MEAL',
      description: '180 fresh cooked vegetarian buffet meals from wedding reception.',
      quantity: 180,
      unit: 'meals',
      allocatedQty: 0,
      deliveredQty: 0,
      pickup: {
        lat: 28.618,
        lng: 77.21,
        address: 'Sharma Wedding Hall, Main Banquet Road',
      },
      availableFromUtc: nowIso,
      expiryUtc: expiryDate.toISOString(),
      handlingInstructions: 'Packed in clean catering trays of 20. Keep upright.',
      requiredCapabilities: [],
      mode: 'VOLUNTEER',
      status: 'PUBLISHED',
      createdAtUtc: nowIso,
      updatedAtUtc: nowIso,
    };

    this.donations.set(donation1.id, donation1);

    this.addAuditLog({
      actorKind: 'system',
      action: 'SYSTEM_SEEDED',
      entityType: 'system',
      entityId: 'seed',
      afterState: { users: seedUsers.length, sites: seedSites.length, donations: 1 },
      reason: 'PRD baseline seed data loaded',
    });
  }

  // --- Transactions & Helpers ---

  addAuditLog(entry: Omit<AuditLog, 'id' | 'createdAtUtc'>): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAtUtc: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(log);
    return log;
  }

  addEvent(event: Omit<DeliveryEvent, 'id' | 'createdAtUtc'>): DeliveryEvent {
    const ev: DeliveryEvent = {
      id: this.nextEventId++,
      createdAtUtc: new Date().toISOString(),
      ...event,
    };
    this.events.unshift(ev);
    return ev;
  }

  addNotification(n: Omit<Notification, 'id' | 'createdAtUtc'>): Notification {
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAtUtc: new Date().toISOString(),
      ...n,
    };
    this.notifications.unshift(notif);
    return notif;
  }

  // Enforces unique constraint (eventType, subjectId, userId) - INV-7
  awardCredit(entry: Omit<LedgerEntry, 'id' | 'createdAtUtc'>): LedgerEntry | null {
    const exists = this.ledger.some(
      (e) =>
        e.eventType === entry.eventType &&
        e.subjectId === entry.subjectId &&
        e.userId === entry.userId &&
        !e.reverses
    );
    if (exists) {
      return null; // Idempotent: already awarded
    }

    const ledgerEntry: LedgerEntry = {
      id: `credit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAtUtc: new Date().toISOString(),
      ...entry,
    };
    this.ledger.unshift(ledgerEntry);
    return ledgerEntry;
  }
}

export const db = new Database();
