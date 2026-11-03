import fs from 'node:fs';
import path from 'node:path';
import {
  ClinicSettings,
  Doctor,
  Treatment,
  Appointment,
  DayWorkingHours,
  BlockedDate,
  NotificationRecord,
  BookingSlot
} from '../types/clinic';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic_data.json');

export interface ClinicDatabase {
  settings: ClinicSettings;
  doctors: Doctor[];
  treatments: Treatment[];
  appointments: Appointment[];
  workingHours: DayWorkingHours[];
  blockedDates: BlockedDate[];
  notifications: NotificationRecord[];
}

const DEFAULT_SETTINGS: ClinicSettings = {
  id: 'clinic-main',
  name: 'Nandita Dental Clinic',
  doctorName: 'Dr. Prasannakumar Kadakol',
  doctorTitle: 'Dentist & Prosthodontist',
  speciality: 'Dentistry / Prosthodontics',
  address: 'Hubli-Dharwad, Karnataka, India',
  city: 'Hubli-Dharwad',
  state: 'Karnataka',
  country: 'India',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123089.47547141505!2d75.0592759!3d15.3647083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d73b0606da09%3A0xb36315ef769741e1!2sHubballi%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  googleMapsLink: 'https://maps.google.com/?q=Nandita+Dental+Clinic+Hubli+Dharwad+Karnataka',
  phone: 'Pending clinic update',
  phoneConfirmed: false,
  whatsapp: 'Pending clinic update',
  whatsappConfirmed: false,
  email: 'Pending clinic update',
  emailConfirmed: false,
  slotDurationMinutes: 30,
  consultationFee: 'Pending clinic confirmation',
  emergencyNote: 'For urgent dental pain or emergencies during clinic hours, please visit our clinic in Hubli-Dharwad directly.',
  aboutText: 'Nandita Dental Clinic provides dedicated, compassionate oral healthcare in Hubli-Dharwad under the expert clinical guidance of Dr. Prasannakumar Kadakol. We blend modern clinical precision, prosthodontic mastery, and an unhurried, gentle environment designed to make every dental visit stress-free.',
  missionText: 'To preserve natural smiles through conservative dentistry, superior prosthodontic care, and uncompromised sterilisation standards.'
};

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Prasannakumar Kadakol',
    role: 'Chief Dental Surgeon & Prosthodontist',
    speciality: 'Prosthodontics & General Dentistry',
    bio: 'Specialist in Dentistry and Prosthodontics providing comprehensive care including restorative crown & bridge work, painless root canal procedures, and aesthetic smile maintenance at Nandita Dental Clinic.',
    photoUrl: '/src/assets/images/doctor_profile_placeholder_1793713705980.jpg',
    active: true
  }
];

