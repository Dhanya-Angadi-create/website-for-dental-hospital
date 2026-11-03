import React from 'react';
import { ShieldCheck, Sparkles, HeartHandshake, Eye, CheckCircle2, Calendar } from 'lucide-react';
import { ClinicSettings } from '../types/clinic';

interface AboutPageProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  settings,
  onOpenBooking
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Intro Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
          Our Practice & Philosophy
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display mt-1">
          About Nandita Dental Clinic
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Nandita Dental Clinic was established to provide gentle, comprehensive dental care and expert prosthodontic restoration for individuals and families in Hubli-Dharwad, Karnataka.
        </p>
      </div>

      {/* Grid: Clinic Positioning & Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            A Patient-First Approach to Modern Dentistry
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We believe oral healthcare should never feel rushed, intimidating, or uncertain. Guided by Dr. Prasannakumar Kadakol, our practice centers on thorough chair-side consultation, transparent discussion of clinical findings, and treatment plans crafted to preserve biological teeth wherever possible.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Whether you require routine preventative care like scaling, restorative endodontic root canal therapy, or advanced prosthodontic crowns and dentures, every procedure is carried out with deliberate precision and maximum comfort.
          </p>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <img
              src="/src/assets/images/clinic_reception_lounge_1793713705984.jpg"
              alt="Nandita Dental Clinic interior"
              className="w-full h-80 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#D6ECE8] text-[#123B46] flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Our Mission
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To provide the community of Hubli-Dharwad with high-standard, gentle oral care that safeguards natural tooth structure, restores healthy chewing function, and instills lifelong smile confidence through conservative clinical principles.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#D6ECE8] text-[#123B46] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#123B46]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Our Vision
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To be recognized as Hubli-Dharwad's trusted sanctuary for ethical dental practice and prosthodontic excellence—where patients experience zero fear, absolute hygiene transparency, and durable restorative outcomes.
          </p>
        </div>
      </div>

      {/* Hygiene & Sterilization Protocol */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#123B46] text-white space-y-6 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D6ECE8] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#C5A46D]" />
            <span>Patient Safety Standard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display">
            Uncompromised Hygiene & Infection Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your safety is our foundational priority. We uphold rigorous protocol across all dental instruments, chairs, and treatment spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-200 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <strong className="text-white block text-sm">Autoclaved Instrumentation</strong>
            <p className="text-slate-300">
              High-pressure, temperature-monitored steam autoclaving for every reusable dental instrument.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <strong className="text-white block text-sm">Single-Use Disposables</strong>
            <p className="text-slate-300">
              Fresh disposable needles, suction tips, patient bibs, and gloves discarded after every patient.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <strong className="text-white block text-sm">Operatory Disinfection</strong>
            <p className="text-slate-300">
              Medical-grade surface disinfection between every appointment slot for complete peace of mind.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-start">
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-[#123B46] bg-[#D6ECE8] hover:bg-white rounded-xl transition-all shadow-md active:scale-98"
          >
            <Calendar className="w-4 h-4 text-[#123B46]" />
            <span>Book Your Safe Consultation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
