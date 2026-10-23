export type Role = 'DONOR' | 'RIDER' | 'HELPER' | 'NGO_OPERATOR' | 'ADMIN';
export type Urgency = 'NORMAL' | 'URGENT' | 'CRITICAL' | 'EXPIRED';
export type SiteStatus = 'OPEN' | 'FULL' | 'CLOSED';
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

export type Capability =
  | 'CLEAN_WATER'
  | 'COOKING_FUEL'
  | 'REFRIGERATION'
  | 'INFANT_CARE_PROCEDURE'
  | 'DRY_STORAGE';

export const ITEM_CATEGORIES = [
  {
    code: 'COOKED_MEAL',
    label: 'Prepared Cooked Meals',
    requiredCapabilities: [] as Capability[],
    requiresColdChain: false,
    helperAllowed: true,
  },
  {
    code: 'RAW_RATION_KIT',
    label: 'Raw Food & Ration Kits',
    requiredCapabilities: ['CLEAN_WATER', 'COOKING_FUEL'] as Capability[],
    requiresColdChain: false,
    helperAllowed: true,
  },
  {
    code: 'COLD_CHAIN_FOOD',
    label: 'Perishable Dairy / Cold Chain',
    requiredCapabilities: ['REFRIGERATION'] as Capability[],
    requiresColdChain: true,
    helperAllowed: true,
  },
  {
    code: 'PACKAGED_DRY_GOODS',
    label: 'Packaged Non-Perishables',
    requiredCapabilities: ['DRY_STORAGE'] as Capability[],
    requiresColdChain: false,
    helperAllowed: true,
  },
  {
    code: 'INFANT_FORMULA',
    label: 'Infant Formula & Baby Supplies',
    requiredCapabilities: ['INFANT_CARE_PROCEDURE', 'CLEAN_WATER'] as Capability[],
    requiresColdChain: false,
    helperAllowed: false,
  },
];

export const CAPABILITIES_LABELS: Record<Capability, string> = {
  CLEAN_WATER: 'Clean Water',
  COOKING_FUEL: 'Cooking Fuel',
  REFRIGERATION: 'Refrigerated Storage',
  INFANT_CARE_PROCEDURE: 'Infant Care Protocol',
  DRY_STORAGE: 'Pest-Free Dry Storage',
};
