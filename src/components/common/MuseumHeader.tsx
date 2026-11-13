import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MUSEUM_ZONES, TOP_NAV_ITEMS } from '../../data/navigation';
import { MuseumRouteId } from '../../types/museum';

interface MuseumHeaderProps {
  activeRoute: MuseumRouteId;
  studentName: string;
  onNavigate: (route: MuseumRouteId) => void;
}

export const MuseumHeader: React.FC<MuseumHeaderProps> = ({
  activeRoute,
  studentName,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isNavActive = (itemId: MuseumRouteId) => {
    if (itemId === 'epic-gate') {
      return ['epic-gate', 'vietnam-epics', 'world-epics', 'dam-san-journey'].includes(activeRoute);
    }
    if (itemId === 'hero-arena') {
      return ['hero-arena', 'stem-studio', 'teacher-admin'].includes(activeRoute);
    }
    return activeRoute === itemId;
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-sandstone">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-wood-900 whitespace-nowrap shrink-0 hover:text-forest-700 transition-colors cursor-pointer"
        >
          SỬ THI SỐ 4.0
        </button>

        {/* Zone 2: 5 concise single-line menu links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-wood-700">
          {TOP_NAV_ITEMS.map((item) => {
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active ? 'text-forest-800 font-semibold' : 'hover:text-wood-900'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-gold-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Learner Profile / Passport Primary CTA + mobile drawer button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('passport')}
            title={`Hồ sơ người học: ${studentName}`}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            Hồ sơ người học
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-sandstone text-wood-900 hover:bg-parchment transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Đóng bản đồ bảo tàng' : 'Mở bản đồ bảo tàng'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet 11-zone navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sandstone bg-cream px-4 py-4 max-h-[75vh] overflow-y-auto">
          <p className="text-xs font-semibold text-wood-500 mb-3">
            Bản đồ các phân khu bảo tàng
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MUSEUM_ZONES.map((zone) => {
              const active = activeRoute === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    onNavigate(zone.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-colors min-h-[44px] cursor-pointer ${
                    active
                      ? 'bg-forest-700 text-cream'
                      : 'bg-parchment/70 text-wood-900 hover:bg-parchment'
                  }`}
                >
                  <span className="font-mono text-xs tabular-nums opacity-75">{zone.orderLabel}</span>
                  <span className="text-sm font-medium truncate">{zone.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
