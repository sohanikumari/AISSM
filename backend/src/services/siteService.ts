import { db } from '../db';
import { ReceivingSite, SiteStatus, Capability, DeliveryTask } from '../../../shared/src/types';
import { rerouteService } from './rerouteService';

export class SiteService {
  setSiteStatus(siteId: string, status: SiteStatus, confirm?: boolean): { site: ReceivingSite; affectedTasks: DeliveryTask[] } {
    const site = db.sites.get(siteId);
    if (!site) throw { code: 'NOT_FOUND', message: 'Site not found' };

    const oldStatus = site.status;
    site.status = status;
    site.updatedAtUtc = new Date().toISOString();

    let affectedTasks: DeliveryTask[] = [];
    if (status === 'FULL' || status === 'CLOSED') {
      affectedTasks = rerouteService.handleSiteStatusChange(siteId);
    }

    db.addAuditLog({
      actorKind: 'user',
      action: 'SITE_STATUS_CHANGED',
      entityType: 'site',
      entityId: site.id,
      beforeState: { status: oldStatus },
      afterState: { status, affectedTasksCount: affectedTasks.length },
      reason: `Status switched to ${status}`,
    });

    return { site, affectedTasks };
  }

  setSiteDemand(siteId: string, category: string, unit: string, demandQty: number): ReceivingSite {
    const site = db.sites.get(siteId);
    if (!site) throw { code: 'NOT_FOUND', message: 'Site not found' };

    let item = site.demand.find((d) => d.category === category);
    if (!item) {
      item = { category, unit, demandQty, reservedQty: 0, receivedQty: 0 };
      site.demand.push(item);
    } else {
      // Invariant: cannot reduce demand below already reserved + received
      if (demandQty < item.reservedQty + item.receivedQty) {
        throw {
          code: 'VALIDATION_ERROR',
          message: `Cannot lower demand below current reserved (${item.reservedQty}) + received (${item.receivedQty})`,
        };
      }
      item.demandQty = demandQty;
    }

    site.updatedAtUtc = new Date().toISOString();
    return site;
  }

  setSiteCapability(siteId: string, capability: Capability, available: boolean): ReceivingSite {
    const site = db.sites.get(siteId);
    if (!site) throw { code: 'NOT_FOUND', message: 'Site not found' };

    site.capabilities[capability] = available;
    site.updatedAtUtc = new Date().toISOString();

    db.addAuditLog({
      actorKind: 'user',
      action: 'SITE_CAPABILITY_UPDATED',
      entityType: 'site',
      entityId: site.id,
      afterState: { capability, available },
    });

    return site;
  }
}

export const siteService = new SiteService();
