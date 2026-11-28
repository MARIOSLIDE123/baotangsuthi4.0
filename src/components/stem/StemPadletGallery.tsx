import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Info,
  Layers,
  Settings,
  Users,
  QrCode,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Camera,
} from 'lucide-react';
import { sanitizeHttpUrl } from '../../services/configService';
import { MuseumRouteId, ServiceConnectionStatus } from '../../types/museum';
import { StemRealPhotoGallery } from './StemRealPhotoGallery';
import { StemLonghouseVideoPlayer } from './StemLonghouseVideoPlayer';
import { Lesson52PresentationSlidesSection } from './Lesson52PresentationSlidesSection';

type PadletBoardKey = 'infographic-mindmap' | 'house' | 'journey';

interface StemPadletGalleryProps {
  serviceStatus: ServiceConnectionStatus;
  onNavigate: (route: MuseumRouteId) => void;
}

const DEFAULT_PADLET_STEM_URL = 'https://padlet.com/beloan107/san-pham-cua-nhung-nha-thiet-ke-tri-thuc-va-nguoi-ket-noi-di-s025riagyk6jit5ke2ka';
const QR_PADLET_STEM_PATH = '/assets/images/qr_padlet_stem_dam_san.png';
const STUDENT_MODEL_ASSEMBLY_PATH = '/assets/images/hoc_sinh_lap_mo_hinh_nha_dai_ede.jpg';

