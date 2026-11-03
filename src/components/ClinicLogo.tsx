import React from 'react';

interface ClinicLogoProps {
  className?: string;
  iconOnly?: boolean;
  light?: boolean;
}

export const ClinicLogo: React.FC<ClinicLogoProps> = ({
  className = '',
  iconOnly = false,
  light = false
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Refined Minimalist Tooth & Crown Icon */}
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <div className={`absolute inset-0 rounded-xl ${light ? 'bg-white/10' : 'bg-[#123B46]/5'} transition-all`} />
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
        >
          {/* Aesthetic tooth contour with prosthodontic crown arch */}
          <path
            d="M9 13C9 8.5 12.5 5 18 5C23.5 5 27 8.5 27 13C27 18 25 21 24 25.5C23.2 29 20.8 31 18.8 31C17.2 31 16.5 29.5 15.8 26.5C15.2 23.8 14.2 21 12 18.5C10 16.2 9 14.5 9 13Z"
            stroke={light ? '#D6ECE8' : '#123B46'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Golden aesthetic dental arc */}
          <path
            d="M13.5 12.5C14.8 14 16.2 14.8 18 14.8C19.8 14.8 21.2 14 22.5 12.5"
            stroke="#C5A46D"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Subtle prosthodontic pinnacle diamond */}
          <path
            d="M18 7.5L18.8 9.2L20.5 10L18.8 10.8L18 12.5L17.2 10.8L15.5 10L17.2 9.2L18 7.5Z"
            fill="#C5A46D"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`text-[1.125rem] font-bold tracking-tight font-display leading-tight ${
              light ? 'text-white' : 'text-[#123B46]'
            }`}
          >
            Nandita Dental Clinic
          </span>
          <span
            className={`text-[0.68rem] font-medium uppercase tracking-[0.16em] ${
              light ? 'text-[#D6ECE8]/80' : 'text-[#123B46]/70'
            }`}
          >
            Hubli-Dharwad
          </span>
        </div>
      )}
    </div>
  );
};
