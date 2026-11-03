import React, { useState } from 'react';
import { Calendar, Search, CheckCircle2, Clock, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { Treatment } from '../types/clinic';

interface TreatmentsPageProps {
  treatments: Treatment[];
  onOpenBooking: (treatmentId?: string) => void;
  onSelectTreatmentModal: (treatment: Treatment) => void;
}

export const TreatmentsPage: React.FC<TreatmentsPageProps> = ({
  treatments,
  onOpenBooking,
  onSelectTreatmentModal
}) => {
  const [search, setSearch] = useState('');

  const filtered = treatments.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.shortDesc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
          Dental Specialties & Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display mt-1">
          Comprehensive Dental Treatments
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          From preventive teeth cleaning to restorative prosthodontic crowns and rotary root canal therapy, every treatment is delivered with strict sterilization and gentle care.
        </p>

        {/* Notice on prices per prompt requirements */}
        <div className="mt-4 p-3 bg-[#D6ECE8]/40 border border-[#123B46]/10 rounded-xl flex items-start gap-2 text-xs text-[#123B46]">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Treatment Pricing Notice:</strong> Exact treatment costs are tailored to individual clinical requirements and displayed once confirmed by clinic owner Dr. Prasannakumar Kadakol. You can book an initial consultation for a thorough examination.
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search treatments (e.g. Root Canal, Cleaning, Whitening)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#123B46]"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Treatments List */}
      <div className="space-y-8">
        {filtered.map((treatment, index) => (
          <div
            key={treatment.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6"
          >
            {/* Image */}
            <div className="lg:col-span-4 rounded-xl overflow-hidden h-56 lg:h-auto bg-slate-100 relative">
              <img
                src={treatment.imageUrl}
                alt={treatment.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/95 text-[#123B46] shadow-2xs font-mono">
                  0{index + 1}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-slate-900 font-display">
                    {treatment.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{treatment.durationMinutes} mins</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-[#123B46] bg-[#D6ECE8]/40 px-2 py-0.5 rounded">
                      {treatment.priceConfirmed ? treatment.price : 'Consultation required'}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {treatment.fullDesc}
                </p>

                {/* Key clinical inclusions */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 block mb-2">
                    Clinical Inclusions & Safety:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {treatment.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#123B46] shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => onSelectTreatmentModal(treatment)}
                  className="text-xs font-semibold text-slate-700 hover:text-[#123B46] flex items-center gap-1 transition-colors"
                >
                  <span>Read Full Clinical Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenBooking(treatment.id)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors shadow-xs active:scale-98"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D6ECE8]" />
                  <span>Book This Treatment</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
