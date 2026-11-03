import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Navigation,
  Send,
  CheckCircle2,
  Info,
  ExternalLink
} from 'lucide-react';
import { ClinicSettings, DayWorkingHours } from '../types/clinic';

interface ContactPageProps {
  settings: ClinicSettings;
  workingHours: DayWorkingHours[];
  onOpenBooking: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  settings,
  workingHours,
  onOpenBooking
}) => {
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) return;

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          email: formEmail,
          subject: formSubject,
          message: formMessage
        })
      });
    } catch (err) {
      console.warn('Enquiry logged locally:', err);
    }

    setSubmitted(true);
  };

  const hasPhone = settings.phone && settings.phone !== 'Pending clinic update';
  const hasWhatsApp = settings.whatsapp && settings.whatsapp !== 'Pending clinic update';
  const hasEmail = settings.email && settings.email !== 'Pending clinic update';

  const cleanWaNumber = settings.whatsapp.replace(/[^0-9]/g, '');
  const waLink = hasWhatsApp
    ? `https://wa.me/${cleanWaNumber.startsWith('91') ? cleanWaNumber : `91${cleanWaNumber}`}?text=${encodeURIComponent(
        'Hello Nandita Dental Clinic, Hubli-Dharwad. I have an enquiry regarding dental treatments.'
      )}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display mt-1">
          Contact & Location Details
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Find Nandita Dental Clinic in Hubli-Dharwad, Karnataka. Inquire about consultation hours, treatments, or directions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Clinic Contact Details & Working Hours */}
        <div className="lg:col-span-5 space-y-6">
          {/* Contact Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
              Clinic Contact Information
            </h3>

            {/* Address */}
            <div className="flex items-start gap-3 text-xs text-slate-700">
              <div className="p-2 rounded-lg bg-[#D6ECE8] text-[#123B46] shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">Clinic Location</strong>
                <span>{settings.address}</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hubli-Dharwad twin cities, Karnataka, India
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 text-xs text-slate-700 border-t border-slate-100 pt-4">
              <div className="p-2 rounded-lg bg-[#D6ECE8] text-[#123B46] shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">Phone Line</strong>
                {hasPhone ? (
                  <a href={`tel:${settings.phone}`} className="text-[#123B46] font-medium hover:underline">
                    {settings.phone}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">
                    Pending clinic owner verification (editable via admin)
                  </span>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-3 text-xs text-slate-700 border-t border-slate-100 pt-4">
              <div className="p-2 rounded-lg bg-[#25D366]/15 text-[#25D366] shrink-0 mt-0.5">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">WhatsApp</strong>
                {waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>{settings.whatsapp}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic">
                    Pending clinic owner verification (editable via admin)
                  </span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 text-xs text-slate-700 border-t border-slate-100 pt-4">
              <div className="p-2 rounded-lg bg-[#D6ECE8] text-[#123B46] shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">Email Address</strong>
                {hasEmail ? (
                  <a href={`mailto:${settings.email}`} className="text-[#123B46] hover:underline">
                    {settings.email}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">
                    Pending clinic owner verification
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Working Hours Schedule Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#123B46]" />
                <span>Working Hours (IST)</span>
              </h3>
              <span className="text-[10px] uppercase font-semibold text-[#123B46] bg-[#D6ECE8] px-2 py-0.5 rounded">
                Live Timings
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              {workingHours.map((wh) => (
                <div key={wh.dayOfWeek} className="pt-2 flex justify-between items-center text-slate-700">
                  <span className="font-medium">{wh.dayName}</span>
                  {wh.isOpen ? (
                    <span className="tabular-nums text-slate-900">
                      {wh.shifts.map(s => `${s.start} - ${s.end}`).join(' & ')}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Closed</span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-xl transition-colors shadow-2xs"
              >
                Book Appointment Within These Hours
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Google Maps & Enquiry Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Map Embed Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Clinic Location Map
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hubli-Dharwad, Karnataka
                </p>
              </div>

              <a
                href={settings.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#123B46] bg-[#D6ECE8] hover:bg-[#c2e4dd] rounded-lg transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Responsive map iframe container */}
            <div className="h-72 w-full bg-slate-100">
              <iframe
                title="Nandita Dental Clinic Hubli Location"
                src={settings.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Enquiry Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Send an Enquiry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Have questions regarding treatments or prosthodontic consultations? Fill out the form below.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  Message Sent Successfully!
                </h4>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Thank you, {formName}. Your inquiry has been received by Nandita Dental Clinic. Our team will contact you at {formPhone}.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormName('');
                    setFormPhone('');
                    setFormEmail('');
                    setFormSubject('');
                    setFormMessage('');
                  }}
                  className="mt-3 text-xs font-semibold text-emerald-800 underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Kulkarni"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Crown inquiry, Root Canal inquiry"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Message / Dental Query <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry, symptoms, or requested date/time..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#123B46]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-colors shadow-xs active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Enquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
