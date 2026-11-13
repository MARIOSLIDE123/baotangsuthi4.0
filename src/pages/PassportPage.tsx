import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  LogIn,
  LogOut,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Stamp,
  UserCheck,
} from 'lucide-react';
import { CORE_SEVEN_WINGS } from '../data/navigation';
import {
  AssignmentRecord,
  AssignmentSubmissionRecord,
  AvatarPresetId,
  CoreWingId,
  ExplorerPassportState,
  ModuleProgressStatus,
  MuseumRouteId,
  ServiceConnectionStatus,
} from '../types/museum';
import {
  AVATAR_PRESETS,
  CORE_WING_IDS,
  fetchClassAssignmentsAndSubmissions,
  resolveAvatarImage,
  signInWithGoogleFirebase,
  signOutFirebase,
  submitAssignmentCloud,
  updateStudentProfileCloud,
} from '../services/firebaseService';
import { auth } from '../services/firebaseClient';
import { DemoModeBanner } from '../components/common/StateFeedback';
import { SafeImage } from '../components/common/SafeImage';

interface PassportPageProps {
  passport: ExplorerPassportState;
  serviceStatus: ServiceConnectionStatus;
  onUpdateDemoProfile: (profile: {
    studentName: string;
    school: string;
    className: string;
    joinCode: string;
    avatarPreset: AvatarPresetId;
  }) => void;
  onSyncPassport: (next: ExplorerPassportState) => void;
  onResetDemo: () => void;
  onNavigate: (route: MuseumRouteId) => void;
}

const STATUS_BADGE: Record<
  ModuleProgressStatus,
  { label: string; className: string }
> = {
  not_started: {
    label: 'Chưa khám phá',
    className: 'bg-parchment text-wood-600 border-sandstone',
  },
  in_progress: {
    label: 'Đang khám phá',
    className: 'bg-gold-500/15 text-wood-900 border-gold-500/50',
  },
  completed: {
    label: 'Đã hoàn thành',
    className: 'bg-forest-700/15 text-forest-800 border-forest-700/40',
  },
};

const ROLE_LABELS = {
  student: 'Học sinh',
  teacher: 'Giáo viên',
  admin: 'Quản trị viên',
};

