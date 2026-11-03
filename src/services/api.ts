import {
  ClinicSettings,
  Doctor,
  Treatment,
  Appointment,
  DayWorkingHours,
  BlockedDate,
  BookingSlot,
  NotificationRecord
} from '../types/clinic';

const API_BASE = '/api';

export const api = {
  // Settings
  async getSettings(): Promise<ClinicSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    return data.data;
  },

  async updateSettings(settings: Partial<ClinicSettings>): Promise<ClinicSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return data.data;
  },

  // Doctors
  async getDoctors(all = false): Promise<Doctor[]> {
    const res = await fetch(`${API_BASE}/doctors${all ? '?all=true' : ''}`);
    const data = await res.json();
    return data.data;
  },

  async saveDoctor(doctor: Doctor): Promise<Doctor> {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor)
    });
    const data = await res.json();
    return data.data;
  },

  // Treatments
  async getTreatments(all = false): Promise<Treatment[]> {
    const res = await fetch(`${API_BASE}/treatments${all ? '?all=true' : ''}`);
    const data = await res.json();
    return data.data;
  },

  async saveTreatment(treatment: Treatment): Promise<Treatment> {
    const res = await fetch(`${API_BASE}/treatments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(treatment)
    });
    const data = await res.json();
    return data.data;
  },

  async deleteTreatment(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/treatments/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  },

  // Working Hours & Blocked Dates
  async getWorkingHours(): Promise<DayWorkingHours[]> {
    const res = await fetch(`${API_BASE}/working-hours`);
    const data = await res.json();
    return data.data;
  },

  async updateWorkingHours(hours: DayWorkingHours[]): Promise<DayWorkingHours[]> {
    const res = await fetch(`${API_BASE}/working-hours`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hours)
    });
    const data = await res.json();
    return data.data;
  },

  async getBlockedDates(): Promise<BlockedDate[]> {
    const res = await fetch(`${API_BASE}/blocked-dates`);
    const data = await res.json();
    return data.data;
  },

  async addBlockedDate(date: string, reason: string): Promise<BlockedDate> {
    const res = await fetch(`${API_BASE}/blocked-dates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, reason })
    });
    const data = await res.json();
    return data.data;
  },

  async deleteBlockedDate(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/blocked-dates/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  },

  // Slots
  async getAvailableSlots(doctorId: string, date: string): Promise<BookingSlot[]> {
    const res = await fetch(`${API_BASE}/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
    const data = await res.json();
    return data.data || [];
  },

  // Appointments
  async getAppointments(filters?: {
    search?: string;
    status?: string;
    date?: string;
    treatmentId?: string;
  }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.treatmentId) params.append('treatmentId', filters.treatmentId);

    const res = await fetch(`${API_BASE}/appointments?${params.toString()}`);
    const data = await res.json();
    return data.data || [];
  },

  async getAppointmentByRef(ref: string): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments/ref/${encodeURIComponent(ref)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Appointment not found');
    return data.data;
  },

  async createAppointment(payload: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    patientAge?: number;
    treatmentId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    message?: string;
  }): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async updateAppointmentStatus(id: string, status: string, reason?: string): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update appointment');
    return data.data;
  },

  async rescheduleAppointment(id: string, newDate: string, newTime: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const res = await fetch(`${API_BASE}/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDate, newTime })
    });
    return await res.json();
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update appointment');
    return data.data;
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  },

  // Admin stats, auth & notifications
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    const data = await res.json();
    return data.data;
  },

  async getNotifications(): Promise<NotificationRecord[]> {
    const res = await fetch(`${API_BASE}/admin/notifications`);
    const data = await res.json();
    return data.data;
  },

  async adminLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  }
};
