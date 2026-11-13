import React from 'react';
import { Globe2 } from 'lucide-react';

interface WorldCultureMapProps {
  selectedRegion: 'all' | 'greece' | 'india' | 'mesopotamia';
  onSelectRegion: (region: 'all' | 'greece' | 'india' | 'mesopotamia') => void;
}

const REGIONS: Array<{
  id: 'greece' | 'mesopotamia' | 'india';
  label: string;
  epics: string;
  x: number;
  y: number;
}> = [
  {
    id: 'greece',
    label: 'Hy Lạp · Địa Trung Hải',
    epics: 'Iliad · Odyssey',
    x: 20,
    y: 42,
  },
  {
    id: 'mesopotamia',
    label: 'Lưỡng Hà · Tây Á',
    epics: 'Epic of Gilgamesh',
    x: 47,
    y: 50,
  },
  {
    id: 'india',
    label: 'Ấn Độ cổ đại · Nam Á',
    epics: 'Ramayana · Mahabharata',
    x: 74,
    y: 62,
  },
];

export const WorldCultureMap: React.FC<WorldCultureMapProps> = ({
  selectedRegion,
  onSelectRegion,
}) => {
  return (
    <section className="bg-wood-900 text-cream border border-wood-800 rounded-2xl p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-gold-400" />
          <div>
            <h2 className="font-serif text-2xl font-bold text-cream">
              Bản đồ khu vực văn hóa sử thi thế giới
            </h2>
            <p className="text-xs text-cream/75">
              Chọn vùng văn hóa để lọc nhanh các thiên sử thi cổ đại tiêu biểu.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectRegion('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer self-start sm:self-auto ${
            selectedRegion === 'all'
              ? 'bg-gold-500 text-wood-950 border-gold-500'
              : 'bg-wood-800 text-cream border-wood-700 hover:border-gold-400'
          }`}
        >
          Tất cả khu vực (5 tác phẩm)
        </button>
      </div>

      {/* Stylized Interactive Cultural Axis Map */}
      <div className="relative h-56 sm:h-64 rounded-xl bg-wood-950 border border-wood-800 overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
        >
          {/* Decorative latitude/longitude grid + stylized landmass silhouettes */}
          <line x1="0" y1="33" x2="100" y2="33" stroke="#DCA847" strokeWidth="0.2" strokeDasharray="1 1" />
          <line x1="0" y1="66" x2="100" y2="66" stroke="#DCA847" strokeWidth="0.2" strokeDasharray="1 1" />
          <line x1="33" y1="0" x2="33" y2="100" stroke="#DCA847" strokeWidth="0.2" strokeDasharray="1 1" />
          <line x1="66" y1="0" x2="66" y2="100" stroke="#DCA847" strokeWidth="0.2" strokeDasharray="1 1" />
          <path
            d="M 8 28 Q 22 20, 34 36 T 55 44 T 82 54 L 86 78 L 62 82 L 42 62 L 14 54 Z"
            fill="#1E4F38"
            opacity="0.55"
          />
          {/* Trade / cultural connection arc */}
          <path
            d="M 20 42 Q 34 32, 47 50 T 74 62"
            fill="none"
            stroke="#DCA847"
            strokeWidth="0.6"
            strokeDasharray="1.5 1.5"
          />
        </svg>

        {REGIONS.map((reg) => {
          const active = selectedRegion === reg.id;
          return (
            <button
              key={reg.id}
              type="button"
              onClick={() => onSelectRegion(reg.id)}
              style={{ left: `${reg.x}%`, top: `${reg.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer max-w-[165px] ${
                active
                  ? 'bg-gold-500 text-wood-950 border-cream shadow-lg scale-105 z-10'
                  : 'bg-wood-900/90 text-cream border-gold-500/40 hover:border-gold-400'
              }`}
            >
              <p className="text-xs font-bold leading-tight">{reg.label}</p>
              <p className={`text-[11px] mt-0.5 ${active ? 'text-wood-950/85' : 'text-gold-400'}`}>
                {reg.epics}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
