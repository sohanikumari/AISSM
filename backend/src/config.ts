import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.SUPABASE_JWT_SECRET || 'lastmile-aid-dev-secret-key-2026',
  demoMode: process.env.DEMO_MODE !== 'false',
  safetyBufferMinutes: parseInt(process.env.SAFETY_BUFFER_MINUTES || '20', 10),
  claimTtlMinutes: parseInt(process.env.CLAIM_TTL_MINUTES || '10', 10),
  workerIntervalSeconds: parseInt(process.env.WORKER_INTERVAL_SECONDS || '30', 10),
  routingProvider: process.env.ROUTING_PROVIDER || 'mock',
};