export const StemPadletGallery: React.FC<StemPadletGalleryProps> = ({
  serviceStatus,
  onNavigate,
}) => {
  const [activeBoard, setActiveBoard] = useState<PadletBoardKey>('infographic-mindmap');
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const houseUrl = sanitizeHttpUrl(serviceStatus.padlet.houseEmbedUrl);
  const journeyUrl = sanitizeHttpUrl(serviceStatus.padlet.journeyEmbedUrl);

  const handleCopyPadletUrl = () => {
    navigator.clipboard.writeText(DEFAULT_PADLET_STEM_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getActiveUrl = () => {
    if (activeBoard === 'infographic-mindmap') {
      return DEFAULT_PADLET_STEM_URL;
    }
    if (activeBoard === 'house') {
      return houseUrl;
    }
    return journeyUrl;
  };

  return (
    <section className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-sandstone pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-wood-900">
            <Layers className="w-5 h-5 text-forest-700" />
            <p className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Không gian trưng bày &amp; Nộp sản phẩm STEAM
            </p>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
            BẢO TÀNG PADLET CỦA CHÚNG EM
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-forest-800">
            Sản phẩm của những nhà thiết kế tri thức và người kết nối di sản
          </p>
          <p className="text-sm text-wood-700 leading-relaxed">
            Học sinh đăng tải Infographic, sơ đồ tư duy (Mind Map), bản vẽ thiết kế, ảnh chụp mô hình nhà dài Ê-đê và bản đồ hành trình lên bảng Padlet của lớp để giáo viên và các bạn cùng đánh giá, bình chọn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('teacher-admin')}
          className="px-3.5 py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Cấu hình Padlet &amp; Google Sheet (Giáo viên)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Bảng trưng bày Padlet">
        <button
          type="button"
          role="tab"
          aria-selected={activeBoard === 'infographic-mindmap'}
          onClick={() => setActiveBoard('infographic-mindmap')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer flex items-center gap-2 ${
            activeBoard === 'infographic-mindmap'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-md'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>Bảo tàng Padlet của chúng em</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">
            Có mã QR
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeBoard === 'house'}
          onClick={() => setActiveBoard('house')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer flex items-center gap-2 ${
            activeBoard === 'house'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-md'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          <span>Sản phẩm mô hình nhà dài Ê-đê</span>
          <span className="text-xs font-mono opacity-80">
            {houseUrl ? '· Đã gắn URL' : '· Ảnh thực hành'}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeBoard === 'journey'}
          onClick={() => setActiveBoard('journey')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer flex items-center gap-2 ${
            activeBoard === 'journey'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-md'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          <span>Sản phẩm hành trình Đăm Săn</span>
          <span className="text-xs font-mono opacity-80">
            {journeyUrl ? '· Đã gắn URL' : '· Chưa cấu hình'}
          </span>
        </button>
      </div>

      {/* TAB 1: Infographic & Mind Map Đăm Săn (QR Code + Padlet Link) */}
      {activeBoard === 'infographic-mindmap' && (
        <div className="space-y-6 animate-fade-in">
          {/* Featured Showcase Card */}
          <div className="bg-gradient-to-br from-wood-950 via-wood-900 to-terracotta-950 text-cream rounded-2xl p-6 sm:p-8 border border-gold-500/30 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* QR Code Presentation */}
              <div className="lg:col-span-5 flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-gold-500/50 hover:border-gold-400 transition-all group relative">
                  <img
                    src={QR_PADLET_STEM_PATH}
                    alt="Mã QR nộp sản phẩm Padlet Infographic & Mind Map Đăm Săn đi bắt Nữ thần Mặt Trời"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-wood-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1.5 bg-wood-900/90 text-gold-400 text-xs font-semibold rounded-lg shadow">
                      Quét mã để nộp sản phẩm
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-gold-400 text-xs font-semibold uppercase tracking-wider">
                  <QrCode className="w-4 h-4" />
                  <span>Quét bằng Camera hoặc Zalo</span>
                </div>
                <p className="text-xs text-sandstone-light mt-1 max-w-xs">
                  Học sinh dùng điện thoại quét mã QR để mở trang Padlet và đăng tải bài làm ngay lập tức.
                </p>
              </div>

              {/* Padlet Information & Direct Buttons */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold uppercase tracking-wider border border-gold-500/30">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Sản phẩm tiết dạy STEAM · Ngữ văn 10</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-cream leading-snug">
                  BẢO TÀNG PADLET CỦA CHÚNG EM
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-gold-400 uppercase tracking-wide">
                  Sản phẩm của những nhà thiết kế tri thức và người kết nối di sản
                </p>

                <p className="text-sm text-sandstone-light leading-relaxed">
                  Khái quát toàn diện <strong>giá trị nội dung</strong> (khát vọng chinh phục, ý chí dấn thân phi thường, vẻ đẹp bi tráng của cộng đồng) và <strong>đặc sắc nghệ thuật</strong> (ngôn ngữ sử thi giàu nhạc tính, biện pháp so sánh phóng đại, trùng điệp tráng lệ) của văn bản <em>"Đăm Săn đi bắt Nữ Thần Mặt Trời"</em>.
                </p>

                <div className="p-4 rounded-xl bg-wood-900/80 border border-wood-700/80 space-y-2 text-xs text-sandstone-light">
                  <p className="font-semibold text-cream">Yêu cầu sản phẩm của nhóm/học sinh khi đăng:</p>
                  <ul className="list-disc list-inside space-y-1 text-sandstone">
                    <li>Chụp ảnh rõ nét Infographic hoặc sơ đồ tư duy (vẽ tay hoặc thiết kế số trên Canva/PowerPoint).</li>
                    <li>Tiêu đề bài đăng ghi rõ: <strong>Tên nhóm / Họ tên học sinh – Lớp</strong> (Ví dụ: <em>Nhóm 01 – Lớp 10A1</em>).</li>
                    <li>Tóm tắt 1–2 câu bình luận ngắn về thông điệp ý nghĩa nhất mà nhóm rút ra từ tác phẩm.</li>
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={DEFAULT_PADLET_STEM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-wood-950 font-bold text-sm shadow-md inline-flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Mở Trang Nộp Sản Phẩm (Tab Mới)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPadletUrl}
                    className="px-4 py-3 rounded-xl bg-wood-800 hover:bg-wood-700 text-cream text-sm font-medium border border-wood-600 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-sandstone-light" />
                        <span>Sao chép link Padlet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Web View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-wood-800">
                Khung xem &amp; tương tác trực tiếp trong bảo tàng:
              </p>
              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="px-3 py-1.5 rounded-lg bg-parchment hover:bg-wood-200 text-wood-900 border border-sandstone text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullScreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
              </button>
            </div>

            <div
              className={`rounded-2xl overflow-hidden border border-sandstone bg-white shadow-md transition-all ${
                isFullScreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[600px]'
              }`}
            >
              <iframe
                src={DEFAULT_PADLET_STEM_URL}
                title="Bảng Padlet nộp sản phẩm STEM Infographic & Mind Map"
                className="w-full h-full border-0"
                allow="camera; microphone; geolocation; clipboard-write"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sản phẩm mô hình nhà dài Ê-đê (Ảnh thực hành của học sinh + Padlet) */}
      {activeBoard === 'house' && (
        <div className="space-y-6 animate-fade-in">
          {/* Video thực tế học sinh lắp ráp mô hình xem trực tiếp */}
          <StemLonghouseVideoPlayer />

          {/* Gallery 4 ảnh thực tế học sinh lắp ráp mô hình */}
          <div className="bg-cream border border-sandstone rounded-3xl p-6 sm:p-8 shadow-sm">
            <StemRealPhotoGallery />
          </div>

          {/* Tiêu điểm ảnh tổng kết & Thuyết minh sản phẩm */}
          <div className="rounded-2xl border border-sandstone bg-cream overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative min-h-[320px] lg:min-h-[420px] bg-wood-950">
                <img
                  src={STUDENT_MODEL_ASSEMBLY_PATH}
                  alt="Học sinh thực hành lắp ráp mô hình nhà dài của người Ê-đê trong tiết học STEM Ngữ văn"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wood-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-cream space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500/30 text-gold-300 text-xs font-semibold backdrop-blur-sm border border-gold-500/40">
                    <Camera className="w-3 h-3" />
                    <span>Hình ảnh thực tế tiết dạy STEAM</span>
                  </div>
                  <h4 className="font-serif text-lg sm:text-xl font-bold">
                    Học sinh thực hành lắp ráp mô hình nhà dài Ê-đê
                  </h4>
                  <p className="text-xs text-sandstone-light">
                    Ứng dụng kiến trúc cột gỗ, sàn nâng, mái dốc truyền thống vào bài học sử thi Đăm Săn
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-parchment/60 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-forest-800 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-gold-600" />
                    <span>Sản phẩm thực tế của học sinh</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-wood-900 leading-snug">
                    Không gian chế tạo mô hình kiến trúc di sản
                  </h3>

                  <p className="text-xs sm:text-sm text-wood-800 leading-relaxed">
                    Học sinh lớp 10 cùng nhau làm việc nhóm, phân công phác thảo bản vẽ tỉ lệ, cắt ghép que gỗ, liên kết hệ khung cột và dầm ngang chịu lực, mô phỏng mái tranh và chạm khắc đôi bầu sữa mẹ – vầng trăng khuyết đặc trưng trên cầu thang nhà dài.
                  </p>

                  <div className="p-3.5 rounded-xl bg-cream border border-sandstone space-y-1.5 text-xs text-wood-900">
                    <p className="font-bold text-forest-900">Vật liệu sáng tạo tiêu biểu:</p>
                    <p className="text-wood-700">Que gỗ, bìa carton tái chế, rơm khô/giấy màu giả lá tranh, keo nến an toàn và sơn phủ màu gỗ trầm tự nhiên.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('stem-studio')}
                    className="w-full py-2.5 rounded-lg bg-wood-900 hover:bg-wood-800 text-cream text-xs font-semibold text-center transition-colors cursor-pointer"
                  >
                    Xem chi tiết 6 bước chế tạo trong Nhiệm vụ 01
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Padlet iframe for house models if configured */}
          {houseUrl ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-parchment/50 border border-sandstone">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-wood-900">
                    Bảng nộp ảnh mô hình nhà dài:
                  </p>
                  <p className="text-xs font-mono text-wood-600 truncate">{houseUrl}</p>
                </div>
                <a
                  href={houseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  <span>Mở Padlet trong tab mới</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="w-full rounded-2xl overflow-hidden border border-sandstone bg-parchment/40">
                <iframe
                  src={houseUrl}
                  title="Padlet – Mô hình nhà dài Ê-đê"
                  className="w-full h-[560px] lg:h-[640px] border-0 bg-white"
                  allow="camera; microphone; geolocation; clipboard-write"
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-parchment border border-sandstone flex items-start gap-3">
              <Info className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-wood-800 space-y-1">
                <p className="font-bold text-wood-900">Ghi chú cho giáo viên:</p>
                <p>
                  Để nhúng trực tiếp bảng Padlet chuyên biệt cho mô hình nhà dài, Thầy/Cô chỉ cần mở mục <strong>Quản trị GV</strong> và dán URL nhúng vào ô <code>PADLET_HOUSE_EMBED_URL</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sản phẩm hành trình Đăm Săn (Tiết học 52) */}
      {activeBoard === 'journey' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sản phẩm trình chiếu 4 Tổ chuẩn bị cho Tiết 52 */}
          <Lesson52PresentationSlidesSection />

          {/* Bảng Padlet bổ trợ hành trình Đăm Săn (nếu đã cấu hình) */}
          {journeyUrl && (
            <div className="space-y-4 pt-4 border-t border-sandstone">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-parchment/50 border border-sandstone">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-wood-900">
                    Bảng nộp bài bổ trợ Padlet hành trình Đăm Săn:
                  </p>
                  <p className="text-xs font-mono text-wood-600 truncate">{journeyUrl}</p>
                </div>
                <a
                  href={journeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  <span>Mở Padlet trong tab mới</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="w-full rounded-2xl overflow-hidden border border-sandstone bg-parchment/40">
                <iframe
                  src={journeyUrl}
                  title="Padlet – Hành trình Đăm Săn"
                  className="w-full h-[560px] lg:h-[640px] border-0 bg-white"
                  allow="camera; microphone; geolocation; clipboard-write"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
