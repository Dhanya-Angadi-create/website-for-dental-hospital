import React from 'react';
import { Calendar, Award, ShieldCheck, CheckCircle2, MapPin, User, Stethoscope } from 'lucide-react';
import { Doctor } from '../types/clinic';

interface DoctorPageProps {
  doctors: Doctor[];
  onOpenBooking: (treatmentId?: string) => void;
}

export const DoctorPage: React.FC<DoctorPageProps> = ({
  doctors,
  onOpenBooking
}) => {
  const doctor = doctors[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
          Clinical Leadership
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display mt-1">
          Consulting Doctor
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Specialized oral healthcare and restorative prosthodontics at Nandita Dental Clinic, Hubli-Dharwad.
        </p>
      </div>

      {doctor && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Photograph placeholder column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
              <img
                src={doctor.photoUrl}
                alt={doctor.name}
                className="w-full h-[440px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent text-white">
                <p className="text-lg font-bold font-display">{doctor.name}</p>
                <p className="text-xs text-[#D6ECE8]">{doctor.role}</p>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 text-center">
              <span>Verified Directory Listing · Nandita Dental Clinic</span>
            </div>
          </div>

          {/* Clinical Profile details */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#D6ECE8] text-[#123B46] rounded-md">
                  {doctor.speciality}
                </span>
                <span className="text-xs text-slate-500">
                  Hubli-Dharwad, Karnataka
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                {doctor.name}
              </h2>

              <p className="text-sm font-medium text-[#123B46]">
                Dentist & Prosthodontist
              </p>

              <div className="p-4 rounded-xl bg-[#F5F8F7] border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {doctor.bio}
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Areas of Dental Care & Focus:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B46] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">Prosthodontics</strong>
                      <span>Crowns, fixed bridges, aesthetic ceramic restorations & dentures</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B46] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">Rotary Endodontics</strong>
                      <span>Root canal treatment preserving biological tooth structure</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B46] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">Restorative Care</strong>
                      <span>Direct composite tooth-colored fillings & cavity sealants</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B46] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-800">Preventive Dentistry</strong>
                      <span>Ultrasonic teeth cleaning, stain removal & oral prophylaxis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Booking CTA */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span className="block font-medium text-slate-800">Appointments by prior reservation</span>
                <span>Slot duration: ~30-45 mins per consultation</span>
              </div>

              <button
                onClick={() => onOpenBooking()}
                className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-xl transition-all shadow-md active:scale-98"
              >
                <Calendar className="w-4 h-4 text-[#D6ECE8]" />
                <span>Book Appointment with Dr. Prasannakumar Kadakol</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
