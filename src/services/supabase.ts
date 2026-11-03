import { createClient } from '@supabase/supabase-js';
import { Appointment } from '../types/clinic';

export const SUPABASE_PROJECT_ID = 'ihovewjjpkcxadattyky';
export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_je5sYsEC2Czmia5GacyVWA_h4WIElGJ';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});

/**
 * Format appointment for Supabase table insertion.
 * Maps both snake_case and camelCase for maximum compatibility.
 */
export function formatAppointmentForSupabase(apt: Appointment) {
  return {
    id: apt.id,
    booking_reference: apt.bookingReference,
    patient_name: apt.patientName,
    patient_phone: apt.patientPhone,
    patient_email: apt.patientEmail || null,
    patient_age: apt.patientAge || null,
    treatment_id: apt.treatmentId,
    treatment_title: apt.treatmentTitle,
    doctor_id: apt.doctorId,
    doctor_name: apt.doctorName,
    appointment_date: apt.appointmentDate,
    appointment_time: apt.appointmentTime,
    duration_minutes: apt.durationMinutes || 30,
    message: apt.message || null,
    status: apt.status || 'pending',
    cancellation_reason: apt.cancellationReason || null,
    created_at: apt.createdAt || new Date().toISOString(),
    updated_at: apt.updatedAt || new Date().toISOString()
  };
}

/**
 * Insert or update appointment in Supabase
 */
export async function syncAppointmentToSupabase(apt: Appointment): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = formatAppointmentForSupabase(apt);
    const { error } = await supabase
      .from('appointments')
      .upsert(payload, { onConflict: 'booking_reference' });

    if (error) {
      console.warn('Supabase upsert returned error (table might need setup or RLS policy):', error.message);
      return { success: false, error: error.message };
    }

    console.log('Successfully synced appointment to Supabase:', apt.bookingReference);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error syncing to Supabase';
    console.error('Failed to sync appointment to Supabase:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Update appointment status in Supabase
 */
export async function updateSupabaseAppointmentStatus(
  idOrRef: string,
  status: string,
  cancellationReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };
    if (cancellationReason) {
      updates.cancellation_reason = cancellationReason;
    }

    // Try matching either id or booking_reference
    const { error } = await supabase
      .from('appointments')
      .update(updates)
      .or(`id.eq.${idOrRef},booking_reference.eq.${idOrRef}`);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update Supabase appointment';
    return { success: false, error: msg };
  }
}

/**
 * Save contact form inquiry to Supabase
 */
export async function saveEnquiryToSupabase(enquiry: {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('enquiries').insert([
      {
        name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email || null,
        subject: enquiry.subject || null,
        message: enquiry.message,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.warn('Note: enquiries table might not be created in Supabase yet:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save enquiry';
    return { success: false, error: msg };
  }
}

/**
 * Fetch all appointments directly from Supabase database
 */
export async function fetchAppointmentsFromSupabase(): Promise<{ success: boolean; data: Appointment[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    if (!data) return { success: true, data: [] };

    const mapped: Appointment[] = data.map((row: Record<string, unknown>) => ({
      id: String(row.id || `apt-${row.booking_reference || Date.now()}`),
      bookingReference: String(row.booking_reference || row.bookingReference || 'NDC-UNKNOWN'),
      patientName: String(row.patient_name || row.patientName || 'Patient'),
      patientPhone: String(row.patient_phone || row.patientPhone || ''),
      patientEmail: row.patient_email ? String(row.patient_email) : (row.patientEmail ? String(row.patientEmail) : undefined),
      patientAge: row.patient_age !== undefined && row.patient_age !== null ? Number(row.patient_age) : undefined,
      treatmentId: String(row.treatment_id || row.treatmentId || 'trt-1'),
      treatmentTitle: String(row.treatment_title || row.treatmentTitle || 'General Consultation'),
      doctorId: String(row.doctor_id || row.doctorId || 'doc-1'),
      doctorName: String(row.doctor_name || row.doctorName || 'Dr. Prasannakumar Kadakol'),
      appointmentDate: String(row.appointment_date || row.appointmentDate || ''),
      appointmentTime: String(row.appointment_time || row.appointmentTime || ''),
      durationMinutes: Number(row.duration_minutes || row.durationMinutes || 30),
      message: row.message ? String(row.message) : undefined,
      status: (row.status as Appointment['status']) || 'pending',
      cancellationReason: row.cancellation_reason ? String(row.cancellation_reason) : undefined,
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || new Date().toISOString())
    }));

    return { success: true, data: mapped };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching from Supabase';
    return { success: false, data: [], error: msg };
  }
}

/**
 * Check Supabase connection health
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
  latencyMs?: number;
}> {
  const start = Date.now();
  try {
    // Attempt to query appointments
    const { data, error } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);

    const latencyMs = Date.now() - start;

    if (error) {
      // 42P01 is PostgreSQL relation does not exist
      if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('not find')) {
        return {
          connected: true,
          tableExists: false,
          message: 'Connected to Supabase project, but "appointments" table has not been created yet in SQL editor.',
          latencyMs
        };
      }
      return {
        connected: true,
        tableExists: false,
        message: `Connected to Supabase: ${error.message}`,
        latencyMs
      };
    }

    return {
      connected: true,
      tableExists: true,
      message: 'Active & connected. "appointments" table is accessible in Supabase.',
      latencyMs
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return {
      connected: false,
      tableExists: false,
      message: `Could not reach Supabase endpoint: ${msg}`
    };
  }
}

export const SUPABASE_SETUP_SQL = `-- Run this script in your Supabase SQL Editor:
-- Go to: https://supabase.com/dashboard/project/ihovewjjpkcxadattyky/sql

-- 1. Create Appointments Table
create table if not exists public.appointments (
  id text primary key,
  booking_reference text not null unique,
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  patient_age integer,
  treatment_id text not null,
  treatment_title text not null,
  doctor_id text not null,
  doctor_name text not null,
  appointment_date text not null,
  appointment_time text not null,
  duration_minutes integer default 30,
  message text,
  status text default 'pending',
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.appointments enable row level security;

-- 3. Create RLS Policies for Website Access
create policy "Allow public bookings" 
  on public.appointments 
  for insert 
  with check (true);

create policy "Allow public reading" 
  on public.appointments 
  for select 
  using (true);

create policy "Allow updates" 
  on public.appointments 
  for update 
  using (true);

-- 4. Optional: Create Enquiries Table for Contact Messages
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

alter table public.enquiries enable row level security;

create policy "Allow public enquiries" 
  on public.enquiries 
  for insert 
  with check (true);

create policy "Allow reading enquiries" 
  on public.enquiries 
  for select 
  using (true);
`;
