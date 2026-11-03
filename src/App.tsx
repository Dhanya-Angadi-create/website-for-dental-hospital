/**
 * Nandita Dental Clinic - Hubli-Dharwad, Karnataka
 * Dr. Prasannakumar Kadakol - Dentistry & Prosthodontics
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { BookingModal } from './components/BookingModal';
import { PatientLookupModal } from './components/PatientLookupModal';
import { TreatmentDetailModal } from './components/TreatmentDetailModal';
import { HomePage } from './pages/HomePage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { DoctorPage } from './pages/DoctorPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ClinicSettings, Treatment, Doctor, DayWorkingHours, Appointment } from './types/clinic';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [workingHours, setWorkingHours] = useState<DayWorkingHours[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedTreatmentId, setPreselectedTreatmentId] = useState<string | undefined>(undefined);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [detailTreatment, setDetailTreatment] = useState<Treatment | null>(null);

  const fetchInitialData = async () => {
    try {
      const [sett, trts, docs, wh] = await Promise.all([
        api.getSettings(),
        api.getTreatments(),
        api.getDoctors(),
        api.getWorkingHours()
      ]);
      setSettings(sett);
      setTreatments(trts);
      setDoctors(docs);
      setWorkingHours(wh);
    } catch (err) {
      console.error('Failed to load clinic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (treatmentId?: string) => {
    setPreselectedTreatmentId(treatmentId);
    setIsBookingOpen(true);
  };

  const handleBookingCompleted = (appointment: Appointment) => {
    // Optionally refresh or keep notification in sync
    console.log('Booked appointment reference:', appointment.bookingReference);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-[#F5F8F7] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#123B46] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#123B46] tracking-wider uppercase">
          Loading Nandita Dental Clinic...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8F7] text-slate-800 antialiased">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            settings={settings}
            treatments={treatments}
            doctors={doctors}
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            onSelectTreatmentModal={(t) => setDetailTreatment(t)}
          />
        )}

        {currentTab === 'treatments' && (
          <TreatmentsPage
            treatments={treatments}
            onOpenBooking={handleOpenBooking}
            onSelectTreatmentModal={(t) => setDetailTreatment(t)}
          />
        )}

        {currentTab === 'doctor' && (
          <DoctorPage
            doctors={doctors}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            settings={settings}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentTab === 'gallery' && (
          <GalleryPage />
        )}

        {currentTab === 'contact' && (
          <ContactPage
            settings={settings}
            workingHours={workingHours}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            onClinicUpdated={fetchInitialData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        treatments={treatments}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
      />

      {/* Floating WhatsApp and Quick Actions */}
      <WhatsAppFloat
        settings={settings}
        onOpenBooking={handleOpenBooking}
      />

      {/* Booking Modal Engine */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedTreatmentId={preselectedTreatmentId}
        clinicSettings={settings}
        onBookingSuccess={handleBookingCompleted}
      />

      {/* Patient Lookup / Reschedule / Cancel Modal */}
      <PatientLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onRescheduleSuccess={fetchInitialData}
      />

      {/* Treatment Detail Information Modal */}
      <TreatmentDetailModal
        treatment={detailTreatment}
        onClose={() => setDetailTreatment(null)}
        onBook={handleOpenBooking}
      />
    </div>
  );
}
