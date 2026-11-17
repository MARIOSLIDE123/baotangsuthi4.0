import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  HelpCircle,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import {
  DetailedAnswerRecord,
  StudentFullLearningProfile,
  isTeacherAuthenticated,
  loadAllStudentsProfiles,
  setTeacherAuthenticated,
  verifyTeacherCredentials,
} from '../../services/studentLearningRecordsService';
import {
  DEFAULT_GOOGLE_SHEETS_SCRIPT_URL,
  syncToGoogleSheets,
} from '../../services/googleSheetsService';

export const LearningResultsView: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isTeacherAuthenticated());
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<StudentFullLearningProfile[]>(() =>
    loadAllStudentsProfiles()
  );
  const [selectedStudent, setSelectedStudent] = useState<StudentFullLearningProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyTeacherCredentials(usernameInput, passwordInput)) {
      setTeacherAuthenticated(true);
      setAuthenticated(true);
      setLoginError(null);
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  const handleLogout = () => {
    setTeacherAuthenticated(false);
    setAuthenticated(false);
    setSelectedStudent(null);
  };

  const availableClasses = useMemo(() => {
    const set = new Set(profiles.map((p) => p.className).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchClass = classFilter === 'ALL' || p.className === classFilter;
      const matchSearch =
        !searchQuery.trim() ||
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.school.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [profiles, classFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalStudents = profiles.length;
    const avgScore =
      totalStudents > 0
        ? Math.round(profiles.reduce((acc, cur) => acc + cur.totalScore, 0) / totalStudents)
        : 0;
    const totalAns = profiles.reduce((acc, cur) => acc + cur.totalQuestionsAnswered, 0);
    const totalCorrect = profiles.reduce((acc, cur) => acc + cur.totalQuestionsCorrect, 0);
    const accuracyRate = totalAns > 0 ? Math.round((totalCorrect / totalAns) * 100) : 100;
    return { totalStudents, avgScore, totalAns, totalCorrect, accuracyRate };
  }, [profiles]);

  const handleSyncAllToGoogleSheets = async () => {
    setSyncLoading(true);
    setSyncNotice(null);

    let successCount = 0;
    for (const student of profiles) {
      const res = await syncToGoogleSheets({
        action: 'update_progress',
        studentName: student.studentName,
        className: student.className,
        school: student.school,
        visitedZonesCount: student.visitedZones.length,
        visitedZonesList: student.visitedZones.join(', '),
        museum3DScore: student.museum3DScore,
        arenaBestScore: student.arenaBestScore,
        totalScore: student.totalScore,
        stemActions: student.stemCompletedTasks.join('; '),
        latestActivity: `Đồng bộ toàn bộ: ${student.detailedAnswers.length} câu hỏi`,
        notes: `Đúng: ${student.totalQuestionsCorrect}/${student.totalQuestionsAnswered}`,
      });
      if (res.ok) successCount++;
    }

    setSyncLoading(false);
    setSyncNotice(`Đã đồng bộ thành công ${successCount}/${profiles.length} học sinh lên Google Sheet!`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  // 1. MÀN HÌNH BẢO MẬT: XÁC THỰC GIÁO VIÊN
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-cream border border-sandstone shadow-xl text-wood-900 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-forest-700/10 border border-forest-700/20 flex items-center justify-center text-forest-800">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
            Khu vực bảo mật dành cho Giáo viên
          </span>
          <h2 className="font-serif text-2xl font-bold text-wood-900 pt-1">
            KẾT QUẢ HỌC TẬP
          </h2>
          <p className="text-xs text-wood-600 leading-relaxed">
            Vui lòng đăng nhập bằng tài khoản quản trị của giáo viên để xem toàn bộ điểm số, thời gian học và chi tiết đáp án đã chọn của học sinh.
          </p>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-wood-800 mb-1.5">
              Tài khoản giáo viên
            </label>
            <input
              type="text"
              autoComplete="off"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Nhập tài khoản giáo viên..."
              className="w-full px-3.5 py-2.5 text-sm bg-parchment/60 border border-sandstone rounded-xl focus:border-gold-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-wood-800 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              autoComplete="off"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-3.5 py-2.5 text-sm bg-parchment/60 border border-sandstone rounded-xl focus:border-gold-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-cream font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ĐĂNG NHẬP XEM KẾT QUẢ</span>
          </button>
        </form>

        <p className="text-[11px] text-center text-wood-500 italic">
          Hệ thống bảo vệ dữ liệu điểm thi và các câu trả lời của học sinh.
        </p>
      </div>
    );
  }

  // 2. MÀN HÌNH QUẢN TRỊ: KẾT QUẢ HỌC TẬP CỦA HỌC SINH
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-sandstone pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-bold uppercase tracking-wider mb-2 border border-forest-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-forest-700" />
              <span>Dành cho Giáo viên: Cô Loan Hồ</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
              KẾT QUẢ HỌC TẬP &amp; ĐÁNH GIÁ CHI TIẾT
            </h2>
            <p className="text-xs sm:text-sm text-wood-700 mt-1">
              Theo dõi điểm số, thời gian học, kiểm tra toàn bộ đáp án đã chọn và bài làm tự luận của từng học sinh theo thời gian thực.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSyncAllToGoogleSheets}
              disabled={syncLoading}
              className="px-4 py-2 text-xs font-semibold bg-forest-700 hover:bg-forest-800 text-cream rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Đang đồng bộ...' : 'Đồng bộ Google Sheet'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 text-xs font-semibold bg-parchment hover:bg-wood-200 text-wood-900 border border-sandstone rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-wood-600" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Live sync banner */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">
              Đang kết nối tự động với Google Sheet:
            </span>
            <span className="font-mono text-[11px] text-emerald-800 truncate max-w-md hidden sm:inline">
              {DEFAULT_GOOGLE_SHEETS_SCRIPT_URL}
            </span>
          </div>
          <span className="font-semibold text-emerald-700 shrink-0">Thời gian thực</span>
        </div>

        {syncNotice && (
          <div className="p-3 rounded-xl bg-forest-50 border border-forest-300 text-forest-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-1">
            <p className="text-xs text-wood-600">Tổng số học sinh</p>
            <p className="text-2xl font-serif font-bold text-wood-900">{stats.totalStudents}</p>
          </div>
          <div className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-1">
            <p className="text-xs text-wood-600">Điểm trung bình</p>
            <p className="text-2xl font-serif font-bold text-forest-800">{stats.avgScore}đ</p>
          </div>
          <div className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-1">
            <p className="text-xs text-wood-600">Số câu hỏi đã làm</p>
            <p className="text-2xl font-serif font-bold text-wood-900">{stats.totalAns}</p>
          </div>
          <div className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-1">
            <p className="text-xs text-wood-600">Tỉ lệ trả lời đúng</p>
            <p className="text-2xl font-serif font-bold text-gold-700">{stats.accuracyRate}%</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cream border border-sandstone rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-wood-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, lớp, trường..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-parchment/60 border border-sandstone rounded-xl focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-wood-800 shrink-0">Lọc theo Lớp:</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-parchment/60 border border-sandstone rounded-xl focus:border-gold-500 focus:outline-none cursor-pointer"
          >
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'ALL' ? 'Tất cả các lớp' : cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Student List Table */}
      <div className="bg-cream border border-sandstone rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-wood-900 text-cream">
              <tr>
                <th className="py-3 px-4 font-semibold">STT</th>
                <th className="py-3 px-4 font-semibold">Học Sinh</th>
                <th className="py-3 px-4 font-semibold">Lớp &amp; Trường</th>
                <th className="py-3 px-4 font-semibold text-center">Tổng Điểm</th>
                <th className="py-3 px-4 font-semibold text-center">3D Nhà Dài</th>
                <th className="py-3 px-4 font-semibold text-center">Đấu Trường</th>
                <th className="py-3 px-4 font-semibold text-center">Đúng / Đã Làm</th>
                <th className="py-3 px-4 font-semibold">Thời Gian Gần Nhất</th>
                <th className="py-3 px-4 font-semibold text-right">Chi Tiết Bài Làm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sandstone/60">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-wood-500">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-parchment/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-wood-600">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-wood-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-forest-700/10 text-forest-800 flex items-center justify-center font-bold">
                          {student.studentName.charAt(0)}
                        </div>
                        <span>{student.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-wood-700">
                      <span className="font-semibold text-wood-900">{student.className}</span>
                      <p className="text-[11px] text-wood-500 truncate max-w-[160px]">{student.school}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-forest-800 text-sm">
                      {student.totalScore}đ
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-wood-800">
                      {student.museum3DScore}đ
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-wood-800">
                      {student.arenaBestScore}đ
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-forest-800">
                        {student.totalQuestionsCorrect}
                      </span>
                      <span className="text-wood-500">/{student.totalQuestionsAnswered}</span>
                    </td>
                    <td className="py-3.5 px-4 text-wood-600">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-wood-500" />
                        <span>{new Date(student.lastActiveIso).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem bài làm ({student.detailedAnswers.length})</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL: XEM CHI TIẾT ĐÁP ÁN & BÀI LÀM CỦA HỌC SINH */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-wood-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-cream border border-sandstone rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-wood-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-sandstone">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-forest-700/15 text-forest-800 text-xs font-bold">
                    Hồ sơ chi tiết
                  </span>
                  <span className="text-xs font-mono text-wood-600">
                    Mã HS: {selectedStudent.studentId}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-wood-900 mt-1">
                  Bài làm của học sinh: {selectedStudent.studentName}
                </h3>
                <p className="text-xs text-wood-600">
                  Lớp: <strong className="text-wood-900">{selectedStudent.className}</strong> · Trường:{' '}
                  <strong className="text-wood-900">{selectedStudent.school}</strong> · Tổng điểm:{' '}
                  <strong className="text-forest-800 font-mono text-sm">{selectedStudent.totalScore}đ</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-parchment hover:bg-wood-200 text-wood-800 cursor-pointer transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content: Detailed Questions & Answers */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-forest-800">
                <span>Danh sách câu hỏi &amp; các đáp án học sinh đã chọn ({selectedStudent.detailedAnswers.length}):</span>
                <span>Số câu đúng: {selectedStudent.totalQuestionsCorrect}/{selectedStudent.totalQuestionsAnswered}</span>
              </div>

              {selectedStudent.detailedAnswers.length === 0 ? (
                <div className="p-8 text-center text-wood-500 rounded-2xl border border-dashed border-sandstone">
                  Học sinh chưa hoàn thành câu hỏi trắc nghiệm hoặc bài viết nào.
                </div>
              ) : (
                selectedStudent.detailedAnswers.map((ans, i) => (
                  <div
                    key={ans.id || i}
                    className="p-4 sm:p-5 rounded-2xl bg-parchment/60 border border-sandstone space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone/60 pb-2">
                      <span className="px-2 py-0.5 rounded-md bg-wood-900 text-cream text-[11px] font-semibold">
                        {ans.activityTitle}
                      </span>
                      <span className="text-[11px] text-wood-500 font-mono">
                        {new Date(ans.timestampIso).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-wood-700 uppercase tracking-wide">
                        Câu hỏi / Tình huống {i + 1}:
                      </p>
                      <p className="text-sm font-serif font-bold text-wood-950 mt-0.5 leading-relaxed">
                        {ans.questionPrompt}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Student's answer */}
                      <div className="p-3 rounded-xl bg-cream border border-sandstone space-y-1">
                        <p className="text-[11px] font-bold text-wood-700 uppercase flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-forest-700" />
                          <span>Đáp án / Nội dung học sinh đã trả lời:</span>
                        </p>
                        <p className="text-xs text-wood-900 leading-relaxed font-medium">
                          {ans.studentAnswer || '(Học sinh để trống)'}
                        </p>
                        <div className="pt-1 flex items-center gap-1.5 text-xs">
                          {ans.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng ({ans.scoreAwarded}đ)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Chưa chuẩn xác ({ans.scoreAwarded}đ)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Correct answer & explanation */}
                      <div className="p-3 rounded-xl bg-cream border border-sandstone space-y-1">
                        <p className="text-[11px] font-bold text-forest-800 uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                          <span>Đáp án chuẩn / Hướng dẫn giải:</span>
                        </p>
                        <p className="text-xs text-forest-900 leading-relaxed font-medium">
                          {ans.correctAnswer || 'Theo tiêu chí Rubric đánh giá'}
                        </p>
                        {ans.teacherOrAiFeedback && (
                          <p className="text-[11px] text-wood-600 italic pt-1 border-t border-sandstone/40">
                            Nhận xét: {ans.teacherOrAiFeedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-sandstone flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 rounded-xl bg-wood-900 hover:bg-wood-800 text-cream text-xs font-bold cursor-pointer"
              >
                Đóng bài làm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
