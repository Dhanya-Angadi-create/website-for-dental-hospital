import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { ClinicLogo } from './ClinicLogo';
import { ClinicSettings, Treatment } from '../types/clinic';

interface FooterProps {
  settings: ClinicSettings;
  treatments: Treatment[];
  onNavigate: (tab: string) => void;
  onOpenBooking: (treatmentId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  treatments,
  onNavigate,
  onOpenBooking
}) => {
  return (
    <footer className="bg-[#0e2c34] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Overview */}
          <div className="space-y-4">
            <ClinicLogo light />
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Gentle, comprehensive dental healthcare and specialized prosthodontic restoration in Hubli-Dharwad under the clinical care of Dr. Prasannakumar Kadakol.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C5A46D] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C5A46D] shrink-0" />
                <span>Mon – Sat: 10:00 AM – 8:30 PM (IST)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Treatments */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-display">
              Dental Treatments
            </h4>
            <ul className="space-y-2 text-xs text-slate-300/80">
              {treatments.slice(0, 5).map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => onOpenBooking(t.id)}
                    className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                  >
                    <ChevronRight className="w-3 h-3 text-[#C5A46D]" />
                    <span>{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigation & Clinic Info */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-display">
              Clinic Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-300/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('treatments')} className="hover:text-white transition-colors">
                  All Treatments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctor')} className="hover:text-white transition-colors">
                  Doctor Profile
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About Clinic & Hygiene
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors">
                  Clinic Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact & Directions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Appointments & Verification Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2 font-display">
              Online Booking
            </h4>
            <p className="text-xs text-slate-400">
              Schedule your appointment online to secure an unhurried, dedicated consultation slot.
            </p>
            <button
              onClick={() => onOpenBooking()}
              className="w-full py-2.5 px-4 text-xs font-semibold text-[#123B46] bg-[#D6ECE8] hover:bg-white rounded-lg transition-colors text-center"
            >
              Book Appointment Now
            </button>

            <div className="pt-2 text-[11px] text-slate-400/80 border-t border-slate-800">
              <span className="block text-[#C5A46D]">Owner Verification Note:</span>
              <span>Exact clinic street address & phone numbers remain customizable in the admin dashboard.</span>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <p>© {new Date().getFullYear()} Nandita Dental Clinic, Hubli-Dharwad. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Speciality: Prosthodontics</span>
            <span>·</span>
            <span>Karnataka, India</span>
            <span>·</span>
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
