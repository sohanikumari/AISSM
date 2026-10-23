import { Capability, ItemCategory, Urgency } from './types';

export const SYSTEM_DEFAULTS = {
  SAFETY_BUFFER_MINUTES: 20,
  CLAIM_TTL_MINUTES: 10,
  ACK_DEADLINE_MINUTES: 5,
  PICKUP_DEADLINE_MINUTES: 30,
  WORKER_INTERVAL_SECONDS: 30,
  EMERGENCY_HELPER_MULTIPLIER: 1.5,
  MIN_EXPIRY_LEAD_MINUTES: 45,
  MOCK_AVERAGE_SPEED_KMH: 25,
  MOCK_DETOUR_FACTOR: 1.3,
  MOCK_HANDLING_MINUTES: 10,
};

export const ITEM_CATEGORIES: ItemCategory[] = [
  {
    code: 'COOKED_MEAL',
    label: 'Prepared Cooked Meals',
    requiredCapabilities: [],
    requiresColdChain: false,
    helperAllowed: true,
    handlingNotes: 'Must be delivered warm or within 2-3 hours of preparation in clean containers.',
  },
  {
    code: 'RAW_RATION_KIT',
    label: 'Raw Food & Ration Kits',
    requiredCapabilities: ['CLEAN_WATER', 'COOKING_FUEL'],
    requiresColdChain: false,
    helperAllowed: true,
    handlingNotes: 'Site must have cooking facilities (clean water & fuel) to prepare raw dry rations.',
  },
  {
    code: 'COLD_CHAIN_FOOD',
    label: 'Perishable Dairy / Cold Chain',
    requiredCapabilities: ['REFRIGERATION'],
    requiresColdChain: true,
    helperAllowed: true,
    handlingNotes: 'Requires insulated cold bag during transport and site refrigeration on arrival.',
  },
  {
    code: 'PACKAGED_DRY_GOODS',
    label: 'Packaged Non-Perishables',
    requiredCapabilities: ['DRY_STORAGE'],
    requiresColdChain: false,
    helperAllowed: true,
    handlingNotes: 'Store off the floor in dry, pest-free storage area.',
  },
  {
    code: 'INFANT_FORMULA',
    label: 'Infant Formula & Baby Supplies',
    requiredCapabilities: ['INFANT_CARE_PROCEDURE', 'CLEAN_WATER'],
    requiresColdChain: false,
    helperAllowed: false, // Strict safety: unvetted public helpers cannot transport infant formula
    handlingNotes: 'Requires strict sanitary handling procedure and potable clean water.',
  },
];

export const CAPABILITIES_CONFIG: { code: Capability; label: string; description: string }[] = [
  { code: 'CLEAN_WATER', label: 'Clean Potable Water', description: 'Certified safe drinking/cooking water available on site' },
  { code: 'COOKING_FUEL', label: 'Cooking Fuel / Gas', description: 'Operational gas burners or electric heating for bulk preparation' },
  { code: 'REFRIGERATION', label: 'Refrigerated Storage', description: 'Commercial or domestic cold storage below 4°C' },
  { code: 'INFANT_CARE_PROCEDURE', label: 'Infant Care Protocol', description: 'Trained staff and sanitary prep for baby nutrition' },
  { code: 'DRY_STORAGE', label: 'Pest-Free Dry Storage', description: 'Clean shelves/pallets away from moisture and pests' },
];

export const ERROR_MESSAGES: Record<string, string> = {
  ALREADY_CLAIMED: 'Someone else just claimed this task.',
  CAPACITY_EXCEEDED: 'This task quantity exceeds your declared carrying capacity.',
  INCOMPATIBLE_SITE: 'This destination cannot safely accept this item category.',
  ETA_EXCEEDS_DEADLINE: 'Estimated travel time would cause delivery past the safe deadline buffer.',
  CLAIM_EXPIRED: 'Your claim reservation expired and the task was returned to the available pool.',
  DEMAND_EXCEEDED: 'The shelter does not have sufficient unmet demand for this quantity.',
  LISTING_CLOSED: 'This collection window has closed.',
  SOLD_OUT: 'All available quantity has been distributed.',
  EXPIRY_EXTENSION_FORBIDDEN: 'Expiry deadline cannot be extended after donation is published.',
  HELPER_CATEGORY_FORBIDDEN: 'This critical item category cannot be dispatched to public emergency helpers.',
  INVALID_STATE_TRANSITION: 'The requested status change is not permitted by domain invariants.',
  VALIDATION_ERROR: 'Submitted payload failed validation checks.',
  UNAUTHORIZED: 'Authentication required to perform this action.',
  FORBIDDEN: 'Your active role does not have permission to execute this operation.',
  NOT_FOUND: 'The requested entity could not be found.',
  RATE_LIMITED: 'Too many requests. Please try again shortly.',
};

export function calculateUrgency(expiryUtc: string, serverNowIso?: string): Urgency {
  const now = serverNowIso ? new Date(serverNowIso).getTime() : Date.now();
  const expiry = new Date(expiryUtc).getTime();
  const diffMinutes = (expiry - now) / (1000 * 60);

  if (diffMinutes <= 0) return 'EXPIRED';
  if (diffMinutes <= 30) return 'CRITICAL';
  if (diffMinutes <= 120) return 'URGENT';
  return 'NORMAL';
}
