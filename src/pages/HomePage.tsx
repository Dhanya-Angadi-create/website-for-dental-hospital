import React from 'react';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight,
  Star,
  CheckCircle2,
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import { Treatment, Doctor, ClinicSettings } from '../types/clinic';

interface HomePageProps {
  settings: ClinicSettings;
  treatments: Treatment[];
  doctors: Doctor[];
  onNavigate: (tab: string) => void;
  onOpenBooking: (treatmentId?: string) => void;
  onSelectTreatmentModal: (treatment: Treatment) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  treatments,
  doctors,
  onNavigate,
  onOpenBooking,
  onSelectTreatmentModal
}) => {
  const leadDoctor = doctors[0];

  const testimonials = [
    {
      name: 'Anand Kulkarni',
      locality: 'Hubli',
      treatment: 'Prosthodontic Crown & Bridge',
      text: 'Dr. Prasannakumar Kadakol took great care to explain the entire crown procedure. The ceramic fit is natural, comfortable, and my bite feels balanced. Highly recommended for prosthodontic work.',
      rating: 5
    },
    {
      name: 'Sunita Patil',
      locality: 'Dharwad',
      treatment: 'Root Canal Treatment',
      text: 'I was very anxious about getting a root canal, but the treatment at Nandita Dental Clinic was remarkably gentle and painless. Very clean and hygienic clinic setting.',
      rating: 5
    },
    {
      name: 'Mahesh Joshi',
      locality: 'Vidyanagar, Hubli',
      treatment: 'Teeth Cleaning & Polish',
      text: 'Thorough ultrasonic cleaning with no discomfort. Dr. Prasannakumar gives genuine advice without recommending unnecessary procedures. Very respectful and punctual with scheduled appointment slots.',
      rating: 5
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B46] bg-[#D6ECE8]/60 px-3 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-[#123B46]" />
                <span>Specialized Dentistry & Prosthodontics · Hubli-Dharwad</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-slate-900 tracking-tight leading-[1.12] font-display">
                Your Smile Deserves <br className="hidden sm:inline" />
                <span className="text-[#123B46] relative">
                  Expert Care.
                  <span className="absolute left-0 right-0 -bottom-1.5 h-1 bg-[#C5A46D]/60 rounded-full" />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Comfortable, personalized dental care under the clinical leadership of{' '}
                <strong className="text-slate-900 font-semibold">Dr. Prasannakumar Kadakol</strong>. Dedicated to gentle treatments, strict hygiene, and precision prosthodontic restoration.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenBooking()}
                  className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98"
                >
                  <Calendar className="w-4 h-4 text-[#D6ECE8]" />
                  <span>Book an Appointment</span>
                </button>

                <button
                  onClick={() => onNavigate('treatments')}
                  className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#123B46] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                >
                  <span>Explore Treatments</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Key Trust Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-200/80 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#123B46] shrink-0" />
                  <span>Hospital-Grade Sterilization</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#123B46] shrink-0" />
                  <span>Prosthodontics Specialist</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Clock className="w-4 h-4 text-[#123B46] shrink-0" />
                  <span>Zero-Wait Booking Slots</span>
                </div>
              </div>
            </div>

            {/* Right Visual Carrier Column */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
                <img
                  src="/src/assets/images/hero_dental_clinic_1793713702437.jpg"
                  alt="Nandita Dental Clinic Interior Hubli"
                  className="w-full h-[420px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Floating caption card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 shadow-lg text-xs text-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 font-display text-sm">
                        Nandita Dental Clinic
                      </p>
                      <p className="text-[11px] text-slate-600">
                        Modern Clinic Suite · Hubli-Dharwad, Karnataka
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#123B46] bg-[#D6ECE8] px-2 py-0.5 rounded">
                      Sterile Suite
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CLINIC HIGHLIGHTS STRIP */}
      <section className="bg-white border-y border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D6ECE8] text-[#123B46]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Strict Sterilization
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Multi-cycle autoclaved instruments and single-use disposables for complete infection control.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D6ECE8] text-[#123B46]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Prosthodontic Focus
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Expert crown, bridge, and denture prosthetics engineered for anatomical balance and longevity.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D6ECE8] text-[#123B46]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Gentle & Transparent
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Unhurried chair-side explanations so you always understand your clinical options before beginning.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F8F7] border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#D6ECE8] text-[#123B46]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Punctual Scheduling
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Automated slot booking system prevents overcrowding and guarantees dedicated patient attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DENTAL TREATMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
              Clinical Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
              Featured Dental Treatments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Directory-listed dental treatments performed with modern clinical precision.
            </p>
          </div>

          <button
            onClick={() => onNavigate('treatments')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#123B46] hover:text-[#0c2a32] transition-colors self-start sm:self-auto"
          >
            <span>View All Treatments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={treatment.imageUrl}
                  alt={treatment.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[#123B46] shadow-xs">
                    ~{treatment.durationMinutes} mins
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display leading-tight">
                    {treatment.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {treatment.shortDesc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectTreatmentModal(treatment)}
                    className="text-xs font-semibold text-slate-700 hover:text-[#123B46] transition-colors"
                  >
                    Learn More
                  </button>

                  <button
                    onClick={() => onOpenBooking(treatment.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D6ECE8]" />
                    <span>Book This</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DOCTOR INTRODUCTION */}
      {leadDoctor && (
        <section className="bg-white border-y border-slate-200/80 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                  <img
                    src={leadDoctor.photoUrl}
                    alt={leadDoctor.name}
                    className="w-full h-[400px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent text-white">
                    <p className="text-base font-bold font-display">{leadDoctor.name}</p>
                    <p className="text-xs text-[#D6ECE8]">{leadDoctor.role}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123B46] uppercase tracking-wider">
                  <Award className="w-4 h-4 text-[#C5A46D]" />
                  <span>Consulting Dental Specialist</span>
                </div>

                <h2 className="text-3xl font-bold text-slate-900 font-display">
                  {leadDoctor.name}
                </h2>

                <p className="text-sm font-medium text-[#123B46]">
                  {leadDoctor.role} · Speciality in {leadDoctor.speciality}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {leadDoctor.bio}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Areas of Clinical Focus:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#123B46]" />
                      <span>Prosthodontics (Crowns, Bridges, Dentures)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#123B46]" />
                      <span>Endodontic Root Canal Therapy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#123B46]" />
                      <span>Aesthetic Composite Fillings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#123B46]" />
                      <span>Preventative Scaling & Gum Maintenance</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    onClick={() => onOpenBooking()}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D6ECE8]" />
                    <span>Book Consultation with Dr. Kadakol</span>
                  </button>

                  <button
                    onClick={() => onNavigate('doctor')}
                    className="text-xs font-semibold text-slate-700 hover:text-[#123B46] px-3 py-2 transition-colors"
                  >
                    Full Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. PATIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
            Patient Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
            Care Rooted in Trust & Comfort
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real feedback from patients who entrusted their smiles to Nandita Dental Clinic in Hubli-Dharwad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#C5A46D] mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A46D]" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900">{t.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span>{t.locality}</span>
                  <span>·</span>
                  <span className="text-[#123B46] font-medium">{t.treatment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CLINIC GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
              Clinical Environment
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
              Pristine Clinic Atmosphere
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-semibold text-[#123B46] hover:underline flex items-center gap-1"
          >
            <span>View Full Gallery</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative rounded-xl overflow-hidden h-60 border border-slate-200 group">
            <img
              src="/src/assets/images/clinic_reception_lounge_1793713705984.jpg"
              alt="Reception and waiting area"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-semibold text-white">Reception & Lounge</span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden h-60 border border-slate-200 group">
            <img
              src="/src/assets/images/hero_dental_clinic_1793713702437.jpg"
              alt="Operatory Suite"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-semibold text-white">Ergonomic Dental Operatory</span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden h-60 border border-slate-200 group sm:col-span-2 lg:col-span-1">
            <img
              src="/src/assets/images/treatment_prosthodontics_1793713726493.jpg"
              alt="Prosthetics Precision"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-xs font-semibold text-white">Prosthodontic Restoration</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM APPOINTMENT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#123B46] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#D6ECE8]">
              Ready for a healthier smile?
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display leading-tight">
              Schedule Your Dental Consultation in Hubli-Dharwad Today.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Select your preferred time slot online. Our clinic team ensures minimal wait times and attentive, dedicated care.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenBooking()}
                className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-[#123B46] bg-white hover:bg-[#D6ECE8] rounded-xl transition-all shadow-md active:scale-98"
              >
                <Calendar className="w-4 h-4 text-[#123B46]" />
                <span>Book Appointment Online</span>
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-3 text-xs font-semibold text-white border border-white/20 hover:bg-white/10 rounded-xl transition-colors"
              >
                View Clinic Directions
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
