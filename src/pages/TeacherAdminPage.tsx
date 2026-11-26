import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Copy,
  Database,
  Download,
  FileCode2,
  FileSpreadsheet,
  Gamepad2,
  GraduationCap,
  Link2,
  Lock,
  LogIn,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  School,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import {
  AssignmentRecord,
  AssignmentSubmissionRecord,
  CoreWingId,
  ExplorerPassportState,
  ModuleProgressStatus,
  ServiceConnectionStatus,
  UserRole,
} from '../types/museum';
import {
  getLocalPadletUrls,
  isValidHttpUrl,
  saveLocalPadletUrls,
} from '../services/configService';
import {
  DEFAULT_GOOGLE_SHEETS_SCRIPT_URL,
  syncToGoogleSheets,
  SAMPLE_GOOGLE_APPS_SCRIPT_CODE,
} from '../services/googleSheetsService';
import {
  isTeacherAuthenticated,
  setTeacherAuthenticated,
  verifyTeacherCredentials,
  loadAllStudentsProfiles,
  loadLocalClassrooms,
  saveLocalClassrooms,
  loadLocalBadges,
  saveLocalBadge,
  LocalClassroomRecord,
  LocalAwardedBadge,
} from '../services/studentLearningRecordsService';
import { LearningResultsView } from '../components/admin/LearningResultsView';
import {
  EPIC_CONCEPT_CARDS,
  VIETNAM_EPIC_DOSSIERS,
  WORLD_EPIC_DOSSIERS,
} from '../data/literaryCurriculumData';
import { ARENA_QUESTIONS } from '../data/arenaAndStemData';
import { CORE_SEVEN_WINGS } from '../data/navigation';
import {
  getMergedConceptCards,
  getMergedVietnamDossiers,
  getMergedWorldDossiers,
  resetAllCurriculumOverrides,
} from '../services/curriculumStorageService';
import {
  awardBadgeToStudentCloud,
  CORE_WING_IDS,
  createAssignmentCloud,
  createClassroomCloud,
  fetchSubmissionsForAssignmentCloud,
  fetchTeacherDashboardData,
  gradeAssignmentSubmissionCloud,
  saveTeacherSettingsCloud,
  signInWithGoogleFirebase,
  signOutFirebase,
  TeacherDashboardPayload,
  toggleClassroomActiveCloud,
  updateUserByAdminOrTeacherCloud,
} from '../services/firebaseService';
import { TeacherAnalyticsCharts } from '../components/admin/TeacherAnalyticsCharts';
import {
  exportClassReportCsv,
  exportClassReportExcel,
  exportFullStudentProfilesToExcel,
  printClassLearningReportPdf,
} from '../utils/reportExport';

interface TeacherAdminPageProps {
  passport: ExplorerPassportState;
  serviceStatus: ServiceConnectionStatus;
  onRefreshStatus: () => void;
}

type AdminTabId =
  | 'results'
  | 'overview'
  | 'students'
  | 'classes'
  | 'progress'
  | 'games'
  | 'reading'
  | 'badges'
  | 'padlet'
  | 'curriculum';

const ADMIN_TABS: Array<{
  id: AdminTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'results', label: 'Kết quả học tập', icon: FileSpreadsheet },
  { id: 'overview', label: 'Biểu đồ & Xuất báo cáo', icon: BarChart3 },
  { id: 'students', label: 'Quản lý học sinh', icon: Users },
  { id: 'classes', label: 'Quản lý lớp', icon: School },
  { id: 'progress', label: 'Theo dõi tiến độ', icon: ClipboardList },
  { id: 'games', label: 'Xem kết quả trò chơi', icon: Gamepad2 },
  { id: 'reading', label: 'Xem kết quả đọc hiểu', icon: BookOpenCheck },
  { id: 'badges', label: 'Quản lý huy hiệu', icon: Award },
  { id: 'padlet', label: 'Cập nhật Padlet', icon: Link2 },
  { id: 'curriculum', label: 'Quản lý học liệu', icon: FileCode2 },
];

const STATUS_LABEL: Record<ModuleProgressStatus, { text: string; cls: string }> = {
  not_started: { text: 'Chưa khám phá', cls: 'bg-parchment text-wood-600 border-sandstone' },
  in_progress: { text: 'Đang khám phá', cls: 'bg-gold-500/15 text-wood-900 border-gold-500/50' },
  completed: { text: 'Đã hoàn thành', cls: 'bg-forest-700/15 text-forest-800 border-forest-700/40' },
};

function buildDashboardFromLocalRecords(): TeacherDashboardPayload {
  const localClasses = loadLocalClassrooms();
  const profiles = loadAllStudentsProfiles();
  const localBadges = loadLocalBadges();

  const classes: ClassroomRecord[] = localClasses.map((c) => ({
    classId: c.classId,
    name: c.name,
    school: c.school,
    academicYear: c.academicYear,
    joinCode: c.joinCode,
    teacherUid: 'loanho',
    teacherName: c.teacherName,
    isActive: c.isActive,
    createdAtIso: c.createdAtIso || new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
  }));

  const students: UserProfileRecord[] = profiles.map((p) => {
    const matched = localClasses.find(
      (c) => c.name.toLowerCase() === p.className.toLowerCase()
    );
    return {
      uid: p.studentId,
      displayName: p.studentName,
      school: p.school,
      className: p.className,
      classId: matched?.classId || p.className,
      joinCode: matched?.joinCode || p.className,
      teacherUid: 'loanho',
      avatarPreset: 'dam-san',
      avatarUrl: '',
      role: 'student' as UserRole,
      totalScore: p.totalScore,
      createdAtIso: p.firstJoinedIso,
      updatedAtIso: p.lastActiveIso,
    };
  });

  const progressRecords: ModuleProgressRecord[] = [];
  for (const p of profiles) {
    for (const modId of CORE_WING_IDS) {
      const isVisited = p.visitedZones.includes(modId);
      const isCompleted =
        isVisited &&
        (modId === 'museum-3d'
          ? p.completedHotspots.length >= 3
          : modId === 'hero-arena'
          ? p.totalQuestionsAnswered >= 3
          : modId === 'stem-studio'
          ? p.stemCompletedTasks.length >= 1
          : true);

      progressRecords.push({
        progressDocId: `prog_${p.studentId}_${modId}`,
        studentUid: p.studentId,
        studentName: p.studentName,
        classId: p.className,
        teacherUid: 'loanho',
        moduleId: modId,
        status: isCompleted ? 'completed' : isVisited ? 'in_progress' : 'not_started',
        requiredActionsCount: 4,
        actionsCompleted: isVisited ? ['action_visit', 'action_interact'] : [],
        scoreEarned:
          modId === 'museum-3d'
            ? p.museum3DScore
            : modId === 'hero-arena'
            ? p.arenaBestScore
            : isVisited
            ? 20
            : 0,
        lastInteractionAtIso: p.lastActiveIso,
      });
    }
  }

  const quizAttempts: QuizAttemptRecord[] = [];
  for (const p of profiles) {
    for (const ans of p.detailedAnswers) {
      quizAttempts.push({
        attemptId: ans.id,
        studentUid: p.studentId,
        studentName: p.studentName,
        classId: p.className,
        teacherUid: 'loanho',
        moduleId: (ans.activityId === 'museum-3d' ? 'museum-3d' : 'hero-arena') as CoreWingId,
        activityType: (ans.activityType === 'quiz' ? 'quiz' : 'dialogue') as QuizAttemptRecord['activityType'],
        activityTitle: ans.activityTitle,
        workTitle: 'Đăm Săn đi bắt Nữ thần Mặt Trời',
        difficultTopic: ans.questionPrompt,
        score: ans.scoreAwarded,
        maxScore: ans.maxScore || 15,
        correctCount: ans.isCorrect ? 1 : 0,
        wrongCount: ans.isCorrect ? 0 : 1,
        createdAtIso: ans.timestampIso,
      });
    }
  }

  const badges: BadgeRecord[] = localBadges.map((b) => ({
    badgeDocId: b.badgeDocId,
    recordType: 'issued',
    badgeId: b.badgeId,
    badgeTitle: b.badgeTitle,
    criteria: b.criteria,
    studentUid: b.studentUid,
    classId: b.className,
    teacherUid: 'loanho',
    awardedBy: 'teacher',
    pointsBonus: b.pointsBonus,
    createdAtIso: b.createdAtIso,
  }));

  return {
    classes,
    students,
    progressRecords,
    quizAttempts,
    badges,
    assignments: [],
    submissionsCountByAssignment: {},
  };
}

