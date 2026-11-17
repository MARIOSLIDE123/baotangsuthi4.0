import React from 'react';
import { Video, ExternalLink, Sparkles, Play } from 'lucide-react';

export const STEM_LONGHOUSE_VIDEO_DRIVE_URL =
  'https://drive.google.com/file/d/1EzGo4Q62KRUM39Qkozwz6WJQYveyGzu7/view?usp=sharing';
export const STEM_LONGHOUSE_VIDEO_EMBED_URL =
  'https://drive.google.com/file/d/1EzGo4Q62KRUM39Qkozwz6WJQYveyGzu7/preview';

interface StemLonghouseVideoPlayerProps {
  className?: string;
  compact?: boolean;
}

export const StemLonghouseVideoPlayer: React.FC<StemLonghouseVideoPlayerProps> = ({
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-sandstone bg-cream overflow-hidden shadow-sm transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-wood-950 text-cream border-b border-wood-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-800/80 text-forest-200 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-gold-400" />
                Video thực tế tiết học STEM
              </span>
            </div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-cream mt-0.5">
              Video thực hành chế tạo &amp; hoàn thiện mô hình nhà dài Ê-đê
            </h4>
          </div>
        </div>

        <a
          href={STEM_LONGHOUSE_VIDEO_DRIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 text-xs font-semibold bg-forest-700 hover:bg-forest-600 text-cream rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          <span>Mở trên Google Drive</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Video Player Container */}
      <div className="p-4 sm:p-6 bg-wood-950/5 space-y-3">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg border border-sandstone/80">
          <iframe
            src={STEM_LONGHOUSE_VIDEO_EMBED_URL}
            title="Video học sinh lắp ráp mô hình nhà dài Ê-đê"
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {!compact && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-wood-700">
            <p className="flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span>
                Thầy cô và các bạn học sinh có thể nhấn nút <strong>Phát (Play)</strong> hoặc phóng to <strong>Toàn màn hình</strong> để xem trực tiếp video trong ứng dụng.
              </span>
            </p>
            <span className="text-wood-500 font-mono text-[11px] shrink-0">
              Chất lượng: HD · Lưu trữ Google Drive
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
