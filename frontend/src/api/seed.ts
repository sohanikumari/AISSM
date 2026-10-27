import { User, ReceivingSite, Donation, Role } from './types';

export function getSeedData() {
  const now = new Date();
  const nowIso = now.toISOString();

  const users: User[] = [
    { id: 'donor1', displayName: 'Sharma Wedding Hall', email: 'donor@sharma.org', roles: ['DONOR'], activeRole: 'DONOR' },
    { id: 'rider1', displayName: 'Rahul (Rider 1)', email: 'rider1@volunteer.org', roles: ['RIDER'], activeRole: 'RIDER' },
    { id: 'rider2', displayName: 'Priya (Rider 2)', email: 'rider2@volunteer.org', roles: ['RIDER'], activeRole: 'RIDER' },
    { id: 'rider3', displayName: 'Amit (Rider 3)', email: 'rider3@volunteer.org', roles: ['RIDER'], activeRole: 'RIDER' },
    { id: 'rider4', displayName: 'Sneha (Rider 4)', email: 'rider4@volunteer.org', roles: ['RIDER'], activeRole: 'RIDER' },
    { id: 'helper1', displayName: 'Vikas (Emergency Helper)', email: 'helper1@community.org', roles: ['HELPER'], activeRole: 'HELPER', helperOptIn: true },
    { id: 'ngo1', displayName: 'Asha Shelter Operator', email: 'operator@asha.org', roles: ['NGO_OPERATOR'], activeRole: 'NGO_OPERATOR' },
    { id: 'ngo2', displayName: 'Bright Future Operator', email: 'operator@brightfuture.org', roles: ['NGO_OPERATOR'], activeRole: 'NGO_OPERATOR' },
    { id: 'ngo3', displayName: 'Care Home Operator', email: 'operator@carehome.org', roles: ['NGO_OPERATOR'], activeRole: 'NGO_OPERATOR' },
    { id: 'ngo4', displayName: 'Dry Relief Operator', email: 'operator@dryrelief.org', roles: ['NGO_OPERATOR'], activeRole: 'NGO_OPERATOR' },
    { id: 'admin1', displayName: 'System Admin', email: 'admin@lastmileaid.org', roles: ['ADMIN'], activeRole: 'ADMIN' },
  ];

  const sites: ReceivingSite[] = [
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
      capabilities: { CLEAN_WATER: true, COOKING_FUEL: true, REFRIGERATION: true, INFANT_CARE_PROCEDURE: false, DRY_STORAGE: true },
      demand: [
        { category: 'COOKED_MEAL', unit: 'meals', demandQty: 50, reservedQty: 0, receivedQty: 0 },
        { category: 'PACKAGED_DRY_GOODS', unit: 'boxes', demandQty: 30, reservedQty: 0, receivedQty: 0 },
      ],
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
      acceptedCategories: ['COOKED_MEAL', 'RAW_RATION_KIT', 'PACKAGED_DRY_GOODS'],
      capabilities: { CLEAN_WATER: true, COOKING_FUEL: true, REFRIGERATION: false, INFANT_CARE_PROCEDURE: false, DRY_STORAGE: true },
      demand: [
        { category: 'COOKED_MEAL', unit: 'meals', demandQty: 80, reservedQty: 0, receivedQty: 0 },
      ],
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
      capabilities: { CLEAN_WATER: true, COOKING_FUEL: true, REFRIGERATION: true, INFANT_CARE_PROCEDURE: true, DRY_STORAGE: true },
      demand: [
        { category: 'COOKED_MEAL', unit: 'meals', demandQty: 50, reservedQty: 0, receivedQty: 0 },
      ],
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
      capabilities: { CLEAN_WATER: true, COOKING_FUEL: true, REFRIGERATION: false, INFANT_CARE_PROCEDURE: false, DRY_STORAGE: true },
      demand: [
        { category: 'RAW_RATION_KIT', unit: 'kits', demandQty: 100, reservedQty: 0, receivedQty: 0 },
      ],
    },
  ];

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
    pickup: { lat: 28.618, lng: 77.21, address: 'Sharma Wedding Hall, Main Banquet Road' },
    availableFromUtc: nowIso,
    expiryUtc: new Date(now.getTime() + 3 * 3600 * 1000).toISOString(),
    handlingInstructions: 'Packed in clean catering trays of 20. Keep upright.',
    requiredCapabilities: [],
    mode: 'VOLUNTEER',
    status: 'PUBLISHED',
    createdAtUtc: nowIso,
    updatedAtUtc: nowIso,
  };

  return { users, sites, donations: [donation1] };
}
