import { Api, SimApi } from './client';
import {
  User,
  Donation,
  DeliveryTask,
  ReceivingSite,
  OpenGateListing,
  LedgerEntry,
  LeaderboardRank,
  Notification,
  AuditLog,
  DeliveryEvent,
  Role,
  Capability,
  SiteStatus,
  DonationStatus,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export class HttpApi implements Api {
  private currentUserId: string = 'admin1';
  private activeRole: Role = 'ADMIN';

  setSession(userId: string, role: Role) {
    this.currentUserId = userId;
    this.activeRole = role;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': this.currentUserId,
      'x-active-role': this.activeRole,
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: res.statusText }));
      const err: any = new Error(errData.message || 'API request failed');
      err.code = errData.code;
      err.fields = errData.fields;
      throw err;
    }

    return res.json();
  }

  async serverNow(): Promise<string> {
    const data = await this.request<{ server_now: string }>('/time/now');
    return data.server_now;
  }

  async me(): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/me');
    return data.user;
  }

  async login(email: string): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'password123' }),
    });
    this.setSession(data.user.id, data.user.activeRole);
    return data.user;
  }

  async register(input: any): Promise<User> {
    const data = await this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...input, password: 'password123' }),
    });
    this.setSession(data.user.id, data.user.activeRole);
    return data.user;
  }

  async setAvailability(a: any): Promise<void> {
    await this.request('/auth/availability', {
      method: 'PUT',
      body: JSON.stringify(a),
    });
  }

  async getAvailability(): Promise<any> {
    const data = await this.request<{ availability: any }>('/auth/availability');
    return data.availability;
  }

  async listDonations(q?: { mine?: boolean; status?: DonationStatus }): Promise<Donation[]> {
    const params = new URLSearchParams();
    if (q?.status) params.set('status', q.status);
    if (q?.mine) params.set('mine', 'true');
    const data = await this.request<{ donations: Donation[] }>(`/donations?${params.toString()}`);
    return data.donations;
  }

  async getDonation(id: string): Promise<{ donation: Donation; tasks: DeliveryTask[]; events: DeliveryEvent[] }> {
    return this.request(`/donations/${id}`);
  }

  async createDonation(input: any): Promise<Donation> {
    const data = await this.request<{ donation: Donation }>('/donations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data.donation;
  }

  async switchToOpenGate(donationId: string, input: any): Promise<OpenGateListing> {
    const data = await this.request<{ listing: OpenGateListing }>(`/donations/${donationId}/open-gate`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data.listing;
  }

  async availableTasks(): Promise<DeliveryTask[]> {
    const data = await this.request<{ tasks: DeliveryTask[] }>('/tasks/available');
    return data.tasks;
  }

  async getTask(id: string): Promise<{ task: DeliveryTask; events: DeliveryEvent[] }> {
    return this.request(`/tasks/${id}`);
  }

  async claimTask(id: string): Promise<DeliveryTask> {
    const data = await this.request<{ task: DeliveryTask }>(`/tasks/${id}/claim`, { method: 'POST' });
    return data.task;
  }

  async acknowledgeTask(id: string): Promise<DeliveryTask> {
    const data = await this.request<{ task: DeliveryTask }>(`/tasks/${id}/acknowledge`, { method: 'POST' });
    return data.task;
  }

  async confirmPickup(id: string, qty: number): Promise<DeliveryTask> {
    const data = await this.request<{ task: DeliveryTask }>(`/tasks/${id}/pickup`, {
      method: 'POST',
      body: JSON.stringify({ pickedUpQty: qty }),
    });
    return data.task;
  }

  async confirmDelivery(id: string, qty: number): Promise<DeliveryTask> {
    const data = await this.request<{ task: DeliveryTask }>(`/tasks/${id}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ deliveredQty: qty }),
    });
    return data.task;
  }

  async verifyReceipt(id: string, qty: number, note?: string): Promise<{ task: DeliveryTask; credits: LedgerEntry[] }> {
    return this.request(`/tasks/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verifiedQty: qty, note }),
    });
  }

  async acceptReroute(taskId: string, proposalId: string): Promise<DeliveryTask> {
    const data = await this.request<{ task: DeliveryTask }>(`/tasks/${taskId}/reroute/accept`, {
      method: 'POST',
      body: JSON.stringify({ proposalId }),
    });
    return data.task;
  }

  async declineReroute(taskId: string, reason: string): Promise<DeliveryTask> {
    const data = await this.request<{ task: DeliveryTask }>(`/tasks/${taskId}/reroute/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return data.task;
  }

  async listSites(q?: { category?: string; status?: SiteStatus }): Promise<ReceivingSite[]> {
    const params = new URLSearchParams();
    if (q?.status) params.set('status', q.status);
    if (q?.category) params.set('category', q.category);
    const data = await this.request<{ sites: ReceivingSite[] }>(`/sites?${params.toString()}`);
    return data.sites;
  }

  async getSite(id: string): Promise<ReceivingSite> {
    const data = await this.request<{ site: ReceivingSite }>(`/sites/${id}`);
    return data.site;
  }

  async setSiteStatus(id: string, status: SiteStatus, confirm?: boolean): Promise<{ site: ReceivingSite; affectedTasks: DeliveryTask[] }> {
    return this.request(`/sites/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, confirm }),
    });
  }

  async setSiteDemand(id: string, d: { category: string; unit: string; demandQty: number }): Promise<ReceivingSite> {
    const data = await this.request<{ site: ReceivingSite }>(`/sites/${id}/demand`, {
      method: 'PUT',
      body: JSON.stringify(d),
    });
    return data.site;
  }

  async setSiteCapability(id: string, c: Capability, available: boolean): Promise<ReceivingSite> {
    const data = await this.request<{ site: ReceivingSite }>(`/sites/${id}/capability`, {
      method: 'PUT',
      body: JSON.stringify({ capability: c, available }),
    });
    return data.site;
  }

  async listOpenGate(): Promise<OpenGateListing[]> {
    const data = await this.request<{ listings: OpenGateListing[] }>('/open-gate');
    return data.listings;
  }

  async getOpenGate(id: string): Promise<OpenGateListing> {
    const data = await this.request<{ listing: OpenGateListing }>(`/open-gate/${id}`);
    return data.listing;
  }

  async recordHandout(listingId: string, qty: number): Promise<OpenGateListing> {
    const data = await this.request<{ listing: OpenGateListing }>(`/open-gate/${listingId}/handout`, {
      method: 'POST',
      body: JSON.stringify({ quantity: qty }),
    });
    return data.listing;
  }

  async notifications(): Promise<Notification[]> {
    const data = await this.request<{ notifications: Notification[] }>('/notifications');
    return data.notifications;
  }

  async markRead(ids: string[]): Promise<void> {
    await this.request('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async credits(): Promise<{ totals: Record<'DONOR' | 'VOLUNTEER' | 'HELPER', number>; entries: LedgerEntry[] }> {
    return this.request('/credits');
  }

  async leaderboard(type: 'DONOR' | 'VOLUNTEER' | 'HELPER'): Promise<LeaderboardRank[]> {
    const data = await this.request<{ leaderboard: LeaderboardRank[] }>(`/credits/leaderboard?type=${type}`);
    return data.leaderboard;
  }

  async audit(q?: any): Promise<AuditLog[]> {
    const data = await this.request<{ logs: AuditLog[] }>('/admin/audit');
    return data.logs;
  }

  async events(donationId?: string, taskId?: string): Promise<DeliveryEvent[]> {
    const params = new URLSearchParams();
    if (donationId) params.set('donationId', donationId);
    if (taskId) params.set('taskId', taskId);
    const data = await this.request<{ events: DeliveryEvent[] }>(`/admin/events?${params.toString()}`);
    return data.events;
  }

  sim: SimApi = {
    seedDemo: async () => {
      await this.request('/admin/sim/seed', { method: 'POST' });
    },
    runMatching: async (donationId?: string) => {
      return this.request('/admin/sim/match', {
        method: 'POST',
        body: JSON.stringify({ donationId }),
      });
    },
    runClaimExpiry: async () => {
      return this.request('/admin/sim/worker/claim-expiry', { method: 'POST' });
    },
    runListingClosure: async () => {
      return this.request('/admin/sim/worker/listing-closure', { method: 'POST' });
    },
    runExpirySweeper: async () => {
      return this.request('/admin/sim/worker/expiry-sweeper', { method: 'POST' });
    },
    setZeroVolunteers: async (enabled: boolean) => {
      return this.request('/admin/sim/zero-volunteers', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      });
    },
  };
}

export const httpApi = new HttpApi();
