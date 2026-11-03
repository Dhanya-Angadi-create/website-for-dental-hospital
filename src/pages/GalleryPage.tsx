import React, { useState } from 'react';
import { X, ZoomIn, Info } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; caption: string; category: string } | null>(null);

  const galleryItems = [
    {
      src: '/src/assets/images/hero_dental_clinic_1793713702437.jpg',
      caption: 'Main Dental Operatory Suite & Ergonomic Patient Chair',
      category: 'operatory'
    },
    {
      src: '/src/assets/images/clinic_reception_lounge_1793713705984.jpg',
      caption: 'Clinic Reception & Waiting Lounge',
      category: 'reception'
    },
    {
      src: '/src/assets/images/treatment_root_canal_1793713703877.jpg',
      caption: 'Rotary Endodontics & Precision Instrumentation',
      category: 'equipment'
    },
    {
      src: '/src/assets/images/treatment_cleaning_1793713703988.jpg',
      caption: 'Ultrasonic Scaling Setup & Prophylaxis Unit',
      category: 'equipment'
    },
    {
      src: '/src/assets/images/treatment_whitening_1793713705532.jpg',
      caption: 'In-Office Clinical Whitening & Enamel Shading',
      category: 'operatory'
    },
    {
      src: '/src/assets/images/treatment_fillings_1793713725404.jpg',
      caption: 'Composite Restorative Preparation & Curing Light',
      category: 'equipment'
    },
    {
      src: '/src/assets/images/treatment_prosthodontics_1793713726493.jpg',
      caption: 'Prosthodontic Crown & Bridge Articulation Model',
      category: 'equipment'
    },
    {
      src: '/src/assets/images/doctor_profile_placeholder_1793713705980.jpg',
      caption: 'Dr. Prasannakumar Kadakol, Consulting Dentist & Prosthodontist',
      category: 'doctor'
    }
  ];

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'operatory', label: 'Treatment Rooms' },
    { id: 'reception', label: 'Reception & Lounge' },
    { id: 'equipment', label: 'Equipment & Prosthetics' },
    { id: 'doctor', label: 'Doctor & Consultation' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#123B46]">
          Visual Tour
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display mt-1">
          Clinic Photo Gallery
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Explore the operatory suites, reception lounge, and clinical equipment at Nandita Dental Clinic in Hubli-Dharwad.
        </p>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Authentic Visuals:</strong> All photographs reflect actual clinical spaces, equipment, and doctor representations for Nandita Dental Clinic. Clinic owners can upload additional original clinic captures via the admin portal.
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-xl max-w-fit">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeCategory === c.id
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPhoto(item)}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-xs hover:shadow-md transition-all h-72"
          >
            <img
              src={item.src}
              alt={item.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
              <div className="flex justify-end">
                <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D6ECE8] block mb-1">
                  {item.category.toUpperCase()}
                </span>
                <p className="text-xs font-medium text-slate-100 line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[80vh] flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.caption}
                className="max-h-[75vh] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800 text-xs">
              <span className="font-medium text-slate-200">
                {selectedPhoto.caption}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#D6ECE8] bg-slate-800 px-2.5 py-1 rounded">
                Nandita Dental Clinic
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
