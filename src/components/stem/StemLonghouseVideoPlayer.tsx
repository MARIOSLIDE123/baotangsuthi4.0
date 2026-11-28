import React, { useState } from 'react';
import {
  Video,
  ExternalLink,
  Sparkles,
  Play,
  Copy,
  Check,
  Film,
  Users,
  Award,
  Maximize2,
} from 'lucide-react';

// Video 1: Chế tạo & Hoàn thiện mô hình (Nhóm 1 - Kiến trúc sư di sản)
export const STEM_LONGHOUSE_VIDEO_DRIVE_URL =
  'https://drive.google.com/file/d/1EzGo4Q62KRUM39Qkozwz6WJQYveyGzu7/view?usp=sharing';
export const STEM_LONGHOUSE_VIDEO_EMBED_URL =
  'https://drive.google.com/file/d/1EzGo4Q62KRUM39Qkozwz6WJQYveyGzu7/preview';

// Video 2: Video trước cải tiến (Nhóm 2 - Hướng dẫn viên bảo tàng)
export const STEM_GROUP2_VIDEO_DRIVE_URL =
  'https://drive.google.com/file/d/18qgax1OkxZ0OdEASraIWGKd6IRkv-xlK/view?usp=sharing';
export const STEM_GROUP2_VIDEO_EMBED_URL =
  'https://drive.google.com/file/d/18qgax1OkxZ0OdEASraIWGKd6IRkv-xlK/preview';

export interface StemVideoItem {
  id: string;
  title: string;
  groupName: string;
  stageBadge: string;
  driveUrl: string;
  embedUrl: string;
  description: string;
  highlights: string[];
  tag: string;
}

export const STEM_VIDEOS: StemVideoItem[] = [
  {
    id: 'video-1-che-tao',
    title: 'Video thực hành chế tạo & hoàn thiện mô hình nhà dài Ê-đê',
    groupName: 'Nhóm 1 – Kiến trúc sư di sản (Lớp 10D3 · THPT Trần Nguyên Hãn)',
    stageBadge: 'Minh chứng 2 · Chế tác & Lắp ráp thực tế',
    driveUrl: STEM_LONGHOUSE_VIDEO_DRIVE_URL,
    embedUrl: STEM_LONGHOUSE_VIDEO_EMBED_URL,
    description:
      'Học sinh tiến hành gắn khung cột, đo đạc tỉ lệ vì kèo, dán mái dốc và hoàn thiện mô hình nhà dài Ê-đê kết hợp tranh phong cảnh núi rừng Tây Nguyên và tem mã QR số hóa.',
    highlights: [
      'Gia cố khung cột và dầm sàn chịu lực',
      'Đo đạc tỉ lệ vì kèo và độ dốc mái tranh',
      'Hoàn thiện bục trưng bày và tem mã QR',
    ],
    tag: 'Nhóm 1: Kiến trúc sư di sản',
  },
  {
    id: 'video-2-truoc-cai-tien',
    title: 'Video trước cải tiến của Nhóm 2 – Hướng dẫn viên bảo tàng',
    groupName: 'Nhóm 2 – Hướng dẫn viên bảo tàng (Lớp 10D3 · THPT Trần Nguyên Hãn)',
    stageBadge: 'Minh chứng 3 & 4 · Video trước cải tiến',
    driveUrl: STEM_GROUP2_VIDEO_DRIVE_URL,
    embedUrl: STEM_GROUP2_VIDEO_EMBED_URL,
    description:
      'Video ghi lại phần thuyết minh và tương tác thực nghiệm không gian nhà dài Ê-đê của Nhóm 2 trước khi lập phiếu kiểm thử, đánh giá độ vững chắc và nâng cấp sản phẩm hoàn thiện.',
    highlights: [
      'Thuyết minh không gian văn hóa gian khách Gah & gian Ôk',
      'Giới thiệu ý nghĩa biểu trưng chế độ mẫu hệ (cầu thang đực/cái)',
      'Tư liệu thực nghiệm làm căn cứ kiểm thử & cải tiến sản phẩm',
    ],
    tag: 'Nhóm 2: Hướng dẫn viên bảo tàng',
  },
];

interface StemLonghouseVideoPlayerProps {
  className?: string;
  compact?: boolean;
  initialVideoId?: string;
}

