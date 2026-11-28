import React, { useState } from 'react';
import {
  Presentation,
  FolderOpen,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Users,
  BookOpen,
  Compass,
  Award,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const LESSON_52_SLIDES_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1lPWIewTODXUn_ic_Wd5UUh0XI79_8btF';

export const LESSON_52_SLIDES_EMBED_URL =
  'https://drive.google.com/embeddedfolderview?id=1lPWIewTODXUn_ic_Wd5UUh0XI79_8btF#grid';

export interface GroupSlideItem {
  groupCode: string;
  groupName: string;
  topicTitle: string;
  mainFocus: string;
  pedagogicalDetails: string[];
  deliverables: string;
  themeColor: string;
}

export const LESSON_52_GROUPS: GroupSlideItem[] = [
  {
    groupCode: 'TỔ 1',
    groupName: 'Tổ 1 – Khởi hành & Thử thách Rừng Sáp Đen',
    topicTitle: 'Hành trình khởi hành & Bản lĩnh vượt qua thiên nhiên hiểm trở',
    mainFocus:
      'Phân tích cảnh Đăm Săn bất chấp hiểm nguy, ngựa phi như gió vượt qua Rừng Sáp Đen; nghệ thuật miêu tả không gian kỳ vĩ và sự kiên định của người anh hùng cộng đồng.',
    pedagogicalDetails: [
      'Khắc họa chân dung người tù trưởng với khát vọng chinh phục những đỉnh cao mới.',
      'Phân tích nghệ thuật so sánh, phóng đại đặc trưng của sử thi Ê-đê.',
      'Bản đồ mô phỏng chặng đường từ buôn làng đến ranh giới Rừng Sáp Đen.',
    ],
    deliverables: 'Slide trình chiếu PowerPoint / Canva + Bản đồ tư duy trực quan',
    themeColor: 'from-amber-600/20 to-amber-700/10 border-amber-500/40 text-amber-900',
  },
  {
    groupCode: 'TỔ 2',
    groupName: 'Tổ 2 – Đối thoại Đăm Par Kvây & Cung điện Mặt Trời',
    topicTitle: 'Tình bạn khuyên can & Kiến trúc tráng lệ Cung điện Nữ thần',
    mainFocus:
      'Làm rõ xung đột kịch tính giữa lời khuyên can của người bạn thân Đăm Par Kvây và ý chí sắt đá của Đăm Săn; tái hiện vẻ đẹp rực rỡ, lộng lẫy của Cung điện Nữ thần Mặt Trời.',
    pedagogicalDetails: [
      'Phân tích chiều sâu tâm lý và tình bằng hữu qua cuộc đối thoại sử thi.',
      'Giải mã biểu trưng kiến trúc cung điện phản ánh sự giàu có và mắt thẩm mỹ Tây Nguyên.',
      'Thiết kế đồ họa trực quan về cấu trúc các tầng không gian cung điện.',
    ],
    deliverables: 'Slide báo cáo thuyết trình + Trích đoạn đối thoại minh họa',
    themeColor: 'from-forest-600/20 to-forest-700/10 border-forest-500/40 text-forest-900',
  },
  {
    groupCode: 'TỔ 3',
    groupName: 'Tổ 3 – Đối thoại cầu hôn & Khát vọng bi tráng',
    topicTitle: 'Cuộc đối thoại cầu hôn & Vẻ đẹp bi tráng của Đăm Săn',
    mainFocus:
      'Phân tích cuộc kỳ ngộ giữa Đăm Săn và Nữ thần Mặt Trời; lời cầu hôn thể hiện khát vọng chinh phục vũ trụ; lời chối từ đầy minh triết và cái kết bi tráng khi ngựa ngã ở Rừng Sáp Đen.',
    pedagogicalDetails: [
      'Phân tích sự va chạm giữa hai thế giới: con người trần thế và nữ thần tự nhiên.',
      'Nghệ thuật xây dựng ngôn ngữ đối thoại kịch tính, dồn dập, giàu nhạc tính.',
      'Ý thức về giới hạn nhân sinh và tinh thần không lùi bước của người anh hùng sử thi.',
    ],
    deliverables: 'Slide thuyết trình chuyên sâu + Video diễn đọc truyền cảm trích đoạn',
    themeColor: 'from-rose-600/20 to-rose-700/10 border-rose-500/40 text-rose-900',
  },
  {
    groupCode: 'TỔ 4',
    groupName: 'Tổ 4 – Tổng kết nghệ thuật & Thông điệp nhân sinh',
    topicTitle: 'Tổng kết giá trị nghệ thuật sử thi & Liên hệ thực tiễn hôm nay',
    mainFocus:
      'Khái quát các biện pháp nghệ thuật cốt lõi (so sánh kép, phóng đại trùng điệp, nhịp điệu kể Khan); rút ra thông điệp triết lý và bài học hành động cho học sinh thời đại số.',
    pedagogicalDetails: [
      'Bảng tổng hợp đối chiếu biện pháp tu từ tiêu biểu trong đoạn trích.',
      'Bài học về khát vọng vươn lên, dám nghĩ dám làm nhưng luôn thấu hiểu giới hạn khách quan.',
      'Liên hệ thực tiễn: Tinh thần vượt khó của thế hệ học sinh 2026 trong kỉ nguyên số.',
    ],
    deliverables: 'Slide báo cáo tổng kết + Bộ câu hỏi tương tác củng cố bài học',
    themeColor: 'from-sky-600/20 to-sky-700/10 border-sky-500/40 text-sky-900',
  },
];

interface Lesson52PresentationSlidesSectionProps {
  className?: string;
  showFolderEmbed?: boolean;
}

export const Lesson52PresentationSlidesSection: React.FC<
  Lesson52PresentationSlidesSectionProps
> = ({ className = '', showFolderEmbed = true }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);

  const handleCopyFolderLink = () => {
    navigator.clipboard.writeText(LESSON_52_SLIDES_DRIVE_FOLDER_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const selectedGroup = LESSON_52_GROUPS[selectedGroupIndex];

  return (
    <section
      className={`rounded-3xl border-2 border-forest-600/30 bg-gradient-to-br from-cream via-parchment/80 to-cream overflow-hidden shadow-lg p-6 sm:p-8 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-sandstone pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-forest-700 text-cream shadow-md shrink-0 mt-0.5">
            <Presentation className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-100 text-gold-900 border border-gold-300">
                Tiết học 52 · Ngữ văn 10
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 text-forest-800 border border-forest-300">
                Đăm Săn đi bắt Nữ thần Mặt Trời
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sản phẩm 4 Tổ hoàn thiện</span>
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-wood-950 leading-tight">
              SẢN PHẨM TRÌNH CHIẾU CỦA 4 TỔ CHUẨN BỊ CHO TIẾT HỌC 52
            </h3>
            <p className="text-xs sm:text-sm text-wood-700 leading-relaxed">
              Dự án học tập liên môn tích hợp số hóa: Báo cáo thuyết trình, Infographic &amp; Slide bài học của học sinh 4 Tổ – Lớp 10D3 &amp; 10D7 trường THPT Trần Nguyên Hãn (GV hướng dẫn: <strong>Cô Hồ Thị Thanh Loan</strong>).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={LESSON_52_SLIDES_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-cream font-bold text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
          >
            <FolderOpen className="w-4 h-4 text-gold-300" />
            <span>Mở thư mục Google Drive (4 Tổ)</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={handleCopyFolderLink}
            className="px-4 py-3 rounded-xl bg-cream hover:bg-parchment text-wood-900 border border-sandstone text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-wood-600" />
                <span>Chép link thư mục</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Tổ Summary Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-forest-700" />
            <span>Phân công nhiệm vụ học tập &amp; Sản phẩm của 4 Tổ:</span>
          </p>
          <span className="text-xs text-wood-600 font-medium hidden sm:inline">
            Nhấp vào từng Tổ để xem chi tiết nội dung chuẩn bị
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {LESSON_52_GROUPS.map((grp, idx) => {
            const isSelected = idx === selectedGroupIndex;
            return (
              <div
                key={grp.groupCode}
                onClick={() => setSelectedGroupIndex(idx)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-wood-900 text-cream border-gold-500 shadow-md scale-[1.02]'
                    : 'bg-cream text-wood-900 border-sandstone hover:border-gold-500 hover:bg-parchment/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-wood-800 text-gold-300'
                          : 'bg-forest-100 text-forest-800'
                      }`}
                    >
                      {grp.groupCode}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] text-gold-400 font-semibold">
                        ● Đang xem
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif text-sm font-bold leading-snug">
                    {grp.topicTitle}
                  </h4>
                </div>

                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-cream/80' : 'text-wood-600'
                  }`}
                >
                  {grp.mainFocus}
                </p>

                <div
                  className={`pt-2 border-t text-[11px] font-medium flex items-center justify-between ${
                    isSelected
                      ? 'border-wood-800 text-gold-300'
                      : 'border-sandstone text-forest-700'
                  }`}
                >
                  <span>Chi tiết bài chuẩn bị</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Group Detailed Drawer / Highlight Box */}
      {selectedGroup && (
        <div className="p-5 sm:p-6 rounded-2xl bg-cream border border-sandstone space-y-4 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sandstone/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-forest-700 text-cream text-xs font-bold">
                {selectedGroup.groupCode}
              </span>
              <div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-wood-950">
                  {selectedGroup.groupName}
                </h4>
                <p className="text-xs text-wood-600">
                  Chủ đề trọng tâm: <strong>{selectedGroup.topicTitle}</strong>
                </p>
              </div>
            </div>

            <a
              href={LESSON_52_SLIDES_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1.5 self-start sm:self-center"
            >
              <span>Xem tệp slide gốc của {selectedGroup.groupCode}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-forest-900">
              Nội dung chuẩn bị &amp; Khai thác bài học:
            </p>
            <p className="text-xs sm:text-sm text-wood-800 leading-relaxed bg-parchment/60 p-3 rounded-xl border border-sandstone">
              {selectedGroup.mainFocus}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {selectedGroup.pedagogicalDetails.map((detail, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-parchment/80 border border-sandstone text-xs text-wood-800 flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-forest-700 text-cream text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{detail}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-wood-700 bg-forest-50/70 p-3 rounded-xl border border-forest-200">
            <span className="flex items-center gap-1.5 font-semibold text-forest-900">
              <Layers className="w-4 h-4 text-forest-700" />
              <span>Hình thức nộp: {selectedGroup.deliverables}</span>
            </span>
            <span className="text-[11px] text-wood-600 font-mono">
              Đồng bộ trực tiếp trên Google Drive
            </span>
          </div>
        </div>
      )}

      {/* Embedded Google Drive Folder Viewer */}
      {showFolderEmbed && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-wood-700">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-forest-700" />
              <span className="font-bold text-wood-900 text-sm">
                Thư mục trình chiếu 4 Tổ trực tuyến trên Google Drive:
              </span>
            </div>
            <a
              href={LESSON_52_SLIDES_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-900 font-bold inline-flex items-center gap-1"
            >
              <span>Mở toàn bộ tệp trong tab mới</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border border-sandstone bg-white shadow-inner">
            <iframe
              src={LESSON_52_SLIDES_EMBED_URL}
              className="w-full h-80 sm:h-96 lg:h-[420px] border-0 bg-white"
              title="Google Drive – Sản phẩm trình chiếu 4 tổ Tiết 52 Đăm Săn đi bắt Nữ thần Mặt Trời"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-[11px] text-wood-600 italic">
            <p>
              * Lưu ý: Thầy/Cô và Giám khảo có thể nhấp đúp vào từng tệp trong khung trên để xem trực tiếp slide hoặc nhấp nút &ldquo;Mở thư mục Google Drive (4 Tổ)&rdquo; để tải về.
            </p>
            <span className="not-italic font-semibold text-forest-800 shrink-0">
              Cập nhật cho bài học Tiết 52
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
