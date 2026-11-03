import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Printer,
  CalendarCheck,
  Stethoscope,
  Info
} from 'lucide-react';
import { Treatment, Doctor, BookingSlot, Appointment, ClinicSettings } from '../types/clinic';
import { api } from '../services/api';
import { syncAppointmentToSupabase } from '../services/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTreatmentId?: string;
  clinicSettings: ClinicSettings;
  onBookingSuccess?: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedTreatmentId,
  clinicSettings,
  onBookingSuccess
}) => {
  const [step, setStep] = useState<number>(1);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Selection state
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Patient info state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [message, setMessage] = useState('');

  // Submitting & confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Fetch treatments & doctors on open
  useEffect(() => {
    if (isOpen) {
      setLoadingInitial(true);
      Promise.all([api.getTreatments(), api.getDoctors()])
        .then(([trts, docs]) => {
          setTreatments(trts);
          setDoctors(docs);

          if (preselectedTreatmentId && trts.some(t => t.id === preselectedTreatmentId)) {
            setSelectedTreatmentId(preselectedTreatmentId);
          } else if (trts.length > 0 && !selectedTreatmentId) {
            setSelectedTreatmentId(trts[0].id);
          }

          if (docs.length > 0 && !selectedDoctorId) {
            setSelectedDoctorId(docs[0].id);
          }

          // Default date: tomorrow if today has passed or today
          if (!selectedDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const yyyy = tomorrow.getFullYear();
            const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const dd = String(tomorrow.getDate()).padStart(2, '0');
            setSelectedDate(`${yyyy}-${mm}-${dd}`);
          }
        })
        .finally(() => setLoadingInitial(false));
    } else {
      // Reset after closing if finished
      if (confirmedBooking) {
        setStep(1);
        setConfirmedBooking(null);
        setSelectedTime('');
        setPatientName('');
        setPatientPhone('');
        setPatientEmail('');
        setPatientAge('');
        setMessage('');
      }
    }
  }, [isOpen, preselectedTreatmentId]);

  // Load available slots whenever doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      setSlotsLoading(true);
      setSelectedTime('');
      api.getAvailableSlots(selectedDoctorId, selectedDate)
        .then((slots) => {
          setAvailableSlots(slots);
        })
        .catch((err) => {
          console.error('Failed to load slots', err);
          setAvailableSlots([]);
        })
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDoctorId, selectedDate]);

  if (!isOpen) return null;

  const currentTreatment = treatments.find((t) => t.id === selectedTreatmentId);
  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Minimum date for calendar: today
  const todayStr = new Date().toISOString().split('T')[0];

  // Quick 7 days date generator
  const getNextDays = (count = 14) => {
    const list = [];
    const base = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
      const dayNum = d.getDate();
      list.push({ iso, dayName, monthName, dayNum, isSunday: d.getDay() === 0 });
    }
    return list;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate phone
    const cleanPhone = patientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!patientName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }

    if (!selectedTime) {
      setSubmitError('Please select an appointment time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createAppointment({
        patientName,
        patientPhone,
        patientEmail: patientEmail || undefined,
        patientAge: patientAge ? parseInt(patientAge, 10) : undefined,
        treatmentId: selectedTreatmentId,
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        message: message || undefined
      });

      if (!res.success || !res.appointment) {
        setSubmitError(res.error || 'Unable to book slot. Please try another slot.');
        return;
      }

      // Sync to Supabase directly from client as well
      syncAppointmentToSupabase(res.appointment).catch((err) => {
        console.warn('Client-side Supabase sync note:', err);
      });

      setConfirmedBooking(res.appointment);
      setStep(8); // Confirmation step
      if (onBookingSuccess) {
        onBookingSuccess(res.appointment);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error communicating with server';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#123B46] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-[#D6ECE8]" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight font-display">
                Book an Appointment
              </h2>
              <p className="text-xs text-[#D6ECE8]/80">
                Nandita Dental Clinic · Hubli-Dharwad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar (if not yet confirmed) */}
        {step < 8 && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-500">
            <span className={step >= 1 ? 'text-[#123B46] font-semibold' : ''}>
              1. Treatment
            </span>
            <span className="text-slate-300">/</span>
            <span className={step >= 2 ? 'text-[#123B46] font-semibold' : ''}>
              2. Date & Time
            </span>
            <span className="text-slate-300">/</span>
            <span className={step >= 3 ? 'text-[#123B46] font-semibold' : ''}>
              3. Patient Details
            </span>
          </div>
        )}

        {/* Body content */}
        <div className="p-6">
          {loadingInitial ? (
            <div className="py-16 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-[#123B46] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading clinic schedule and treatments...</p>
            </div>
          ) : step === 1 ? (
            /* STEP 1 & 2: Treatment & Doctor Selection */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Select Required Treatment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {treatments.map((t) => {
                    const isSelected = selectedTreatmentId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTreatmentId(t.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#123B46] bg-[#D6ECE8]/25 ring-1 ring-[#123B46]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-900">
                              {t.title}
                            </span>
                            {t.isPopular && (
                              <span className="text-[10px] font-medium text-[#123B46] bg-[#D6ECE8] px-1.5 py-0.5 rounded">
                                Common
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {t.shortDesc}
                          </p>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                          <span>~{t.durationMinutes} mins</span>
                          <span className="font-medium text-[#123B46]">
                            {t.priceConfirmed ? t.price : 'Consultation required'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Doctor Selection (if multiple) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Consulting Doctor
                </label>
                <div className="space-y-2">
                  {doctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#123B46] bg-[#D6ECE8]/20 ring-1 ring-[#123B46]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.photoUrl}
                            alt={doc.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {doc.role} · {doc.speciality}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          {isSelected ? (
                            <span className="text-[#123B46] font-semibold">Selected</span>
                          ) : (
                            <span>Select</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedTreatmentId || !selectedDoctorId}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors disabled:opacity-50"
                >
                  <span>Select Date & Time</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 3 & 4: Date & Available Slots Selection */
            <div className="space-y-5">
              {/* Date selection carousel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Select Appointment Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-700 bg-white"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {getNextDays(14).map((day) => {
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.iso}
                        type="button"
                        onClick={() => setSelectedDate(day.iso)}
                        className={`flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-xl border transition-all shrink-0 ${
                          isSelected
                            ? 'border-[#123B46] bg-[#123B46] text-white shadow-xs'
                            : day.isSunday
                            ? 'border-slate-100 bg-slate-50 text-slate-400'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[11px] font-medium uppercase">
                          {day.dayName}
                        </span>
                        <span className="text-base font-bold tabular-nums">
                          {day.dayNum}
                        </span>
                        <span className="text-[10px]">
                          {day.monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Available Time Slots (IST)
                  </label>
                  <span className="text-xs text-slate-500">
                    {currentDoctor?.name}
                  </span>
                </div>

                {slotsLoading ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Checking live clinic slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                    <Info className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                    <p className="text-xs font-medium">
                      No slots available on this date.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      The clinic may be closed (e.g. Sunday or blocked holiday) or all slots have been reserved.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'border-[#123B46] bg-[#123B46] text-white'
                              : slot.available
                              ? 'border-slate-200 bg-white text-slate-800 hover:border-[#123B46] hover:bg-[#D6ECE8]/20'
                              : 'border-slate-100 bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Treatment summary strip */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between text-slate-600">
                <span>
                  <strong>{currentTreatment?.title}</strong> · {currentDoctor?.name}
                </span>
                <span>
                  {selectedDate} · {selectedTime || 'Select time slot'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors disabled:opacity-50"
                >
                  <span>Patient Information</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            /* STEP 5: Patient Information Form */
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile (e.g. 9845012345)"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Used to send WhatsApp / SMS booking reference & updates.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Age <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    placeholder="e.g. 34"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dental Concern / Additional Notes <span className="text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe any symptoms, previous treatments, tooth pain, or concerns..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                />
              </div>

              {/* Review card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Appointment Summary:</span>
                  <span className="text-[#123B46]">Indian Standard Time (IST)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Treatment:</span>
                  <span className="font-medium text-slate-800">{currentTreatment?.title}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Doctor:</span>
                  <span className="font-medium text-slate-800">{currentDoctor?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Date & Slot:</span>
                  <span className="font-medium text-slate-800">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Consultation Fee:</span>
                  <span className="text-slate-800">{clinicSettings.consultationFee}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Reserving Slot...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#C5A46D]" />
                      <span>Confirm Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 7 & 8: Confirmation Screen */
            confirmedBooking && (
              <div className="text-center py-2 space-y-5">
                <div className="w-14 h-14 bg-[#D6ECE8] text-[#123B46] rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">
                    Appointment Booking Received!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Your appointment has been registered in the Nandita Dental Clinic scheduling system.
                  </p>
                </div>

                {/* Booking Slip Card */}
                <div className="bg-[#F5F8F7] border border-slate-200 rounded-xl p-5 text-left max-w-md mx-auto shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                        Booking Reference
                      </span>
                      <p className="text-base font-bold text-[#123B46] font-mono tabular-nums">
                        {confirmedBooking.bookingReference}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#D6ECE8] text-[#123B46]">
                      {confirmedBooking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient Name:</span>
                      <span className="font-semibold">{confirmedBooking.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <span className="font-medium tabular-nums">{confirmedBooking.patientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Treatment:</span>
                      <span className="font-semibold text-slate-900">{confirmedBooking.treatmentTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Doctor:</span>
                      <span>{confirmedBooking.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Slot:</span>
                      <span className="font-semibold text-[#123B46]">
                        {confirmedBooking.appointmentDate} · {confirmedBooking.appointmentTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span>{clinicSettings.address}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Synced to Supabase DB (Project: ihovewjjpkcxadattyky)</span>
                    </div>
                    <p className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>Please arrive 10 minutes prior to your slot. If you need to reschedule or cancel, use your Booking Reference ({confirmedBooking.bookingReference}).</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-xs font-semibold text-white bg-[#123B46] rounded-lg hover:bg-[#0c2a32]"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
