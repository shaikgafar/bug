import { Bug, Component, AdminStats, Feedback, User } from '@/types';

let rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
  rawBaseUrl = `https://${rawBaseUrl}`;
}
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bugtriage_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = 'API request failed';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('bugtriage_token', data.access_token);
      localStorage.setItem('bugtriage_user', JSON.stringify(data.user));
    }
    return data;
  }

  async register(name: string, email: string, password: string, role: string = 'reporter') {
    const data = await this.request<{ access_token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('bugtriage_token', data.access_token);
      localStorage.setItem('bugtriage_user', JSON.stringify(data.user));
    }
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bugtriage_token');
      localStorage.removeItem('bugtriage_user');
    }
  }

  // Bugs
  async getBugs(params?: {
    status?: string;
    severity?: string;
    priority?: string;
    search?: string;
  }): Promise<Bug[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Bug[]>(`/api/bugs${qs}`);
  }

  async getBug(id: string): Promise<Bug> {
    return this.request<Bug>(`/api/bugs/${id}`);
  }

  async createBug(data: {
    title: string;
    raw_description: string;
    component_id?: string | null;
    severity?: string;
    priority?: string;
  }): Promise<Bug> {
    return this.request<Bug>('/api/bugs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBug(id: string, data: Partial<Bug>): Promise<Bug> {
    return this.request<Bug>(`/api/bugs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async clarifyBug(id: string, message: string) {
    return this.request<{ status: string; message: string }>(`/api/bugs/${id}/clarify`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async sendClarification(id: string, message: string) {
    return this.clarifyBug(id, message);
  }

  async confirmDuplicate(bugId: string, matchedBugId: string, confirmed: boolean) {
    return this.request<{ status: string; confirmed: boolean }>(`/api/bugs/${bugId}/confirm-duplicate`, {
      method: 'POST',
      body: JSON.stringify({ matched_bug_id: matchedBugId, confirmed }),
    });
  }

  // Triage Pipeline
  async startTriage(bugId: string) {
    return this.request<{ status: string; bug_id: string; triage_run_id: string }>(
      `/api/triage/${bugId}/start`,
      { method: 'POST' }
    );
  }

  getTriageStreamUrl(bugId: string): string {
    return `${API_BASE_URL}/api/triage/${bugId}/stream`;
  }

  async getTriageReport(bugId: string) {
    return this.request<{ status: string; full_report: any }>(`/api/triage/${bugId}/report`);
  }

  // Components
  async getComponents(): Promise<Component[]> {
    return this.request<Component[]>('/api/components');
  }

  async createComponent(data: { name: string; description: string; owner_team: string }): Promise<Component> {
    return this.request<Component>('/api/components', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Feedback & Admin
  async submitFeedback(data: {
    bug_id: string;
    rating_summary: number;
    rating_duplicate: number;
    rating_component: number;
    rating_reproduction: number;
    comments?: string;
  }): Promise<Feedback> {
    return this.request<Feedback>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeedback(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/api/feedback');
  }

  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/api/admin/stats');
  }

  async seedDemo() {
    return this.request<{ status: string; message: string }>('/api/admin/seed-demo', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
