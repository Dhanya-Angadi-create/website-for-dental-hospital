import React, { useState } from 'react';
import { X, Search, Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Appointment, BookingSlot } from '../types/clinic';
import { api } from '../services/api';

interface PatientLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescheduleSuccess?: () => void;
}

export const PatientLookupModal: React.FC<PatientLookupModalProps> = ({
  isOpen,
  onClose,
  onRescheduleSuccess
}) => {
  const [referenceQuery, setReferenceQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  // Cancellation state
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceQuery.trim()) return;

    setLoading(true);
    setError(null);
    setAppointment(null);
    setCancelSuccess(false);
    setRescheduleSuccess(false);
    setIsRescheduling(false);

    try {
      const data = await api.getAppointmentByRef(referenceQuery.trim());
      setAppointment(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Appointment reference not found. Please check and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    setIsCancelling(true);
    try {
      const updated = await api.updateAppointmentStatus(
        appointment.id,
        'cancelled',
        cancelReason || 'Cancelled by patient request'
      );
      setAppointment(updated);
      setCancelSuccess(true);
    } catch {
      setError('Failed to cancel appointment. Please contact clinic directly.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleStartReschedule = () => {
    if (!appointment) return;
    setIsRescheduling(true);
    setRescheduleDate(appointment.appointmentDate);
    fetchSlotsForReschedule(appointment.doctorId, appointment.appointmentDate);
  };

  const fetchSlotsForReschedule = (doctorId: string, date: string) => {
    setLoadingSlots(true);
    api.getAvailableSlots(doctorId, date)
      .then(setRescheduleSlots)
      .catch(() => setRescheduleSlots([]))
      .finally(() => setLoadingSlots(false));
  };

  const handleConfirmReschedule = async () => {
    if (!appointment || !rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please select both a new date and time slot.');
      return;
    }

    setRescheduleError(null);
    try {
      const res = await api.rescheduleAppointment(appointment.id, rescheduleDate, rescheduleTime);
      if (res.success && res.appointment) {
        setAppointment(res.appointment);
        setRescheduleSuccess(true);
        setIsRescheduling(false);
        if (onRescheduleSuccess) onRescheduleSuccess();
      } else {
        setRescheduleError(res.error || 'Failed to reschedule. Slot may have been taken.');
      }
    } catch (err: unknown) {
      setRescheduleError(err instanceof Error ? err.message : 'Error rescheduling');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-[#123B46] text-white">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#D6ECE8]" />
            <h2 className="text-sm font-semibold font-display">Find / Manage Your Appointment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Enter Booking Reference (e.g. NDC-2026-XXXX)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="NDC-2026-..."
                value={referenceQuery}
                onChange={(e) => setReferenceQuery(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46] font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Lookup'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Your reference code was displayed after booking and sent via SMS / WhatsApp notification.
            </p>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {appointment && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    Patient Reference
                  </span>
                  <p className="text-sm font-bold text-[#123B46] font-mono">
                    {appointment.bookingReference}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    appointment.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : appointment.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {appointment.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient Name</span>
                  <span className="font-medium">{appointment.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <span className="font-medium tabular-nums">{appointment.patientPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Treatment</span>
                  <span className="font-medium text-slate-900">{appointment.treatmentTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Doctor</span>
                  <span>{appointment.doctorName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Date & Time</span>
                  <span className="font-semibold text-[#123B46]">
                    {appointment.appointmentDate} at {appointment.appointmentTime} (IST)
                  </span>
                </div>
                {appointment.cancellationReason && (
                  <div className="col-span-2 text-red-600 bg-red-50 p-2 rounded">
                    <strong>Cancellation Note:</strong> {appointment.cancellationReason}
                  </div>
                )}
              </div>

              {cancelSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Your cancellation has been registered. The time slot is now released.</span>
                </div>
              )}

              {rescheduleSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Appointment rescheduled successfully!</span>
                </div>
              )}

              {/* Patient Actions: Reschedule or Cancel (if appointment is not already cancelled or completed) */}
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && !isRescheduling && (
                <div className="pt-2 border-t border-slate-200 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleStartReschedule}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const reason = window.prompt('Please provide a brief reason for cancellation:') || 'Patient request';
                      setCancelReason(reason);
                      handleCancel();
                    }}
                    disabled={isCancelling}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span>{isCancelling ? 'Cancelling...' : 'Cancel Appointment'}</span>
                  </button>
                </div>
              )}

              {/* Reschedule View */}
              {isRescheduling && (
                <div className="pt-3 border-t border-slate-200 space-y-3 bg-white p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-800">
                      Select New Date & Time
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel Reschedule
                    </button>
                  </div>

                  {rescheduleError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {rescheduleError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">New Date</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={rescheduleDate}
                      onChange={(e) => {
                        setRescheduleDate(e.target.value);
                        fetchSlotsForReschedule(appointment.doctorId, e.target.value);
                      }}
                      className="w-full text-xs border border-slate-200 rounded p-1.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Available Slots</label>
                    {loadingSlots ? (
                      <p className="text-xs text-slate-400">Loading slots...</p>
                    ) : rescheduleSlots.length === 0 ? (
                      <p className="text-xs text-slate-500">No slots available on this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
                        {rescheduleSlots.map((s) => (
                          <button
                            key={s.time}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setRescheduleTime(s.time)}
                            className={`p-1.5 text-xs rounded border ${
                              rescheduleTime === s.time
                                ? 'bg-[#123B46] text-white border-[#123B46]'
                                : s.available
                                ? 'bg-white hover:bg-slate-100 border-slate-200'
                                : 'bg-slate-100 text-slate-300 line-through'
                            }`}
                          >
                            {s.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!rescheduleTime}
                      onClick={handleConfirmReschedule}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded disabled:opacity-50"
                    >
                      Confirm New Slot
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
