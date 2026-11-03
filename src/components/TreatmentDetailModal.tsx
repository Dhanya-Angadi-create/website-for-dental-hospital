import React from 'react';
import { X, CheckCircle, Clock, ShieldCheck, Calendar } from 'lucide-react';
import { Treatment } from '../types/clinic';

interface TreatmentDetailModalProps {
  treatment: Treatment | null;
  onClose: () => void;
  onBook: (treatmentId: string) => void;
}

export const TreatmentDetailModal: React.FC<TreatmentDetailModalProps> = ({
  treatment,
  onClose,
  onBook
}) => {
  if (!treatment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          <img
            src={treatment.imageUrl}
            alt={treatment.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[11px] font-medium text-[#D6ECE8] uppercase tracking-wider">
              Clinical Treatment
            </span>
            <h3 className="text-xl font-bold text-white font-display">
              {treatment.title}
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Est. Duration: ~{treatment.durationMinutes} mins</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Sterile Protocol</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-[#123B46]">
              {treatment.priceConfirmed ? treatment.price : 'Consultation required'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {treatment.fullDesc}
          </p>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Key Highlights & Inclusions
            </h4>
            <div className="space-y-1.5">
              {treatment.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-[#123B46] shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBook(treatment.id);
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D6ECE8]" />
              <span>Book This Treatment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