export const StemLonghouseVideoPlayer: React.FC<StemLonghouseVideoPlayerProps> = ({
  className = '',
  compact = false,
  initialVideoId = 'video-1-che-tao',
}) => {
  const [activeVideoId, setActiveVideoId] = useState<string>(initialVideoId);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentVideo =
    STEM_VIDEOS.find((v) => v.id === activeVideoId) || STEM_VIDEOS[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentVideo.driveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      className={`rounded-3xl border border-sandstone bg-cream overflow-hidden shadow-md transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-7 py-5 bg-wood-950 text-cream border-b border-wood-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30 shrink-0 mt-0.5">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-forest-800 text-forest-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                Kho Video thực nghiệm STEAM (Lớp 10D3)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-wood-800 text-gold-300 text-[11px] font-semibold border border-wood-700">
                <Award className="w-3 h-3" />
                2 Video tư liệu thực tế
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-cream mt-1 leading-snug">
              {currentVideo.title}
            </h3>
            <p className="text-xs text-cream/75 mt-0.5">
              Thực hiện bởi: <strong className="text-gold-300">{currentVideo.groupName}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={currentVideo.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold bg-forest-700 hover:bg-forest-600 text-cream rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <span>Mở trên Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 text-xs font-semibold bg-wood-800 hover:bg-wood-700 text-cream/90 rounded-xl transition-colors border border-wood-700 inline-flex items-center gap-1.5 cursor-pointer"
            title="Sao chép link Google Drive"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Đã chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-wood-400" />
                <span>Chép link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 px-5 sm:px-7 py-3 bg-wood-900/90 border-b border-wood-800">
        <span className="text-xs font-semibold text-gold-400 mr-1 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          Chọn video:
        </span>
        {STEM_VIDEOS.map((vid, idx) => {
          const isActive = vid.id === activeVideoId;
          return (
            <button
              key={vid.id}
              type="button"
              onClick={() => setActiveVideoId(vid.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-gold-500 text-wood-950 shadow-md scale-[1.02]'
                  : 'bg-wood-800/80 text-cream/80 hover:bg-wood-700 hover:text-cream border border-wood-700'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>
                Video {idx + 1}: {vid.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Video Player Container */}
      <div className="p-4 sm:p-7 bg-wood-950/5 space-y-4">
        {/* Responsive 16:9 Iframe */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl border border-sandstone/80">
          <iframe
            key={currentVideo.embedUrl}
            src={currentVideo.embedUrl}
            title={currentVideo.title}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Video Metadata & Description */}
        <div className="p-4 sm:p-5 rounded-2xl bg-cream border border-sandstone space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-forest-100 text-forest-800 border border-forest-300">
                {currentVideo.stageBadge}
              </span>
              <span className="text-xs text-wood-600 font-medium">
                Chất lượng: HD 1080p · Lưu trữ Google Drive
              </span>
            </div>
            <a
              href={currentVideo.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-forest-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Xem toàn màn hình trên Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-wood-800 leading-relaxed">
            {currentVideo.description}
          </p>

          {/* Highlights */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-forest-900">
              Điểm nổi bật trong video:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentVideo.highlights.map((h, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl bg-parchment/70 border border-sandstone text-xs text-wood-800 flex items-start gap-1.5"
                >
                  <span className="font-bold text-gold-600 shrink-0">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2 Quick Cards Switcher */}
        {!compact && (
          <div className="pt-2 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-wood-700">
              Danh sách video trong bộ hồ sơ STEAM:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STEM_VIDEOS.map((vid, idx) => {
                const isSelected = vid.id === activeVideoId;
                return (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideoId(vid.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-wood-900 text-cream border-gold-500 shadow-md ring-2 ring-gold-500/30'
                        : 'bg-cream text-wood-900 border-sandstone hover:border-gold-500 hover:bg-parchment/60'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-gold-500 text-wood-950 font-bold'
                          : 'bg-parchment text-forest-800 border border-sandstone'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-wood-800 text-gold-300'
                              : 'bg-forest-100 text-forest-800'
                          }`}
                        >
                          Video {idx + 1}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] text-gold-400 font-semibold">
                            ● Đang phát
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-xs sm:text-sm font-bold truncate">
                        {vid.title}
                      </h4>
                      <p
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-cream/80' : 'text-wood-600'
                        }`}
                      >
                        {vid.groupName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