const DEFAULT_TREATMENTS: Treatment[] = [
  {
    id: 'trt-1',
    title: 'Root Canal Treatment',
    shortDesc: 'Painless endodontic therapy to eliminate deep infection and save your natural tooth.',
    fullDesc: 'Modern rotary endodontic treatment designed to thoroughly cleanse infected pulp tissue, disinfect the canal spaces, and hermetically seal the tooth structure, relieving pain and preventing extraction.',
    details: [
      'Painless procedure with advanced local anesthesia',
      'High-precision rotary canal preparation',
      'Preserves original tooth roots and bite alignment',
      'Protective ceramic or composite crown placement'
    ],
    durationMinutes: 45,
    price: 'Consultation required',
    priceConfirmed: false,
    imageUrl: '/src/assets/images/treatment_root_canal_1793713703877.jpg',
    isPopular: true,
    active: true
  },
  {
    id: 'trt-2',
    title: 'Teeth Cleaning',
    shortDesc: 'Ultrasonic scaling and polishing to remove stubborn calculus and protect gum health.',
    fullDesc: 'Routine preventative dental prophylaxis that removes supra-gingival and sub-gingival plaque, tartar deposits, and external stains. Essential for preventing periodontal disease and bad breath.',
    details: [
      'Gentle ultrasonic scaler technology',
      'Targeted stain removal and air polishing',
      'Thorough gum and periodontal assessment',
      'Personalised oral hygiene guidance'
    ],
    durationMinutes: 30,
    price: 'Consultation required',
    priceConfirmed: false,
    imageUrl: '/src/assets/images/treatment_cleaning_1793713703988.jpg',
    isPopular: true,
    active: true
  },
  {
    id: 'trt-3',
    title: 'Teeth Whitening',
    shortDesc: 'Safe, in-office cosmetic whitening to brighten your smile several shades naturally.',
    fullDesc: 'Clinical enamel-safe whitening designed to eliminate stubborn deep discoloration caused by tea, coffee, aging, or fluorosis, restoring a bright, youthful, and luminous smile.',
    details: [
      'Enamel-safe professional brightening formula',
      'Visible shade improvement in single session',
      'Protective barrier applied to gums and soft tissues',
      'Long-lasting natural looking luminescence'
    ],
    durationMinutes: 45,
    price: 'Consultation required',
    priceConfirmed: false,
    imageUrl: '/src/assets/images/treatment_whitening_1793713705532.jpg',
    isPopular: false,
    active: true
  },
  {
    id: 'trt-4',
    title: 'Dental Fillings',
    shortDesc: 'Aesthetic, tooth-colored composite restorations that restore chipped or decayed teeth.',
    fullDesc: 'Biocompatible composite resin fillings that bond seamlessly to natural tooth structure, repairing dental caries, chips, and minor fractures while matching the exact shade of adjacent enamel.',
    details: [
      'Natural tooth-matching composite shades',
      'Conservative preparation preserving healthy enamel',
      'Durable, wear-resistant light-cured material',
      'Instant bite checking and smooth contouring'
    ],
    durationMinutes: 30,
    price: 'Consultation required',
    priceConfirmed: false,
    imageUrl: '/src/assets/images/treatment_fillings_1793713725404.jpg',
    isPopular: true,
    active: true
  },
  {
    id: 'trt-5',
    title: 'Prosthodontic Care',
    shortDesc: 'Expert restoration and replacement of missing teeth using crowns, bridges, and prosthetics.',
    fullDesc: 'Specialized prosthodontic therapy delivered by Dr. Prasannakumar Kadakol, focused on restoring lost masticatory function, bite equilibrium, and facial aesthetics through precision-engineered prostheses.',
    details: [
      'Zirconia and porcelain-fused crowns',
      'Fixed dental bridges for missing gaps',
      'Complete and partial removable dentures',
      'Bite equilibration and TMJ comfort assessment'
    ],
    durationMinutes: 60,
    price: 'Consultation required',
    priceConfirmed: false,
    imageUrl: '/src/assets/images/treatment_prosthodontics_1793713726493.jpg',
    isPopular: true,
    active: true
  }
];

const DEFAULT_WORKING_HOURS: DayWorkingHours[] = [
  {
    dayOfWeek: 0,
    dayName: 'Sunday',
    isOpen: false,
    shifts: []
  },
  {
    dayOfWeek: 1,
    dayName: 'Monday',
    isOpen: true,
    shifts: [
      { start: '10:00', end: '13:30' },
      { start: '17:00', end: '20:30' }
    ]
  },
  {
    dayOfWeek: 2,
    dayName: 'Tuesday',
    isOpen: true,
    shifts: [
      { start: '10:00', end: '13:30' },
      { start: '17:00', end: '20:30' }
    ]
  },
  {
    dayOfWeek: 3,
    dayName: 'Wednesday',
    isOpen: true,
    shifts: [
      { start: '10:00', end: '13:30' },
      { start: '17:00', end: '20:30' }
    ]
  },
  {
    dayOfWeek: 4,
    dayName: 'Thursday',
    isOpen: true,
    shifts: [
      { start: '10:00', end: '13:30' },
      { start: '17:00', end: '20:30' }
    ]
  },
  {
    dayOfWeek: 5,
    dayName: 'Friday',
    isOpen: true,
    shifts: [
      { start: '10:00', end: '13:30' },
      { start: '17:00', end: '20:30' }
    ]
  },
  {
    dayOfWeek: 6,
    dayName: 'Saturday',
    isOpen: true,
    shifts: [
      { start: '10:00', end: '13:30' },
      { start: '17:00', end: '20:30' }
    ]
  }
];

