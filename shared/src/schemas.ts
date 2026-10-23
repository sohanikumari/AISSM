import { z } from 'zod';

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(3),
});

export const capabilitySchema = z.enum([
  'CLEAN_WATER',
  'COOKING_FUEL',
  'REFRIGERATION',
  'INFANT_CARE_PROCEDURE',
  'DRY_STORAGE',
]);

export const roleSchema = z.enum(['DONOR', 'RIDER', 'HELPER', 'NGO_OPERATOR', 'ADMIN']);

export const createDonationSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(3).max(500),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  pickup: locationSchema,
  availableFromUtc: z.string().datetime(),
  expiryUtc: z.string().datetime(),
  handlingInstructions: z.string().optional(),
  requiredCapabilities: z.array(capabilitySchema).default([]),
  mode: z.enum(['VOLUNTEER', 'OPEN_GATE']).default('VOLUNTEER'),
});

export const switchToOpenGateSchema = z.object({
  opensAtUtc: z.string().datetime(),
  closesAtUtc: z.string().datetime(),
  instructions: z.string().optional(),
  venue: z.string().optional(),
});

export const riderAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  capacityQty: z.number().nonnegative(),
  capacityUnit: z.string().min(1).default('meals'),
  hasColdBag: z.boolean().default(false),
  radiusKm: z.number().positive().max(50).default(15),
  currentLocation: locationSchema.optional(),
  windowFromUtc: z.string().datetime().optional(),
  windowUntilUtc: z.string().datetime().optional(),
});

export const claimTaskSchema = z.object({
  taskId: z.string(),
});

export const pickupTaskSchema = z.object({
  pickedUpQty: z.number().positive(),
  notes: z.string().optional(),
});

export const deliverTaskSchema = z.object({
  deliveredQty: z.number().positive(),
  notes: z.string().optional(),
});

export const verifyReceiptSchema = z.object({
  verifiedQty: z.number().positive(),
  note: z.string().optional(),
});

export const setSiteStatusSchema = z.object({
  status: z.enum(['OPEN', 'FULL', 'CLOSED']),
  confirm: z.boolean().optional(),
});

export const setSiteDemandSchema = z.object({
  category: z.string().min(1),
  unit: z.string().min(1),
  demandQty: z.number().nonnegative(),
});

export const setSiteCapabilitySchema = z.object({
  capability: capabilitySchema,
  available: z.boolean(),
});

export const recordHandoutSchema = z.object({
  quantity: z.number().positive(),
  notes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema,
  helperOptIn: z.boolean().optional(),
  phone: z.string().optional(),
});

export const acceptRerouteSchema = z.object({
  proposalId: z.string(),
});

export const declineRerouteSchema = z.object({
  reason: z.string().min(3),
});
