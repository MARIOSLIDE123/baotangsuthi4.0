import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { getZoneInfo } from '../../data/navigation';
import { MuseumRouteId } from '../../types/museum';
import { SafeImage } from './SafeImage';

interface GuideCharacterWidgetProps {
  activeRoute: MuseumRouteId;
  onOpenAiAssistant: () => void;
}

export const GuideCharacterWidget: React.FC<GuideCharacterWidgetProps> = ({
  activeRoute,
  onOpenAiAssistant,
}) => {
  const [expanded, setExpanded] = useState(true);
  const zone = getZoneInfo(activeRoute);

  return (
    <aside
      aria-label="Nhân vật hướng dẫn Sứ Giả Đại Ngàn"
      className="fixed bottom-4 right-4 z-30 max-w-xs sm:max-w-sm"
    >
      <div className="bg-wood-900 text-cream border border-gold-500/45 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-wood-950/65">
          <div className="flex items-center gap-2.5 min-w-0">
            <SafeImage
              src="/assets/images/su_gia_dai_ngan_1794539491712.jpg"
              alt="Sứ Giả Đại Ngàn"
              className="w-10 h-10 rounded-lg object-cover border border-gold-500/50 shrink-0 overflow-hidden"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-gold-400">
                SỨ GIẢ ĐẠI NGÀN
              </p>
              <p className="text-[11px] text-cream/75 leading-tight">
                Trợ lý khám phá · {zone.shortTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="p-1.5 text-cream/75 hover:text-cream rounded-md hover:bg-wood-800 transition-colors cursor-pointer"
            aria-label={expanded ? 'Thu gọn hướng dẫn' : 'Mở rộng hướng dẫn'}
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="px-3.5 py-3 space-y-2.5">
            <p className="text-xs text-cream/90 leading-relaxed">{zone.guideTip}</p>
            {activeRoute !== 'ai-assistant' && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Trò chuyện cùng Sứ Giả AI</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
