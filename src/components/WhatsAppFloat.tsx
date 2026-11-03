import React from 'react';
import { MessageCircle, Phone, Calendar } from 'lucide-react';
import { ClinicSettings } from '../types/clinic';

interface WhatsAppFloatProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({
  settings,
  onOpenBooking
}) => {
  // If whatsapp is confirmed or provided, format wa.me link
  const hasWhatsApp = settings.whatsapp && settings.whatsapp !== 'Pending clinic update';
  const cleanNumber = settings.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = hasWhatsApp
    ? `https://wa.me/${cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`}?text=${encodeURIComponent(
        'Hello Nandita Dental Clinic, Hubli-Dharwad. I would like to inquire regarding an appointment.'
      )}`
    : null;

  return (
    <>
      {/* Floating desktop button */}
      <div className="fixed bottom-6 right-6 z-30 hidden sm:flex flex-col items-end gap-2.5">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <span>WhatsApp Clinic</span>
          </a>
        ) : (
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#123B46] hover:bg-[#0c2a32] text-white text-xs font-semibold rounded-full shadow-lg transition-all duration-200 active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[#D6ECE8]" />
            <span>Book Online</span>
          </button>
        )}
      </div>

      {/* Mobile sticky quick action strip (<=15% mobile viewport cap compliant) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2 flex items-center justify-between gap-3 shadow-lg">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <div className="flex-1 text-[11px] text-slate-500 truncate">
            <span>Hubli-Dharwad, Karnataka</span>
          </div>
        )}

        <button
          onClick={onOpenBooking}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-[#123B46] rounded-lg shadow-sm active:scale-98"
        >
          <Calendar className="w-3.5 h-3.5 text-[#D6ECE8]" />
          <span>Book Appointment</span>
        </button>
      </div>
    </>
  );
};
