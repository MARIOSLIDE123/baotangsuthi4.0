import {
  ArenaAttemptRecord,
  ExplorerPassportState,
} from '../types/museum';
import { syncToGoogleSheets } from './googleSheetsService';

export const ALL_STUDENTS_RECORDS_KEY = 'suthiso_all_students_records_v2';
export const TEACHER_SESSION_KEY = 'suthiso_teacher_auth_session_v1';

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
 */
export function loadAllStudentsProfiles(): StudentFullLearningProfile[] {
  try {
    const raw = localStorage.getItem(ALL_STUDENTS_RECORDS_KEY);
    if (!raw) return getInitialDemoStudents();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as StudentFullLearningProfile[];
    }
    return getInitialDemoStudents();
  } catch {
    return getInitialDemoStudents();
  }
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
 */
export function recordArenaAttemptToStudentProfile(
  passport: ExplorerPassportState,
  attempt: ArenaAttemptRecord
): void {
  const answerRecords: DetailedAnswerRecord[] = attempt.reviewItems.map((item, idx) => ({
    id: `${attempt.id}_ans_${idx}`,
    activityId: attempt.gameId,
    activityTitle: attempt.gameTitle,
    activityType: attempt.gameId === 'evidence-challenge' ? 'evidence' : attempt.gameId === 'epic-dialogue' ? 'dialogue' : 'quiz',
    timestampIso: attempt.completedAtIso,
    questionPrompt: item.prompt,
    studentAnswer: item.yourAnswer,
    correctAnswer: item.correctAnswer,
    isCorrect: attempt.gameId === 'epic-dialogue' ? item.explanation.includes('Lập luận') || item.yourAnswer.length > 30 : item.yourAnswer === item.correctAnswer,
    scoreAwarded: Math.round(attempt.score / Math.max(1, attempt.reviewItems.length)),
    maxScore: Math.round(attempt.score / Math.max(1, attempt.reviewItems.length)),
    teacherOrAiFeedback: item.explanation,
  }));

  const profiles = loadAllStudentsProfiles();
  const studentKey = generateStudentKey(passport.studentName, passport.className);
  let existingIndex = profiles.findIndex((p) => p.studentId === studentKey);

  const nowIso = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = profiles[existingIndex];
    const combinedAnswers = [...answerRecords, ...existing.detailedAnswers];
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
    syncProfileToGoogleSheet(profiles[existingIndex]);
  } else {
    upsertStudentLearningProfile(passport, answerRecords[0]);
  }
}

/**
 * Đồng bộ dữ liệu chi tiết lên Google Sheet của Cô Loan Hồ
 */
function syncProfileToGoogleSheet(
  profile: StudentFullLearningProfile,
  latestAnswer?: DetailedAnswerRecord
): void {
  const latestAnsText = latestAnswer
    ? `[${latestAnswer.activityTitle}] Câu hỏi: ${latestAnswer.questionPrompt.slice(0, 80)}... | HS chọn: ${latestAnswer.studentAnswer.slice(0, 100)}`
    : profile.detailedAnswers.length > 0
      ? `Đã làm ${profile.detailedAnswers.length} câu hỏi. Gần nhất: ${profile.detailedAnswers[0].questionPrompt.slice(0, 60)}`
      : 'Tham quan & học tập';

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
  }).catch(() => {});
}

/**
 * Dữ liệu mẫu chuẩn mực ban đầu để giáo viên xem trực quan
 */
function getInitialDemoStudents(): StudentFullLearningProfile[] {
  return [
    {
      studentId: 'hs_nguyen_hoang_nam_10a1',
      studentName: 'Nguyễn Hoàng Nam',
      className: '10A1',
      school: 'THPT Buôn Ma Thuột',
      firstJoinedIso: new Date(Date.now() - 3600000 * 2).toISOString(),
      lastActiveIso: new Date(Date.now() - 600000).toISOString(),
      totalScore: 235,
      museum3DScore: 80,
      arenaBestScore: 115,
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
          activityTitle: 'Đối thoại sử thi · Tình huống 1',
          activityType: 'dialogue',
          timestampIso: new Date(Date.now() - 900000).toISOString(),
          questionPrompt: 'Có ý kiến cho rằng: Đăm Săn cố chấp không nghe lời khuyên của Đăm Par Kvây và Nữ Thần Mặt Trời để rồi lún sâu trong rừng Sáp Đen. Đó là một sự thất bại vô nghĩa. Em có đồng tình với ý kiến đó không?',
          studentAnswer: 'Em hoàn toàn không đồng tình với ý kiến trên. Sự ra đi của Đăm Săn không phải là thất bại vô nghĩa mà là biểu tượng sáng ngời cho khát vọng vượt qua giới hạn của con người Tây Nguyên để chạm tới ánh sáng và cái đẹp tuyệt đối.',
          correctAnswer: 'Khát vọng vượt ngưỡng, vẻ đẹp bi tráng và ý chí buôn làng',
          isCorrect: true,
          scoreAwarded: 15,
          maxScore: 15,
          teacherOrAiFeedback: 'Lập luận sắc bén, lập trường vững vàng và thể hiện tư duy phản biện văn học rất tốt!',
        },
        {
          id: 'ans_2',
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
          id: 'ans_3',
          activityId: 'evidence-challenge',
          activityTitle: 'Thử thách dẫn chứng',
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
      studentId: 'hs_tran_thi_mai_anh_10van',
      studentName: 'Trần Thị Mai Anh',
      className: '10 Văn',
      school: 'THPT Chuyên Nguyễn Du',
      firstJoinedIso: new Date(Date.now() - 3600000 * 3).toISOString(),
      lastActiveIso: new Date(Date.now() - 1800000).toISOString(),
      totalScore: 195,
      museum3DScore: 60,
      arenaBestScore: 95,
      readingScore: 40,
      visitedZones: ['home', 'epic-gate', 'vietnam-epics', 'museum-3d', 'hero-arena'],
      completedHotspots: ['hotspot_cot_chu', 'hotspot_bep_lua', 'hotspot_cau_thang_cai'],
      stemCompletedTasks: ['stem_house_mission'],
      totalQuestionsAnswered: 3,
      totalQuestionsCorrect: 3,
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
      ],
    },
  ];
}
