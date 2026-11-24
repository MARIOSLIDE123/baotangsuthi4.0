import {
  ArenaAttemptRecord,
  ExplorerPassportState,
} from '../types/museum';
import {
  syncToGoogleSheets,
  fetchRawDataFromGoogleSheets,
} from './googleSheetsService';

export const ALL_STUDENTS_RECORDS_KEY = 'suthiso_all_students_records_v2';
export const TEACHER_SESSION_KEY = 'suthiso_teacher_auth_session_v1';
export const TEACHER_CLASSES_KEY = 'suthiso_teacher_classes_v2';
export const TEACHER_BADGES_KEY = 'suthiso_teacher_badges_v2';

/**
 * Danh sách tên các tài khoản học sinh (đã gỡ bỏ lọc tự động để khôi phục toàn bộ dữ liệu)
 */
export const TEST_STUDENTS_TO_PURGE_NAMES: string[] = [];

/**
 * Không tự động lọc bỏ học sinh nào (giữ nguyên tất cả bài làm và kết quả)
 */
export function isTestStudentToPurge(_studentName?: string, _className?: string): boolean {
  return false;
}

export interface LocalClassroomRecord {
  classId: string;
  name: string;
  school: string;
  academicYear: string;
  joinCode: string;
  teacherName: string;
  isActive: boolean;
  createdAtIso: string;
}

export const DEFAULT_LOAN_HO_CLASSES: LocalClassroomRecord[] = [
  {
    classId: 'cls_10d3_tnh',
    name: '10D3',
    school: 'THPT Trần Nguyên Hãn',
    academicYear: '2025-2026',
    joinCode: 'TNH_10D3',
    teacherName: 'Cô Hồ Thị Thanh Loan',
    isActive: true,
    createdAtIso: '2026-09-05T07:30:00.000Z',
  },
  {
    classId: 'cls_10d7_tnh',
    name: '10D7',
    school: 'THPT Trần Nguyên Hãn',
    academicYear: '2025-2026',
    joinCode: 'TNH_10D7',
    teacherName: 'Cô Hồ Thị Thanh Loan',
    isActive: true,
    createdAtIso: '2026-09-05T07:30:00.000Z',
  },
  {
    classId: 'cls_19d3_tnh',
    name: '19D3',
    school: 'THPT Trần Nguyên Hãn',
    academicYear: '2025-2026',
    joinCode: 'TNH_19D3',
    teacherName: 'Cô Hồ Thị Thanh Loan',
    isActive: true,
    createdAtIso: '2026-09-05T07:30:00.000Z',
  },
];

