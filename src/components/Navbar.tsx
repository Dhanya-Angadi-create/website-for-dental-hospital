import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Search, ShieldCheck } from 'lucide-react';
import { ClinicLogo } from './ClinicLogo';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenBooking: (treatmentId?: string) => void;
  onOpenLookup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenBooking,
  onOpenLookup
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'treatments', label: 'Treatments' },
    { id: 'doctor', label: 'Doctor' },
    { id: 'about', label: 'About Us' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-[#F5F8F7]/95 backdrop-blur-sm border-b border-slate-200/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123B46] rounded-lg"
          >
            <ClinicLogo />
          </button>

          {/* Zone 2: Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-[#123B46] font-semibold'
                      : 'text-slate-600 hover:text-[#123B46]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C5A46D] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Patient lookup / My Bookings */}
            <button
              onClick={onOpenLookup}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 shadow-xs"
              title="Track or manage your booking"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Find Booking</span>
            </button>

            {/* Primary CTA */}
            <button
              onClick={() => onOpenBooking()}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#123B46] hover:bg-[#0c2a32] rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Calendar className="w-4 h-4 text-[#D6ECE8]" />
              <span>Book Appointment</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 border ${
                currentTab === 'admin'
                  ? 'bg-[#123B46] text-white border-[#123B46] shadow-xs'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
              title="Open Admin Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span>Admin Panel</span>
            </button>
          </div>

          {/* Mobile Hamburger & Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onOpenBooking()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#123B46] rounded-lg shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D6ECE8]" />
              <span>Book</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#123B46] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === link.id
                    ? 'bg-[#D6ECE8]/40 text-[#123B46] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLookup();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Find / Manage Booking</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-[#123B46] rounded-lg"
              >
                <Calendar className="w-4 h-4 text-[#D6ECE8]" />
                <span>Book Appointment</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
              >
                <ShieldCheck className="w-4 h-4 text-[#C5A46D]" />
                <span>Admin Panel (Manage Bookings)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
