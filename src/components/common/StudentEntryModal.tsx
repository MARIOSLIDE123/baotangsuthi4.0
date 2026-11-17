import React, { useState } from 'react';
import {
  Sparkles,
  User,
  GraduationCap,
  Building,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  StudentProfileData,
  getGoogleSheetsScriptUrl,
  setStudentProfileRegistered,
  syncToGoogleSheets,
} from '../../services/googleSheetsService';

interface StudentEntryModalProps {
  isOpen: boolean;
  initialName?: string;
  initialClass?: string;
  initialSchool?: string;
  onSaveProfile: (profile: StudentProfileData) => void;
  onClose?: () => void;
  isEditMode?: boolean;
}

export const StudentEntryModal: React.FC<StudentEntryModalProps> = ({
  isOpen,
  initialName = '',
  initialClass = '',
  initialSchool = '',
  onSaveProfile,
  onClose,
  isEditMode = false,
}) => {
  const [studentName, setStudentName] = useState(initialName || '');
  const [className, setClassName] = useState(initialClass || '');
  const [school, setSchool] = useState(initialSchool || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = studentName.trim();
    const cleanClass = className.trim();
    const cleanSchool = school.trim();

    if (!cleanName) {
      setErrorMsg('Vui lòng nhập Họ và tên của bạn.');
      return;
    }
    if (!cleanClass) {
      setErrorMsg('Vui lòng nhập Lớp học (ví dụ: 10A1, 10 Văn...).');
      return;
    }
    if (!cleanSchool) {
      setErrorMsg('Vui lòng nhập Tên trường THPT của bạn.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const profileData: StudentProfileData = {
      studentName: cleanName,
      className: cleanClass,
      school: cleanSchool,
      registeredAtIso: new Date().toISOString(),
    };

    // Đánh dấu học sinh đã hoàn tất ghi danh
    setStudentProfileRegistered(true);

    // Gửi đồng bộ lên Google Sheets theo thời gian thực
    try {
      const res = await syncToGoogleSheets({
        action: 'register_student',
        studentName: cleanName,
        className: cleanClass,
        school: cleanSchool,
        latestActivity: isEditMode ? 'Cập nhật hồ sơ học sinh' : 'Ghi danh bắt đầu tham quan Bảo tàng 4.0',
        visitedZonesCount: 1,
        totalScore: 0,
      });

      if (res.mode === 'cloud-synced') {
        setSyncStatus('Đã kết nối và lưu vào Google Sheet của lớp học!');
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ ban đầu:', err);
    }

    setIsSubmitting(false);
    onSaveProfile(profileData);
  };

  const hasScriptUrl = Boolean(getGoogleSheetsScriptUrl());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-wood-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-wood-900 via-wood-900 to-wood-950 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-cream overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-terracotta-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold tracking-wider uppercase border border-gold-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sử Thi Số 4.0 · Hồ Sơ Học Sinh</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream tracking-wide">
            {isEditMode ? 'CẬP NHẬT HỒ SƠ HỌC SINH' : 'GHI DANH THAM QUAN BẢO TÀNG'}
          </h2>

          <p className="text-sandstone-light text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            {isEditMode
              ? 'Thay đổi thông tin học sinh để tiếp tục lưu trữ kết quả và đồng bộ lên Google Sheet.'
              : 'Vui lòng hoàn tất thông tin để nhận Hộ chiếu sử thi cá nhân và bắt đầu trải nghiệm không gian học tập di sản.'}
          </p>
        </div>

        {/* Real-time Google Sheet Sync Badge */}
        <div className="mb-5 p-3 rounded-xl bg-wood-950/70 border border-wood-700/60 flex items-center gap-2.5 text-xs text-sandstone-light">
          <Zap className="w-4 h-4 text-gold-400 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-cream">Đồng bộ Google Sheets thời gian thực: </span>
            {hasScriptUrl ? (
              <span className="text-emerald-400 font-medium">Đang sẵn sàng kết nối tự động</span>
            ) : (
              <span className="text-sandstone">Sẽ tự động cập nhật khi Giáo viên gắn link Sheet</span>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {syncStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          <div>
            <label htmlFor="studentNameInput" className="block text-xs font-medium text-sandstone-light mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold-400" />
              <span>Họ và tên học sinh <strong className="text-terracotta-400">*</strong></span>
            </label>
            <input
              id="studentNameInput"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-4 py-3 rounded-xl bg-wood-950/90 border border-wood-700 text-cream text-sm placeholder:text-sandstone/50 focus:outline-none focus:border-gold-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="classNameInput" className="block text-xs font-medium text-sandstone-light mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-gold-400" />
                <span>Lớp học <strong className="text-terracotta-400">*</strong></span>
              </label>
              <input
                id="classNameInput"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ví dụ: 10A1"
                className="w-full px-4 py-3 rounded-xl bg-wood-950/90 border border-wood-700 text-cream text-sm placeholder:text-sandstone/50 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="schoolInput" className="block text-xs font-medium text-sandstone-light mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-gold-400" />
                <span>Trường THPT <strong className="text-terracotta-400">*</strong></span>
              </label>
              <input
                id="schoolInput"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ví dụ: THPT Buôn Ma Thuột"
                className="w-full px-4 py-3 rounded-xl bg-wood-950/90 border border-wood-700 text-cream text-sm placeholder:text-sandstone/50 focus:outline-none focus:border-gold-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            {isEditMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-wood-800 hover:bg-wood-700 text-sandstone-light text-sm font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-wood-950 font-bold text-sm sm:text-base shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isEditMode ? 'LƯU & CẬP NHẬT' : 'BẮT ĐẦU TRẢI NGHIỆM BẢO TÀNG'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
