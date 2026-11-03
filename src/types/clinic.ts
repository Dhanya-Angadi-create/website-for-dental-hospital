/**
 * Nandita Dental Clinic Data Models & TypeScript Definitions
 */

export interface ClinicSettings {
  id: string;
  name: string;
  doctorName: string;
  doctorTitle: string;
  speciality: string;
  address: string;
  city: string;
  state: string;
  country: string;
  googleMapsEmbedUrl: string;
  googleMapsLink: string;
  phone: string;
  phoneConfirmed: boolean;
  whatsapp: string;
  whatsappConfirmed: boolean;
  email: string;
  emailConfirmed: boolean;
  slotDurationMinutes: number;
  consultationFee: string;
  emergencyNote: string;
  aboutText: string;
  missionText: string;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  speciality: string;
  bio: string;
  photoUrl: string;
  active: boolean;
}

export interface Treatment {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  details: string[];
  durationMinutes: number;
  price: string;
  priceConfirmed: boolean;
  imageUrl: string;
  isPopular?: boolean;
  active: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  treatmentId: string;
  treatmentTitle: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:30 AM"
  durationMinutes: number;
  message?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

export interface WorkingShift {
  start: string; // "10:00" (24h)
  end: string;   // "13:30" (24h)
}

export interface DayWorkingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  isOpen: boolean;
  shifts: WorkingShift[];
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface NotificationRecord {
  id: string;
  appointmentId: string;
  bookingReference: string;
  type: 'confirmation' | 'clinic_alert' | 'reminder' | 'cancellation' | 'reschedule';
  channel: 'WhatsApp' | 'Email' | 'SMS';
  recipient: string;
  status: 'Ready' | 'Configured' | 'Mock Gate (Needs API Key)';
  message: string;
  timestamp: string;
}

export interface BookingSlot {
  time: string; // e.g. "10:00 AM"
  available: boolean;
  reason?: string;
}
