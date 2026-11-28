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
  ExternalLink,
  Copy,
  Check,
  FolderOpen,
  ShieldCheck,
  Film,
} from 'lucide-react';
import {
  STEM_GROUP2_VIDEO_DRIVE_URL,
  STEM_GROUP2_VIDEO_EMBED_URL,
} from './StemLonghouseVideoPlayer';

const GOOGLE_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/11aXHvCXqjigN4dQKtTotSoEUHshxYlXJ';

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

  // MINH CHỨNG 3: Quy trình 5 bước cải tiến cầu thang nhà dài Ê-đê
  {
    id: 'mc-3-cai-tien-cau-thang-1',
    imageSrc: '/assets/images/stem/stem_cai_tien_cau_thang_1_ban_ve_thuoc_ke.jpg',
    title: 'Bước 1: Phác thảo bản vẽ cải tiến kích thước & góc nghiêng cầu thang',
    caption:
      'Học sinh sử dụng thước đo kỹ thuật tính toán lại tỉ lệ độ dốc, bề rộng mặt thang và số bậc thang lẻ cho cả cầu thang đực (Kpal) và cầu thang cái (Ngă) mang biểu tượng trăng khuyết và đôi bầu sữa mẹ.',
    stage: 'Minh chứng 3 · Cải tiến cầu thang',
    tag: 'Bước 1 · Bản vẽ đo đạc tỉ lệ',
    minhChungCategory: 'mc3',
  },
  {
    id: 'mc-3-cai-tien-cau-thang-2',
    imageSrc: '/assets/images/stem/stem_cai_tien_cau_thang_2_phac_thao_chi_tiet.jpg',
    title: 'Bước 2: Phác thảo chi tiết biểu tượng vầng trăng khuyết & đôi bầu sữa mẹ',
    caption:
      'Bản vẽ phóng to phần đỉnh cầu thang cái với biểu tượng đôi bầu sữa mẹ căng tròn và vầng trăng khuyết – biểu trưng thiêng liêng của chế độ mẫu hệ Ê-đê được đưa vào phương án cải tiến sản phẩm mô hình.',
    stage: 'Minh chứng 3 · Cải tiến cầu thang',
    tag: 'Bước 2 · Hoa văn văn hóa mẫu hệ',
    minhChungCategory: 'mc3',
  },
  {
    id: 'mc-3-cai-tien-cau-thang-3',
    imageSrc: '/assets/images/stem/stem_cai_tien_cau_thang_3_chuan_bi_phoi_xop.jpg',
    title: 'Bước 3: Chuẩn bị phôi xốp định hình và dụng cụ gia công bậc thang',
    caption:
      'Học sinh chuẩn bị phôi xốp đặc, bút chì và thước kẻ chuyên dụng để chuyển đổi từ bản vẽ 2D sang phôi vật liệu 3D, tối ưu độ nhẹ và khả năng bám dính chắc chắn vào sàn mô hình.',
    stage: 'Minh chứng 3 · Cải tiến cầu thang',
    tag: 'Bước 3 · Chuẩn bị phôi xốp 3D',
    minhChungCategory: 'mc3',
  },
  {
    id: 'mc-3-cai-tien-cau-thang-4',
    imageSrc: '/assets/images/stem/stem_cai_tien_cau_thang_4_ve_dinh_hinh_xop.jpg',
    title: 'Bước 4: Vẽ định hình từng bậc thang và hoa văn mẫu hệ lên phôi xốp',
    caption:
      'Học sinh dùng bút lông vẽ chính xác vị trí từng bậc thang, vầng trăng khuyết và đôi mắt/bầu sữa mẹ lên khối xốp trước khi tiến hành cắt gọt và khía bậc.',
    stage: 'Minh chứng 3 · Cải tiến cầu thang',
    tag: 'Bước 4 · Định hình kỹ thuật',
    minhChungCategory: 'mc3',
  },
  {
    id: 'mc-3-cai-tien-cau-thang-5',
    imageSrc: '/assets/images/stem/stem_cai_tien_cau_thang_5_hoan_thien_khia_bac.jpg',
    title: 'Bước 5: Hoàn thiện cắt khía bậc thang đực và cầu thang cái sau cải tiến',
    caption:
      'Cặp cầu thang hoàn thiện sau quy trình cải tiến: Cầu thang đực thanh thoát và cầu thang cái rộng bản được khía từng bậc sắc nét, phẳng mịn, sẵn sàng gắn lên bục sàn Gah của mô hình nhà dài Ê-đê.',
    stage: 'Minh chứng 3 · Cải tiến cầu thang',
    tag: 'Bước 5 · Sản phẩm hoàn thiện',
    minhChungCategory: 'mc3',
  },

  // MINH CHỨNG 4: Thuyết trình trong tiết dạy học đường
  {
    id: 'mc-4-toan-canh-lop-hoc',
    imageSrc: '/assets/images/stem/stem_toan_canh_tiet_day_10d3.jpg',
    title: 'Toàn cảnh tiết dạy học STEAM Ngữ văn 10 tại lớp 10D3 trường THPT Trần Nguyên Hãn',
    caption:
      'Cô giáo Hồ Thị Thanh Loan và học sinh lớp 10D3 trong tiết học ứng dụng mô hình STEAM: Khởi động với mô hình nhà dài Ê-đê thực tế, tem mã QR và học liệu số bài "Đăm Săn đi bắt Nữ thần Mặt Trời".',
    stage: 'Minh chứng 4 · Không gian lớp học STEAM',
    tag: 'Tiết dạy thực tế · 10D3',
    minhChungCategory: 'mc4',
  },
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
  const [copiedDrive, setCopiedDrive] = useState(false);

  const handleCopyDriveLink = () => {
    navigator.clipboard.writeText(GOOGLE_DRIVE_FOLDER_URL);
    setCopiedDrive(true);
    setTimeout(() => setCopiedDrive(false), 2500);
  };

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
            <span>Minh chứng 3: Cải tiến cầu thang ({REAL_STEM_PHOTOS.filter((p) => p.minhChungCategory === 'mc3').length})</span>
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

      {/* MINH CHỨNG 3: PHIẾU GHI NHẬN KẾT QUẢ KIỂM THỬ, ĐÁNH GIÁ VÀ CẢI TIẾN SẢN PHẨM */}
      {(filterCategory === 'all' || filterCategory === 'mc3') && (
        <div className="bg-gradient-to-br from-cream via-parchment/90 to-cream border-2 border-forest-600/40 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
          {/* Card Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-sandstone pb-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-forest-700 text-cream shadow-md shrink-0 mt-1">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-300">
                    Minh chứng 3 · Kiểm thử &amp; Cải tiến sản phẩm
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Đã xác thực dữ liệu</span>
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-wood-950 leading-snug">
                  PHIẾU GHI NHẬN KẾT QUẢ KIỂM THỬ, ĐÁNH GIÁ VÀ CẢI TIẾN SẢN PHẨM MÔ HÌNH NHÀ DÀI Ê-ĐÊ
                </h3>
                <p className="text-xs sm:text-sm text-wood-700">
                  Thực hiện bởi: <strong>Nhóm Kiến trúc sư di sản lớp 10D3 trường THPT Trần Nguyên Hãn</strong>
                </p>
              </div>
            </div>

            {/* Direct Google Drive Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-cream font-bold text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <FolderOpen className="w-4 h-4 text-gold-300" />
                <span>Mở thư mục Google Drive</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyDriveLink}
                className="px-4 py-3 rounded-xl bg-cream hover:bg-parchment text-wood-900 border border-sandstone text-xs sm:text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                {copiedDrive ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Đã chép link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-wood-600" />
                    <span>Sao chép liên kết</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4 Core Dimensions of Testing & Improvement Form */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-forest-900">
              Các nội dung kiểm thử &amp; cải tiến trọng tâm trong phiếu:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-cream/90 border border-sandstone space-y-1.5 shadow-sm">
                <span className="font-mono text-xs font-bold text-forest-800">01. Tải trọng &amp; Sàn nâng</span>
                <h5 className="text-xs sm:text-sm font-bold text-wood-900">Độ đứng vững kết cấu</h5>
                <p className="text-xs text-wood-600 leading-relaxed">
                  Kiểm tra khả năng chịu lực của các hàng cột chống, dầm ngang và sàn gỗ nâng cao khỏi mặt đất theo đúng thực nghiệm.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream/90 border border-sandstone space-y-1.5 shadow-sm">
                <span className="font-mono text-xs font-bold text-forest-800">02. Tỉ lệ kiến trúc</span>
                <h5 className="text-xs sm:text-sm font-bold text-wood-900">Chuẩn hóa cấu trúc Ê-đê</h5>
                <p className="text-xs text-wood-600 leading-relaxed">
                  Đối chiếu chiều dài thân nhà, độ dốc mái tranh thoát nước và tỉ lệ đối xứng giữa gian khách Gah và gian Ôk.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream/90 border border-sandstone space-y-1.5 shadow-sm">
                <span className="font-mono text-xs font-bold text-forest-800">03. Yếu tố Mẫu hệ &amp; Art</span>
                <h5 className="text-xs sm:text-sm font-bold text-wood-900">Hoa văn biểu trưng</h5>
                <p className="text-xs text-wood-600 leading-relaxed">
                  Đánh giá độ sắc nét của cầu thang cái chạm khắc đôi bầu sữa mẹ, vầng trăng khuyết và phối màu tranh núi rừng Tây Nguyên.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cream/90 border border-sandstone space-y-1.5 shadow-sm">
                <span className="font-mono text-xs font-bold text-forest-800">04. Phương án cải tiến</span>
                <h5 className="text-xs sm:text-sm font-bold text-wood-900">Gia cố &amp; Tích hợp QR</h5>
                <p className="text-xs text-wood-600 leading-relaxed">
                  Bổ sung keo cố định các khớp mộng que gỗ, cải tiến độ bền và dán tem mã QR liên kết trực tiếp vào Bảo tàng số 4.0.
                </p>
              </div>
            </div>
          </div>

          {/* Video trước cải tiến của Nhóm 2 - Hướng dẫn viên bảo tàng */}
          <div className="p-5 rounded-2xl bg-wood-950 text-cream space-y-3.5 border border-gold-500/30 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wood-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30 shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-forest-800 text-forest-200">
                      Tư liệu thực nghiệm
                    </span>
                    <span className="text-xs text-gold-400 font-semibold">
                      Nhóm 2: Hướng dẫn viên bảo tàng (10D3)
                    </span>
                  </div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-cream mt-0.5">
                    Video trước cải tiến – Thuyết minh mô hình nhà dài Ê-đê
                  </h4>
                </div>
              </div>

              <a
                href={STEM_GROUP2_VIDEO_DRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-600 text-cream text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
              >
                <span>Xem trên Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs sm:text-sm text-cream/80 leading-relaxed">
              Video thực tế ghi nhận phần thuyết minh của <strong>Nhóm 2 (Hướng dẫn viên bảo tàng)</strong> trước khi đối chiếu và lập Phiếu kiểm thử, làm căn cứ cải tiến độ vững chắc và hoàn thiện mô hình.
            </p>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-wood-800 shadow-lg">
              <iframe
                src={STEM_GROUP2_VIDEO_EMBED_URL}
                title="Video trước cải tiến của Nhóm 2 – Hướng dẫn viên bảo tàng"
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Quy trình 5 bước cải tiến cầu thang nhà dài Ê-đê */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sandstone/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-forest-700 text-cream">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-wood-950">
                    HÌNH ẢNH THỰC TẾ: QUY TRÌNH 5 BƯỚC CẢI TIẾN CẦU THANG NHÀ DÀI Ê-ĐÊ
                  </h4>
                  <p className="text-xs text-wood-600">
                    Khắc phục nhược điểm về tỉ lệ và hoa văn mẫu hệ (cầu thang đực Kpal &amp; cầu thang cái Ngă) sau kiểm thử thực tế
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-forest-800 bg-forest-100 border border-forest-300 px-2.5 py-1 rounded-full shrink-0">
                5 Ảnh minh chứng thực tế
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {REAL_STEM_PHOTOS.filter((p) => p.minhChungCategory === 'mc3').map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPhoto(item)}
                  className="group relative bg-cream border border-sandstone rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gold-500 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 bg-wood-950 overflow-hidden">
                    <img
                      src={item.imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wood-950/70 via-transparent to-transparent" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-wood-900/90 text-gold-300 text-[10px] font-bold border border-gold-500/30">
                      Bước {idx + 1}
                    </span>
                    <span className="absolute bottom-2 right-2 p-1 rounded-full bg-wood-900/80 text-cream opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <h5 className="font-serif text-xs font-bold text-wood-900 line-clamp-2 leading-snug">
                      {item.title.replace(/^Bước \d+:\s*/, '')}
                    </h5>
                    <p className="text-[11px] text-wood-600 line-clamp-3 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded Google Drive Folder Viewer */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-wood-700">
              <span className="font-semibold text-wood-900">
                Thư mục hồ sơ trực tuyến Google Drive (Nhóm 10D3):
              </span>
              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-700 hover:text-forest-900 font-semibold inline-flex items-center gap-1"
              >
                <span>Xem trên drive.google.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full rounded-2xl overflow-hidden border border-sandstone bg-white shadow-inner">
              <iframe
                src="https://drive.google.com/embeddedfolderview?id=11aXHvCXqjigN4dQKtTotSoEUHshxYlXJ#list"
                className="w-full h-80 sm:h-96 border-0 bg-white"
                title="Google Drive – Phiếu kiểm thử và cải tiến mô hình nhà dài Ê-đê"
                loading="lazy"
              />
            </div>
            <p className="text-[11px] text-wood-500 italic">
              * Ghi chú: Nếu trình duyệt chặn cookie bên thứ ba hoặc chưa đăng nhập Google, Thầy/Cô và Giám khảo có thể nhấp nút &ldquo;Mở thư mục Google Drive&rdquo; ở góc trên để xem toàn bộ tài liệu và ảnh scan độ phân giải cao.
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
