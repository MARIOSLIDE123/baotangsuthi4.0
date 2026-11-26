import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Maximize2,
  X,
  FileText,
  Palette,
  Users,
  Presentation,
  Compass,
  Sparkles,
  Clock,
} from 'lucide-react';

export interface StemPhotoItem {
  id: string;
  imageSrc: string;
  title: string;
  caption: string;
  stage: string;
  tag: string;
  minhChungCategory: 'all' | 'mc1' | 'mc2' | 'mc3' | 'mc4';
}

export const REAL_STEM_PHOTOS: StemPhotoItem[] = [
  // MINH CHỨNG 1: Bản vẽ thiết kế
  {
    id: 'mc-1-ban-ve',
    imageSrc: '/assets/images/stem/stem_minh_chung_1_ban_ve_phan_trong_nghia.jpg',
    title: 'Sơ đồ thiết kế mô hình nhà dài Ê-đê – Phan Trọng Nghĩa (Nhóm 1)',
    caption:
      'Bản vẽ kỹ thuật 3 hình chiếu chuẩn xác: Hình chiếu đứng theo chiều dài, Hình chiếu đầu hồi, và Hình chiếu bằng bố trí các hàng cột chịu lực. Thực hiện bởi học sinh Phan Trọng Nghĩa – Nhóm 1 (Kiến trúc sư di sản) – Lớp 10D3 trường THPT Trần Nguyên Hãn.',
    stage: 'Minh chứng 1 · Bản vẽ thiết kế',
    tag: 'Phan Trọng Nghĩa · 10D3',
    minhChungCategory: 'mc1',
  },

  // MINH CHỨNG 2: Mô hình và Bức tranh phong cảnh (Yếu tố Nghệ thuật - Art trong STEAM)
  {
    id: 'mc-2-tranh-phong-canh',
    imageSrc: '/assets/images/stem/stem_minh_chung_2_mo_hinh_va_tranh_phong_canh.jpg',
    title: 'Mô hình nhà dài kết hợp bức tranh phong cảnh núi rừng Tây Nguyên',
    caption:
      'Tập thể học sinh lớp 10D3 hoàn thành xuất sắc mô hình kiến trúc nhà dài truyền thống của người Ê-đê kết hợp bức tranh phong cảnh núi rừng Tây Nguyên vẽ tay làm phông nền nghệ thuật (Yếu tố Nghệ thuật - Art cốt lõi khi nâng cấp từ STEM sang STEAM).',
    stage: 'Minh chứng 2 · Mô hình & Tranh phong cảnh',
    tag: 'Nghệ thuật STEAM (Art)',
    minhChungCategory: 'mc2',
  },
  {
    id: 'mc-2-sung-ban-keo',
    imageSrc: '/assets/images/stem/stem_nha_dai_sung_ban_keo.jpg',
    title: 'Học sinh sử dụng súng bắn keo gia cố khung cột',
    caption:
      'Tỉ mỉ liên kết từng cột gỗ, dầm sàn và bậc thềm theo đúng kết cấu nhà sàn truyền thống của người Ê-đê trong không gian xưởng sáng tạo.',
    stage: 'Minh chứng 2 · Chế tác khung cột',
    tag: 'Kỹ thuật & Kết cấu',
    minhChungCategory: 'mc2',
  },
  {
    id: 'mc-2-lap-ghep-mai',
    imageSrc: '/assets/images/stem/stem_nha_dai_lap_ghep_mai.jpg',
    title: 'Thầy trò cùng lắp ghép vì kèo và mái dốc nhà dài',
    caption:
      'Cô giáo và học sinh phối hợp đo đạc tỉ lệ, ghép vì kèo và phủ lớp mái dốc mô phỏng kiến trúc nhà dài truyền thống của đồng bào Tây Nguyên.',
    stage: 'Minh chứng 2 · Lắp ráp mái dốc',
    tag: 'Làm việc nhóm',
    minhChungCategory: 'mc2',
  },
  {
    id: 'mc-2-hoan-thien-qr',
    imageSrc: '/assets/images/stem/stem_nha_dai_hoan_thien_qr.jpg',
    title: 'Mô hình hoàn thiện có dán tem mã QR thuyết minh',
    caption:
      'Mô hình gỗ sắc nét trên bục trưng bày với hàng rào, cầu thang đực/cái và mã QR tích hợp liên kết thuyết minh văn học và bảo tàng số.',
    stage: 'Minh chứng 2 · Tích hợp số hóa QR',
    tag: 'Sản phẩm hoàn chỉnh',
    minhChungCategory: 'mc2',
  },

  // MINH CHỨNG 4: Thuyết trình trong tiết dạy học đường
  {
    id: 'mc-4-thuyet-trinh-1',
    imageSrc: '/assets/images/stem/stem_minh_chung_4_thuyet_trinh_tiet_hoc_1.jpg',
    title: 'Đại diện nhóm thuyết trình kiến trúc và văn hóa mẫu hệ trước lớp',
    caption:
      'Đại diện nhóm thực hiện giới thiệu ngắn gọn về đặc điểm kiến trúc, ý nghĩa văn hóa của nhà dài Ê-đê gắn liền với chế độ mẫu hệ trong không gian lớp học kết hợp bức tranh phong cảnh núi rừng Tây Nguyên và học liệu trình chiếu.',
    stage: 'Minh chứng 4 · Thuyết trình tiết dạy',
    tag: 'Văn hóa mẫu hệ & Kiến trúc',
    minhChungCategory: 'mc4',
  },
  {
    id: 'mc-4-thuyet-trinh-2',
    imageSrc: '/assets/images/stem/stem_minh_chung_4_thuyet_trinh_tiet_hoc_2.jpg',
    title: 'Học sinh nhóm Kiến trúc sư di sản báo cáo và tương tác',
    caption:
      'Hai học sinh đại diện nhóm báo cáo quy trình chế tạo, giải thích công năng gian khách Gah, gian gia đình Ôk và giải đáp phản biện trong tiết học Ngữ văn 10.',
    stage: 'Minh chứng 4 · Báo cáo tương tác',
    tag: 'Nhóm Kiến trúc sư di sản 10D3',
    minhChungCategory: 'mc4',
  },
];

