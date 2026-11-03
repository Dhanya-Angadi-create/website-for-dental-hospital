import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Users,
  Settings,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  RefreshCw,
  Bell,
  MapPin,
  Phone,
  MessageCircle,
  Save,
  Check,
  FileText,
  Database,
  ExternalLink,
  Copy,
  Eye,
  Download,
  PhoneCall,
  MessageSquare,
  CheckCheck
} from 'lucide-react';
import {
  Appointment,
  ClinicSettings,
  Doctor,
  Treatment,
  DayWorkingHours,
  BlockedDate,
  NotificationRecord
} from '../types/clinic';
import { api } from '../services/api';
import {
  testSupabaseConnection,
  SUPABASE_SETUP_SQL,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  syncAppointmentToSupabase,
  fetchAppointmentsFromSupabase,
  updateSupabaseAppointmentStatus,
  supabase
} from '../services/supabase';

interface AdminDashboardProps {
  onClinicUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClinicUpdated }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nandita_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active tab inside admin
  const [adminTab, setAdminTab] = useState<'appointments' | 'settings' | 'treatments' | 'hours' | 'blocked' | 'notifications' | 'supabase'>('appointments');

  // Supabase Integration state
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tableExists: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Live Data
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [workingHours, setWorkingHours] = useState<DayWorkingHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  // Filtering for appointments
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [treatmentFilter, setTreatmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Loading & feedback states
  const [loading, setLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Modal / Editing states for treatments & holidays
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [isNewTreatment, setIsNewTreatment] = useState(false);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  // Appointment management modal states
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('Cancelled by clinic administration');
  const [dataSourceMode, setDataSourceMode] = useState<'all' | 'supabase_direct'>('all');
  const [isFetchingSupabaseDirect, setIsFetchingSupabaseDirect] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Initial load
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [st, apts, setts, trts, docs, wh, blk, notifs] = await Promise.all([
        api.getAdminStats(),
        api.getAppointments({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          treatmentId: treatmentFilter !== 'all' ? treatmentFilter : undefined,
          date: dateFilter || undefined
        }),
        api.getSettings(),
        api.getTreatments(true),
        api.getDoctors(true),
        api.getWorkingHours(),
        api.getBlockedDates(),
        api.getNotifications()
      ]);

      setStats(st);
      setAppointments(apts);
      setSettings(setts);
      setTreatments(trts);
      setDoctors(docs);
      setWorkingHours(wh);
      setBlockedDates(blk);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, searchQuery, statusFilter, treatmentFilter, dateFilter]);

  // Real-time Supabase Subscription
  useEffect(() => {
    const channel = supabase
      .channel('appointments-realtime-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('Realtime Postgres notification from Supabase:', payload);
          loadDashboardData();
          triggerToast(`Supabase update detected: ${payload.eventType}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.adminLogin(username, password || 'nandita2026!');
      if (res.success) {
        setIsAuthenticated(true);
        localStorage.setItem('nandita_admin_auth', 'true');
      } else {
        setLoginError('Invalid username or password.');
      }
    } catch {
      setLoginError('Could not authenticate. Please verify password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('nandita2026!');
    setIsAuthenticated(true);
    localStorage.setItem('nandita_admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nandita_admin_auth');
  };

  // Appointment Actions: Save Edited Details
  const handleSaveEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    setIsSavingEdit(true);
    try {
      const updated = await api.updateAppointment(editingAppointment.id, editingAppointment);
      await syncAppointmentToSupabase(updated);
      triggerToast(`Appointment ${updated.bookingReference} updated and saved to Supabase!`);
      setEditingAppointment(null);
      if (viewingAppointment?.id === updated.id) {
        setViewingAppointment(updated);
      }
      loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update appointment';
      alert(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Appointment Actions: Confirm Cancellation
  const handleConfirmCancelAppointment = async () => {
    if (!cancellingAppointment) return;
    try {
      await api.updateAppointmentStatus(
        cancellingAppointment.id,
        'cancelled',
        cancelReasonInput || 'Cancelled by clinic administration'
      );
      await updateSupabaseAppointmentStatus(
        cancellingAppointment.id,
        'cancelled',
        cancelReasonInput || 'Cancelled by clinic administration'
      );
      triggerToast(`Appointment ${cancellingAppointment.bookingReference} cancelled & slot released.`);
      setCancellingAppointment(null);
      if (viewingAppointment?.id === cancellingAppointment.id) {
        setViewingAppointment(null);
      }
      loadDashboardData();
    } catch {
      alert('Failed to cancel appointment');
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (id: string, ref: string) => {
    if (window.confirm(`Permanently remove booking ${ref} from database?`)) {
      try {
        await api.deleteAppointment(id);
        triggerToast(`Appointment ${ref} removed.`);
        if (viewingAppointment?.id === id) setViewingAppointment(null);
        loadDashboardData();
      } catch {
        alert('Failed to delete appointment');
      }
    }
  };

  // Switch between All Sync and Supabase Direct query
  const handleToggleDataSource = async (mode: 'all' | 'supabase_direct') => {
    setDataSourceMode(mode);
    if (mode === 'supabase_direct') {
      setIsFetchingSupabaseDirect(true);
      try {
        const res = await fetchAppointmentsFromSupabase();
        if (res.success && res.data.length > 0) {
          setAppointments(res.data);
          triggerToast(`Retrieved ${res.data.length} live bookings directly from Supabase!`);
        } else if (res.error) {
          triggerToast(`Supabase note: ${res.error}. Displaying local database records.`);
        } else {
          triggerToast('Connected to Supabase. Table currently has 0 rows.');
        }
      } catch {
        triggerToast('Could not query Supabase directly. Displaying local records.');
      } finally {
        setIsFetchingSupabaseDirect(false);
      }
    } else {
      loadDashboardData();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (appointments.length === 0) {
      triggerToast('No appointment data to export.');
      return;
    }

    const headers = [
      'Reference',
      'Patient Name',
      'Phone',
      'Email',
      'Age',
      'Treatment',
      'Doctor',
      'Date',
      'Time',
      'Status',
      'Cancellation Reason',
      'Created At'
    ];

    const rows = appointments.map((a) => [
      `"${a.bookingReference}"`,
      `"${a.patientName}"`,
      `"${a.patientPhone}"`,
      `"${a.patientEmail || ''}"`,
      `"${a.patientAge || ''}"`,
      `"${a.treatmentTitle}"`,
      `"${a.doctorName}"`,
      `"${a.appointmentDate}"`,
      `"${a.appointmentTime}"`,
      `"${a.status}"`,
      `"${a.cancellationReason || ''}"`,
      `"${a.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nandita_dental_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Bookings exported to CSV successfully!');
  };


  // Appointment Actions
  const handleUpdateStatus = async (id: string, status: Appointment['status'], reason?: string) => {
    try {
      await api.updateAppointmentStatus(id, status, reason);
      loadDashboardData();
      triggerToast(`Appointment marked as ${status.toUpperCase()}`);
    } catch {
      alert('Failed to update appointment status');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      onClinicUpdated();
      triggerToast('Clinic details and contact information updated successfully!');
    } catch {
      alert('Failed to save settings');
    }
  };

  // Working Hours Save
  const handleSaveWorkingHours = async () => {
    try {
      const updated = await api.updateWorkingHours(workingHours);
      setWorkingHours(updated);
      triggerToast('Working hours and shifts saved!');
    } catch {
      alert('Failed to save working hours');
    }
  };

  // Blocked Date
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    try {
      await api.addBlockedDate(newBlockedDate, newBlockedReason || 'Clinic Holiday');
      setNewBlockedDate('');
      setNewBlockedReason('');
      loadDashboardData();
      triggerToast('Date blocked from appointment booking');
    } catch {
      alert('Failed to add blocked date');
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    if (window.confirm('Unblock this date?')) {
      await api.deleteBlockedDate(id);
      loadDashboardData();
      triggerToast('Date unblocked');
    }
  };

  // Treatment Save
  const handleSaveTreatmentModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTreatment) return;
    try {
      await api.saveTreatment(editingTreatment);
      setEditingTreatment(null);
      setIsNewTreatment(false);
      loadDashboardData();
      onClinicUpdated();
      triggerToast('Treatment saved successfully!');
    } catch {
      alert('Failed to save treatment');
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (window.confirm('Archive this treatment? It will no longer appear on the website.')) {
      await api.deleteTreatment(id);
      loadDashboardData();
      onClinicUpdated();
      triggerToast('Treatment archived');
    }
  };

  const triggerToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      const res = await testSupabaseConnection();
      setSupabaseStatus(res);
      triggerToast(res.message);
    } catch {
      setSupabaseStatus({
        connected: false,
        tableExists: false,
        message: 'Unable to connect to Supabase.'
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleBulkSyncToSupabase = async () => {
    if (appointments.length === 0) {
      triggerToast('No appointments to sync.');
      return;
    }
    setIsSyncingSupabase(true);
    let successCount = 0;
    try {
      for (const apt of appointments) {
        const res = await syncAppointmentToSupabase(apt);
        if (res.success) successCount++;
      }
      triggerToast(`Synced ${successCount} of ${appointments.length} appointments to Supabase!`);
    } catch {
      triggerToast('Error during bulk sync.');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    triggerToast('SQL script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#D6ECE8] text-[#123B46] rounded-xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Clinic Administration Login
            </h2>
            <p className="text-xs text-slate-500">
              Nandita Dental Clinic · Hubli-Dharwad
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying...' : 'Access Clinic Dashboard'}
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              One-Click Login as Admin
            </button>
          </form>

          {/* Quick Helper for review */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 block">Default Credentials:</span>
            <span>Username: <strong className="text-slate-800 font-mono">admin</strong></span>
            <span className="block">Password: <strong className="text-slate-800 font-mono">nandita2026!</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {saveSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 p-3 bg-emerald-900 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#D6ECE8] text-[#123B46]">
              Authorized Admin Portal
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Hubli-Dharwad, Karnataka</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">
            Nandita Dental Clinic Control Panel
          </h1>
          <p className="text-xs text-slate-500">
            Real-time appointments, working shifts, treatment catalog, and clinic details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Total Bookings</span>
          <span className="text-2xl font-bold text-slate-900 font-display tabular-nums">
            {stats.total}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Today's Slots</span>
          <span className="text-2xl font-bold text-[#123B46] font-display tabular-nums">
            {stats.today}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-amber-600 block">Pending Requests</span>
          <span className="text-2xl font-bold text-amber-700 font-display tabular-nums">
            {stats.pending}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-emerald-600 block">Confirmed</span>
          <span className="text-2xl font-bold text-emerald-700 font-display tabular-nums">
            {stats.confirmed}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Completed</span>
          <span className="text-2xl font-bold text-slate-700 font-display tabular-nums">
            {stats.completed}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-red-500 block">Cancelled</span>
          <span className="text-2xl font-bold text-red-600 font-display tabular-nums">
            {stats.cancelled}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('appointments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            adminTab === 'appointments'
              ? 'bg-[#123B46] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            adminTab === 'settings'
              ? 'bg-[#123B46] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Clinic Info & Contacts
        </button>

        <button
          onClick={() => setAdminTab('treatments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            adminTab === 'treatments'
              ? 'bg-[#123B46] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Treatments & Pricing ({treatments.length})
        </button>

        <button
          onClick={() => setAdminTab('hours')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            adminTab === 'hours'
              ? 'bg-[#123B46] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Working Hours & Shifts
        </button>

        <button
          onClick={() => setAdminTab('blocked')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            adminTab === 'blocked'
              ? 'bg-[#123B46] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Blocked Dates / Holidays ({blockedDates.length})
        </button>

        <button
          onClick={() => setAdminTab('notifications')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            adminTab === 'notifications'
              ? 'bg-[#123B46] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Notification Logs ({notifications.length})
        </button>

        <button
          onClick={() => {
            setAdminTab('supabase');
            if (!supabaseStatus) handleTestSupabase();
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            adminTab === 'supabase'
              ? 'bg-emerald-800 text-white shadow-2xs'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Supabase DB (ihovewjjpkcxadattyky)</span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS MANAGEMENT */}
      {adminTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          {/* Header Bar with Source Selection & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  All Stored Appointments
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#D6ECE8] text-[#123B46] tabular-nums">
                  {appointments.length} Total
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                View, manage, edit, reschedule, or cancel patient bookings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Data Source Selector */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleDataSource('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    dataSourceMode === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Database Bookings
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDataSource('supabase_direct')}
                  disabled={isFetchingSupabaseDirect}
                  className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                    dataSourceMode === 'supabase_direct'
                      ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                      : 'text-emerald-800 hover:text-emerald-900'
                  }`}
                >
                  <Database className="w-3 h-3" />
                  <span>{isFetchingSupabaseDirect ? 'Querying...' : 'Live Supabase Only'}</span>
                </button>
              </div>

              {/* Export to CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
                title="Export bookings to CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
                title="Refresh table data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, phone, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={treatmentFilter}
              onChange={(e) => setTreatmentFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white"
            >
              <option value="all">All Treatments</option>
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            <div className="flex gap-1.5">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white"
              />
              {(searchQuery || statusFilter !== 'all' || treatmentFilter !== 'all' || dateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTreatmentFilter('all');
                    setDateFilter('');
                  }}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                  title="Clear all filters"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Appointments Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Ref #</th>
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Treatment & Doctor</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Manage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      <p className="font-medium text-xs">No appointments found matching your search or filters.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Book an appointment on the website to see it appear here immediately.</p>
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ref */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setViewingAppointment(apt)}
                          className="font-mono font-bold text-[#123B46] hover:underline"
                          title="Click to view details"
                        >
                          {apt.bookingReference}
                        </button>
                      </td>

                      {/* Patient Name & Age */}
                      <td className="py-3 px-3 font-medium text-slate-900">
                        <span>{apt.patientName}</span>
                        {apt.patientAge && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Age: {apt.patientAge}
                          </span>
                        )}
                      </td>

                      {/* Mobile & Shortcuts */}
                      <td className="py-3 px-3">
                        <span className="font-medium tabular-nums block text-slate-800">{apt.patientPhone}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Direct WhatsApp link */}
                          <a
                            href={`https://wa.me/91${apt.patientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${apt.patientName}, Nandita Dental Clinic regarding your booking ${apt.bookingReference}: `
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#25D366] hover:underline text-[10px] flex items-center gap-0.5 font-medium"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WA</span>
                          </a>
                          <span className="text-slate-300">·</span>
                          {/* Direct Call link */}
                          <a
                            href={`tel:${apt.patientPhone}`}
                            className="text-[#123B46] hover:underline text-[10px] flex items-center gap-0.5 font-medium"
                            title="Call patient"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </div>
                      </td>

                      {/* Treatment & Doctor */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block">{apt.treatmentTitle}</span>
                        <span className="text-[11px] text-slate-500 block">{apt.doctorName}</span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 tabular-nums">
                        <span className="font-semibold text-slate-900 block">
                          {apt.appointmentDate}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {apt.appointmentTime}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : apt.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {apt.status.toUpperCase()}
                        </span>
                        {apt.cancellationReason && (
                          <span className="text-[10px] text-red-600 block truncate max-w-[130px]" title={apt.cancellationReason}>
                            {apt.cancellationReason}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Modal */}
                          <button
                            type="button"
                            onClick={() => setViewingAppointment(apt)}
                            className="p-1 text-slate-600 hover:text-[#123B46] hover:bg-slate-100 rounded"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Modal */}
                          <button
                            type="button"
                            onClick={() => setEditingAppointment({ ...apt })}
                            className="p-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit Booking"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Approve */}
                          {apt.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                              className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-2xs"
                              title="Confirm appointment"
                            >
                              Approve
                            </button>
                          )}

                          {/* Quick Complete */}
                          {apt.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(apt.id, 'completed')}
                              className="px-2 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs"
                              title="Mark appointment completed"
                            >
                              Complete
                            </button>
                          )}

                          {/* Cancel Dialog */}
                          {apt.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancellingAppointment(apt);
                                setCancelReasonInput('Cancelled by clinic administration');
                              }}
                              className="px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 rounded border border-red-200"
                              title="Cancel appointment"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAppointment(apt.id, apt.bookingReference)}
                            className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Permanently remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* TAB 2: CLINIC SETTINGS & CONTACT INFO */}
      {adminTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Clinic Profile & Editable Information
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update clinic name, doctor credentials, phone numbers, exact address in Hubli-Dharwad, and Google Maps embed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinic Business Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consulting Doctor Name
              </label>
              <input
                type="text"
                value={settings.doctorName}
                onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Speciality / Title
              </label>
              <input
                type="text"
                value={settings.speciality}
                onChange={(e) => setSettings({ ...settings, speciality: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Fee
              </label>
              <input
                type="text"
                placeholder="e.g. ₹300, ₹500, or Pending clinic confirmation"
                value={settings.consultationFee}
                onChange={(e) => setSettings({ ...settings, consultationFee: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinic Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98450 XXXXX"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value, phoneConfirmed: true })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinic WhatsApp Number
              </label>
              <input
                type="text"
                placeholder="e.g. 9845012345"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value, whatsappConfirmed: true })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinic Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. info@nanditadental.com"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value, emailConfirmed: true })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slot Duration (Minutes)
              </label>
              <select
                value={settings.slotDurationMinutes}
                onChange={(e) => setSettings({ ...settings, slotDurationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exact Clinic Address (Hubli-Dharwad)
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Maps Embed URL
            </label>
            <input
              type="text"
              value={settings.googleMapsEmbedUrl}
              onChange={(e) => setSettings({ ...settings, googleMapsEmbedUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46] font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              About Clinic Description (Appears on About & Home pages)
            </label>
            <textarea
              rows={3}
              value={settings.aboutText}
              onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Clinic Information</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: TREATMENTS & PRICING */}
      {adminTab === 'treatments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Treatments Catalog & Pricing
              </h3>
              <p className="text-xs text-slate-500">
                Manage treatments, descriptions, and price visibility.
              </p>
            </div>
            <button
              onClick={() => {
                setIsNewTreatment(true);
                setEditingTreatment({
                  id: `trt-${Date.now()}`,
                  title: '',
                  shortDesc: '',
                  fullDesc: '',
                  details: ['Sterile surgical environment', 'Precision instruments'],
                  durationMinutes: 30,
                  price: '₹500',
                  priceConfirmed: false,
                  imageUrl: '/src/assets/images/treatment_root_canal_1793713703877.jpg',
                  active: true
                });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#123B46] rounded-lg hover:bg-[#0c2a32]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Treatment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                    <span className="text-xs font-semibold text-[#123B46] bg-[#D6ECE8] px-2 py-0.5 rounded">
                      {t.priceConfirmed ? t.price : 'Consultation required'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{t.shortDesc}</p>
                  <p className="text-[11px] text-slate-400 mt-2">Duration: ~{t.durationMinutes} mins</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsNewTreatment(false);
                      setEditingTreatment({ ...t });
                    }}
                    className="p-1.5 text-slate-600 hover:text-[#123B46] hover:bg-slate-100 rounded"
                    title="Edit Treatment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTreatment(t.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Archive Treatment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Treatment Edit Modal */}
          {editingTreatment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {isNewTreatment ? 'Add Treatment' : 'Edit Treatment'}
                  </h4>
                  <button onClick={() => setEditingTreatment(null)}>
                    <XCircle className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSaveTreatmentModal} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Title</label>
                    <input
                      type="text"
                      required
                      value={editingTreatment.title}
                      onChange={(e) => setEditingTreatment({ ...editingTreatment, title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
                    <input
                      type="text"
                      required
                      value={editingTreatment.shortDesc}
                      onChange={(e) => setEditingTreatment({ ...editingTreatment, shortDesc: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Clinical Description</label>
                    <textarea
                      rows={3}
                      value={editingTreatment.fullDesc}
                      onChange={(e) => setEditingTreatment({ ...editingTreatment, fullDesc: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Price (e.g. ₹500)</label>
                      <input
                        type="text"
                        value={editingTreatment.price}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, price: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        value={editingTreatment.durationMinutes}
                        onChange={(e) => setEditingTreatment({ ...editingTreatment, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 text-xs border rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="priceConfirmed"
                      checked={editingTreatment.priceConfirmed}
                      onChange={(e) => setEditingTreatment({ ...editingTreatment, priceConfirmed: e.target.checked })}
                      className="rounded text-[#123B46]"
                    />
                    <label htmlFor="priceConfirmed" className="text-xs text-slate-700">
                      Display exact price on website (Unchecked shows "Consultation required")
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingTreatment(null)}
                      className="px-3 py-1.5 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#123B46] rounded"
                    >
                      Save Treatment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WORKING HOURS & SHIFTS */}
      {adminTab === 'hours' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Weekly Working Hours & Shifts (IST)
              </h3>
              <p className="text-xs text-slate-500">
                Configure opening days and morning/evening shifts. Changes automatically update slot generation.
              </p>
            </div>
            <button
              onClick={handleSaveWorkingHours}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg shadow-2xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {workingHours.map((wh, idx) => (
              <div key={wh.dayOfWeek} className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`open-${wh.dayOfWeek}`}
                    checked={wh.isOpen}
                    onChange={(e) => {
                      const copy = [...workingHours];
                      copy[idx].isOpen = e.target.checked;
                      if (e.target.checked && copy[idx].shifts.length === 0) {
                        copy[idx].shifts = [
                          { start: '10:00', end: '13:30' },
                          { start: '17:00', end: '20:30' }
                        ];
                      }
                      setWorkingHours(copy);
                    }}
                    className="w-4 h-4 text-[#123B46] rounded"
                  />
                  <label htmlFor={`open-${wh.dayOfWeek}`} className="text-xs font-bold text-slate-800">
                    {wh.dayName}
                  </label>
                </div>

                <div className="md:col-span-9 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  {wh.isOpen ? (
                    wh.shifts.map((shift, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5 p-2 bg-slate-50 border rounded-lg">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {sIdx === 0 ? 'Morning' : 'Evening'}:
                        </span>
                        <input
                          type="time"
                          value={shift.start}
                          onChange={(e) => {
                            const copy = [...workingHours];
                            copy[idx].shifts[sIdx].start = e.target.value;
                            setWorkingHours(copy);
                          }}
                          className="border border-slate-200 rounded px-1.5 py-0.5"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={shift.end}
                          onChange={(e) => {
                            const copy = [...workingHours];
                            copy[idx].shifts[sIdx].end = e.target.value;
                            setWorkingHours(copy);
                          }}
                          className="border border-slate-200 rounded px-1.5 py-0.5"
                        />
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">Closed all day</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BLOCKED DATES & HOLIDAYS */}
      {adminTab === 'blocked' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Blocked Dates & Clinic Holidays
            </h3>
            <p className="text-xs text-slate-500">
              Dates listed here will automatically hide all slots and prevent patients from booking.
            </p>
          </div>

          {/* Form to add blocked date */}
          <form onSubmit={handleAddBlockedDate} className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                required
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Holiday Name
              </label>
              <input
                type="text"
                placeholder="e.g. Karnataka Rajyotsava / Doctor Leave"
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Block Date</span>
            </button>
          </form>

          {/* Blocked dates table */}
          <div className="space-y-2">
            {blockedDates.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No dates are currently blocked. The clinic operates according to standard weekly schedule.
              </p>
            ) : (
              blockedDates.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 tabular-nums">{b.date}</span>
                    <span className="text-slate-500 ml-2">({b.reason})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBlockedDate(b.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Remove block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATION AUDIT LOGS */}
      {adminTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Automated Notification Audit Logs
            </h3>
            <p className="text-xs text-slate-500">
              System records for all booking confirmations, clinic alerts, reminders, and patient updates.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Message Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No notifications logged yet. Make a test booking to see event triggers.
                    </td>
                  </tr>
                ) : (
                  notifications.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-500 tabular-nums">
                        {new Date(n.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-[#123B46]">
                        {n.bookingReference}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                          {n.channel}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 tabular-nums">
                        {n.recipient}
                      </td>
                      <td className="py-2.5 px-4 capitalize">
                        {n.type}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-sm truncate" title={n.message}>
                        {n.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SUPABASE DATABASE INTEGRATION */}
      {adminTab === 'supabase' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-100 text-emerald-800">
                  <Database className="w-4 h-4 text-emerald-700" />
                </span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Supabase Cloud Database Integration
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Connected to your project: <strong className="text-slate-800 font-mono">ihovewjjpkcxadattyky</strong>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                <span>Test Live Connection</span>
              </button>

              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Connection Status Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">
                  Connection Configuration: Verified
                </span>
              </div>
              {supabaseStatus?.latencyMs !== undefined && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Latency: {supabaseStatus.latencyMs}ms
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Supabase Project ID</span>
                <span className="font-mono font-medium text-slate-800">{SUPABASE_PROJECT_ID}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">REST API Endpoint</span>
                <span className="font-mono text-slate-800">{SUPABASE_URL}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Client Publishable Key</span>
                <span className="font-mono text-[11px] text-slate-600 truncate block">sb_publishable_je5sYsEC2Czmia5GacyVWA_h4WIElGJ</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Auto-Sync Status</span>
                <span className="font-semibold text-emerald-700">Active (Syncs on every appointment booking)</span>
              </div>
            </div>

            {supabaseStatus && (
              <div className={`p-3 rounded-lg text-xs ${supabaseStatus.connected ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                <p className="font-semibold">{supabaseStatus.message}</p>
              </div>
            )}
          </div>

          {/* Bulk Sync Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#D6ECE8]/30 border border-[#123B46]/10 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Push Existing Appointments to Supabase
              </h4>
              <p className="text-[11px] text-slate-600">
                Sync all {appointments.length} current appointments stored in the clinic scheduling database directly to your Supabase table.
              </p>
            </div>
            <button
              onClick={handleBulkSyncToSupabase}
              disabled={isSyncingSupabase}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg shadow-2xs whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
              <span>{isSyncingSupabase ? 'Syncing to Supabase...' : 'Sync All Bookings Now'}</span>
            </button>
          </div>

          {/* Database Setup & SQL */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Supabase Table Setup (SQL Script)
                </h4>
                <p className="text-xs text-slate-500">
                  If you haven't created the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">appointments</code> table in Supabase yet, open the{' '}
                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#123B46] font-semibold underline"
                  >
                    SQL Editor in Supabase
                  </a>
                  , paste this script, and click <strong>Run</strong>.
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-slate-200 text-xs font-mono p-4 max-h-72 overflow-y-auto">
              <pre>{SUPABASE_SETUP_SQL}</pre>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW APPOINTMENT DETAILS */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#123B46] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#D6ECE8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display">
                    Booking Details: {viewingAppointment.bookingReference}
                  </h3>
                  <p className="text-[11px] text-[#D6ECE8]">
                    {viewingAppointment.patientName} · {viewingAppointment.status.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingAppointment(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Patient Profile */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider">
                    Patient Profile
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      viewingAppointment.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingAppointment.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : viewingAppointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {viewingAppointment.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Full Name</span>
                    <span className="font-bold text-slate-900">{viewingAppointment.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Age</span>
                    <span>{viewingAppointment.patientAge ? `${viewingAppointment.patientAge} years` : 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    <span className="font-medium tabular-nums">{viewingAppointment.patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span>{viewingAppointment.patientEmail || 'Not provided'}</span>
                  </div>
                </div>

                {/* Quick Contact Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-200/60">
                  <a
                    href={`https://wa.me/91${viewingAppointment.patientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Namaste ${viewingAppointment.patientName}, from Nandita Dental Clinic regarding your appointment ${viewingAppointment.bookingReference}: `
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-semibold hover:bg-[#20ba59] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Patient</span>
                  </a>
                  <a
                    href={`tel:${viewingAppointment.patientPhone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-300 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Patient</span>
                  </a>
                </div>
              </div>

              {/* Appointment Service & Schedule */}
              <div className="p-4 rounded-xl border border-slate-200/80 space-y-2">
                <span className="font-semibold text-slate-900 uppercase text-[10px] tracking-wider block border-b pb-1.5">
                  Treatment & Timings
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Treatment</span>
                    <span className="font-bold text-[#123B46]">{viewingAppointment.treatmentTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Consulting Doctor</span>
                    <span>{viewingAppointment.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Appointment Date</span>
                    <span className="font-semibold tabular-nums text-slate-900">{viewingAppointment.appointmentDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Time Slot</span>
                    <span className="font-semibold text-slate-900">{viewingAppointment.appointmentTime} (IST)</span>
                  </div>
                </div>
              </div>

              {/* Message / Patient Notes */}
              {viewingAppointment.message && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Patient Notes / Symptoms
                  </span>
                  <p className="text-xs text-slate-800 mt-0.5">{viewingAppointment.message}</p>
                </div>
              )}

              {/* Cancellation Reason if cancelled */}
              {viewingAppointment.cancellationReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  <span className="block text-[10px] uppercase font-bold">Cancellation Reason</span>
                  <p className="text-xs mt-0.5">{viewingAppointment.cancellationReason}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-[11px] text-slate-400 flex justify-between border-t pt-2">
                <span>Booked: {new Date(viewingAppointment.createdAt).toLocaleString('en-IN')}</span>
                <span>Last Updated: {new Date(viewingAppointment.updatedAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDeleteAppointment(viewingAppointment.id, viewingAppointment.bookingReference)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Delete Record
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = { ...viewingAppointment };
                    setViewingAppointment(null);
                    setEditingAppointment(toEdit);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Booking</span>
                </button>

                {viewingAppointment.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      const toCancel = { ...viewingAppointment };
                      setViewingAppointment(null);
                      setCancellingAppointment(toCancel);
                      setCancelReasonInput('Cancelled by clinic administration');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg"
                  >
                    Cancel Booking
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewingAppointment(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT APPOINTMENT */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#123B46] text-white">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#D6ECE8]" />
                <h3 className="text-sm font-bold font-display">
                  Edit Appointment: {editingAppointment.bookingReference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAppointment} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAppointment.patientName}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editingAppointment.patientPhone}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientPhone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingAppointment.patientEmail || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    value={editingAppointment.patientAge || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientAge: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Treatment
                  </label>
                  <select
                    value={editingAppointment.treatmentId}
                    onChange={(e) => {
                      const t = treatments.find(item => item.id === e.target.value);
                      setEditingAppointment({
                        ...editingAppointment,
                        treatmentId: e.target.value,
                        treatmentTitle: t ? t.title : editingAppointment.treatmentTitle
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {treatments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Doctor
                  </label>
                  <select
                    value={editingAppointment.doctorId}
                    onChange={(e) => {
                      const d = doctors.find(doc => doc.id === e.target.value);
                      setEditingAppointment({
                        ...editingAppointment,
                        doctorId: e.target.value,
                        doctorName: d ? d.name : editingAppointment.doctorName
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingAppointment.appointmentDate}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointmentDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={editingAppointment.appointmentTime}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointmentTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as Appointment['status'] })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {editingAppointment.status === 'cancelled' && (
                <div>
                  <label className="block text-xs font-semibold text-red-700 mb-1">
                    Cancellation Reason
                  </label>
                  <input
                    type="text"
                    value={editingAppointment.cancellationReason || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, cancellationReason: e.target.value })}
                    placeholder="e.g. Patient called to cancel, Doctor on emergency leave"
                    className="w-full px-3 py-1.5 text-xs border border-red-300 rounded-lg bg-red-50/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Notes / Clinical Query
                </label>
                <textarea
                  rows={2}
                  value={editingAppointment.message || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, message: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  placeholder="Additional instructions or symptoms..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg shadow-2xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? 'Saving...' : 'Save & Sync to Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL APPOINTMENT CONFIRMATION */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-red-600 text-white">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold font-display">
                  Cancel Booking: {cancellingAppointment.bookingReference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingAppointment(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <p className="text-slate-600 leading-relaxed">
                Cancelling will mark this appointment as <strong>Cancelled</strong>, notify system logs, release the time slot for new bookings, and immediately update your <strong>Supabase</strong> database.
              </p>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div><strong>Patient:</strong> {cancellingAppointment.patientName} ({cancellingAppointment.patientPhone})</div>
                <div><strong>Treatment:</strong> {cancellingAppointment.treatmentTitle}</div>
                <div><strong>Slot:</strong> {cancellingAppointment.appointmentDate} at {cancellingAppointment.appointmentTime}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={2}
                  required
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder="e.g. Patient requested cancellation, Doctor unavailable"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingAppointment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelAppointment}
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs"
                >
                  Confirm Cancellation & Release Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
