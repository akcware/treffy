import axios, { AxiosInstance } from 'axios';
import { User, Call, Contact, CallSettings } from './types';

export class ApiClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // İstek araya girerek (interceptor) token ekle
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Kullanıcı işlemleri
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/users/me');
    return response.data;
  }

  async updateUser(data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const response = await this.api.patch('/users/me', data);
    return response.data;
  }

  // Kişi işlemleri
  async getContacts(): Promise<Contact[]> {
    const response = await this.api.get('/contacts');
    return response.data;
  }

  async addContact(data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const response = await this.api.post('/contacts', data);
    return response.data;
  }

  async updateContact(id: string, data: Partial<Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Contact> {
    const response = await this.api.patch(`/contacts/${id}`, data);
    return response.data;
  }

  async deleteContact(id: string): Promise<void> {
    await this.api.delete(`/contacts/${id}`);
  }

  // Arama işlemleri
  async getCalls(): Promise<Call[]> {
    const response = await this.api.get('/calls');
    return response.data;
  }

  async initiateCall(participantId: string): Promise<Call> {
    const response = await this.api.post('/calls', { participantId });
    return response.data;
  }

  async answerCall(callId: string): Promise<Call> {
    const response = await this.api.post(`/calls/${callId}/answer`);
    return response.data;
  }

  async endCall(callId: string): Promise<Call> {
    const response = await this.api.post(`/calls/${callId}/end`);
    return response.data;
  }

  // Ayarlar işlemleri
  async getCallSettings(): Promise<CallSettings> {
    const response = await this.api.get('/settings/call');
    return response.data;
  }

  async updateCallSettings(settings: Partial<CallSettings>): Promise<CallSettings> {
    const response = await this.api.patch('/settings/call', settings);
    return response.data;
  }
}