import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
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
  pullLearningRecordsFromGoogleSheets,
} from '../../services/studentLearningRecordsService';
import {
  DEFAULT_GOOGLE_SHEETS_SCRIPT_URL,
  SAMPLE_GOOGLE_APPS_SCRIPT_CODE,
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

  // Modal filters for activity & right/wrong
  const [modalActivityFilter, setModalActivityFilter] = useState('ALL');
  const [modalResultFilter, setModalResultFilter] = useState<'ALL' | 'CORRECT' | 'WRONG'>('ALL');

  // Script Code Modal
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

  // 1. ĐẨY DỮ LIỆU TỪ APP LÊN GOOGLE SHEET (CẢ 2 SHEET)
  const handleSyncAllToGoogleSheets = async () => {
    setSyncLoading(true);
    setSyncNotice(null);

    let successCount = 0;
    for (const student of profiles) {
      const answersPayload = (student.detailedAnswers || []).slice(0, 15).map((a) => ({
        questionPrompt: a.questionPrompt,
        studentAnswer: a.studentAnswer,
        correctAnswer: a.correctAnswer,
        isCorrect: a.isCorrect,
        scoreAwarded: a.scoreAwarded,
        activityTitle: a.activityTitle,
        attemptNumber: a.attemptNumber || 1,
      }));

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
        latestActivity: `Đồng bộ: ${student.detailedAnswers.length} câu hỏi`,
        notes: `Đúng: ${student.totalQuestionsCorrect}/${student.totalQuestionsAnswered}`,
        detailedAnswers: answersPayload,
      });
      if (res.ok) successCount++;
    }

    setSyncLoading(false);
    setSyncNotice(`Đã gửi đồng bộ thành công ${successCount}/${profiles.length} học sinh lên Google Sheet!`);
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // 2. ĐỒNG BỘ NGƯỢC TỪ GOOGLE SHEET VỀ APP
  const handlePullFromGoogleSheets = async () => {
    setSyncLoading(true);
    setSyncNotice(null);

    const res = await pullLearningRecordsFromGoogleSheets();
    setSyncLoading(false);

    if (res.ok && res.students.length > 0) {
      setProfiles([...res.students]);
      setSyncNotice(res.message);
    } else {
      setSyncNotice(res.message);
    }
    setTimeout(() => setSyncNotice(null), 5000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Danh sách câu hỏi chi tiết sau khi lọc theo hoạt động & đúng/sai trong Modal
  const displayedAnswers = useMemo(() => {
    if (!selectedStudent) return [];
    return selectedStudent.detailedAnswers.filter((ans) => {
      const matchAct =
        modalActivityFilter === 'ALL' ||
        ans.activityId === modalActivityFilter ||
        ans.activityTitle.toLowerCase().includes(modalActivityFilter.toLowerCase());
      const matchRes =
        modalResultFilter === 'ALL' ||
        (modalResultFilter === 'CORRECT' ? ans.isCorrect : !ans.isCorrect);
      return matchAct && matchRes;
    });
  }, [selectedStudent, modalActivityFilter, modalResultFilter]);

  // Danh sách các hoạt động có trong bài làm của học sinh đang xem
  const studentActivitiesList = useMemo(() => {
    if (!selectedStudent) return [];
    const set = new Set(selectedStudent.detailedAnswers.map((a) => a.activityTitle).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [selectedStudent]);

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
              Theo dõi điểm số, thời gian học, kiểm tra toàn bộ đáp án đã chọn (lưu bài làm mới nhất, mỗi học sinh làm 1 lần và thử lại 1 lần).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Nút đồng bộ ngược từ Google Sheet */}
            <button
              type="button"
              onClick={handlePullFromGoogleSheets}
              disabled={syncLoading}
              className="px-3.5 py-2 text-xs font-semibold bg-gold-500 hover:bg-gold-400 text-wood-950 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Đồng bộ ngược dữ liệu từ Google Sheet về bảng điểm của Giáo viên"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Đang tải...' : 'Tải từ Google Sheet'}</span>
            </button>

            {/* Nút đẩy dữ liệu lên Google Sheet */}
            <button
              type="button"
              onClick={handleSyncAllToGoogleSheets}
              disabled={syncLoading}
              className="px-3.5 py-2 text-xs font-semibold bg-forest-700 hover:bg-forest-800 text-cream rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Đẩy toàn bộ danh sách và bài làm học sinh lên Google Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-gold-300" />
              <span>Đẩy lên Google Sheet</span>
            </button>

            {/* Xem mã Google Apps Script 4.0 */}
            <button
              type="button"
              onClick={() => setShowScriptModal(true)}
              className="px-3 py-2 text-xs font-semibold bg-wood-900 hover:bg-wood-800 text-cream rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-gold-400" />
              <span>Mã Apps Script 4.0</span>
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
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">
              Google Sheet tự động phân loại 2 Sheet:
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-mono text-[11px] font-bold">
              1. DANH_SACH_HOC_SINH
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-mono text-[11px] font-bold">
              2. CHI_TIET_BAI_LAM
            </span>
          </div>
          <span className="font-semibold text-emerald-700 shrink-0">Đồng bộ 2 chiều thời gian thực</span>
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
                {cls === 'ALL' ? 'Tất cả các lớp' : `Lớp ${cls}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-cream border border-sandstone rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-sandstone flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-wood-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-700" />
            <span>Danh sách kết quả học tập ({filteredProfiles.length} học sinh)</span>
          </h3>
          <span className="text-xs text-wood-600 italic">
            Nhấn vào "Xem bài làm chi tiết" để đối soát từng câu hỏi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-parchment text-wood-800 uppercase font-bold tracking-wider border-b border-sandstone">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Trường</th>
                <th className="py-3 px-4 text-center">Tổng điểm</th>
                <th className="py-3 px-4 text-center">Điểm 3D</th>
                <th className="py-3 px-4 text-center">Điểm Đấu trường</th>
                <th className="py-3 px-4 text-center">Số câu làm</th>
                <th className="py-3 px-4 text-center">Tỉ lệ đúng</th>
                <th className="py-3 px-4">Thời gian học / Gần nhất</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sandstone/60">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-wood-500 italic">
                    Không tìm thấy học sinh phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-parchment/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-wood-600">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-wood-950 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-forest-700/10 text-forest-800 flex items-center justify-center font-bold text-xs">
                        {student.studentName.charAt(0).toUpperCase()}
                      </div>
                      <span>{student.studentName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-wood-800">{student.className}</td>
                    <td className="py-3.5 px-4 text-wood-600 max-w-[150px] truncate">{student.school}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-forest-800 text-sm">
                        {student.totalScore}đ
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-gold-800">
                      {student.museum3DScore}đ
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-amber-800">
                      {student.arenaBestScore}đ
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-wood-800">
                      {student.totalQuestionsAnswered} câu
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                          student.totalQuestionsAnswered > 0 &&
                          student.totalQuestionsCorrect / student.totalQuestionsAnswered >= 0.7
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {student.totalQuestionsAnswered > 0
                          ? `${Math.round(
                              (student.totalQuestionsCorrect / student.totalQuestionsAnswered) * 100
                            )}%`
                          : '100%'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-wood-600">
                      {new Date(student.lastActiveIso).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(student);
                          setModalActivityFilter('ALL');
                          setModalResultFilter('ALL');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-wood-900 hover:bg-wood-800 text-cream font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-gold-400" />
                        <span>Xem chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL: XEM BÀI LÀM CHI TIẾT CỦA HỌC SINH (KÈM BỘ LỌC HOẠT ĐỘNG & ĐÁP ÁN ĐÚNG/SAI) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-wood-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-cream border border-sandstone rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-wood-900">
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
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-800 text-xs font-semibold">
                    Lưu bài làm mới nhất
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-wood-900 mt-1">
                  Bài làm của học sinh: {selectedStudent.studentName}
                </h3>
                <p className="text-xs text-wood-600 mt-0.5">
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

            {/* BỘ LỌC TRÒ CHƠI / HOẠT ĐỘNG VÀ KẾT QUẢ ĐÚNG / SAI (Yêu cầu 5) */}
            <div className="py-3 border-b border-sandstone flex flex-wrap items-center justify-between gap-3 bg-parchment/40 px-3 rounded-xl mt-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-forest-800" />
                <span className="text-xs font-bold text-wood-800">Lọc theo hoạt động / trò chơi:</span>
                <select
                  value={modalActivityFilter}
                  onChange={(e) => setModalActivityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-cream border border-sandstone rounded-lg focus:border-gold-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả trò chơi &amp; hoạt động</option>
                  {studentActivitiesList
                    .filter((a) => a !== 'ALL')
                    .map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                </select>
              </div>

              {/* Lọc theo Đúng / Sai */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-wood-800 mr-1">Kết quả:</span>
                <button
                  type="button"
                  onClick={() => setModalResultFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    modalResultFilter === 'ALL'
                      ? 'bg-wood-900 text-cream'
                      : 'bg-cream text-wood-700 border border-sandstone'
                  }`}
                >
                  Tất cả ({selectedStudent.detailedAnswers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModalResultFilter('CORRECT')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    modalResultFilter === 'CORRECT'
                      ? 'bg-emerald-700 text-cream'
                      : 'bg-cream text-emerald-800 border border-emerald-300'
                  }`}
                >
                  Chỉ câu Đúng ({selectedStudent.totalQuestionsCorrect})
                </button>
                <button
                  type="button"
                  onClick={() => setModalResultFilter('WRONG')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    modalResultFilter === 'WRONG'
                      ? 'bg-rose-700 text-cream'
                      : 'bg-cream text-rose-800 border border-rose-300'
                  }`}
                >
                  Chỉ câu Sai ({selectedStudent.detailedAnswers.length - selectedStudent.totalQuestionsCorrect})
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content: Detailed Questions & Answers */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {displayedAnswers.length === 0 ? (
                <div className="p-8 text-center text-wood-500 rounded-2xl border border-dashed border-sandstone">
                  Không có câu hỏi nào phù hợp với bộ lọc đã chọn.
                </div>
              ) : (
                displayedAnswers.map((ans, i) => (
                  <div
                    key={ans.id || i}
                    className="p-4 sm:p-5 rounded-2xl bg-parchment/60 border border-sandstone space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-wood-900 text-cream text-[11px] font-semibold">
                          {ans.activityTitle}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ans.attemptNumber === 2
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {ans.attemptNumber === 2 ? 'Lần 2 (Thử lại)' : 'Lần 1 (Chính thức)'}
                        </span>
                      </div>
                      <span className="text-[11px] text-wood-500 font-mono">
                        {new Date(ans.timestampIso).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-wood-700 uppercase tracking-wide">
                        Câu hỏi / Nhiệm vụ {i + 1}:
                      </p>
                      <p className="text-sm font-serif font-bold text-wood-950 mt-0.5 leading-relaxed">
                        {ans.questionPrompt}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* 1. Đáp án học sinh đã chọn (Đỏ nếu Sai, Xanh nếu Đúng) */}
                      <div
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          ans.isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300'
                            : 'bg-rose-50/80 border-rose-300'
                        }`}
                      >
                        <p className="text-[11px] font-bold uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-wood-800">
                            <User className="w-3.5 h-3.5 text-forest-700" />
                            <span>Đáp án học sinh đã chọn:</span>
                          </span>
                          {ans.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>ĐÚNG (+{ans.scoreAwarded}đ)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-100 px-2 py-0.5 rounded">
                              <XCircle className="w-3.5 h-3.5 text-rose-700" />
                              <span>SAI (0đ)</span>
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-xs leading-relaxed font-semibold ${
                            ans.isCorrect ? 'text-emerald-950' : 'text-rose-950'
                          }`}
                        >
                          {ans.studentAnswer || '(Học sinh để trống)'}
                        </p>
                      </div>

                      {/* 2. Đáp án chuẩn & Nhận xét của hệ thống */}
                      <div className="p-3.5 rounded-xl bg-cream border border-forest-300 space-y-1.5">
                        <p className="text-[11px] font-bold text-forest-800 uppercase flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                          <span>Đáp án chuẩn của tác phẩm:</span>
                        </p>
                        <p className="text-xs text-forest-950 leading-relaxed font-semibold">
                          {ans.correctAnswer || 'Theo chuẩn nội dung bài học'}
                        </p>
                        {ans.teacherOrAiFeedback && (
                          <p className="text-[11px] text-wood-600 italic pt-1 border-t border-sandstone/40">
                            Giải thích / Nhận xét: {ans.teacherOrAiFeedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-sandstone flex justify-between items-center">
              <span className="text-xs text-wood-600">
                Hiển thị <strong>{displayedAnswers.length}</strong> câu hỏi
              </span>
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

      {/* 4. MODAL MÃ NGUỒN GOOGLE APPS SCRIPT 4.0 (2 SHEET RIÊNG & 2-WAY SYNC) */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-wood-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-cream border border-sandstone rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-wood-900 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-sandstone">
              <div>
                <h3 className="font-serif text-xl font-bold text-wood-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-gold-600" />
                  <span>Mã nguồn Google Apps Script 4.0 mới nhất</span>
                </h3>
                <p className="text-xs text-wood-600 mt-1">
                  Hỗ trợ 2 sheet riêng: <strong>DANH_SACH_HOC_SINH</strong> và <strong>CHI_TIET_BAI_LAM</strong>, đồng bộ 2 chiều về App.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="p-2 rounded-xl bg-parchment hover:bg-wood-200 text-wood-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-gold-50 border border-gold-300 text-xs text-wood-900 space-y-1">
              <p className="font-bold text-gold-950">Hướng dẫn cập nhật trong 10 giây:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-wood-800">
                <li>Bấm nút <strong>"Sao chép mã Apps Script"</strong> bên dưới.</li>
                <li>Mở Google Sheet của cô &rarr; vào <strong>Tiện ích mở rộng &rarr; Apps Script</strong> &rarr; dán đè toàn bộ mã.</li>
                <li>Bấm <strong>Triển khai (Deploy) &rarr; Quản lý bản triển khai (Manage deployments) &rarr; Chỉnh sửa &rarr; Tạo phiên bản mới &rarr; Triển khai</strong>.</li>
              </ol>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-wood-700">Mã Code.gs:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-wood-900 hover:bg-wood-800 text-cream text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Đã sao chép mã!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã Apps Script</span>
                  </>
                )}
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto p-4 rounded-xl bg-wood-950 text-sandstone-light text-xs font-mono border border-sandstone max-h-[360px] leading-relaxed">
              {SAMPLE_GOOGLE_APPS_SCRIPT_CODE}
            </pre>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="px-5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-cream text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