export const PassportPage: React.FC<PassportPageProps> = ({
  passport,
  serviceStatus,
  onUpdateDemoProfile,
  onSyncPassport,
  onResetDemo,
  onNavigate,
}) => {
  const [nameInput, setNameInput] = useState(passport.studentName);
  const [schoolInput, setSchoolInput] = useState(passport.school);
  const [classInput, setClassInput] = useState(passport.className);
  const [joinCodeInput, setJoinCodeInput] = useState(passport.joinCode || '');
  const [avatarPreset, setAvatarPreset] = useState<AvatarPresetId>(passport.avatarPreset);

  const [authBusy, setAuthBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmissionRecord>>({});
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>({});
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);

  // Sync form inputs whenever cloud profile updates
  useEffect(() => {
    setNameInput(passport.studentName);
    setSchoolInput(passport.school);
    setClassInput(passport.className);
    setJoinCodeInput(passport.joinCode || '');
    setAvatarPreset(passport.avatarPreset);
  }, [
    passport.studentName,
    passport.school,
    passport.className,
    passport.joinCode,
    passport.avatarPreset,
  ]);

  // Load class assignments when joined to a class
  useEffect(() => {
    let active = true;
    const loadAssignments = async () => {
      if (!passport.uid || !passport.classId || !serviceStatus.firebase.configured) {
        setAssignments([]);
        setSubmissions({});
        return;
      }
      try {
        const res = await fetchClassAssignmentsAndSubmissions(passport.classId, passport.uid);
        if (!active) return;
        setAssignments(res.assignments);
        setSubmissions(res.mySubmissions);
        const drafts: Record<string, string> = {};
        for (const [aid, sub] of Object.entries(res.mySubmissions)) {
          drafts[aid] = sub.responseSummary;
        }
        setDraftResponses(drafts);
      } catch {
        // Ignore silent read fallback
      }
    };
    loadAssignments();
    return () => {
      active = false;
    };
  }, [passport.uid, passport.classId, serviceStatus.firebase.configured]);

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await signInWithGoogleFirebase();
      setStatusMessage('Đăng nhập tài khoản thành công! Đang đồng bộ Hộ chiếu.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('popup-closed-by-user')) {
        setErrorMessage('Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.');
      } else if (msg.includes('popup-blocked')) {
        setErrorMessage('Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép pop-up và thử lại.');
      } else {
        setErrorMessage('Không thể đăng nhập lúc này. Hãy thử lại sau vài giây.');
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    setErrorMessage(null);
    try {
      await signOutFirebase();
      setStatusMessage('Đã đăng xuất khỏi tài khoản đám mây.');
    } catch {
      setErrorMessage('Lỗi khi đăng xuất. Vui lòng thử lại.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanName = nameInput.trim() || 'Học sinh lớp 10';
    const cleanSchool = schoolInput.trim();
    const cleanClass = classInput.trim() || 'Lớp 10';
    const cleanCode = joinCodeInput.trim().toUpperCase();

    if (passport.uid && auth.currentUser?.uid === passport.uid && serviceStatus.firebase.configured) {
      setSaveBusy(true);
      try {
        const { profile, joinedClass } = await updateStudentProfileCloud(passport.uid, {
          displayName: cleanName,
          school: cleanSchool,
          className: cleanClass,
          joinCode: cleanCode,
          avatarPreset,
          avatarUrl: passport.avatarUrl || auth.currentUser?.photoURL || '',
        });
        onSyncPassport({
          ...passport,
          studentName: profile.displayName,
          school: profile.school,
          className: profile.className,
          classId: profile.classId,
          joinCode: profile.joinCode,
          teacherUid: profile.teacherUid,
          avatarPreset: profile.avatarPreset,
          avatarUrl: profile.avatarUrl,
        });
        setStatusMessage(
          joinedClass
            ? `Đã lưu hồ sơ & tham gia lớp "${joinedClass.name}" (${joinedClass.teacherName}).`
            : 'Đã cập nhật hồ sơ học sinh lên Cloud Firestore.'
        );
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Không thể lưu hồ sơ lên đám mây. Kiểm tra lại mã lớp hoặc kết nối.'
        );
      } finally {
        setSaveBusy(false);
      }
    } else {
      onUpdateDemoProfile({
        studentName: cleanName,
        school: cleanSchool,
        className: cleanClass,
        joinCode: cleanCode,
        avatarPreset,
      });
      setStatusMessage('Đã lưu hồ sơ học sinh (Chế độ trình duyệt cục bộ).');
    }
  };

  const handleSubmitAssignment = async (assignment: AssignmentRecord) => {
    if (!passport.uid) return;
    const responseText = (draftResponses[assignment.assignmentId] || '').trim();
    if (responseText.length < 10) {
      setErrorMessage('Vui lòng nhập nội dung bài làm ít nhất 10 ký tự trước khi nộp.');
      return;
    }
    setSubmittingAssignmentId(assignment.assignmentId);
    setErrorMessage(null);
    try {
      const sub = await submitAssignmentCloud({
        assignment,
        studentUid: passport.uid,
        studentName: passport.studentName,
        responseSummary: responseText,
      });
      setSubmissions((prev) => ({ ...prev, [assignment.assignmentId]: sub }));
      setStatusMessage(`Đã nộp bài "${assignment.title}" thành công!`);
    } catch {
      setErrorMessage('Không thể nộp bài lúc này. Vui lòng thử lại.');
    } finally {
      setSubmittingAssignmentId(null);
    }
  };

  // Passport Metrics
  const exploredWingsCount = useMemo(
    () =>
      CORE_WING_IDS.filter((id) => {
        const st = passport.moduleProgress?.[id]?.status;
        return st === 'in_progress' || st === 'completed';
      }).length,
    [passport.moduleProgress]
  );

  const completedWingsCount = useMemo(
    () =>
      CORE_WING_IDS.filter(
        (id) => passport.moduleProgress?.[id]?.status === 'completed'
      ).length,
    [passport.moduleProgress]
  );

  const completedTasksCount = useMemo(() => {
    const actionCount = CORE_WING_IDS.reduce(
      (sum, id) => sum + (passport.moduleProgress?.[id]?.actionsCompleted?.length || 0),
      0
    );
    return (
      actionCount +
      passport.completedMilestones.length +
      passport.completed3DHotspots.length +
      passport.completedAssignmentsCount
    );
  }, [
    passport.moduleProgress,
    passport.completedMilestones.length,
    passport.completed3DHotspots.length,
    passport.completedAssignmentsCount,
  ]);

  const activityHistory = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      scoreText: string;
      iso: string;
    }> = [];

    for (const att of passport.quizAttempts || []) {
      items.push({
        id: `att-${att.attemptId}`,
        title: att.activityTitle,
        subtitle: att.workTitle
          ? `Tác phẩm: ${att.workTitle} · Đúng ${att.correctCount}/${att.correctCount + att.wrongCount}`
          : `Đúng ${att.correctCount} câu`,
        scoreText: `${att.score}/${att.maxScore}đ`,
        iso: att.createdAtIso,
      });
    }

    for (const modId of CORE_WING_IDS) {
      const mod = passport.moduleProgress?.[modId];
      if (mod && mod.status !== 'not_started') {
        const wingTitle =
          CORE_SEVEN_WINGS.find((w) => w.id === modId)?.title || modId;
        items.push({
          id: `mod-${modId}`,
          title: `${wingTitle} (${STATUS_BADGE[mod.status].label})`,
          subtitle: mod.lastActivityLabel,
          scoreText: `${mod.scoreEarned}đ`,
          iso: mod.updatedAtIso,
        });
      }
    }

    for (const badge of passport.earnedBadges || []) {
      items.push({
        id: `bdg-${badge.badgeDocId}`,
        title: `Đạt huy hiệu: ${badge.badgeTitle}`,
        subtitle: badge.criteria,
        scoreText: badge.pointsBonus > 0 ? `+${badge.pointsBonus}đ` : 'Huy hiệu',
        iso: badge.createdAtIso,
      });
    }

    return items.sort((a, b) => b.iso.localeCompare(a.iso)).slice(0, 12);
  }, [passport.quizAttempts, passport.moduleProgress, passport.earnedBadges]);

  const activeAvatarSrc = resolveAvatarImage(avatarPreset, passport.avatarUrl);

  const qrPassportData = JSON.stringify({
    app: 'SuThiSo4.0',
    uid: passport.uid || 'local-demo',
    student: passport.studentName,
    school: passport.school,
    className: passport.className,
    totalScore: passport.totalScore,
    completedWings: completedWingsCount,
  });

  return (
    <div className="space-y-8 pb-14">
      <header className="border-b border-sandstone pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-medium text-wood-600">
            Phân khu 09 · Tài khoản học sinh &amp; Hộ chiếu hành trình sử thi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
            Hộ chiếu nhà thám hiểm
          </h1>
          <p className="text-sm sm:text-base text-wood-700 leading-relaxed">
            Ghi nhận tiến độ thực tế qua 7 phân hệ, điểm tích lũy, huy hiệu, tác phẩm đã đọc hiểu và đồng bộ lớp học qua Firebase.
          </p>
        </div>

        {/* Auth Status & Quick Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {passport.uid ? (
            <div className="flex flex-wrap items-center gap-2.5 bg-parchment border border-sandstone rounded-xl px-4 py-2.5">
              <UserCheck className="w-4 h-4 text-forest-700" />
              <div className="text-xs">
                <p className="font-semibold text-wood-900">
                  {ROLE_LABELS[passport.role]} · ID: <span className="font-mono">{passport.uid.slice(0, 10)}…</span>
                </p>
                <p className="text-wood-600">
                  {passport.classId ? `Đã tham gia lớp mã ${passport.joinCode || passport.classId}` : 'Chưa gắn mã lớp học'}
                </p>
              </div>
              {(passport.role === 'teacher' || passport.role === 'admin') && (
                <button
                  type="button"
                  onClick={() => onNavigate('teacher-admin')}
                  className="px-3 py-1.5 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
                >
                  Vào trang giáo viên
                </button>
              )}
              <button
                type="button"
                disabled={authBusy}
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-medium bg-cream border border-sandstone text-wood-800 rounded-lg hover:border-gold-500 inline-flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={authBusy || !serviceStatus.firebase.configured}
              onClick={handleGoogleSignIn}
              className="px-4 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-xl hover:bg-forest-700 transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-gold-400" />
              <span>{authBusy ? 'Đang đăng nhập...' : 'Đăng nhập tài khoản học tập (Google)'}</span>
            </button>
          )}
        </div>
      </header>

      {!serviceStatus.firebase.configured && (
        <DemoModeBanner
          serviceName="Firebase Firestore & Auth"
          detail="Chưa cấu hình dự án Firebase. Tiến trình Hộ chiếu hiện được lưu cục bộ trên trình duyệt ở chế độ Demo."
          actionLabel="Xem trạng thái hệ thống"
          onAction={() => onNavigate('teacher-admin')}
        />
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-wood-900 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-terracotta-700 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 rounded-xl bg-forest-800/10 border border-forest-700/40 text-forest-800 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Passport Overview Stats (9 Required Passport Items) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-wood-900 text-cream rounded-2xl p-5 flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-gold-500/60 shrink-0 bg-wood-950">
            <SafeImage
              src={activeAvatarSrc}
              alt={`Ảnh đại diện của ${passport.studentName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gold-400 font-medium">Học sinh</p>
            <p className="font-serif text-lg font-bold truncate">{passport.studentName}</p>
            <p className="text-xs text-cream/75 truncate">
              {passport.className} {passport.school ? `· ${passport.school}` : ''}
            </p>
          </div>
        </div>

        <div className="bg-cream border border-sandstone rounded-2xl p-5">
          <p className="text-xs text-wood-600 font-medium">Tổng điểm tích lũy</p>
          <p className="font-mono tabular-nums text-3xl font-bold text-forest-800 mt-1">
            {passport.totalScore}
          </p>
          <p className="text-[11px] text-wood-500 mt-1 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Tính từ kết quả thực tế</span>
          </p>
        </div>

        <div className="bg-cream border border-sandstone rounded-2xl p-5">
          <p className="text-xs text-wood-600 font-medium">Phân hệ đã khám phá</p>
          <p className="font-mono tabular-nums text-3xl font-bold text-wood-900 mt-1">
            {exploredWingsCount} / {CORE_WING_IDS.length}
          </p>
          <p className="text-[11px] text-wood-500 mt-1">
            Đã hoàn thành: <strong className="text-forest-700">{completedWingsCount}</strong> phân hệ
          </p>
        </div>

        <div className="bg-cream border border-sandstone rounded-2xl p-5">
          <p className="text-xs text-wood-600 font-medium">Nhiệm vụ &amp; Huy hiệu</p>
          <p className="font-mono tabular-nums text-3xl font-bold text-wood-900 mt-1">
            {completedTasksCount}
          </p>
          <p className="text-[11px] text-wood-500 mt-1">
            Đạt <strong className="text-gold-600">{passport.earnedBadges.length}</strong> huy hiệu sử thi
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Minimal Safe Student Profile Form + QR Card */}
        <section className="lg:col-span-5 bg-wood-900 text-cream rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
              Hồ sơ học sinh
            </span>
            <span className="text-xs font-mono text-cream/75">
              {passport.uid ? 'Đồng bộ Firestore' : 'Chế độ Demo'}
            </span>
          </div>

          {/* Avatar Picker */}
          <div className="space-y-2">
            <p className="text-xs text-cream/80">Chọn ảnh đại diện bảo tàng</p>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_PRESETS.map((preset) => {
                const selected = avatarPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarPreset(preset.id)}
                    title={preset.label}
                    className={`rounded-xl overflow-hidden border-2 aspect-square cursor-pointer transition-all ${
                      selected ? 'border-gold-400 scale-105' : 'border-wood-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={preset.imagePath}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
              {passport.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarPreset('google')}
                  title="Ảnh tài khoản Google"
                  className={`rounded-xl overflow-hidden border-2 aspect-square cursor-pointer transition-all ${
                    avatarPreset === 'google' ? 'border-gold-400 scale-105' : 'border-wood-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={passport.avatarUrl}
                    alt="Ảnh Google"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label htmlFor="passport-name" className="block text-xs text-cream/85 mb-1">
                Họ và tên hoặc tên hiển thị *
              </label>
              <input
                id="passport-name"
                type="text"
                required
                maxLength={80}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-wood-950 border border-wood-700 text-cream focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="passport-school" className="block text-xs text-cream/85 mb-1">
                  Trường THPT
                </label>
                <input
                  id="passport-school"
                  type="text"
                  maxLength={120}
                  value={schoolInput}
                  onChange={(e) => setSchoolInput(e.target.value)}
                  placeholder="THPT Chuyên..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-wood-950 border border-wood-700 text-cream focus:outline-none focus:border-gold-400"
                />
              </div>

              <div>
                <label htmlFor="passport-class" className="block text-xs text-cream/85 mb-1">
                  Lớp *
                </label>
                <input
                  id="passport-class"
                  type="text"
                  required
                  maxLength={40}
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  placeholder="10A1"
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-wood-950 border border-wood-700 text-cream focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="passport-joincode" className="block text-xs text-cream/85 mb-1">
                Mã lớp / Mã tham gia do giáo viên cung cấp
              </label>
              <input
                id="passport-joincode"
                type="text"
                maxLength={24}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Ví dụ: VAN10A1"
                className="w-full px-3.5 py-2 text-sm font-mono uppercase rounded-lg bg-wood-950 border border-wood-700 text-cream focus:outline-none focus:border-gold-400"
              />
              <p className="text-[11px] text-cream/60 mt-1">
                Hệ thống không thu thập số điện thoại hay địa chỉ cá nhân.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={saveBusy}
                className="px-4 py-2 text-xs font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saveBusy ? 'Đang lưu...' : passport.uid ? 'Lưu hồ sơ & Đồng bộ lớp' : 'Lưu thẻ Demo'}
              </button>

              {!passport.uid && (
                <button
                  type="button"
                  onClick={onResetDemo}
                  className="px-3 py-2 text-xs text-cream/75 hover:text-cream inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại Demo</span>
                </button>
              )}
            </div>
          </form>

          <div className="pt-4 border-t border-wood-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gold-400">Mã QR Hộ chiếu</p>
              <p className="text-[11px] text-cream/70 leading-relaxed">
                Quét mã để xem nhanh thông tin học sinh và tiến độ đạt được.
              </p>
            </div>
            <div className="p-2.5 bg-cream rounded-xl shrink-0">
              <QRCodeSVG value={qrPassportData} size={92} bgColor="#F8F4EC" fgColor="#231B13" />
            </div>
          </div>
        </section>

        {/* Right Column: Action-Based 3-State Module Progress */}
        <section className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sandstone pb-4">
            <div className="flex items-center gap-2">
              <Stamp className="w-5 h-5 text-forest-700" />
              <h2 className="font-serif text-2xl font-bold text-wood-900">
                Tiến độ 7 phân hệ cốt lõi (theo hành động thực tế)
              </h2>
            </div>
            <span className="text-xs text-wood-600">
              Chỉ chuyển &ldquo;Đã hoàn thành&rdquo; khi hoàn tất nhiệm vụ
            </span>
          </div>

          <div className="space-y-3">
            {CORE_SEVEN_WINGS.map((wing) => {
              const modId = wing.id as CoreWingId;
              const prog = passport.moduleProgress?.[modId];
              const status: ModuleProgressStatus = prog?.status || 'not_started';
              const badge = STATUS_BADGE[status];
              const doneCount = prog?.actionsCompleted?.length || 0;
              const reqCount = prog?.requiredActionsCount || 1;
              const pct = Math.min(100, Math.round((doneCount / reqCount) * 100));

              return (
                <div
                  key={wing.id}
                  className="p-4 rounded-xl border border-sandstone bg-parchment/45 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono text-wood-500">
                        PHÂN HỆ {wing.orderNumber}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate(wing.id)}
                        className="font-serif text-lg font-bold text-wood-900 hover:text-forest-700 text-left cursor-pointer"
                      >
                        {wing.title}
                      </button>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono tabular-nums text-xs text-wood-700">
                        {doneCount}/{reqCount} bước · {prog?.scoreEarned || 0}đ
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-sandstone/70 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        status === 'completed'
                          ? 'bg-forest-700'
                          : status === 'in_progress'
                            ? 'bg-gold-500'
                            : 'bg-transparent'
                      }`}
                      style={{ width: `${status === 'completed' ? 100 : pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-wood-600">{prog?.lastActivityLabel || 'Chưa khám phá'}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Grid: Earned Badges, Explored Works, Activity History, Class Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Badges + Works */}
        <section className="lg:col-span-6 space-y-6">
          <div className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-wood-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-gold-600" />
                <span>Huy hiệu đạt được ({passport.earnedBadges.length})</span>
              </h2>
            </div>

            {passport.earnedBadges.length === 0 ? (
              <p className="text-sm text-wood-600 bg-parchment/60 p-4 rounded-xl border border-sandstone">
                Chưa có huy hiệu nào. Hãy hoàn thành các trạm đọc hiểu, điểm chạm 3D hoặc Đấu trường để nhận huy hiệu đầu tiên.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {passport.earnedBadges.map((b) => (
                  <div
                    key={b.badgeDocId}
                    className="p-3.5 rounded-xl bg-parchment/70 border border-gold-500/40 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-wood-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                        <span>{b.badgeTitle}</span>
                      </span>
                      {b.pointsBonus > 0 && (
                        <span className="font-mono text-xs font-semibold text-forest-800">
                          +{b.pointsBonus}đ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-wood-700">{b.criteria}</p>
                    <p className="text-[11px] text-wood-500">
                      {b.awardedBy === 'teacher' ? 'Giáo viên trao tặng' : 'Hệ thống ghi nhận'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-wood-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-forest-700" />
              <span>Các tác phẩm đã tìm hiểu ({passport.exploredWorks.length})</span>
            </h2>
            {passport.exploredWorks.length === 0 ? (
              <div className="space-y-3 text-sm text-wood-600 bg-parchment/60 p-4 rounded-xl border border-sandstone">
                <p>Chưa ghi nhận tác phẩm đã học. Hãy lưu ghi chú hoặc làm bài tập tại Thư viện sử thi Việt Nam &amp; Thế giới.</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('vietnam-epics')}
                    className="px-3 py-1.5 text-xs font-semibold bg-wood-900 text-cream rounded-lg cursor-pointer"
                  >
                    Mở Sử thi Việt Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('world-epics')}
                    className="px-3 py-1.5 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg cursor-pointer"
                  >
                    Mở Sử thi thế giới
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {passport.exploredWorks.map((work) => (
                  <span
                    key={work}
                    className="px-3 py-1.5 rounded-lg bg-parchment border border-sandstone text-xs font-semibold text-wood-900"
                  >
                    {work}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Activity History + Assignments */}
        <section className="lg:col-span-6 space-y-6">
          <div className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-wood-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-wood-700" />
              <span>Lịch sử hoạt động gần đây</span>
            </h2>
            {activityHistory.length === 0 ? (
              <p className="text-sm text-wood-600 bg-parchment/60 p-4 rounded-xl border border-sandstone">
                Chưa có hoạt động được ghi nhận. Mỗi lần hoàn thành trạm, điểm chạm 3D hoặc ván đấu trường sẽ hiển thị tại đây.
              </p>
            ) : (
              <div className="divide-y divide-sandstone/70 max-h-80 overflow-y-auto pr-1">
                {activityHistory.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-wood-900 truncate">{item.title}</p>
                      <p className="text-xs text-wood-600">{item.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono tabular-nums text-xs font-semibold text-forest-800 block">
                        {item.scoreText}
                      </span>
                      <span className="text-[10px] text-wood-500">
                        {new Date(item.iso).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {passport.uid && passport.classId && (
            <div className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-wood-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-forest-700" />
                <span>Nhiệm vụ giáo viên giao cho lớp ({assignments.length})</span>
              </h2>
              {assignments.length === 0 ? (
                <p className="text-sm text-wood-600">
                  Giáo viên lớp {passport.joinCode || passport.className} chưa giao bài tập mới.
                </p>
              ) : (
                <div className="space-y-4">
                  {assignments.map((asg) => {
                    const existingSub = submissions[asg.assignmentId];
                    return (
                      <div
                        key={asg.assignmentId}
                        className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-wood-900">{asg.title}</p>
                            <p className="text-xs text-wood-700 mt-0.5">{asg.description}</p>
                          </div>
                          <span className="font-mono text-xs text-forest-800 shrink-0">
                            Tối đa {asg.maxPoints}đ
                          </span>
                        </div>

                        {existingSub?.status === 'graded' ? (
                          <div className="p-3 rounded-lg bg-forest-800/10 border border-forest-700/30 text-xs space-y-1">
                            <p className="font-semibold text-forest-800">
                              Đã chấm điểm: {existingSub.score}/{asg.maxPoints}đ
                            </p>
                            {existingSub.teacherFeedback && (
                              <p className="text-wood-800">Nhận xét GV: {existingSub.teacherFeedback}</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={draftResponses[asg.assignmentId] || ''}
                              onChange={(e) =>
                                setDraftResponses((prev) => ({
                                  ...prev,
                                  [asg.assignmentId]: e.target.value,
                                }))
                              }
                              placeholder="Nhập tóm tắt bài làm / dẫn chứng của em..."
                              className="w-full p-2.5 text-xs bg-cream border border-sandstone rounded-lg"
                            />
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-wood-600">
                                {existingSub ? 'Đã nộp · Có thể cập nhật lại trước khi GV chấm' : 'Chưa nộp bài'}
                              </span>
                              <button
                                type="button"
                                disabled={submittingAssignmentId === asg.assignmentId}
                                onClick={() => handleSubmitAssignment(asg)}
                                className="px-3 py-1.5 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>
                                  {submittingAssignmentId === asg.assignmentId
                                    ? 'Đang nộp...'
                                    : existingSub
                                      ? 'Cập nhật bài nộp'
                                      : 'Nộp bài'}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