export const TeacherAdminPage: React.FC<TeacherAdminPageProps> = ({
  passport,
  serviceStatus,
  onRefreshStatus,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabId>('results');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [studentSearch, setStudentSearch] = useState('');

  // Authentication for Teacher (loanho / 2026)
  const [isTeacherAuth, setIsTeacherAuth] = useState<boolean>(() => isTeacherAuthenticated());
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyTeacherCredentials(authUsername, authPassword)) {
      setTeacherAuthenticated(true);
      setIsTeacherAuth(true);
      setAuthError(null);
      setAuthUsername('');
      setAuthPassword('');
    } else {
      setAuthError('Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  const handleTeacherLogout = () => {
    setTeacherAuthenticated(false);
    setIsTeacherAuth(false);
  };

  const [dashboard, setDashboard] = useState<TeacherDashboardPayload>({
    classes: [],
    students: [],
    progressRecords: [],
    quizAttempts: [],
    badges: [],
    assignments: [],
    submissionsCountByAssignment: {},
  });
  const [loadingData, setLoadingData] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Class creation state
  const [newClassName, setNewClassName] = useState('10D3');
  const [newClassSchool, setNewClassSchool] = useState('THPT Trần Nguyên Hãn');
  const [newAcademicYear, setNewAcademicYear] = useState('2025-2026');
  const [newJoinCode, setNewJoinCode] = useState('TNH_10D3');
  const [creatingClass, setCreatingClass] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Student score/role edit
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});

  // Badge award state
  const [badgeStudentUid, setBadgeStudentUid] = useState('');
  const [badgeTitle, setBadgeTitle] = useState('Ngôi sao đọc hiểu Sử thi');
  const [badgeCriteria, setBadgeCriteria] = useState('Phân tích dẫn chứng Đăm Săn xuất sắc');
  const [badgePoints, setBadgePoints] = useState(15);

  // Assignment creation + submission grading state
  const [assignClassId, setAssignClassId] = useState('');
  const [assignModuleId, setAssignModuleId] = useState<CoreWingId>('dam-san-journey');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignMaxPoints, setAssignMaxPoints] = useState(10);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRecord | null>(null);
  const [assignmentSubs, setAssignmentSubs] = useState<AssignmentSubmissionRecord[]>([]);
  const [gradeDrafts, setGradeDrafts] = useState<
    Record<string, { score: string; feedback: string }>
  >({});

  // Padlet & curriculum state
  const DEFAULT_PADLET_HOUSE_URL =
    'https://padlet.com/beloan107/san-pham-cua-nhung-nha-thiet-ke-tri-thuc-va-nguoi-ket-noi-di-s025riagyk6jit5ke2ka';
  const localUrls = getLocalPadletUrls();
  const [houseEmbedUrl, setHouseEmbedUrl] = useState<string>(
    () => serviceStatus.padlet.houseEmbedUrl || localUrls.houseEmbedUrl || DEFAULT_PADLET_HOUSE_URL
  );
  const [journeyEmbedUrl, setJourneyEmbedUrl] = useState<string>(
    serviceStatus.padlet.journeyEmbedUrl || localUrls.journeyEmbedUrl || ''
  );
  const [presentationMode, setPresentationMode] = useState(false);

  const [padletSavedNote, setPadletSavedNote] = useState<string | null>(null);
  const [padletError, setPadletError] = useState<string | null>(null);
  const [curriculumFeedback, setCurriculumFeedback] = useState<string | null>(null);

  const isAuthorizedEducator =
    Boolean(passport.uid) &&
    (passport.role === 'teacher' || passport.role === 'admin');

  const loadDashboard = useCallback(async () => {
    setLoadingData(true);
    setActionError(null);
    try {
      const localData = buildDashboardFromLocalRecords();
      if (passport.uid && isAuthorizedEducator) {
        try {
          const cloudPayload = await fetchTeacherDashboardData(passport.uid, passport.role);
          if (cloudPayload.classes.length > 0 || cloudPayload.students.length > 0) {
            setDashboard({
              classes: cloudPayload.classes.length > 0 ? cloudPayload.classes : localData.classes,
              students: cloudPayload.students.length > 0 ? cloudPayload.students : localData.students,
              progressRecords: cloudPayload.progressRecords.length > 0 ? cloudPayload.progressRecords : localData.progressRecords,
              quizAttempts: cloudPayload.quizAttempts.length > 0 ? cloudPayload.quizAttempts : localData.quizAttempts,
              badges: [...cloudPayload.badges, ...localData.badges],
              assignments: cloudPayload.assignments,
              submissionsCountByAssignment: cloudPayload.submissionsCountByAssignment,
            });
            if (!assignClassId && (cloudPayload.classes[0] || localData.classes[0])) {
              setAssignClassId((cloudPayload.classes[0] || localData.classes[0]).classId);
            }
            if (!badgeStudentUid && (cloudPayload.students[0] || localData.students[0])) {
              setBadgeStudentUid((cloudPayload.students[0] || localData.students[0]).uid);
            }
            return;
          }
        } catch {
          // Cloud failed, fallback to localData
        }
      }
      setDashboard(localData);
      if (!assignClassId && localData.classes.length > 0) {
        setAssignClassId(localData.classes[0].classId);
      }
      if (!badgeStudentUid && localData.students.length > 0) {
        setBadgeStudentUid(localData.students[0].uid);
      }
    } catch (err: unknown) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoadingData(false);
    }
  }, [passport.uid, passport.role, isAuthorizedEducator, assignClassId, badgeStudentUid]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Filtered datasets by selected class
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return dashboard.students.filter((st) => {
      if (selectedClassFilter !== 'ALL' && st.classId !== selectedClassFilter) {
        return false;
      }
      if (q) {
        return (
          st.displayName.toLowerCase().includes(q) ||
          st.school.toLowerCase().includes(q) ||
          st.className.toLowerCase().includes(q) ||
          st.uid.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dashboard.students, selectedClassFilter, studentSearch]);

  const filteredProgress = useMemo(() => {
    if (selectedClassFilter === 'ALL') return dashboard.progressRecords;
    return dashboard.progressRecords.filter((p) => p.classId === selectedClassFilter);
  }, [dashboard.progressRecords, selectedClassFilter]);

  const filteredAttempts = useMemo(() => {
    if (selectedClassFilter === 'ALL') return dashboard.quizAttempts;
    return dashboard.quizAttempts.filter((a) => a.classId === selectedClassFilter);
  }, [dashboard.quizAttempts, selectedClassFilter]);

  const gameAttempts = useMemo(
    () => filteredAttempts.filter((a) => a.activityType === 'arena_game'),
    [filteredAttempts]
  );

  const readingAttempts = useMemo(
    () => filteredAttempts.filter((a) => a.activityType !== 'arena_game'),
    [filteredAttempts]
  );

  const getComputedStudentScore = useCallback(
    (uid: string, baseBonus: number) => {
      const modSum = dashboard.progressRecords
        .filter((p) => p.studentUid === uid)
        .reduce((s, p) => s + p.scoreEarned, 0);
      const bestArena = dashboard.quizAttempts
        .filter((a) => a.studentUid === uid && a.activityType === 'arena_game')
        .reduce((m, a) => Math.max(m, a.score), 0);
      const badgeSum = dashboard.badges
        .filter((b) => b.studentUid === uid)
        .reduce((s, b) => s + (b.pointsBonus || 0), 0);
      return Math.max(baseBonus, modSum + bestArena + badgeSum);
    },
    [dashboard.progressRecords, dashboard.quizAttempts, dashboard.badges]
  );

  // Handlers
  const handleSignIn = async () => {
    setActionError(null);
    try {
      await signInWithGoogleFirebase();
    } catch {
      setActionError('Không thể đăng nhập lúc này. Hãy cho phép cửa sổ pop-up và thử lại.');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingClass(true);
    setActionError(null);
    setActionNotice(null);

    const createdClass: ClassroomRecord = {
      classId: `cls_${Date.now()}`,
      name: newClassName.trim(),
      school: newClassSchool.trim(),
      academicYear: newAcademicYear.trim(),
      joinCode: newJoinCode.trim().toUpperCase(),
      teacherUid: 'loanho',
      teacherName: 'Cô Hồ Thị Thanh Loan',
      isActive: true,
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    };

    try {
      if (passport.uid && isAuthorizedEducator) {
        try {
          const cloudCreated = await createClassroomCloud(passport.uid, passport.studentName, {
            name: newClassName,
            school: newClassSchool,
            academicYear: newAcademicYear,
            joinCode: newJoinCode,
          });
          createdClass.classId = cloudCreated.classId;
        } catch {
          // Fallback to local
        }
      }

      const localClasses = loadLocalClassrooms();
      const updatedLocal: LocalClassroomRecord[] = [
        {
          classId: createdClass.classId,
          name: createdClass.name,
          school: createdClass.school,
          academicYear: createdClass.academicYear,
          joinCode: createdClass.joinCode,
          teacherName: createdClass.teacherName,
          isActive: createdClass.isActive,
          createdAtIso: createdClass.createdAtIso,
        },
        ...localClasses,
      ];
      saveLocalClassrooms(updatedLocal);

      setDashboard((prev) => ({
        ...prev,
        classes: [createdClass, ...prev.classes],
      }));
      setNewJoinCode(`TNH_${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
      setActionNotice(`Đã tạo lớp "${createdClass.name}" (${createdClass.school}) với mã tham gia ${createdClass.joinCode}.`);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Lỗi khi tạo lớp mới.');
    } finally {
      setCreatingClass(false);
    }
  };

  const handleToggleClass = async (classId: string, nextActive: boolean) => {
    try {
      if (passport.uid && isAuthorizedEducator) {
        try {
          await toggleClassroomActiveCloud(classId, nextActive);
        } catch {}
      }
      const localClasses = loadLocalClassrooms();
      const updatedLocal = localClasses.map((c) =>
        c.classId === classId ? { ...c, isActive: nextActive } : c
      );
      saveLocalClassrooms(updatedLocal);

      setDashboard((prev) => ({
        ...prev,
        classes: prev.classes.map((c) =>
          c.classId === classId ? { ...c, isActive: nextActive } : c
        ),
      }));
      setActionNotice('Đã cập nhật trạng thái lớp học.');
    } catch {
      setActionError('Không thể cập nhật trạng thái lớp.');
    }
  };

  const handleDeleteClass = (classId: string, className: string) => {
    if (window.confirm(`Cô có chắc chắn muốn xóa lớp "${className}" không?`)) {
      const localClasses = loadLocalClassrooms();
      const updatedLocal = localClasses.filter((c) => c.classId !== classId);
      saveLocalClassrooms(updatedLocal);
      setDashboard((prev) => ({
        ...prev,
        classes: prev.classes.filter((c) => c.classId !== classId),
      }));
      setActionNotice(`Đã xóa lớp "${className}".`);
    }
  };

  const handleUpdateUserRole = async (uid: string, role: UserRole) => {
    try {
      if (passport.uid && isAuthorizedEducator) {
        await updateUserByAdminOrTeacherCloud(uid, { role });
      }
      setDashboard((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.uid === uid ? { ...s, role } : s)),
      }));
      setActionNotice(`Đã cập nhật quyền thành "${role}".`);
    } catch {
      setActionError('Chỉ Quản trị viên (Admin) mới có quyền thay đổi vai trò người dùng.');
    }
  };

  const handleSaveBonusScore = async (uid: string) => {
    const raw = Number(scoreDrafts[uid]);
    if (Number.isNaN(raw) || raw < 0) return;
    try {
      if (passport.uid && isAuthorizedEducator) {
        try {
          await updateUserByAdminOrTeacherCloud(uid, { totalScore: Math.round(raw) });
        } catch {}
      }
      setDashboard((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s.uid === uid ? { ...s, totalScore: Math.round(raw) } : s
        ),
      }));
      setActionNotice('Đã cập nhật điểm hồ sơ học sinh.');
    } catch {
      setActionError('Không thể cập nhật điểm cho học sinh này.');
    }
  };

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeStudentUid) return;
    const student = dashboard.students.find((s) => s.uid === badgeStudentUid);
    if (!student) return;

    const newBadge: BadgeRecord = {
      badgeDocId: `badge_${Date.now()}`,
      recordType: 'issued',
      badgeId: `badge_${Date.now()}`,
      badgeTitle,
      criteria: badgeCriteria,
      studentUid: student.uid,
      classId: student.classId || '10D3',
      teacherUid: 'loanho',
      awardedBy: 'teacher',
      pointsBonus: badgePoints,
      createdAtIso: new Date().toISOString(),
    };

    try {
      saveLocalBadge({
        badgeDocId: newBadge.badgeDocId,
        badgeId: newBadge.badgeId,
        badgeTitle: newBadge.badgeTitle,
        criteria: newBadge.criteria,
        studentUid: student.uid,
        studentName: student.displayName,
        className: student.className,
        pointsBonus: badgePoints,
        awardedBy: 'Cô Hồ Thị Thanh Loan',
        createdAtIso: newBadge.createdAtIso,
      });

      if (passport.uid && isAuthorizedEducator) {
        try {
          await awardBadgeToStudentCloud({
            studentUid: student.uid,
            classId: student.classId || '',
            teacherUid: student.teacherUid || passport.uid,
            badgeTitle,
            criteria: badgeCriteria,
            pointsBonus: badgePoints,
          });
        } catch {}
      }

      setDashboard((prev) => ({
        ...prev,
        badges: [newBadge, ...prev.badges],
      }));
      setActionNotice(`Đã trao huy hiệu "${badgeTitle}" (+${badgePoints}đ) cho học sinh ${student.displayName}.`);
    } catch {
      setActionError('Không thể trao huy hiệu.');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport.uid || !assignClassId || !assignTitle.trim()) return;
    try {
      const created = await createAssignmentCloud({
        classId: assignClassId,
        teacherUid: passport.uid,
        moduleId: assignModuleId,
        title: assignTitle,
        description: assignDescription,
        maxPoints: assignMaxPoints,
      });
      setDashboard((prev) => ({
        ...prev,
        assignments: [created, ...prev.assignments],
      }));
      setAssignTitle('');
      setAssignDescription('');
      setActionNotice(`Đã giao nhiệm vụ "${created.title}" cho lớp ${created.classId}.`);
    } catch {
      setActionError('Không thể tạo nhiệm vụ cho lớp.');
    }
  };

  const handleInspectAssignment = async (asg: AssignmentRecord) => {
    if (!passport.uid) return;
    setSelectedAssignment(asg);
    try {
      const subs = await fetchSubmissionsForAssignmentCloud(
        asg.assignmentId,
        passport.uid,
        passport.role
      );
      setAssignmentSubs(subs);
      const drafts: Record<string, { score: string; feedback: string }> = {};
      subs.forEach((s) => {
        drafts[s.studentUid] = {
          score: String(s.score || asg.maxPoints),
          feedback: s.teacherFeedback || '',
        };
      });
      setGradeDrafts(drafts);
    } catch {
      setActionError('Không thể tải danh sách bài nộp.');
    }
  };

  const handleGradeSubmission = async (sub: AssignmentSubmissionRecord) => {
    if (!selectedAssignment) return;
    const draft = gradeDrafts[sub.studentUid];
    const score = Number(draft?.score || 0);
    try {
      await gradeAssignmentSubmissionCloud({
        assignmentId: selectedAssignment.assignmentId,
        studentUid: sub.studentUid,
        score,
        maxPoints: selectedAssignment.maxPoints,
        teacherFeedback: draft?.feedback || '',
      });
      setAssignmentSubs((prev) =>
        prev.map((item) =>
          item.studentUid === sub.studentUid
            ? {
                ...item,
                status: 'graded',
                score,
                teacherFeedback: draft?.feedback || '',
              }
            : item
        )
      );
      setActionNotice(`Đã chấm điểm bài của ${sub.studentName}.`);
    } catch {
      setActionError('Không thể lưu điểm chấm bài.');
    }
  };

  const handleSavePadlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setPadletError(null);

    const trimmedHouse = houseEmbedUrl.trim();
    const trimmedJourney = journeyEmbedUrl.trim();

    if (trimmedHouse && !isValidHttpUrl(trimmedHouse)) {
      setPadletError('URL Padlet Nhà dài phải bắt đầu bằng https:// hoặc http://.');
      return;
    }
    if (trimmedJourney && !isValidHttpUrl(trimmedJourney)) {
      setPadletError('URL Padlet Hành trình Đăm Săn phải bắt đầu bằng https:// hoặc http://.');
      return;
    }

    saveLocalPadletUrls({
      houseEmbedUrl: trimmedHouse,
      journeyEmbedUrl: trimmedJourney,
    });
    if (passport.uid && isAuthorizedEducator) {
      try {
        await saveTeacherSettingsCloud(passport.uid, {
          houseEmbedUrl: trimmedHouse,
          journeyEmbedUrl: trimmedJourney,
          presentationMode,
        });
      } catch {
        // Fallback to localStorage only
      }
    }
    onRefreshStatus();
    setPadletSavedNote('Đã lưu & đồng bộ cấu hình 2 bảng Padlet.');
    setTimeout(() => setPadletSavedNote(null), 3000);
  };

  const handleClearPadlet = () => {
    setHouseEmbedUrl('');
    setJourneyEmbedUrl('');
    saveLocalPadletUrls({ houseEmbedUrl: '', journeyEmbedUrl: '' });
    onRefreshStatus();
    setPadletError(null);
    setPadletSavedNote('Đã xóa liên kết Padlet lưu cục bộ.');
    setTimeout(() => setPadletSavedNote(null), 3000);
  };

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      concepts: getMergedConceptCards(),
      vietnamEpics: getMergedVietnamDossiers(),
      worldEpics: getMergedWorldDossiers(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'su-thi-so-hoc-lieu.json';
    a.click();
    URL.revokeObjectURL(url);
    setCurriculumFeedback('Đã xuất tệp JSON học liệu.');
  };

  const handleResetCurriculum = () => {
    resetAllCurriculumOverrides();
    setCurriculumFeedback('Đã khôi phục toàn bộ học liệu về phiên bản gốc.');
  };

  const activeClassLabel =
    selectedClassFilter === 'ALL'
      ? 'Tất cả lớp phụ trách'
      : dashboard.classes.find((c) => c.classId === selectedClassFilter)?.name ||
        selectedClassFilter;

  // Access Gate if not signed in or not teacher authenticated
  if (!isAuthorizedEducator && !isTeacherAuth) {
    return (
      <div className="space-y-8 pb-14 max-w-xl mx-auto animate-fade-in">
        <header className="border-b border-sandstone pb-6 space-y-2 text-center">
          <p className="text-xs font-medium text-wood-600">
            Phân khu 11 · Cổng xác thực Giáo viên Ngữ văn
          </p>
          <h1 className="font-serif text-3xl font-bold text-wood-900">
            KẾT QUẢ HỌC TẬP
          </h1>
        </header>

        <section className="bg-cream border border-sandstone rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-forest-700/10 border border-forest-700/20 flex items-center justify-center text-forest-800">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
              Khu vực bảo mật dành cho Giáo viên
            </span>
            <p className="text-xs text-wood-600 leading-relaxed max-w-sm mx-auto">
              Chỉ giáo viên phụ trách mới có quyền xem điểm số, thời gian học và kiểm tra toàn bộ chi tiết các câu trả lời của học sinh.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-wood-800 mb-1.5">
                Tài khoản giáo viên
              </label>
              <input
                type="text"
                autoComplete="off"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
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
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
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

          <div className="pt-2 border-t border-sandstone text-center">
            <button
              type="button"
              onClick={handleSignIn}
              className="text-xs text-wood-600 hover:text-wood-900 inline-flex items-center gap-1.5 cursor-pointer underline"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Hoặc đăng nhập bằng tài khoản Google (Firebase)</span>
            </button>
          </div>
        </section>

        {/* Honest Service Status Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-cream border border-sandstone rounded-xl p-5 space-y-1.5">
            <p className="text-xs font-semibold text-wood-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-jade-700" />
              <span>Gemini API</span>
            </p>
            <p className="text-xs text-wood-700">
              {serviceStatus.gemini.configured ? 'Đã kết nối Backend' : 'Chờ GEMINI_API_KEY'}
            </p>
          </div>
          <div className="bg-cream border border-sandstone rounded-xl p-5 space-y-1.5">
            <p className="text-xs font-semibold text-wood-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-forest-700" />
              <span>Firebase Firestore &amp; Auth</span>
            </p>
            <p className="text-xs text-wood-700">
              {serviceStatus.firebase.configured ? 'Đã kết nối' : 'Chưa cấu hình'}
            </p>
          </div>
          <div className="bg-cream border border-sandstone rounded-xl p-5 space-y-1.5">
            <p className="text-xs font-semibold text-wood-800 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-forest-700" />
              <span>Google Sheets Real-time</span>
            </p>
            <p className="text-xs text-wood-700 text-forest-800 font-medium">
              Đã tích hợp tự động
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-14">
      <header className="border-b border-sandstone pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-medium text-wood-600">
            Phân khu 11 · Bảng điều phối Giáo viên Ngữ văn ({passport.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'})
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
            Trang quản trị dành cho giáo viên
          </h1>
          <p className="text-sm sm:text-base text-wood-700 leading-relaxed">
            Quản lý lớp học, theo dõi tiến độ 3 trạng thái, chấm kết quả đọc hiểu &amp; trò chơi, phân tích 4 biểu đồ và xuất báo cáo CSV/Excel.
          </p>
          {isTeacherAuth && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-900">
                Tài khoản Giáo viên: loanho
              </span>
              <button
                type="button"
                onClick={handleTeacherLogout}
                className="text-xs text-rose-700 hover:text-rose-800 ml-2 font-bold cursor-pointer underline"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        {/* Class Filter & Refresh + Export */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            aria-label="Lọc theo lớp"
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-cream border border-sandstone rounded-lg text-wood-900"
          >
            <option value="ALL">Tất cả lớp ({dashboard.classes.length})</option>
            {dashboard.classes.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.name} ({c.joinCode})
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={loadingData}
            onClick={loadDashboard}
            className="px-3 py-2 text-xs font-semibold bg-parchment border border-sandstone rounded-lg hover:border-gold-500 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const allProfiles = loadAllStudentsProfiles();
              const profilesToExport =
                selectedClassFilter === 'ALL'
                  ? allProfiles
                  : allProfiles.filter(
                      (p) =>
                        p.className === selectedClassFilter ||
                        p.studentId === selectedClassFilter
                    );
              exportFullStudentProfilesToExcel({
                classLabel: activeClassLabel,
                profiles: profilesToExport,
              });
            }}
            className="px-3 py-2 text-xs font-semibold bg-emerald-700 text-cream rounded-lg hover:bg-emerald-800 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Xuất bảng điểm và chi tiết bài làm học sinh sang Excel (.xls)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel Báo Cáo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const allProfiles = loadAllStudentsProfiles();
              const profilesToExport =
                selectedClassFilter === 'ALL'
                  ? allProfiles
                  : allProfiles.filter(
                      (p) =>
                        p.className === selectedClassFilter ||
                        p.studentId === selectedClassFilter
                    );
              printClassLearningReportPdf({
                classLabel: activeClassLabel,
                profiles: profilesToExport,
              });
            }}
            className="px-3 py-2 text-xs font-semibold bg-indigo-700 text-cream rounded-lg hover:bg-indigo-800 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="In hoặc lưu báo cáo học tập PDF có chữ ký giáo viên"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo PDF</span>
          </button>

          <button
            type="button"
            onClick={() =>
              exportClassReportCsv({
                classLabel: activeClassLabel,
                students: filteredStudents,
                progressRecords: filteredProgress,
                quizAttempts: filteredAttempts,
              })
            }
            className="px-3 py-2 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </header>

      {actionError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-wood-900 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-terracotta-700 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionNotice && (
        <div className="p-4 rounded-xl bg-forest-800/10 border border-forest-700/40 text-forest-800 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Menu Navigation */}
      <nav
        aria-label="Menu quản trị giáo viên"
        className="flex flex-wrap gap-2 border-b border-sandstone pb-4"
      >
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                active
                  ? 'bg-wood-900 text-cream border-wood-900'
                  : 'bg-cream text-wood-800 border-sandstone hover:border-gold-500'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-gold-400' : 'text-forest-700'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB 0: KẾT QUẢ HỌC TẬP (Bảo mật giáo viên & Real-time Google Sheets) */}
      {activeTab === 'results' && <LearningResultsView />}

      {/* TAB 1: Overview & 4 Analytics Charts */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-cream border border-sandstone rounded-2xl p-5">
              <p className="text-xs text-wood-600">Lớp đang quản lý</p>
              <p className="font-mono tabular-nums text-3xl font-bold text-wood-900 mt-1">
                {dashboard.classes.length}
              </p>
            </div>
            <div className="bg-cream border border-sandstone rounded-2xl p-5">
              <p className="text-xs text-wood-600">Học sinh trong phạm vi lọc</p>
              <p className="font-mono tabular-nums text-3xl font-bold text-forest-800 mt-1">
                {filteredStudents.filter((s) => s.role === 'student').length}
              </p>
            </div>
            <div className="bg-cream border border-sandstone rounded-2xl p-5">
              <p className="text-xs text-wood-600">Lượt làm bài &amp; Trò chơi</p>
              <p className="font-mono tabular-nums text-3xl font-bold text-wood-900 mt-1">
                {filteredAttempts.length}
              </p>
            </div>
            <div className="bg-cream border border-sandstone rounded-2xl p-5">
              <p className="text-xs text-wood-600">Huy hiệu đã trao</p>
              <p className="font-mono tabular-nums text-3xl font-bold text-gold-600 mt-1">
                {dashboard.badges.length}
              </p>
            </div>
          </section>

          <TeacherAnalyticsCharts
            students={filteredStudents}
            progressRecords={filteredProgress}
            quizAttempts={filteredAttempts}
          />
        </div>
      )}

      {/* TAB 2: Quản lý học sinh */}
      {activeTab === 'students' && (
        <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold text-wood-900">
              Quản lý học sinh ({filteredStudents.length})
            </h2>
            <input
              type="search"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Tìm theo tên, trường, lớp..."
              className="px-3.5 py-2 text-xs bg-parchment/60 border border-sandstone rounded-lg w-full sm:w-64"
            />
          </div>

          {filteredStudents.length === 0 ? (
            <p className="text-sm text-wood-600 py-6">
              Chưa có học sinh nào tham gia lớp bạn phụ trách. Hãy tạo lớp ở mục &ldquo;Quản lý lớp&rdquo; và gửi Mã lớp cho học sinh nhập trong Hộ chiếu.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-sandstone text-wood-600">
                    <th className="py-3 pr-4 font-semibold w-12">STT</th>
                    <th className="py-3 pr-4 font-semibold">Họ và tên / UID</th>
                    <th className="py-3 pr-4 font-semibold">Trường &amp; Lớp</th>
                    <th className="py-3 pr-4 font-semibold">Mã lớp</th>
                    <th className="py-3 pr-4 font-semibold">Vai trò</th>
                    <th className="py-3 pr-4 font-semibold">Điểm thực tế</th>
                    <th className="py-3 font-semibold">Cộng điểm GV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandstone/60">
                  {filteredStudents.map((st, sIdx) => {
                    const realScore = getComputedStudentScore(st.uid, st.totalScore);
                    return (
                      <tr key={st.uid} className="hover:bg-parchment/40">
                        <td className="py-3 pr-4 font-mono font-bold text-wood-700">{sIdx + 1}</td>
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-wood-900">{st.displayName}</p>
                          <p className="font-mono text-[10px] text-wood-500">{st.uid}</p>
                        </td>
                        <td className="py-3 pr-4 text-wood-800">
                          <p>{st.className}</p>
                          <p className="text-[11px] text-wood-500">{st.school || '-'}</p>
                        </td>
                        <td className="py-3 pr-4 font-mono text-wood-700">
                          {st.joinCode || st.classId || '-'}
                        </td>
                        <td className="py-3 pr-4">
                          {passport.role === 'admin' && st.uid !== passport.uid ? (
                            <select
                              value={st.role}
                              onChange={(e) =>
                                handleUpdateUserRole(st.uid, e.target.value as UserRole)
                              }
                              className="px-2 py-1 rounded border border-sandstone bg-cream text-xs"
                            >
                              <option value="student">Học sinh</option>
                              <option value="teacher">Giáo viên</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-parchment border border-sandstone">
                              {st.role}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 font-mono tabular-nums font-bold text-forest-800">
                          {realScore}đ
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={10000}
                              placeholder={String(st.totalScore)}
                              value={scoreDrafts[st.uid] ?? ''}
                              onChange={(e) =>
                                setScoreDrafts((p) => ({ ...p, [st.uid]: e.target.value }))
                              }
                              className="w-20 px-2 py-1 border border-sandstone rounded bg-cream font-mono text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveBonusScore(st.uid)}
                              className="px-2.5 py-1 bg-forest-700 text-cream rounded font-semibold cursor-pointer hover:bg-forest-800"
                            >
                              Lưu
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: Quản lý lớp */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleCreateClass}
            className="lg:col-span-5 bg-cream border border-sandstone rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-serif text-xl font-bold text-wood-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-forest-700" />
              <span>Tạo lớp học mới</span>
            </h2>
            <div>
              <label className="block text-xs font-semibold text-wood-800 mb-1">
                Tên lớp *
              </label>
              <input
                type="text"
                required
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-cream border border-sandstone rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-wood-800 mb-1">
                Trường THPT *
              </label>
              <input
                type="text"
                required
                value={newClassSchool}
                onChange={(e) => setNewClassSchool(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-cream border border-sandstone rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">
                  Năm học
                </label>
                <input
                  type="text"
                  value={newAcademicYear}
                  onChange={(e) => setNewAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-cream border border-sandstone rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">
                  Mã tham gia lớp *
                </label>
                <input
                  type="text"
                  required
                  value={newJoinCode}
                  onChange={(e) => setNewJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm font-mono uppercase bg-cream border border-sandstone rounded-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creatingClass}
              className="w-full py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-xl hover:bg-forest-800 cursor-pointer disabled:opacity-50"
            >
              {creatingClass ? 'Đang tạo lớp...' : 'Tạo lớp & Phát mã tham gia'}
            </button>
          </form>

          <section className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-wood-900">
              Danh sách lớp học ({dashboard.classes.length})
            </h2>
            {dashboard.classes.length === 0 ? (
              <p className="text-sm text-wood-600">
                Chưa có lớp học nào. Hãy tạo lớp đầu tiên ở biểu mẫu bên cạnh.
              </p>
            ) : (
              <div className="space-y-3">
                {dashboard.classes.map((cls) => {
                  const memberCount = dashboard.students.filter(
                    (s) => s.classId === cls.classId
                  ).length;
                  return (
                    <div
                      key={cls.classId}
                      className="p-4 rounded-xl bg-parchment/55 border border-sandstone flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="font-serif text-lg font-bold text-wood-900">
                          {cls.name} · <span className="text-sm font-sans font-normal">{cls.school}</span>
                        </p>
                        <p className="text-xs text-wood-600">
                          Năm học {cls.academicYear} · GV: {cls.teacherName} ·{' '}
                          <strong>{memberCount}</strong> học sinh đã tham gia
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(cls.joinCode);
                            setCopiedCode(cls.joinCode);
                            setTimeout(() => setCopiedCode(null), 2000);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-wood-900 text-cream font-mono text-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-gold-400" />
                          <span>
                            {copiedCode === cls.joinCode ? 'Đã sao chép!' : cls.joinCode}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleClass(cls.classId, !cls.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                            cls.isActive
                              ? 'bg-forest-700/15 text-forest-800 border-forest-700/40'
                              : 'bg-parchment text-wood-600 border-sandstone'
                          }`}
                        >
                          {cls.isActive ? 'Đang mở' : 'Tạm khóa'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClass(cls.classId, cls.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                          title={`Xóa lớp ${cls.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 4: Theo dõi tiến độ (Ma trận 3 trạng thái) */}
      {activeTab === 'progress' && (
        <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold text-wood-900">
              Ma trận tiến độ 7 phân hệ theo hành động thực tế
            </h2>
            <span className="text-xs text-wood-600">
              Hiển thị trạng thái: Chưa khám phá · Đang khám phá · Đã hoàn thành
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <p className="text-sm text-wood-600">Chưa có học sinh trong lớp được chọn.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-sandstone text-wood-700">
                    <th className="py-3 pr-3 font-semibold min-w-[140px]">Học sinh</th>
                    {CORE_SEVEN_WINGS.map((w) => (
                      <th key={w.id} className="py-3 px-2 font-semibold min-w-[110px]">
                        {w.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandstone/60">
                  {filteredStudents.map((st) => (
                    <tr key={st.uid}>
                      <td className="py-3 pr-3 font-semibold text-wood-900">
                        {st.displayName}
                        <span className="block text-[10px] font-normal text-wood-500">
                          {st.className}
                        </span>
                      </td>
                      {CORE_WING_IDS.map((modId) => {
                        const rec = filteredProgress.find(
                          (p) => p.studentUid === st.uid && p.moduleId === modId
                        );
                        const status: ModuleProgressStatus = rec?.status || 'not_started';
                        const badge = STATUS_LABEL[status];
                        return (
                          <td key={modId} className="py-3 px-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded border font-medium ${badge.cls}`}
                            >
                              {badge.text}
                            </span>
                            {rec && (
                              <span className="block font-mono text-[10px] text-wood-600 mt-0.5">
                                {rec.actionsCompleted.length}/{rec.requiredActionsCount} · {rec.scoreEarned}đ
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 5: Xem kết quả trò chơi */}
      {activeTab === 'games' && (
        <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-wood-900">
            Kết quả Đấu trường Anh hùng ca ({gameAttempts.length} lượt)
          </h2>
          {gameAttempts.length === 0 ? (
            <p className="text-sm text-wood-600">
              Chưa có lượt chơi nào từ học sinh thuộc lớp được chọn.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-sandstone text-wood-600">
                    <th className="py-2.5 pr-4">Học sinh</th>
                    <th className="py-2.5 pr-4">Trò chơi</th>
                    <th className="py-2.5 pr-4">Đúng / Sai</th>
                    <th className="py-2.5 pr-4">Điểm</th>
                    <th className="py-2.5">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandstone/60">
                  {gameAttempts.map((att) => (
                    <tr key={att.attemptId}>
                      <td className="py-2.5 pr-4 font-semibold text-wood-900">{att.studentName}</td>
                      <td className="py-2.5 pr-4 text-wood-800">{att.activityTitle}</td>
                      <td className="py-2.5 pr-4 font-mono tabular-nums">
                        <span className="text-forest-800">{att.correctCount} đúng</span> /{' '}
                        <span className="text-terracotta-700">{att.wrongCount} sai</span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono tabular-nums font-bold text-wood-900">
                        {att.score}/{att.maxScore}
                      </td>
                      <td className="py-2.5 text-wood-600">
                        {new Date(att.createdAtIso).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 6: Xem kết quả đọc hiểu & Giao/Chấm bài */}
      {activeTab === 'reading' && (
        <div className="space-y-8">
          <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-wood-900">
              Kết quả Đọc hiểu, La bàn dẫn chứng &amp; Điểm chạm 3D ({readingAttempts.length} lượt)
            </h2>
            {readingAttempts.length === 0 ? (
              <p className="text-sm text-wood-600">
                Chưa có bài đọc hiểu hoặc đánh giá dẫn chứng nào được ghi nhận.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-sandstone text-wood-600">
                      <th className="py-2.5 pr-4">Học sinh</th>
                      <th className="py-2.5 pr-4">Nhiệm vụ</th>
                      <th className="py-2.5 pr-4">Tác phẩm / Chủ đề</th>
                      <th className="py-2.5 pr-4">Điểm</th>
                      <th className="py-2.5">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone/60">
                    {readingAttempts.map((att) => (
                      <tr key={att.attemptId}>
                        <td className="py-2.5 pr-4 font-semibold text-wood-900">{att.studentName}</td>
                        <td className="py-2.5 pr-4 text-wood-800">{att.activityTitle}</td>
                        <td className="py-2.5 pr-4 text-wood-700">
                          {att.workTitle || att.difficultTopic || '-'}
                        </td>
                        <td className="py-2.5 pr-4 font-mono tabular-nums font-bold text-forest-800">
                          {att.score}/{att.maxScore}
                        </td>
                        <td className="py-2.5 text-wood-600">
                          {new Date(att.createdAtIso).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Giao nhiệm vụ đọc hiểu & Chấm bài nộp */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleCreateAssignment}
              className="lg:col-span-5 bg-cream border border-sandstone rounded-2xl p-6 space-y-3.5"
            >
              <h3 className="font-serif text-xl font-bold text-wood-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-forest-700" />
                <span>Giao nhiệm vụ đọc hiểu cho lớp</span>
              </h3>
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">Lớp nhận bài</label>
                <select
                  required
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg"
                >
                  <option value="">-- Chọn lớp --</option>
                  {dashboard.classes.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      {c.name} ({c.joinCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">Phân hệ gắn kết</label>
                <select
                  value={assignModuleId}
                  onChange={(e) => setAssignModuleId(e.target.value as CoreWingId)}
                  className="w-full px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg"
                >
                  {CORE_SEVEN_WINGS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">Tiêu đề nhiệm vụ *</label>
                <input
                  type="text"
                  required
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="Ví dụ: Phân tích chi tiết chiếc khiên Đăm Săn"
                  className="w-full px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">Yêu cầu chi tiết</label>
                <textarea
                  rows={3}
                  value={assignDescription}
                  onChange={(e) => setAssignDescription(e.target.value)}
                  placeholder="Nêu yêu cầu tìm dẫn chứng và lập luận..."
                  className="w-full px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">Điểm tối đa</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={assignMaxPoints}
                  onChange={(e) => setAssignMaxPoints(Number(e.target.value))}
                  className="w-24 px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
              >
                Phát hành nhiệm vụ
              </button>
            </form>

            <section className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-xl font-bold text-wood-900">
                Bài tập đã giao &amp; Chấm bài ({dashboard.assignments.length})
              </h3>
              <div className="space-y-2.5">
                {dashboard.assignments.map((asg) => (
                  <div
                    key={asg.assignmentId}
                    className="p-3.5 rounded-xl bg-parchment/55 border border-sandstone flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-wood-900">{asg.title}</p>
                      <p className="text-xs text-wood-600">
                        Lớp {asg.classId} · Tối đa {asg.maxPoints}đ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInspectAssignment(asg)}
                      className="px-3 py-1.5 text-xs font-semibold bg-wood-900 text-cream rounded-lg cursor-pointer"
                    >
                      Xem bài nộp
                    </button>
                  </div>
                ))}
              </div>

              {selectedAssignment && (
                <div className="pt-4 border-t border-sandstone space-y-3">
                  <p className="text-xs font-bold text-forest-800">
                    Bài nộp cho: {selectedAssignment.title} ({assignmentSubs.length} bài)
                  </p>
                  {assignmentSubs.map((sub) => (
                    <div
                      key={sub.studentUid}
                      className="p-3.5 rounded-xl bg-parchment border border-sandstone space-y-2 text-xs"
                    >
                      <div className="flex justify-between font-semibold text-wood-900">
                        <span>{sub.studentName}</span>
                        <span>{sub.status === 'graded' ? `Đã chấm: ${sub.score}đ` : 'Chờ chấm'}</span>
                      </div>
                      <p className="text-wood-800 bg-cream p-2.5 rounded border border-sandstone/60">
                        {sub.responseSummary}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={selectedAssignment.maxPoints}
                          value={gradeDrafts[sub.studentUid]?.score || ''}
                          onChange={(e) =>
                            setGradeDrafts((p) => ({
                              ...p,
                              [sub.studentUid]: {
                                ...(p[sub.studentUid] || { feedback: '' }),
                                score: e.target.value,
                              },
                            }))
                          }
                          className="w-20 px-2 py-1 bg-cream border border-sandstone rounded font-mono"
                          placeholder="Điểm"
                        />
                        <input
                          type="text"
                          value={gradeDrafts[sub.studentUid]?.feedback || ''}
                          onChange={(e) =>
                            setGradeDrafts((p) => ({
                              ...p,
                              [sub.studentUid]: {
                                ...(p[sub.studentUid] || { score: '0' }),
                                feedback: e.target.value,
                              },
                            }))
                          }
                          className="flex-1 px-2.5 py-1 bg-cream border border-sandstone rounded"
                          placeholder="Nhận xét của giáo viên..."
                        />
                        <button
                          type="button"
                          onClick={() => handleGradeSubmission(sub)}
                          className="px-3 py-1 bg-forest-700 text-cream rounded font-semibold cursor-pointer"
                        >
                          Lưu điểm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* TAB 7: Quản lý huy hiệu */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAwardBadge}
            className="lg:col-span-5 bg-cream border border-sandstone rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-serif text-xl font-bold text-wood-900">
              Trao huy hiệu khen thưởng học sinh
            </h2>
            <div>
              <label className="block text-xs font-semibold text-wood-800 mb-1">Chọn học sinh</label>
              <select
                required
                value={badgeStudentUid}
                onChange={(e) => setBadgeStudentUid(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg"
              >
                <option value="">-- Chọn học sinh --</option>
                {filteredStudents.map((s) => (
                  <option key={s.uid} value={s.uid}>
                    {s.displayName} ({s.className})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-wood-800 mb-1">Tên huy hiệu</label>
              <input
                type="text"
                required
                value={badgeTitle}
                onChange={(e) => setBadgeTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-wood-800 mb-1">Lý do / Tiêu chí</label>
              <input
                type="text"
                required
                value={badgeCriteria}
                onChange={(e) => setBadgeCriteria(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream border border-sandstone rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-wood-800 mb-1">Điểm thưởng (0–50)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={badgePoints}
                onChange={(e) => setBadgePoints(Number(e.target.value))}
                className="w-24 px-3 py-2 text-xs font-mono bg-cream border border-sandstone rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold bg-gold-500 text-wood-950 rounded-xl hover:bg-gold-400 cursor-pointer"
            >
              Trao huy hiệu ngay
            </button>
          </form>

          <section className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-wood-900">
              Danh sách huy hiệu đã cấp ({dashboard.badges.length})
            </h2>
            <div className="divide-y divide-sandstone/70 max-h-96 overflow-y-auto text-xs">
              {dashboard.badges.map((b) => {
                const holder =
                  dashboard.students.find((s) => s.uid === b.studentUid)?.displayName ||
                  b.studentUid;
                return (
                  <div key={b.badgeDocId} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-wood-900">{b.badgeTitle}</p>
                      <p className="text-wood-600">
                        Người nhận: <strong>{holder}</strong> · {b.criteria}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-forest-800 shrink-0">
                      +{b.pointsBonus}đ
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 8: Cập nhật Padlet */}
      {activeTab === 'padlet' && (
        <form
          onSubmit={handleSavePadlet}
          className="max-w-2xl bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-4"
        >
          <h2 className="font-serif text-2xl font-bold text-wood-900">
            Cấu hình 2 liên kết nhúng Padlet – Bảo tàng của chúng em
          </h2>
          <p className="text-sm text-wood-700 leading-relaxed">
            Dán đường dẫn nhúng Padlet (<code className="font-mono text-xs">https://padlet.com/embed/...</code>) để đồng bộ cho toàn bộ lớp trong phân hệ Xưởng sáng tạo di sản.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="teacher-padlet-house-url" className="block text-xs font-semibold text-wood-800">
              1. PADLET_HOUSE_EMBED_URL · Sản phẩm mô hình nhà dài
            </label>
            <input
              id="teacher-padlet-house-url"
              type="url"
              value={houseEmbedUrl}
              onChange={(e) => setHouseEmbedUrl(e.target.value)}
              placeholder="https://padlet.com/embed/nha-dai-ede-lop10"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-cream border border-sandstone rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="teacher-padlet-journey-url" className="block text-xs font-semibold text-wood-800">
              2. PADLET_JOURNEY_EMBED_URL · Sản phẩm hành trình Đăm Săn
            </label>
            <input
              id="teacher-padlet-journey-url"
              type="url"
              value={journeyEmbedUrl}
              onChange={(e) => setJourneyEmbedUrl(e.target.value)}
              placeholder="https://padlet.com/embed/hanh-trinh-dam-san-lop10"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-cream border border-sandstone rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-wood-800 cursor-pointer">
            <input
              type="checkbox"
              checked={presentationMode}
              onChange={(e) => setPresentationMode(e.target.checked)}
              className="rounded border-sandstone"
            />
            <span>Bật chế độ Hội giảng (mở khóa xem trước các trạm cho giáo viên trình chiếu)</span>
          </label>

          {padletError && (
            <p className="text-xs font-medium text-terracotta-700 inline-flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{padletError}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
            >
              Lưu &amp; Đồng bộ cấu hình Padlet
            </button>
            <button
              type="button"
              onClick={handleClearPadlet}
              className="px-3.5 py-2 text-xs font-semibold bg-parchment text-wood-800 border border-sandstone rounded-lg cursor-pointer"
            >
              Xóa cấu hình cục bộ
            </button>
            {padletSavedNote && (
              <span className="text-xs font-medium text-forest-700 inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{padletSavedNote}</span>
              </span>
            )}
          </div>
        </form>
      )}



      {/* TAB 9: Quản lý học liệu */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* 1. Trọng tâm: 2 Câu hỏi Đối thoại sử thi */}
          <section className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-sandstone pb-4">
              <BookOpenCheck className="w-5 h-5 text-forest-700" />
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-900">
                  2 Câu hỏi Đối thoại sử thi trọng tâm (Văn bản: Đăm Săn đi bắt Nữ thần Mặt Trời)
                </h2>
                <p className="text-xs text-wood-600 mt-0.5">
                  Bộ câu hỏi tự luận phát triển tư duy phản biện và liên hệ thực tiễn cho học sinh lớp 10
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold">
                  Câu hỏi 1 · Giá trị biểu tượng
                </span>
                <p className="text-xs sm:text-sm font-semibold text-wood-900 leading-snug">
                  Có ý kiến cho rằng: Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ Thần Mặt Trời để rồi lún sâu trong rừng Sáp Đen. Đó là một sự thất bại vô nghĩa. Em có đồng tình với ý kiến đó không? Hãy viết quan điểm của em (khoảng 3 - 5 câu) lí giải giá trị biểu tượng của lựa chọn ấy.
                </p>
                <div className="p-3 rounded-lg bg-cream border border-sandstone text-xs text-wood-700 space-y-1">
                  <p className="font-bold text-forest-900">Tiêu chí chấm điểm (15đ):</p>
                  <p>• Lập trường rõ ràng: Không đồng tình hoặc có góc nhìn phản biện đa chiều (3đ).</p>
                  <p>• Lí giải giá trị biểu tượng: Khát vọng chinh phục cái đẹp, ý chí dấn thân vượt ngưỡng của cộng đồng Ê-đê (8đ).</p>
                  <p>• Vẻ đẹp bi tráng và thông điệp nhân văn (4đ).</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-900 text-[11px] font-bold">
                  Câu hỏi 2 · Bài học hành động
                </span>
                <p className="text-xs sm:text-sm font-semibold text-wood-900 leading-snug">
                  Từ câu chuyện Đăm Săn đi bắt nữ thần Mặt Trời, em sẽ lựa chọn: dám vượt qua giới hạn để chinh phục những đỉnh cao mới hay nhận thức đúng giới hạn của bản thân để lựa chọn những mục tiêu phù hợp?
                </p>
                <div className="p-3 rounded-lg bg-cream border border-sandstone text-xs text-wood-700 space-y-1">
                  <p className="font-bold text-forest-900">Tiêu chí chấm điểm (15đ):</p>
                  <p>• Xác định rõ quan điểm hoặc dung hòa cả hai khía cạnh (4đ).</p>
                  <p>• Lập luận thuyết phục gắn với bối cảnh đời sống giới trẻ hiện nay (7đ).</p>
                  <p>• Rút ra bài học hành động thiết thực cho bản thân (4đ).</p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Thống kê & Quản lý kho học liệu */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <section className="lg:col-span-5 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-wood-700" />
                <h3 className="font-serif text-xl font-bold text-wood-900">
                  Cơ sở dữ liệu học liệu
                </h3>
              </div>

              <dl className="divide-y divide-sandstone/70 text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-wood-700">Cánh cửa sử thi (Chuyên đề lý thuyết)</dt>
                  <dd className="font-mono tabular-nums font-semibold text-wood-900">
                    {EPIC_CONCEPT_CARDS.length} chuyên đề
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-wood-700">Thư viện Sử thi Việt Nam</dt>
                  <dd className="font-mono tabular-nums font-semibold text-wood-900">
                    {VIETNAM_EPIC_DOSSIERS.length} tác phẩm
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-wood-700">Thư viện Sử thi thế giới</dt>
                  <dd className="font-mono tabular-nums font-semibold text-wood-900">
                    {WORLD_EPIC_DOSSIERS.length} tác phẩm
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-wood-700">Ngân hàng câu hỏi Đấu trường</dt>
                  <dd className="font-mono tabular-nums font-semibold text-wood-900">
                    {ARENA_QUESTIONS.length} câu hỏi
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-2 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất học liệu JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetCurriculum}
                  className="px-3.5 py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục bản gốc</span>
                </button>
              </div>

              {curriculumFeedback && (
                <p className="text-xs font-medium text-forest-700">{curriculumFeedback}</p>
              )}
            </section>

            {/* 3. Ngân hàng câu hỏi Đấu trường mẫu */}
            <section className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
              <h3 className="font-serif text-xl font-bold text-wood-900">
                Ngân hàng câu hỏi Đấu trường mẫu ({ARENA_QUESTIONS.length} câu)
              </h3>
              <div className="divide-y divide-sandstone/70 max-h-96 overflow-y-auto text-xs pr-1">
                {ARENA_QUESTIONS.slice(0, 15).map((q, idx) => (
                  <div key={idx} className="py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-wood-900/10 text-wood-800 font-mono text-[11px] font-bold">
                        Câu {idx + 1}
                      </span>
                      <span className="font-semibold text-wood-900">{q.prompt}</span>
                    </div>
                    <p className="text-forest-800 pl-2">
                      ✓ <strong>Đáp án đúng:</strong> {q.options[q.correctIndex]}
                    </p>
                    {q.explanation && (
                      <p className="text-wood-600 pl-2 italic">
                        Lí giải: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
