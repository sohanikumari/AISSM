import { config } from '../config';
import { runClaimExpiryWorker } from './claimExpiry';
import { runListingClosureWorker } from './listingClosure';
import { runExpirySweeperWorker } from './expirySweeper';

export class WorkerScheduler {
  private timer: NodeJS.Timeout | null = null;

  start() {
    if (this.timer) return;
    const intervalMs = config.workerIntervalSeconds * 1000;
    this.timer = setInterval(() => {
      this.tick();
    }, intervalMs);
    console.log(`[WorkerScheduler] Background workers active (tick every ${config.workerIntervalSeconds}s)`);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick() {
    runClaimExpiryWorker();
    runListingClosureWorker();
    runExpirySweeperWorker();
  }
}

export const scheduler = new WorkerScheduler();
