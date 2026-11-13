import React from 'react';
import { MUSEUM_ZONES } from '../../data/navigation';
import { MuseumRouteId } from '../../types/museum';

interface MuseumZoneDirectoryProps {
  activeRoute: MuseumRouteId;
  visitedZones: MuseumRouteId[];
  onNavigate: (route: MuseumRouteId) => void;
}

export const MuseumZoneDirectory: React.FC<MuseumZoneDirectoryProps> = ({
  activeRoute,
  visitedZones,
  onNavigate,
}) => {
  return (
    <section aria-label="Bản đồ phân khu bảo tàng" className="border-b border-sandstone bg-parchment/55">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-2.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-wood-600 whitespace-nowrap shrink-0 pr-2 border-r border-sandstone">
          11 Phân khu
        </span>
        <div className="flex items-center gap-1.5">
          {MUSEUM_ZONES.map((zone) => {
            const isActive = activeRoute === zone.id;
            const isVisited = visitedZones.includes(zone.id);
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => onNavigate(zone.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-wood-900 text-cream shadow-sm'
                    : isVisited
                    ? 'bg-cream text-wood-800 border border-sandstone hover:border-gold-500'
                    : 'text-wood-700 hover:bg-cream/80'
                }`}
              >
                <span className="font-mono text-[11px] tabular-nums opacity-70">{zone.orderLabel}</span>
                <span>{zone.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
