import React, { useState } from 'react';
import { Camera, CheckCircle2, Maximize2, X } from 'lucide-react';

export interface StemPhotoItem {
  id: string;
  imageSrc: string;
  title: string;
  caption: string;
  stage: string;
  tag: string;
}

export const REAL_STEM_PHOTOS: StemPhotoItem[] = [
  {
    id: 'photo-1',
    imageSrc: '/assets/images/stem/stem_nha_dai_hoc_sinh_chup_anh.jpg',
    title: 'Tập thể học sinh chụp ảnh kỷ niệm cùng sản phẩm',
    caption: 'Nhóm học sinh hoàn thành xuất sắc mô hình nhà dài Ê-đê kết hợp tranh phong cảnh núi rừng Tây Nguyên hùng vĩ.',
    stage: 'Hoàn thiện & Báo cáo',
    tag: 'Tập thể lớp 10',
  },
  {
    id: 'photo-2',
    imageSrc: '/assets/images/stem/stem_nha_dai_sung_ban_keo.jpg',
    title: 'Học sinh sử dụng súng bắn keo gia cố khung cột',
    caption: 'Tỉ mỉ liên kết từng cột gỗ, dầm sàn và bậc thềm theo đúng kết cấu nhà sàn truyền thống của người Ê-đê.',
    stage: 'Chế tạo khung nhà',
    tag: 'Kỹ thuật & Kết cấu',
  },
  {
    id: 'photo-3',
    imageSrc: '/assets/images/stem/stem_nha_dai_lap_ghep_mai.jpg',
    title: 'Cô giáo và học sinh cùng lắp ghép phần mái tranh',
    caption: 'Thầy trò cùng phối hợp đo đạc tỉ lệ, ghép vì kèo và phủ lớp mái dốc mô phỏng kiến trúc nhà dài truyền thống.',
    stage: 'Lắp ráp mái dốc',
    tag: 'Làm việc nhóm',
  },
  {
    id: 'photo-4',
    imageSrc: '/assets/images/stem/stem_nha_dai_hoan_thien_qr.jpg',
    title: 'Mô hình hoàn thiện có dán tem mã QR thuyết minh',
    caption: 'Mô hình gỗ sắc nét trên bục trưng bày với hàng rào, cầu thang đực/cái và mã QR tích hợp liên kết thuyết minh văn học.',
    stage: 'Sản phẩm hoàn chỉnh',
    tag: 'Tích hợp số hóa QR',
  },
];

export const StemRealPhotoGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<StemPhotoItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gold-500/20 text-gold-700">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-wood-900">
              Hình ảnh học sinh lắp mô hình nhà dài của người Ê-đê
            </h4>
            <p className="text-xs text-wood-600">
              Sản phẩm thực tế của học sinh trong các tiết dạy có ứng dụng STEM Sử thi số 4.0
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 border border-forest-300 hidden sm:inline">
          4 ảnh thực tế
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REAL_STEM_PHOTOS.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative bg-cream border border-sandstone rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="relative h-52 bg-wood-950 overflow-hidden">
              <img
                src={photo.imageSrc}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wood-950/85 via-wood-950/20 to-transparent" />
              
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-md bg-wood-900/80 backdrop-blur-sm text-[11px] font-semibold text-gold-300 border border-gold-500/30">
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
                  <span>{photo.tag}</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between bg-cream space-y-1.5">
              <h5 className="text-xs sm:text-sm font-bold text-wood-900 line-clamp-1 group-hover:text-forest-800 transition-colors">
                {photo.title}
              </h5>
              <p className="text-[11px] text-wood-600 line-clamp-2 leading-relaxed">
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

            <div className="max-h-[70vh] flex items-center justify-center bg-black/50">
              <img
                src={selectedPhoto.imageSrc}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
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
