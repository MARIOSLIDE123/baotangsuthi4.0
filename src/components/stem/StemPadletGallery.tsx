import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Info,
  Layers,
  Settings,
  Users,
} from 'lucide-react';
import { sanitizeHttpUrl } from '../../services/configService';
import { MuseumRouteId, ServiceConnectionStatus } from '../../types/museum';

type PadletBoardKey = 'house' | 'journey';

interface StemPadletGalleryProps {
  serviceStatus: ServiceConnectionStatus;
  onNavigate: (route: MuseumRouteId) => void;
}

export const StemPadletGallery: React.FC<StemPadletGalleryProps> = ({
  serviceStatus,
  onNavigate,
}) => {
  const [activeBoard, setActiveBoard] = useState<PadletBoardKey>('house');

  const houseUrl = sanitizeHttpUrl(serviceStatus.padlet.houseEmbedUrl);
  const journeyUrl = sanitizeHttpUrl(serviceStatus.padlet.journeyEmbedUrl);

  const isHouse = activeBoard === 'house';
  const activeUrl = isHouse ? houseUrl : journeyUrl;
  const activeEnvVarName = isHouse
    ? 'PADLET_HOUSE_EMBED_URL'
    : 'PADLET_JOURNEY_EMBED_URL';
  const activeBoardTitle = isHouse
    ? 'Sản phẩm mô hình nhà dài'
    : 'Sản phẩm hành trình Đăm Săn';

  return (
    <section className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-sandstone pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-wood-900">
            <Layers className="w-5 h-5 text-forest-700" />
            <p className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Không gian trưng bày Padlet trực tiếp
            </p>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
            BẢO TÀNG CỦA CHÚNG EM
          </h2>
          <p className="text-sm text-wood-700 leading-relaxed">
            Học sinh đăng tải ảnh chụp mô hình, bản đồ hành trình và giới thiệu sản phẩm trực tiếp trên bảng Padlet của lớp (không sử dụng hệ thống tải ảnh riêng).
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('teacher-admin')}
          className="px-3.5 py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Cấu hình URL Padlet (Giáo viên)</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Bảng trưng bày Padlet">
        <button
          type="button"
          role="tab"
          aria-selected={activeBoard === 'house'}
          onClick={() => setActiveBoard('house')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
            activeBoard === 'house'
              ? 'bg-wood-900 text-cream border-wood-900'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          Sản phẩm mô hình nhà dài
          <span className="ml-2 text-xs font-mono opacity-80">
            {houseUrl ? '· Đã gắn URL' : '· Chưa cấu hình'}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeBoard === 'journey'}
          onClick={() => setActiveBoard('journey')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
            activeBoard === 'journey'
              ? 'bg-wood-900 text-cream border-wood-900'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          Sản phẩm hành trình Đăm Săn
          <span className="ml-2 text-xs font-mono opacity-80">
            {journeyUrl ? '· Đã gắn URL' : '· Chưa cấu hình'}
          </span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-parchment/80 border border-sandstone flex items-start gap-3">
        <Users className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-wood-800 leading-relaxed space-y-1">
          <p className="font-bold text-wood-900">
            Hướng dẫn ghi danh khi nộp sản phẩm lên Padlet:
          </p>
          <p>
            Nếu bảng Padlet cho phép đăng ẩn danh (không cần đăng nhập tài khoản), học sinh vui lòng{' '}
            <strong>ghi rõ Tên nhóm hoặc Mã nhóm và Lớp</strong> (ví dụ:{' '}
            <code className="font-mono bg-cream px-1.5 py-0.5 rounded border border-sandstone">
              Nhóm 02 – Lớp 10A1
            </code>
            ) ngay ở dòng tiêu đề bài viết để giáo viên nhận diện và chấm điểm đúng nhóm.
          </p>
        </div>
      </div>

      {activeUrl ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-parchment/50 border border-sandstone">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-bold text-wood-900">
                Đang hiển thị bảng: {activeBoardTitle}
              </p>
              <p className="text-xs font-mono text-wood-600 truncate">
                {activeUrl}
              </p>
            </div>

            <a
              href={activeUrl}
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
              key={activeUrl}
              src={activeUrl}
              title={`Padlet – ${activeBoardTitle}`}
              className="w-full h-[560px] lg:h-[640px] border-0 bg-white"
              allow="camera; microphone; geolocation; clipboard-write"
              loading="lazy"
            />
          </div>

          <div className="p-4 rounded-xl bg-gold-50/70 border border-gold-500/40 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-gold-700 shrink-0 mt-0.5" />
            <div className="text-xs text-wood-800 leading-relaxed space-y-1">
              <p className="font-bold text-wood-900">
                Lưu ý dự phòng nếu khung nhúng Padlet không hiển thị hoặc báo từ chối kết nối:
              </p>
              <p>
                Một số bảng Padlet có cấu hình bảo mật trình duyệt (<code className="font-mono">X-Frame-Options</code> / CSP) chặn nhúng trực tiếp qua iframe khi chưa bật chế độ Embed. Nếu gặp tình trạng khung trắng hoặc lỗi kết nối, học sinh hãy bấm nút{' '}
                <strong>“Mở Padlet trong tab mới”</strong> ở phía trên để nộp ảnh trực tiếp; đồng thời giáo viên hãy kiểm tra lại liên kết có dạng{' '}
                <code className="font-mono">https://padlet.com/embed/...</code> trong mục Quản trị.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-sandstone bg-parchment/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gold-700 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-wood-900">
                Chưa cấu hình liên kết cho bảng “{activeBoardTitle}”
              </h3>
              <p className="text-sm text-wood-700 leading-relaxed">
                Hệ thống không hiển thị khung nhúng giả lập khi chưa có liên kết Padlet thật. Để kích hoạt bảng trưng bày này cho lớp học, giáo viên thực hiện một trong hai cách sau:
              </p>
            </div>
          </div>

          <ol className="list-decimal pl-6 space-y-2 text-sm text-wood-800 leading-relaxed">
            <li>
              <strong>Cách 1 (Nhanh trên giao diện):</strong> Bấm nút{' '}
              <strong>Mở cấu hình Giáo viên</strong> bên dưới, dán đường dẫn nhúng Padlet (ví dụ{' '}
              <code className="font-mono text-xs bg-cream px-1.5 py-0.5 rounded border border-sandstone">
                https://padlet.com/embed/...
              </code>
              ) vào ô <code className="font-mono text-xs">{activeEnvVarName}</code> và lưu lại.
            </li>
            <li>
              <strong>Cách 2 (Cấu hình máy chủ):</strong> Thiết lập biến môi trường{' '}
              <code className="font-mono text-xs bg-cream px-1.5 py-0.5 rounded border border-sandstone">
                {activeEnvVarName}
              </code>{' '}
              trong cấu hình triển khai của ứng dụng để toàn bộ học sinh truy cập từ nhiều thiết bị đều thấy ngay.
            </li>
            <li>
              Trong phần <strong>Share</strong> của Padlet, bật quyền khách truy cập là{' '}
              <strong>Can write</strong> và chọn <strong>Embed in your blog or website</strong> để sao chép đúng URL nhúng.
            </li>
          </ol>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('teacher-admin')}
              className="px-4 py-2.5 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Mở cấu hình Giáo viên để gắn {activeEnvVarName}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
