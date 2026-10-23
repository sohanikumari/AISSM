import http from 'http';
import { app } from './app';
import { config } from './config';
import { realtimeServer } from './realtime/socketServer';
import { scheduler } from './workers/scheduler';

const httpServer = http.createServer(app);

// Initialize Realtime WebSocket Server
realtimeServer.init(httpServer);

// Start Periodic Background Schedulers
scheduler.start();

httpServer.listen(config.port, () => {
  console.log(`=================================================`);
  console.log(` LastMile Aid Backend API Service Running       `);
  console.log(` Port: ${config.port} | Mode: ${config.demoMode ? 'DEMO' : 'PRODUCTION'} `);
  console.log(` Realtime Socket.IO: active                     `);
  console.log(` Background workers: active (${config.workerIntervalSeconds}s interval)  `);
  console.log(`=================================================`);
});