class ClinicStore {
  private db: ClinicDatabase;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): ClinicDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          doctors: parsed.doctors || DEFAULT_DOCTORS,
          treatments: parsed.treatments || DEFAULT_TREATMENTS,
          appointments: parsed.appointments || [],
          workingHours: parsed.workingHours || DEFAULT_WORKING_HOURS,
          blockedDates: parsed.blockedDates || [],
          notifications: parsed.notifications || []
        };
      }
    } catch (err) {
      console.error('Failed to read database file, seeding defaults:', err);
    }

    const initialDb: ClinicDatabase = {
      settings: DEFAULT_SETTINGS,
      doctors: DEFAULT_DOCTORS,
      treatments: DEFAULT_TREATMENTS,
      appointments: [],
      workingHours: DEFAULT_WORKING_HOURS,
      blockedDates: [],
      notifications: []
    };
    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(data: ClinicDatabase) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Clinic Settings
  public getSettings(): ClinicSettings {
    return this.db.settings;
  }

  public updateSettings(updates: Partial<ClinicSettings>): ClinicSettings {
    this.db.settings = { ...this.db.settings, ...updates };
    this.saveDatabase(this.db);
    return this.db.settings;
  }

  // Doctors
  public getDoctors(): Doctor[] {
    return this.db.doctors.filter(d => d.active);
  }

  public getAllDoctors(): Doctor[] {
    return this.db.doctors;
  }

  public getDoctorById(id: string): Doctor | undefined {
    return this.db.doctors.find(d => d.id === id);
  }

  public saveDoctor(doctor: Doctor): Doctor {
    const idx = this.db.doctors.findIndex(d => d.id === doctor.id);
    if (idx >= 0) {
      this.db.doctors[idx] = doctor;
    } else {
      this.db.doctors.push(doctor);
    }
    this.saveDatabase(this.db);
    return doctor;
  }

  // Treatments
  public getTreatments(): Treatment[] {
    return this.db.treatments.filter(t => t.active);
  }

  public getAllTreatments(): Treatment[] {
    return this.db.treatments;
  }

  public getTreatmentById(id: string): Treatment | undefined {
    return this.db.treatments.find(t => t.id === id);
  }

  public saveTreatment(treatment: Treatment): Treatment {
    const idx = this.db.treatments.findIndex(t => t.id === treatment.id);
    if (idx >= 0) {
      this.db.treatments[idx] = treatment;
    } else {
      this.db.treatments.push(treatment);
    }
    this.saveDatabase(this.db);
    return treatment;
  }

  public deleteTreatment(id: string): boolean {
    const idx = this.db.treatments.findIndex(t => t.id === id);
    if (idx >= 0) {
      this.db.treatments[idx].active = false;
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // Working Hours & Blocked Dates
  public getWorkingHours(): DayWorkingHours[] {
    return this.db.workingHours;
  }

  public updateWorkingHours(hours: DayWorkingHours[]): DayWorkingHours[] {
    this.db.workingHours = hours;
    this.saveDatabase(this.db);
    return this.db.workingHours;
  }

  public getBlockedDates(): BlockedDate[] {
    return this.db.blockedDates;
  }

  public addBlockedDate(date: string, reason: string): BlockedDate {
    const newBlocked: BlockedDate = {
      id: `blk-${Date.now()}`,
      date,
      reason
    };
    this.db.blockedDates = this.db.blockedDates.filter(b => b.date !== date);
    this.db.blockedDates.push(newBlocked);
    this.saveDatabase(this.db);
    return newBlocked;
  }

  public deleteBlockedDate(id: string): boolean {
    const initLen = this.db.blockedDates.length;
    this.db.blockedDates = this.db.blockedDates.filter(b => b.id !== id);
    if (this.db.blockedDates.length !== initLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // Available Time Slots Engine (Strict double-booking prevention)
  public getAvailableSlots(doctorId: string, dateStr: string): BookingSlot[] {
    // Parse date in IST
    const dateObj = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = dateObj.getDay();

    // Check if whole date is blocked
    const isBlocked = this.db.blockedDates.some(b => b.date === dateStr);
    if (isBlocked) {
      return [];
    }

    const daySchedule = this.db.workingHours.find(w => w.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isOpen || daySchedule.shifts.length === 0) {
      return [];
    }

    const slotDuration = this.db.settings.slotDurationMinutes || 30;

    // Generate potential slots for all shifts
    const rawSlots: string[] = [];
    for (const shift of daySchedule.shifts) {
      const [startHour, startMin] = shift.start.split(':').map(Number);
      const [endHour, endMin] = shift.end.split(':').map(Number);

      let currentMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;

      while (currentMin + slotDuration <= endTotalMin) {
        const h = Math.floor(currentMin / 60);
        const m = currentMin % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = m.toString().padStart(2, '0');
        rawSlots.push(`${displayH}:${displayM} ${ampm}`);
        currentMin += slotDuration;
      }
    }

    // Existing active bookings for this doctor and date
    const bookedTimes = new Set(
      this.db.appointments
        .filter(a => a.doctorId === doctorId && a.appointmentDate === dateStr && a.status !== 'cancelled')
        .map(a => a.appointmentTime)
    );

    // Current IST check to avoid booking slots in the past if date is today
    const now = new Date();
    // Convert now to IST string YYYY-MM-DD
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIst = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
    const todayIstStr = nowIst.toISOString().split('T')[0];
    const isToday = dateStr === todayIstStr;
    const currentIstMinutes = nowIst.getHours() * 60 + nowIst.getMinutes();

    return rawSlots.map(timeStr => {
      let isAvailable = !bookedTimes.has(timeStr);
      let reason: string | undefined = undefined;

      if (!isAvailable) {
        reason = 'Booked';
      } else if (isToday) {
        // parse slot time to minutes
        const [timePart, modifier] = timeStr.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const slotMinutes = hours * 60 + minutes;

        if (slotMinutes <= currentIstMinutes + 15) { // 15 mins advance lead time
          isAvailable = false;
          reason = 'Time passed';
        }
      }

      return {
        time: timeStr,
        available: isAvailable,
        reason
      };
    });
  }

  // Appointments Management with Atomic Double-Booking Lock
  public createAppointment(data: {
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    patientAge?: number;
    treatmentId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    message?: string;
  }): { success: boolean; appointment?: Appointment; error?: string } {
    // 1. Validate fields
    if (!data.patientName?.trim()) {
      return { success: false, error: 'Patient name is required.' };
    }
    if (!data.patientPhone?.trim()) {
      return { success: false, error: 'Mobile phone number is required.' };
    }
    if (!data.appointmentDate || !data.appointmentTime) {
      return { success: false, error: 'Date and time slot must be selected.' };
    }

    // 2. Prevent past dates
    const dateObj = new Date(`${data.appointmentDate}T00:00:00`);
    if (isNaN(dateObj.getTime())) {
      return { success: false, error: 'Invalid appointment date format.' };
    }

    // 3. Check blocked date
    if (this.db.blockedDates.some(b => b.date === data.appointmentDate)) {
      return { success: false, error: 'The clinic is closed on this date.' };
    }

    // 4. Double-booking atomic check
    const existingConflict = this.db.appointments.find(
      a => a.doctorId === data.doctorId &&
           a.appointmentDate === data.appointmentDate &&
           a.appointmentTime === data.appointmentTime &&
           a.status !== 'cancelled'
    );

    if (existingConflict) {
      return {
        success: false,
        error: `The ${data.appointmentTime} slot on ${data.appointmentDate} is already reserved. Please choose another available slot.`
      };
    }

    const doctor = this.getDoctorById(data.doctorId) || this.db.doctors[0];
    const treatment = this.getTreatmentById(data.treatmentId) || this.db.treatments[0];

    // Generate unique booking reference: NDC-YYYY-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `NDC-${new Date().getFullYear()}-${randomHex}`;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingReference,
      patientName: data.patientName.trim(),
      patientPhone: data.patientPhone.trim(),
      patientEmail: data.patientEmail?.trim() || undefined,
      patientAge: data.patientAge ? Number(data.patientAge) : undefined,
      treatmentId: treatment.id,
      treatmentTitle: treatment.title,
      doctorId: doctor.id,
      doctorName: doctor.name,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      durationMinutes: treatment.durationMinutes || 30,
      message: data.message?.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.db.appointments.push(newAppointment);

    // Record notification events
    const notifPatient: NotificationRecord = {
      id: `notif-${Date.now()}-1`,
      appointmentId: newAppointment.id,
      bookingReference: newAppointment.bookingReference,
      type: 'confirmation',
      channel: 'WhatsApp',
      recipient: newAppointment.patientPhone,
      status: 'Ready',
      message: `Namaste ${newAppointment.patientName}, your appointment booking (${newAppointment.bookingReference}) for ${newAppointment.treatmentTitle} on ${newAppointment.appointmentDate} at ${newAppointment.appointmentTime} has been received by Nandita Dental Clinic, Hubli-Dharwad.`,
      timestamp: new Date().toISOString()
    };

    const notifClinic: NotificationRecord = {
      id: `notif-${Date.now()}-2`,
      appointmentId: newAppointment.id,
      bookingReference: newAppointment.bookingReference,
      type: 'clinic_alert',
      channel: 'SMS',
      recipient: this.db.settings.phone || 'Clinic Reception',
      status: 'Ready',
      message: `New Booking: ${newAppointment.patientName} (${newAppointment.patientPhone}) for ${newAppointment.treatmentTitle} with ${newAppointment.doctorName} on ${newAppointment.appointmentDate} at ${newAppointment.appointmentTime}.`,
      timestamp: new Date().toISOString()
    };

    this.db.notifications.push(notifPatient, notifClinic);
    this.saveDatabase(this.db);

    return { success: true, appointment: newAppointment };
  }

  public getAppointments(filters?: {
    search?: string;
    status?: string;
    date?: string;
    treatmentId?: string;
  }): Appointment[] {
    let list = [...this.db.appointments];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        a => a.patientName.toLowerCase().includes(q) ||
             a.patientPhone.includes(q) ||
             a.bookingReference.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter(a => a.status === filters.status);
    }

    if (filters?.date) {
      list = list.filter(a => a.appointmentDate === filters.date);
    }

    if (filters?.treatmentId && filters.treatmentId !== 'all') {
      list = list.filter(a => a.treatmentId === filters.treatmentId);
    }

    // Sort by appointment date descending, then time
    return list.sort((a, b) => {
      const cmp = b.appointmentDate.localeCompare(a.appointmentDate);
      if (cmp !== 0) return cmp;
      return b.appointmentTime.localeCompare(a.appointmentTime);
    });
  }

  public getAppointmentByRef(ref: string): Appointment | undefined {
    return this.db.appointments.find(
      a => a.bookingReference.toLowerCase() === ref.toLowerCase().trim()
    );
  }

  public updateAppointmentStatus(id: string, status: Appointment['status'], reason?: string): Appointment | null {
    const apt = this.db.appointments.find(a => a.id === id);
    if (!apt) return null;

    apt.status = status;
    apt.updatedAt = new Date().toISOString();
    if (reason) apt.cancellationReason = reason;

    // Log status notification
    this.db.notifications.push({
      id: `notif-${Date.now()}`,
      appointmentId: apt.id,
      bookingReference: apt.bookingReference,
      type: status === 'cancelled' ? 'cancellation' : 'confirmation',
      channel: 'WhatsApp',
      recipient: apt.patientPhone,
      status: 'Ready',
      message: `Your appointment ${apt.bookingReference} status was updated to: ${status.toUpperCase()}${reason ? ` (${reason})` : ''}. Nandita Dental Clinic.`,
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(this.db);
    return apt;
  }

  public rescheduleAppointment(id: string, newDate: string, newTime: string): { success: boolean; appointment?: Appointment; error?: string } {
    const apt = this.db.appointments.find(a => a.id === id);
    if (!apt) {
      return { success: false, error: 'Appointment not found' };
    }

    // Check if new slot is taken
    const conflict = this.db.appointments.find(
      a => a.id !== id &&
           a.doctorId === apt.doctorId &&
           a.appointmentDate === newDate &&
           a.appointmentTime === newTime &&
           a.status !== 'cancelled'
    );

    if (conflict) {
      return { success: false, error: 'The requested new slot is already booked.' };
    }

    apt.appointmentDate = newDate;
    apt.appointmentTime = newTime;
    apt.status = 'confirmed';
    apt.updatedAt = new Date().toISOString();

    this.db.notifications.push({
      id: `notif-${Date.now()}`,
      appointmentId: apt.id,
      bookingReference: apt.bookingReference,
      type: 'reschedule',
      channel: 'WhatsApp',
      recipient: apt.patientPhone,
      status: 'Ready',
      message: `Appointment ${apt.bookingReference} has been rescheduled to ${newDate} at ${newTime}. Nandita Dental Clinic.`,
      timestamp: new Date().toISOString()
    });

    this.saveDatabase(this.db);
    return { success: true, appointment: apt };
  }

  public updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const idx = this.db.appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const current = this.db.appointments[idx];
    const updated: Appointment = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.db.appointments[idx] = updated;
    this.saveDatabase(this.db);
    return updated;
  }

  public deleteAppointment(id: string): boolean {
    const initLen = this.db.appointments.length;
    this.db.appointments = this.db.appointments.filter(a => a.id !== id);
    if (this.db.appointments.length !== initLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  public getNotifications(): NotificationRecord[] {
    return [...this.db.notifications].reverse();
  }

  public getStats() {
    const today = new Date().toISOString().split('T')[0];
    const total = this.db.appointments.length;
    const todayCount = this.db.appointments.filter(a => a.appointmentDate === today).length;
    const pending = this.db.appointments.filter(a => a.status === 'pending').length;
    const confirmed = this.db.appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = this.db.appointments.filter(a => a.status === 'cancelled').length;
    const completed = this.db.appointments.filter(a => a.status === 'completed').length;

    return {
      total,
      today: todayCount,
      pending,
      confirmed,
      cancelled,
      completed
    };
  }
}

export const clinicDb = new ClinicStore();