export function loadLocalClassrooms(): LocalClassroomRecord[] {
  try {
    const raw = localStorage.getItem(TEACHER_CLASSES_KEY);
    if (!raw) {
      saveLocalClassrooms(DEFAULT_LOAN_HO_CLASSES);
      return DEFAULT_LOAN_HO_CLASSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_LOAN_HO_CLASSES;
  } catch {
    return DEFAULT_LOAN_HO_CLASSES;
  }
}

export function saveLocalClassrooms(classes: LocalClassroomRecord[]): void {
  try {
    localStorage.setItem(TEACHER_CLASSES_KEY, JSON.stringify(classes));
  } catch {
    // Ignore storage error
  }
}

export interface LocalAwardedBadge {
  badgeDocId: string;
  badgeId: string;
  badgeTitle: string;
  criteria: string;
  studentUid: string;
  studentName: string;
  className: string;
  pointsBonus: number;
  awardedBy: string;
  createdAtIso: string;
}

export function loadLocalBadges(): LocalAwardedBadge[] {
  try {
    const raw = localStorage.getItem(TEACHER_BADGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalBadge(badge: LocalAwardedBadge): LocalAwardedBadge[] {
  const existing = loadLocalBadges();
  const updated = [badge, ...existing.filter((b) => b.badgeDocId !== badge.badgeDocId)];
  try {
    localStorage.setItem(TEACHER_BADGES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage error
  }
  return updated;
}

export interface DetailedAnswerRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  activityType: 'quiz' | 'evidence' | 'dialogue' | 'timeline' | 'match' | 'stem' | 'hotspot';
  timestampIso: string;
  questionPrompt: string;
  studentAnswer: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  scoreAwarded: number;
  maxScore: number;
  teacherOrAiFeedback?: string;
  attemptNumber?: number; // 1 = Lần làm chính thức, 2 = Lần thử lại
}

export interface StudentFullLearningProfile {
  studentId: string;
  studentName: string;
  className: string;
  school: string;
  firstJoinedIso: string;
  lastActiveIso: string;
  totalScore: number;
  museum3DScore: number;
  arenaBestScore: number;
  readingScore: number;
  visitedZones: string[];
  completedHotspots: string[];
  stemCompletedTasks: string[];
  totalQuestionsAnswered: number;
  totalQuestionsCorrect: number;
  detailedAnswers: DetailedAnswerRecord[];
}

export const TEACHER_USERNAME = 'loanho';
export const TEACHER_PASSWORD = '2026';

/**
 * Kiểm tra xác thực giáo viên (tài khoản: loanho / mật khẩu: 2026)
 */
export function verifyTeacherCredentials(u: string, p: string): boolean {
  return u.trim().toLowerCase() === TEACHER_USERNAME && p.trim() === TEACHER_PASSWORD;
}

export function isTeacherAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(TEACHER_SESSION_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

export function setTeacherAuthenticated(auth: boolean): void {
  try {
    if (auth) {
      sessionStorage.setItem(TEACHER_SESSION_KEY, 'authenticated');
    } else {
      sessionStorage.removeItem(TEACHER_SESSION_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Tạo ID định danh học sinh dựa trên Họ tên và Lớp
 */
export function generateStudentKey(name: string, cls: string): string {
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, '_');
  const cleanCls = cls.trim().toLowerCase().replace(/\s+/g, '_');
  return `hs_${cleanName}_${cleanCls}`;
}

/**
 * Tải danh sách toàn bộ hồ sơ kết quả học tập của học sinh
 * Giữ nguyên và tự động khôi phục dữ liệu tất cả học sinh
 */
export function loadAllStudentsProfiles(): StudentFullLearningProfile[] {
  try {
    const raw = localStorage.getItem(ALL_STUDENTS_RECORDS_KEY);
    const demoStudents = getInitialDemoStudents();
    if (!raw) {
      saveAllStudentsProfiles(demoStudents);
      return demoStudents;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Khôi phục nếu thiếu các học sinh trong danh sách chuẩn ban đầu
      const existingIds = new Set(parsed.map((p: any) => p.studentId));
      const missingDemo = demoStudents.filter((d) => !existingIds.has(d.studentId));
      if (missingDemo.length > 0) {
        const merged = [...parsed, ...missingDemo];
        saveAllStudentsProfiles(merged);
        return merged;
      }
      return parsed as StudentFullLearningProfile[];
    }
    saveAllStudentsProfiles(demoStudents);
    return demoStudents;
  } catch {
    return getInitialDemoStudents();
  }
}

/**
 * Xóa một học sinh cụ thể khỏi cơ sở dữ liệu
 */
export function deleteStudentProfile(studentId: string): StudentFullLearningProfile[] {
  const current = loadAllStudentsProfiles();
  const updated = current.filter((p) => p.studentId !== studentId);
  saveAllStudentsProfiles(updated);
  return updated;
}

/**
 * Dọn dẹp toàn bộ tài khoản thử nghiệm theo yêu cầu của Giáo viên
 */
export function purgeAllTestStudentsProfiles(): {
  purgedCount: number;
  remainingProfiles: StudentFullLearningProfile[];
} {
  const current = loadAllStudentsProfiles();
  const initialLen = current.length;
  const cleaned = current.filter(
    (p) => !isTestStudentToPurge(p.studentName, p.className)
  );
  saveAllStudentsProfiles(cleaned);
  return {
    purgedCount: initialLen - cleaned.length,
    remainingProfiles: cleaned,
  };
}

/**
 * Lưu danh sách học sinh vào localStorage
 */
export function saveAllStudentsProfiles(
  profiles: StudentFullLearningProfile[]
): void {
  try {
    localStorage.setItem(ALL_STUDENTS_RECORDS_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Cập nhật hoặc thêm mới kết quả học tập của học sinh
 */
export function upsertStudentLearningProfile(
  passport: ExplorerPassportState,
  newAnswerRecord?: DetailedAnswerRecord
): StudentFullLearningProfile {
  const profiles = loadAllStudentsProfiles();
  const studentKey = generateStudentKey(passport.studentName, passport.className);
  const nowIso = new Date().toISOString();

  let existingIndex = profiles.findIndex((p) => p.studentId === studentKey);
  let studentProfile: StudentFullLearningProfile;

  if (existingIndex >= 0) {
    const existing = profiles[existingIndex];
    const updatedAnswers = newAnswerRecord
      ? [newAnswerRecord, ...existing.detailedAnswers.filter((a) => a.id !== newAnswerRecord.id)]
      : existing.detailedAnswers;

    const correctCount = updatedAnswers.filter((a) => a.isCorrect).length;

    studentProfile = {
      ...existing,
      studentName: passport.studentName,
      className: passport.className,
      school: passport.school,
      lastActiveIso: nowIso,
      totalScore: passport.totalScore,
      museum3DScore: passport.museum3DScore,
      arenaBestScore: passport.arenaBestScore,
      visitedZones: Array.from(new Set([...existing.visitedZones, ...passport.visitedZones])),
      completedHotspots: passport.completed3DHotspots || [],
      stemCompletedTasks: passport.completedStemActions || [],
      totalQuestionsAnswered: updatedAnswers.length,
      totalQuestionsCorrect: correctCount,
      detailedAnswers: updatedAnswers,
    };

    profiles[existingIndex] = studentProfile;
  } else {
    const answers = newAnswerRecord ? [newAnswerRecord] : [];
    studentProfile = {
      studentId: studentKey,
      studentName: passport.studentName,
      className: passport.className,
      school: passport.school,
      firstJoinedIso: nowIso,
      lastActiveIso: nowIso,
      totalScore: passport.totalScore,
      museum3DScore: passport.museum3DScore,
      arenaBestScore: passport.arenaBestScore,
      readingScore: 0,
      visitedZones: passport.visitedZones || [],
      completedHotspots: passport.completed3DHotspots || [],
      stemCompletedTasks: passport.completedStemActions || [],
      totalQuestionsAnswered: answers.length,
      totalQuestionsCorrect: answers.filter((a) => a.isCorrect).length,
      detailedAnswers: answers,
    };
    profiles.unshift(studentProfile);
  }

  saveAllStudentsProfiles(profiles);

  // Đồng bộ lên Google Sheet theo thời gian thực
  syncProfileToGoogleSheet(studentProfile, newAnswerRecord);

  return studentProfile;
}

/**
 * Ghi nhận toàn bộ kết quả trò chơi Đấu Trường kèm chi tiết câu trả lời
 * Luôn cập nhật và lưu kết quả MỚI NHẤT (ghi đè kết quả bài làm cũ của cùng trò chơi)
 */
export function recordArenaAttemptToStudentProfile(
  passport: ExplorerPassportState,
  attempt: ArenaAttemptRecord,
  attemptNumber: number = 1
): void {
  const answerRecords: DetailedAnswerRecord[] = attempt.reviewItems.map((item, idx) => ({
    id: `${attempt.id}_ans_${idx}`,
    activityId: attempt.gameId,
    activityTitle: attempt.gameTitle,
    activityType:
      attempt.gameId === 'evidence-challenge'
        ? 'evidence'
        : attempt.gameId === 'epic-dialogue'
        ? 'dialogue'
        : attempt.gameId === 'who-is-hero'
        ? 'match'
        : attempt.gameId === 'timeline'
        ? 'timeline'
        : 'quiz',
    timestampIso: attempt.completedAtIso,
    questionPrompt: item.prompt,
    studentAnswer: item.yourAnswer,
    correctAnswer: item.correctAnswer,
    isCorrect:
      attempt.gameId === 'epic-dialogue'
        ? item.explanation.includes('Lập luận') || item.yourAnswer.length > 30
        : item.yourAnswer.trim().toLowerCase() === (item.correctAnswer || '').trim().toLowerCase(),
    scoreAwarded: Math.round(attempt.score / Math.max(1, attempt.reviewItems.length)),
    maxScore: Math.round(attempt.score / Math.max(1, attempt.reviewItems.length)),
    teacherOrAiFeedback: item.explanation,
    attemptNumber,
  }));

  const profiles = loadAllStudentsProfiles();
  const studentKey = generateStudentKey(passport.studentName, passport.className);
  let existingIndex = profiles.findIndex((p) => p.studentId === studentKey);

  const nowIso = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = profiles[existingIndex];
    // LỌC BỎ CÂU TRẢ LỜI CŨ CỦA CÙNG TRÒ CHƠI ĐỂ CHỈ LƯU KẾT QUẢ MỚI NHẤT
    const otherAnswers = existing.detailedAnswers.filter((a) => a.activityId !== attempt.gameId);
    const combinedAnswers = [...answerRecords, ...otherAnswers];
    const correctCount = combinedAnswers.filter((a) => a.isCorrect).length;

    profiles[existingIndex] = {
      ...existing,
      lastActiveIso: nowIso,
      totalScore: Math.max(existing.totalScore, passport.totalScore),
      arenaBestScore: Math.max(existing.arenaBestScore, attempt.score),
      totalQuestionsAnswered: combinedAnswers.length,
      totalQuestionsCorrect: correctCount,
      detailedAnswers: combinedAnswers,
    };
    saveAllStudentsProfiles(profiles);
    syncProfileToGoogleSheet(profiles[existingIndex], answerRecords[0]);
  } else {
    upsertStudentLearningProfile(passport, answerRecords[0]);
  }
}

/**
 * Đồng bộ dữ liệu chi tiết lên Google Sheet của Cô Loan Hồ
 */
/**
 * Đồng bộ dữ liệu chi tiết lên Google Sheet (Ghi vào cả 2 sheet DANH_SACH_HOC_SINH và CHI_TIET_BAI_LAM)
 */
function syncProfileToGoogleSheet(
  profile: StudentFullLearningProfile,
  latestAnswer?: DetailedAnswerRecord
): void {
  const latestAnsText = latestAnswer
    ? `[${latestAnswer.activityTitle}] HS chọn: ${latestAnswer.studentAnswer.slice(0, 100)}`
    : profile.detailedAnswers.length > 0
      ? `Đã làm ${profile.detailedAnswers.length} câu hỏi. Gần nhất: ${profile.detailedAnswers[0].questionPrompt.slice(0, 60)}`
      : 'Tham quan & học tập';

  const answersPayload = (latestAnswer ? [latestAnswer] : profile.detailedAnswers.slice(0, 15)).map((a) => ({
    questionPrompt: a.questionPrompt,
    studentAnswer: a.studentAnswer,
    correctAnswer: a.correctAnswer,
    isCorrect: a.isCorrect,
    scoreAwarded: a.scoreAwarded,
    activityTitle: a.activityTitle,
    attemptNumber: a.attemptNumber || 1,
  }));

  syncToGoogleSheets({
    action: 'update_progress',
    studentName: profile.studentName,
    className: profile.className,
    school: profile.school,
    visitedZonesCount: profile.visitedZones.length,
    visitedZonesList: profile.visitedZones.join(', '),
    museum3DScore: profile.museum3DScore,
    arenaBestScore: profile.arenaBestScore,
    totalScore: profile.totalScore,
    stemActions: profile.stemCompletedTasks.join('; '),
    latestActivity: latestAnsText,
    notes: `Tổng câu đúng: ${profile.totalQuestionsCorrect}/${profile.totalQuestionsAnswered}`,
    detailedAnswers: answersPayload,
  }).catch(() => {});
}

/**
 * Đồng bộ ngược từ Google Sheet về APP cho Giáo viên (2 chiều)
 */
export async function pullLearningRecordsFromGoogleSheets(): Promise<{
  ok: boolean;
  students: StudentFullLearningProfile[];
  message: string;
}> {
  const res = await fetchRawDataFromGoogleSheets();
  if (!res.ok || !res.students) {
    return {
      ok: false,
      students: loadAllStudentsProfiles(),
      message: res.message,
    };
  }

  const localProfiles = loadAllStudentsProfiles();
  const remoteStudents = res.students;
  const remoteAnswers = res.detailedAnswers || [];

  for (const r of remoteStudents) {
    if (!r.studentName) continue;
    const key = generateStudentKey(r.studentName, r.className);
    const existingIdx = localProfiles.findIndex((p) => p.studentId === key);

    const studentAnswers: DetailedAnswerRecord[] = remoteAnswers
      .filter(
        (a: any) =>
          String(a.studentName || '').toLowerCase() === String(r.studentName || '').toLowerCase() &&
          String(a.className || '').toLowerCase() === String(r.className || '').toLowerCase()
      )
      .map((a: any, idx: number) => ({
        id: `remote_${key}_${idx}`,
        activityId: 'google-sheet-synced',
        activityTitle: a.activityTitle || 'Đấu trường',
        activityType: 'quiz' as const,
        timestampIso: a.timestampIso || new Date().toISOString(),
        questionPrompt: a.questionPrompt || '',
        studentAnswer: a.studentAnswer || '',
        correctAnswer: a.correctAnswer || '',
        isCorrect: Boolean(a.isCorrect),
        scoreAwarded: Number(a.scoreAwarded) || 0,
        maxScore: Number(a.scoreAwarded) || 10,
        attemptNumber: a.attemptNumber || 1,
      }));

    if (existingIdx >= 0) {
      localProfiles[existingIdx] = {
        ...localProfiles[existingIdx],
        totalScore: Math.max(localProfiles[existingIdx].totalScore, Number(r.totalScore) || 0),
        museum3DScore: Math.max(localProfiles[existingIdx].museum3DScore, Number(r.museum3DScore) || 0),
        arenaBestScore: Math.max(localProfiles[existingIdx].arenaBestScore, Number(r.arenaBestScore) || 0),
        lastActiveIso: r.lastActiveIso || localProfiles[existingIdx].lastActiveIso,
        detailedAnswers:
          studentAnswers.length > 0 ? studentAnswers : localProfiles[existingIdx].detailedAnswers,
      };
    } else {
      localProfiles.push({
        studentId: key,
        studentName: r.studentName,
        className: r.className || '10D3',
        school: r.school || 'THPT Trần Nguyên Hãn',
        firstJoinedIso: r.lastActiveIso || new Date().toISOString(),
        lastActiveIso: r.lastActiveIso || new Date().toISOString(),
        totalScore: Number(r.totalScore) || 0,
        museum3DScore: Number(r.museum3DScore) || 0,
        arenaBestScore: Number(r.arenaBestScore) || 0,
        readingScore: 0,
        visitedZones: ['home', 'museum-3d', 'hero-arena'],
        completedHotspots: [],
        stemCompletedTasks: [],
        totalQuestionsAnswered: studentAnswers.length,
        totalQuestionsCorrect: studentAnswers.filter((a) => a.isCorrect).length,
        detailedAnswers: studentAnswers,
      });
    }
  }

  saveAllStudentsProfiles(localProfiles);
  return {
    ok: true,
    students: localProfiles,
    message: `Đã đồng bộ thành công ${localProfiles.length} học sinh từ Google Sheet!`,
  };
}

/**
 * Dữ liệu hồ sơ học sinh ban đầu được khôi phục đầy đủ
 */
function getInitialDemoStudents(): StudentFullLearningProfile[] {
  return [
    {
      studentId: 'hs_ho_quang_nhat_10d3',
      studentName: 'Hồ Quang Nhật',
      className: '10D3',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 5).toISOString(),
      lastActiveIso: new Date(Date.now() - 900000).toISOString(),
      totalScore: 245,
      museum3DScore: 85,
      arenaBestScore: 120,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'dam-san-journey', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_ghe_kpan', 'hotspot_cau_thang_cai'],
      stemCompletedTasks: ['stem_house_mission', 'stem_padlet_submitted'],
      totalQuestionsAnswered: 5,
      totalQuestionsCorrect: 5,
      detailedAnswers: [
        {
          id: 'ans_hqn_1',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Tình huống 1',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 900000).toISOString(),
          questionPrompt: 'Có ý kiến cho rằng: Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ Thần Mặt Trời để rồi lún sâu trong rừng Sáp Đen. Đó là một sự thất bại vô nghĩa. Em có đồng tình với ý kiến đó không? Hãy viết quan điểm của em lí giải giá trị biểu tượng của lựa chọn ấy.',
          studentAnswer: 'Em không đồng tình với ý kiến đó. Sự ra đi của Đăm Săn biểu tượng cho vẻ đẹp bi tráng và ý chí cộng đồng, dám dấn thân chinh phục lý tưởng của con người thời kỳ sử thi.',
          correctAnswer: 'Khát vọng vượt ngưỡng, vẻ đẹp bi tráng và ý chí buôn làng',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Lập luận sắc bén, lập trường vững vàng và thể hiện tư duy phản biện văn học rất tốt!',
        },
        {
          id: 'ans_hqn_2',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Tình huống 2',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 1500000).toISOString(),
          questionPrompt: 'Từ câu chuyện Đăm Săn đi bắt nữ thần Mặt Trời, em sẽ lựa chọn: dám vượt qua giới hạn để chinh phục những đỉnh cao mới hay nhận thức đúng giới hạn của bản thân để lựa chọn những mục tiêu phù hợp?',
          studentAnswer: 'Theo em, người trẻ cần dung hòa cả hai: vừa có dũng khí dám dấn thân bước ra khỏi vùng an toàn để vươn tới mục tiêu lớn, vừa có trí tuệ nhận thức quy luật tự nhiên để kế hoạch hành động bền vững.',
          correctAnswer: 'Dung hòa giữa khát vọng lớn lao và sự tỉnh táo, nhận thức quy luật',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Góc nhìn toàn diện, sâu sắc, có liên hệ thực tiễn sinh động.',
        },
        {
          id: 'ans_hqn_3',
          activityId: 'evidence-challenge',
          activityTitle: 'Thử thách dẫn chứng văn bản',
          activityType: 'evidence',
          timestampIso: new Date(Date.now() - 2100000).toISOString(),
          questionPrompt: 'Nhận định: “Đăm Săn sở hữu ý chí dấn thân phi thường, dám đối diện hiểm nguy vì khát vọng lớn.” Hãy chọn dẫn chứng phù hợp nhất.',
          studentAnswer: 'Dù Đăm Par Kvây cảnh báo đường đến nhà Nữ thần đầy rừng sáp đen chết người, Đăm Săn vẫn kiên quyết lên đường.',
          correctAnswer: 'Dù Đăm Par Kvây cảnh báo đường đến nhà Nữ thần đầy rừng sáp đen chết người, Đăm Săn vẫn kiên quyết lên đường.',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chọn dẫn chứng rất chuẩn xác và tiêu biểu cho nhận định.',
        },
      ],
    },
    {
      studentId: 'hs_ho_thi_thanh_loan_10d3',
      studentName: 'Hồ Thị Thanh Loan',
      className: '10D3',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 6).toISOString(),
      lastActiveIso: new Date(Date.now() - 1200000).toISOString(),
      totalScore: 250,
      museum3DScore: 90,
      arenaBestScore: 120,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'dam-san-journey', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_ghe_kpan', 'hotspot_cau_thang_cai'],
      stemCompletedTasks: ['stem_house_mission', 'stem_padlet_submitted'],
      totalQuestionsAnswered: 4,
      totalQuestionsCorrect: 4,
      detailedAnswers: [
        {
          id: 'ans_httl_1',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Tình huống 1',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 1200000).toISOString(),
          questionPrompt: 'Có ý kiến cho rằng: Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ Thần Mặt Trời để rồi lún sâu trong rừng Sáp Đen. Đó là một sự thất bại vô nghĩa. Em có đồng tình không?',
          studentAnswer: 'Em không đồng tình với ý kiến đó. Sự ra đi của chàng là cái chết bi tráng, thắp lên khát vọng tự do và chinh phục tự nhiên của người anh hùng sử thi.',
          correctAnswer: 'Khát vọng vượt ngưỡng, vẻ đẹp bi tráng và ý chí buôn làng',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Hiểu bài rất sâu sắc, văn phong lưu loát và giàu cảm xúc.',
        },
        {
          id: 'ans_httl_2',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 2400000).toISOString(),
          questionPrompt: 'Đặc trưng nổi bật nhất của không gian nhà dài Ê-đê phản ánh chế độ xã hội nào?',
          studentAnswer: 'Chế độ mẫu hệ',
          correctAnswer: 'Chế độ mẫu hệ',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chính xác! Nhà dài phát triển nối dài qua các thế hệ dòng họ mẹ.',
        },
      ],
    },
    {
      studentId: 'hs_nguyen_hoang_nam_10d3',
      studentName: 'Nguyễn Hoàng Nam',
      className: '10D3',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 4).toISOString(),
      lastActiveIso: new Date(Date.now() - 1800000).toISOString(),
      totalScore: 220,
      museum3DScore: 75,
      arenaBestScore: 105,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_ghe_kpan'],
      stemCompletedTasks: ['stem_house_mission'],
      totalQuestionsAnswered: 4,
      totalQuestionsCorrect: 4,
      detailedAnswers: [
        {
          id: 'ans_nhn_1',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Tình huống 2',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 1800000).toISOString(),
          questionPrompt: 'Từ câu chuyện Đăm Săn đi bắt nữ thần Mặt Trời, em sẽ lựa chọn: dám vượt qua giới hạn hay nhận thức đúng giới hạn bản thân?',
          studentAnswer: 'Em lựa chọn dám vượt qua giới hạn nhưng luôn có sự chuẩn bị chu đáo để giảm thiểu rủi ro.',
          correctAnswer: 'Dung hòa giữa dũng khí dấn thân và sự tỉnh táo, nhận thức quy luật tự nhiên',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Quan điểm rõ ràng, có tư duy thực tế và tinh thần tiến thủ.',
        },
        {
          id: 'ans_nhn_2',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 2500000).toISOString(),
          questionPrompt: 'Đặc trưng kiến trúc nào của nhà dài thể hiện rõ nhất quyền lực người phụ nữ trong gia đình?',
          studentAnswer: 'Cầu thang cái có khắc đôi bầu sữa mẹ và vành trăng khuyết',
          correctAnswer: 'Cầu thang cái có khắc đôi bầu sữa mẹ và vành trăng khuyết',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Rất chính xác!',
        },
      ],
    },
    {
      studentId: 'hs_tran_thi_mai_anh_10van',
      studentName: 'Trần Thị Mai Anh',
      className: '10 Văn',
      school: 'THPT Chuyên Nguyễn Du',
      firstJoinedIso: new Date(Date.now() - 3600000 * 3).toISOString(),
      lastActiveIso: new Date(Date.now() - 1800000).toISOString(),
      totalScore: 235,
      museum3DScore: 80,
      arenaBestScore: 115,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_cau_thang_cai'],
      stemCompletedTasks: ['stem_house_mission', 'stem_padlet_submitted'],
      totalQuestionsAnswered: 4,
      totalQuestionsCorrect: 4,
      detailedAnswers: [
        {
          id: 'ans_ma_1',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 2400000).toISOString(),
          questionPrompt: 'Đặc trưng nổi bật nhất của không gian nhà dài Ê-đê phản ánh chế độ xã hội nào?',
          studentAnswer: 'Chế độ mẫu hệ',
          correctAnswer: 'Chế độ mẫu hệ',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chính xác! Nhà dài phát triển theo chiều dài qua các thế hệ con gái.',
        },
        {
          id: 'ans_ma_2',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Tình huống 1',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 1400000).toISOString(),
          questionPrompt: 'Có ý kiến cho rằng: Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ Thần Mặt Trời để rồi lún sâu trong rừng Sáp Đen. Đó là một sự thất bại vô nghĩa. Em có đồng tình không?',
          studentAnswer: 'Em không đồng tình vì đó là sự thất bại anh hùng, khẳng định khát vọng vươn lên tầm vóc vũ trụ của cộng đồng thời đại sử thi.',
          correctAnswer: 'Khát vọng vượt ngưỡng, vẻ đẹp bi tráng và ý chí buôn làng',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Lập luận sắc bén, lập trường vững vàng và thể hiện tư duy phản biện văn học rất tốt!',
        },
      ],
    },
    {
      studentId: 'hs_than_phuong_nhac_10d7',
      studentName: 'Thân Phương Nhac',
      className: '10D7',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 4).toISOString(),
      lastActiveIso: new Date(Date.now() - 2000000).toISOString(),
      totalScore: 205,
      museum3DScore: 70,
      arenaBestScore: 95,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'museum-3d', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua'],
      stemCompletedTasks: ['stem_house_mission'],
      totalQuestionsAnswered: 3,
      totalQuestionsCorrect: 3,
      detailedAnswers: [
        {
          id: 'ans_tpn_1',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 2000000).toISOString(),
          questionPrompt: 'Đặc trưng nổi bật nhất của không gian nhà dài Ê-đê phản ánh chế độ xã hội nào?',
          studentAnswer: 'Chế độ mẫu hệ',
          correctAnswer: 'Chế độ mẫu hệ',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chính xác!',
        },
      ],
    },
    {
      studentId: 'hs_bao_an_10d7',
      studentName: 'Bảo an',
      className: '10D7',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 5).toISOString(),
      lastActiveIso: new Date(Date.now() - 2100000).toISOString(),
      totalScore: 190,
      museum3DScore: 65,
      arenaBestScore: 85,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'museum-3d', 'hero-arena'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_cau_thang_cai'],
      stemCompletedTasks: ['stem_house_mission'],
      totalQuestionsAnswered: 3,
      totalQuestionsCorrect: 3,
      detailedAnswers: [
        {
          id: 'ans_ba_1',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 2100000).toISOString(),
          questionPrompt: 'Đặc trưng nổi bật nhất của không gian nhà dài Ê-đê phản ánh chế độ xã hội nào?',
          studentAnswer: 'Chế độ mẫu hệ',
          correctAnswer: 'Chế độ mẫu hệ',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chính xác!',
        },
      ],
    },
    {
      studentId: 'hs_hoc_sinh_trai_nghiem_10d3',
      studentName: 'Học sinh trải nghiệm',
      className: '10D3',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 6).toISOString(),
      lastActiveIso: new Date(Date.now() - 3000000).toISOString(),
      totalScore: 180,
      museum3DScore: 60,
      arenaBestScore: 80,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'museum-3d', 'hero-arena'],
      completedHotspots: ['hotspot_cot_chu'],
      stemCompletedTasks: [],
      totalQuestionsAnswered: 2,
      totalQuestionsCorrect: 2,
      detailedAnswers: [
        {
          id: 'ans_tn_1',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 3000000).toISOString(),
          questionPrompt: 'Đặc trưng nổi bật nhất của không gian nhà dài Ê-đê phản ánh chế độ xã hội nào?',
          studentAnswer: 'Chế độ mẫu hệ',
          correctAnswer: 'Chế độ mẫu hệ',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chính xác!',
        },
      ],
    },
    {
      studentId: 'hs_nguyen_khanh_dan_19d3',
      studentName: 'Nguyễn Khánh Đan',
      className: '19D3',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 4).toISOString(),
      lastActiveIso: new Date(Date.now() - 1100000).toISOString(),
      totalScore: 230,
      museum3DScore: 80,
      arenaBestScore: 110,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_ghe_kpan'],
      stemCompletedTasks: ['stem_house_mission', 'stem_padlet_submitted'],
      totalQuestionsAnswered: 4,
      totalQuestionsCorrect: 4,
      detailedAnswers: [
        {
          id: 'ans_nkd_1',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Tình huống 1',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 1100000).toISOString(),
          questionPrompt: 'Có ý kiến cho rằng: Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ Thần Mặt Trời để rồi lún sâu trong rừng Sáp Đen. Đó là một sự thất bại vô nghĩa. Em có đồng tình không?',
          studentAnswer: 'Em không đồng tình với ý kiến đó. Sự ra đi của Đăm Săn mang tầm vóc bi tráng, thể hiện ý chí quật cường của cộng đồng.',
          correctAnswer: 'Khát vọng vượt ngưỡng, vẻ đẹp bi tráng và ý chí buôn làng',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Nhận thức bài học rất tốt!',
        },
        {
          id: 'ans_nkd_2',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 2200000).toISOString(),
          questionPrompt: 'Đặc trưng nổi bật nhất của không gian nhà dài Ê-đê phản ánh chế độ xã hội nào?',
          studentAnswer: 'Chế độ mẫu hệ',
          correctAnswer: 'Chế độ mẫu hệ',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chính xác!',
        },
      ],
    },
    {
      studentId: 'hs_vu_gia_huy_10d3',
      studentName: 'Vũ Gia Huy',
      className: '10D3',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 2).toISOString(),
      lastActiveIso: new Date(Date.now() - 600000).toISOString(),
      totalScore: 245,
      museum3DScore: 85,
      arenaBestScore: 120,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'dam-san-journey', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_ghe_kpan', 'hotspot_cau_thang_cai'],
      stemCompletedTasks: ['stem_house_mission', 'stem_padlet_submitted'],
      totalQuestionsAnswered: 5,
      totalQuestionsCorrect: 5,
      detailedAnswers: [
        {
          id: 'ans_1',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Câu hỏi 1',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 900000).toISOString(),
          questionPrompt: 'Có ý kiến cho rằng: Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ Thần Mặt Trời để rồi lún sâu trong rừng Sáp Đen. Đó là một sự thất bại vô nghĩa. Em có đồng tình với ý kiến đó không? Hãy viết quan điểm của em (khoảng 3 - 5 câu) lí giải giá trị biểu tượng của lựa chọn ấy.',
          studentAnswer: 'Em không đồng tình với ý kiến cho rằng đó là thất bại vô nghĩa. Hành động của Đăm Săn biểu tượng cho khát vọng chinh phục những đỉnh cao tự nhiên và vượt qua mọi giới hạn của con người Tây Nguyên thời cổ đại. Dù ngã xuống trong rừng Sáp Đen, cái chết ấy mang tầm vóc bi tráng, khẳng định ý chí kiên định và tinh thần dấn thân bất diệt.',
          correctAnswer: 'Khát vọng vượt ngưỡng, vẻ đẹp bi tráng và ý chí cộng đồng',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Lập luận sắc bén, hiểu sâu sắc giá trị biểu tượng bi tráng của sử thi Ê-đê!',
        },
        {
          id: 'ans_2',
          activityId: 'epic-dialogue',
          activityTitle: 'Đối thoại sử thi · Câu hỏi 2',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 1500000).toISOString(),
          questionPrompt: 'Từ câu chuyện Đăm Săn đi bắt nữ thần Mặt Trời, em sẽ lựa chọn: dám vượt qua giới hạn để chinh phục những đỉnh cao mới hay nhận thức đúng giới hạn của bản thân để lựa chọn những mục tiêu phù hợp?',
          studentAnswer: 'Em lựa chọn dung hòa cả hai bài học: thế hệ trẻ hôm nay cần lòng quả cảm, dám vượt qua vùng an toàn để vươn tới khát vọng đổi mới, nhưng đồng thời phải có trí tuệ tỉnh táo để lượng định thực tế và xây dựng phương pháp chinh phục bền vững.',
          correctAnswer: 'Dung hòa giữa dũng khí dấn thân và sự tỉnh táo, nhận thức quy luật tự nhiên',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Góc nhìn toàn diện, tư duy phản biện tốt và liên hệ thực tiễn thiết thực.',
        },
        {
          id: 'ans_3',
          activityId: 'evidence-challenge',
          activityTitle: 'Thử thách dẫn chứng văn bản',
          activityType: 'evidence',
          timestampIso: new Date(Date.now() - 2100000).toISOString(),
          questionPrompt: 'Nhận định: “Đăm Săn sở hữu ý chí dấn thân phi thường, dám đối diện hiểm nguy vì khát vọng lớn.” Hãy chọn dẫn chứng phù hợp nhất.',
          studentAnswer: 'Dù Đăm Par Kvây cảnh báo đường đến nhà Nữ thần đầy rừng sáp đen chết người, Đăm Săn vẫn kiên quyết lên đường.',
          correctAnswer: 'Dù Đăm Par Kvây cảnh báo đường đến nhà Nữ thần đầy rừng sáp đen chết người, Đăm Săn vẫn kiên quyết lên đường.',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Dẫn chứng xác đáng, tiêu biểu nhất cho nhận định.',
        },
      ],
    },
    {
      studentId: 'hs_do_ngoc_minh_chau_10d7',
      studentName: 'Đỗ Ngọc Minh Châu',
      className: '10D7',
      school: 'THPT Trần Nguyên Hãn',
      firstJoinedIso: new Date(Date.now() - 3600000 * 3).toISOString(),
      lastActiveIso: new Date(Date.now() - 1800000).toISOString(),
      totalScore: 210,
      museum3DScore: 70,
      arenaBestScore: 100,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'hero-arena', 'stem-studio'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_cau_thang_cai'],
      stemCompletedTasks: ['stem_house_mission'],
      totalQuestionsAnswered: 4,
      totalQuestionsCorrect: 4,
      detailedAnswers: [
        {
          id: 'ans_mc_1',
          activityId: 'decode',
          activityTitle: 'Giải mã sử thi',
          activityType: 'quiz',
          timestampIso: new Date(Date.now() - 2400000).toISOString(),
          questionPrompt: 'Đặc trưng nổi bật nhất của không gian nhà dài Ê-đê phản ánh chế độ xã hội nào?',
          studentAnswer: 'Chế độ mẫu hệ',
          correctAnswer: 'Chế độ mẫu hệ',
          isCorrect: true,
          scoreAwarded: 10,
          maxScore: 10,
          teacherOrAiFeedback: 'Chính xác! Nhà dài phát triển nối dài qua các thế hệ dòng họ mẹ.',
        },
      ],
    },
  ];
}
