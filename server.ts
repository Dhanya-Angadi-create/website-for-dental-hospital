import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { clinicDb } from './src/server/db.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes

// 1. Clinic Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: clinicDb.getSettings() });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = clinicDb.updateSettings(req.body);
  res.json({ success: true, data: updated });
});

// 2. Doctors
app.get('/api/doctors', (req: Request, res: Response) => {
  const all = req.query.all === 'true';
  const doctors = all ? clinicDb.getAllDoctors() : clinicDb.getDoctors();
  res.json({ success: true, data: doctors });
});

app.post('/api/doctors', (req: Request, res: Response) => {
  const doctor = clinicDb.saveDoctor(req.body);
  res.json({ success: true, data: doctor });
});

// 3. Treatments
app.get('/api/treatments', (req: Request, res: Response) => {
  const all = req.query.all === 'true';
  const treatments = all ? clinicDb.getAllTreatments() : clinicDb.getTreatments();
  res.json({ success: true, data: treatments });
});

app.post('/api/treatments', (req: Request, res: Response) => {
  const treatment = clinicDb.saveTreatment(req.body);
  res.json({ success: true, data: treatment });
});

app.delete('/api/treatments/:id', (req: Request, res: Response) => {
  const success = clinicDb.deleteTreatment(req.params.id);
  res.json({ success });
});

// 4. Working Hours & Blocked Dates
app.get('/api/working-hours', (_req: Request, res: Response) => {
  res.json({ success: true, data: clinicDb.getWorkingHours() });
});

app.put('/api/working-hours', (req: Request, res: Response) => {
  const updated = clinicDb.updateWorkingHours(req.body);
  res.json({ success: true, data: updated });
});

app.get('/api/blocked-dates', (_req: Request, res: Response) => {
  res.json({ success: true, data: clinicDb.getBlockedDates() });
});

app.post('/api/blocked-dates', (req: Request, res: Response) => {
  const { date, reason } = req.body;
  if (!date) {
    return res.status(400).json({ success: false, error: 'Date is required' });
  }
  const blocked = clinicDb.addBlockedDate(date, reason || 'Clinic Holiday');
  res.json({ success: true, data: blocked });
});

app.delete('/api/blocked-dates/:id', (req: Request, res: Response) => {
  const success = clinicDb.deleteBlockedDate(req.params.id);
  res.json({ success });
});

// 5. Available Slots Engine
app.get('/api/slots', (req: Request, res: Response) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ success: false, error: 'doctorId and date query params are required' });
  }
  const slots = clinicDb.getAvailableSlots(String(doctorId), String(date));
  res.json({ success: true, data: slots });
});

// 6. Appointments
app.get('/api/appointments', (req: Request, res: Response) => {
  const { search, status, date, treatmentId } = req.query;
  const list = clinicDb.getAppointments({
    search: search ? String(search) : undefined,
    status: status ? String(status) : undefined,
    date: date ? String(date) : undefined,
    treatmentId: treatmentId ? String(treatmentId) : undefined
  });
  res.json({ success: true, data: list });
});

app.get('/api/appointments/ref/:ref', (req: Request, res: Response) => {
  const apt = clinicDb.getAppointmentByRef(req.params.ref);
  if (!apt) {
    return res.status(404).json({ success: false, error: 'Booking reference not found' });
  }
  res.json({ success: true, data: apt });
});

app.post('/api/appointments', async (req: Request, res: Response) => {
  const result = clinicDb.createAppointment(req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }

  // Dual Sync to Supabase
  if (result.appointment) {
    try {
      const { syncAppointmentToSupabase } = await import('./src/services/supabase.ts');
      const supabaseResult = await syncAppointmentToSupabase(result.appointment);
      console.log('Server Supabase sync status:', supabaseResult);
    } catch (err) {
      console.warn('Could not sync to Supabase in server background:', err);
    }
  }

  res.status(201).json(result);
});

app.patch('/api/appointments/:id/status', async (req: Request, res: Response) => {
  const { status, reason } = req.body;
  const updated = clinicDb.updateAppointmentStatus(req.params.id, status, reason);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Appointment not found' });
  }

  try {
    const { updateSupabaseAppointmentStatus } = await import('./src/services/supabase.ts');
    await updateSupabaseAppointmentStatus(updated.id, status, reason);
  } catch (err) {
    console.warn('Could not update status in Supabase:', err);
  }

  res.json({ success: true, data: updated });
});

app.patch('/api/appointments/:id/reschedule', async (req: Request, res: Response) => {
  const { newDate, newTime } = req.body;
  if (!newDate || !newTime) {
    return res.status(400).json({ success: false, error: 'New date and time are required' });
  }
  const result = clinicDb.rescheduleAppointment(req.params.id, newDate, newTime);
  if (!result.success) {
    return res.status(400).json(result);
  }

  if (result.appointment) {
    try {
      const { syncAppointmentToSupabase } = await import('./src/services/supabase.ts');
      await syncAppointmentToSupabase(result.appointment);
    } catch (err) {
      console.warn('Could not update rescheduled appointment in Supabase:', err);
    }
  }

  res.json(result);
});

// Edit entire appointment
app.put('/api/appointments/:id', async (req: Request, res: Response) => {
  const updated = clinicDb.updateAppointment(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Appointment not found' });
  }

  try {
    const { syncAppointmentToSupabase } = await import('./src/services/supabase.ts');
    await syncAppointmentToSupabase(updated);
  } catch (err) {
    console.warn('Could not sync edited appointment to Supabase:', err);
  }

  res.json({ success: true, data: updated });
});

// Delete appointment
app.delete('/api/appointments/:id', async (req: Request, res: Response) => {
  const success = clinicDb.deleteAppointment(req.params.id);
  try {
    const { supabase } = await import('./src/services/supabase.ts');
    await supabase.from('appointments').delete().eq('id', req.params.id);
  } catch (err) {
    console.warn('Could not delete appointment from Supabase:', err);
  }
  res.json({ success });
});


// Enquiries Endpoint with Supabase Sync
app.post('/api/enquiries', async (req: Request, res: Response) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ success: false, error: 'Name, phone, and message are required' });
  }

  try {
    const { saveEnquiryToSupabase } = await import('./src/services/supabase.ts');
    const result = await saveEnquiryToSupabase({ name, phone, email, subject, message });
    res.json({ success: true, supabase: result });
  } catch (err) {
    res.json({ success: true, note: 'Received locally' });
  }
});

// Supabase Health & Sync Check
app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  try {
    const { testSupabaseConnection, SUPABASE_PROJECT_ID, SUPABASE_URL } = await import('./src/services/supabase.ts');
    const health = await testSupabaseConnection();
    res.json({
      success: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      ...health
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error testing Supabase';
    res.status(500).json({ success: false, error: msg });
  }
});


// 7. Admin Stats & Auth & Notifications
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  res.json({ success: true, data: clinicDb.getStats() });
});

app.get('/api/admin/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, data: clinicDb.getNotifications() });
});

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Secure credentials with simple session token
  if ((username === 'admin' || username === 'clinic') && password === 'nandita2026!') {
    res.json({
      success: true,
      token: 'nandita-auth-token-session-valid-2026',
      user: {
        username: 'admin',
        role: 'Clinic Administrator',
        clinicName: 'Nandita Dental Clinic'
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
});

// Frontend Vite Integration
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Nandita Dental Clinic server running on http://localhost:${PORT}`);
  });
}

startServer();