export const StemRealPhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<StemPhotoItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    'all' | 'mc1' | 'mc2' | 'mc3' | 'mc4'
  >('all');

  const filteredPhotos =
    filterCategory === 'all'
      ? REAL_STEM_PHOTOS
      : REAL_STEM_PHOTOS.filter((p) => p.minhChungCategory === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sandstone pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-gold-500/20 text-gold-700 mt-0.5">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-bold text-wood-900 flex items-center gap-2 flex-wrap">
              <span>HỒ SƠ MINH CHỨNG THỰC TẾ SẢN PHẨM STEAM</span>
              <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-300">
                Nhà dài Ê-đê
              </span>
            </h4>
            <p className="text-xs text-wood-600 mt-0.5">
              Tác giả: <strong>Nhóm Kiến trúc sư di sản lớp 10D3 trường Trung học phổ thông Trần Nguyên Hãn</strong>
            </p>
          </div>
        </div>

        <div className="text-xs text-wood-600 sm:text-right">
          <span className="font-semibold text-wood-900">{filteredPhotos.length}</span> hình ảnh tư liệu
        </div>
      </div>

      {/* Filter Tabs by Minh Chứng */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            filterCategory === 'all'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-sm'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          Tất cả minh chứng ({REAL_STEM_PHOTOS.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('mc1')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
            filterCategory === 'mc1'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-sm'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-gold-600" />
          <span>Minh chứng 1: Bản vẽ thiết kế</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('mc2')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
            filterCategory === 'mc2'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-sm'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-forest-700" />
          <span>Minh chứng 2: Mô hình &amp; Bức tranh</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('mc3')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
            filterCategory === 'mc3'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-sm'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-terracotta-700" />
          <span>Minh chứng 3: Phiếu kiểm thử</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('mc4')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
            filterCategory === 'mc4'
              ? 'bg-wood-900 text-cream border-wood-900 shadow-sm'
              : 'bg-parchment/70 text-wood-800 border-sandstone hover:border-gold-500'
          }`}
        >
          <Presentation className="w-3.5 h-3.5 text-gold-600" />
          <span>Minh chứng 4: Thuyết trình tiết dạy</span>
        </button>
      </div>

      {/* MINH CHỨNG 3 SPECIAL NOTICE CARD */}
      {(filterCategory === 'all' || filterCategory === 'mc3') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-wood-900">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-bold text-sm sm:text-base text-wood-950">
                MINH CHỨNG 3: Phiếu ghi nhận kết quả kiểm thử, đánh giá và cải tiến sản phẩm mô hình nhà dài Ê-đê
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-900 border border-amber-500/30">
                Đang chuẩn bị cập nhật
              </span>
            </div>
            <p className="text-xs text-wood-700 leading-relaxed">
              Khung lưu trữ hồ sơ đã sẵn sàng. Phiếu kiểm thử và cải tiến sản phẩm của học sinh Nhóm Kiến trúc sư di sản lớp 10D3 sẽ được tích hợp trực tiếp vào mục này ngay khi tiếp nhận bản scan/ảnh chụp từ học sinh.
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative bg-cream border border-sandstone rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="relative h-56 bg-wood-950 overflow-hidden">
              <img
                src={photo.imageSrc}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wood-950/85 via-wood-950/20 to-transparent" />

              <div className="absolute top-2.5 left-2.5 max-w-[80%]">
                <span className="px-2 py-0.5 rounded-md bg-wood-900/85 backdrop-blur-sm text-[11px] font-semibold text-gold-300 border border-gold-500/30 truncate block">
                  {photo.stage}
                </span>
              </div>

              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-1.5 rounded-full bg-wood-900/90 text-cream inline-flex">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="text-[11px] font-medium text-emerald-300 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="truncate">{photo.tag}</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between bg-cream space-y-1.5">
              <h5 className="text-xs sm:text-sm font-bold text-wood-900 line-clamp-2 group-hover:text-forest-800 transition-colors">
                {photo.title}
              </h5>
              <p className="text-[11px] text-wood-600 line-clamp-3 leading-relaxed">
                {photo.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-wood-950 border border-wood-700 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-wood-900/80 hover:bg-wood-800 text-cream cursor-pointer transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] flex items-center justify-center bg-black/50 p-2">
              <img
                src={selectedPhoto.imageSrc}
                alt={selectedPhoto.title}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-5 sm:p-6 bg-wood-900 text-cream space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-xs font-semibold border border-gold-500/40">
                  {selectedPhoto.stage}
                </span>
                <span className="text-xs text-sandstone">{selectedPhoto.tag}</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-cream">
                {selectedPhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-sandstone-light leading-relaxed">
                {selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
