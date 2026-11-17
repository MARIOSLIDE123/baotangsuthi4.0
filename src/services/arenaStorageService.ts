import { ArenaAttemptRecord, ArenaBadgeStatus } from '../types/museum';
import { playCorrectSound, playWrongSound } from './ambientAudioService';

const ARENA_ATTEMPTS_KEY = 'suthiso_arena_attempts_v1';
const GAME_ATTEMPTS_COUNT_KEY = 'suthiso_game_attempts_count_v2';

export const MAX_ATTEMPTS_PER_GAME = 2; // Mỗi học sinh chỉ được làm 1 lần và thử lại 1 lần (tổng 2 lần)

/**
 * Đếm số lượt đã thi đấu của học sinh cho 1 trò chơi cụ thể (tối đa 2 lượt)
 */
export function getGameAttemptRecordCount(studentName: string, gameId: string): number {
  try {
    const raw = localStorage.getItem(GAME_ATTEMPTS_COUNT_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw);
    const key = `${studentName.trim().toLowerCase()}_${gameId}`;
    return typeof map[key] === 'number' ? map[key] : 0;
  } catch {
    return 0;
  }
}

/**
 * Tăng số lượt đã thi đấu của học sinh
 */
export function incrementGameAttemptCount(studentName: string, gameId: string): number {
  try {
    const raw = localStorage.getItem(GAME_ATTEMPTS_COUNT_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = `${studentName.trim().toLowerCase()}_${gameId}`;
    const nextCount = (map[key] || 0) + 1;
    map[key] = nextCount;
    localStorage.setItem(GAME_ATTEMPTS_COUNT_KEY, JSON.stringify(map));
    return nextCount;
  } catch {
    return 1;
  }
}

/**
 * Kiểm tra hạn mức thi đấu: cho phép làm 1 lần chính thức và thử lại 1 lần
 */
export function checkStudentGameAttemptQuota(studentName: string, gameId: string): {
  canPlay: boolean;
  attemptNumber: number; // 1 = Lần đầu, 2 = Thử lại
  attemptsCount: number;
  maxAttempts: number;
  isRetry: boolean;
  message?: string;
} {
  const count = getGameAttemptRecordCount(studentName, gameId);
  const maxAttempts = MAX_ATTEMPTS_PER_GAME;
  if (count >= maxAttempts) {
    return {
      canPlay: false,
      attemptNumber: count,
      attemptsCount: count,
      maxAttempts,
      isRetry: true,
      message: 'Bạn đã hoàn thành tối đa 2/2 lượt làm bài (1 lần làm chính thức + 1 lần thử lại). Kết quả mới nhất đã được lưu!',
    };
  }
  return {
    canPlay: true,
    attemptNumber: count + 1,
    attemptsCount: count,
    maxAttempts,
    isRetry: count === 1,
  };
}

export function loadArenaAttempts(): ArenaAttemptRecord[] {
  try {
    const raw = localStorage.getItem(ARENA_ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ArenaAttemptRecord[]) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu kết quả thi đấu Đấu trường:
 * Luôn cập nhật và lưu kết quả MỚI NHẤT của học sinh đối với từng trò chơi
 */
export function saveArenaAttempt(record: ArenaAttemptRecord): ArenaAttemptRecord[] {
  const existing = loadArenaAttempts();
  // Lọc bỏ bài làm cũ cùng trò chơi của học sinh này để chỉ lưu kết quả mới nhất
  const otherAttempts = existing.filter(
    (a) =>
      !(
        a.gameId === record.gameId &&
        a.studentName.trim().toLowerCase() === record.studentName.trim().toLowerCase()
      )
  );
  const next = [record, ...otherAttempts].slice(0, 60);
  try {
    localStorage.setItem(ARENA_ATTEMPTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore restricted storage errors
  }
  return next;
}

export function clearArenaAttempts(): ArenaAttemptRecord[] {
  try {
    localStorage.removeItem(ARENA_ATTEMPTS_KEY);
  } catch {
    // Ignore
  }
  return [];
}

/**
 * Privacy protection for shared class results:
 * Masks full student names so personal identity is never publicly exposed on leaderboards.
 */
export function maskStudentNameForClassBoard(fullName: string): string {
  const clean = fullName.replace(/\(Chế độ Demo\)/gi, '').trim();
  if (!clean) return 'Học sinh ẩn danh';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0];
    return `${word.charAt(0).toUpperCase()}${'*'.repeat(Math.max(2, word.length - 1))}`;
  }
  return parts
    .map((p) => `${p.charAt(0).toUpperCase()}.`)
    .join(' ');
}

/**
 * Strictly computes the 5 Arena Badges from real completed attempt records.
 * Never auto-grants badges if criteria have not been satisfied.
 */
export function computeArenaBadges(attempts: ArenaAttemptRecord[]): ArenaBadgeStatus[] {
  const qualifiedAccuracy = (a: ArenaAttemptRecord, threshold: number) =>
    a.totalItems > 0 && a.correctCount / a.totalItems >= threshold;

  const hasExplorer = attempts.some((a) => qualifiedAccuracy(a, 0.6));

  const decodeOrTiles80 = attempts.some(
    (a) => (a.gameId === 'decode' || a.gameId === 'mystery-tiles') && qualifiedAccuracy(a, 0.8)
  );

  const hasHeroMatch = attempts.some((a) => a.gameId === 'who-is-hero' && a.correctCount >= 6);
  const hasTimeline = attempts.some((a) => a.gameId === 'timeline' && a.correctCount >= 2);

  const hasResearcher = attempts.some(
    (a) =>
      a.gameId === 'evidence-challenge' &&
      a.breakdown.evidenceBonus + a.breakdown.analysisBonus >= 35
  );

  const distinctGamesCompleted = new Set(
    attempts.filter((a) => a.correctCount > 0 || a.breakdown.analysisBonus > 0).map((a) => a.gameId)
  );
  const hasDialogue = attempts.some(
    (a) => a.gameId === 'epic-dialogue' && a.breakdown.analysisBonus >= 12
  );

  return [
    {
      id: 'badge-explorer',
      title: 'Nhà thám hiểm đại ngàn',
      criteria: 'Hoàn thành trọn vẹn ít nhất 1 trò chơi bất kì với tỉ lệ đúng từ 60% trở lên.',
      earned: hasExplorer,
      progressLabel: hasExplorer ? 'Đã đạt' : '0/1 lượt ≥ 60%',
    },
    {
      id: 'badge-decoder',
      title: 'Người giải mã sử thi',
      criteria: 'Đạt từ 80% số câu đúng trở lên ở Giải mã sử thi hoặc Mảnh ghép bí ẩn.',
      earned: decodeOrTiles80,
      progressLabel: decodeOrTiles80 ? 'Đã đạt' : 'Chưa đạt ≥ 80%',
    },
    {
      id: 'badge-warrior',
      title: 'Chiến binh trí tuệ',
      criteria: 'Hoàn thành cả Ai là anh hùng? (≥ 6 cặp đúng) và Dòng thời gian sử thi (≥ 2 chuỗi đúng).',
      earned: hasHeroMatch && hasTimeline,
      progressLabel: `${(hasHeroMatch ? 1 : 0) + (hasTimeline ? 1 : 0)}/2 trò chơi`,
    },
    {
      id: 'badge-researcher',
      title: 'Nhà nghiên cứu sử thi',
      criteria: 'Đạt từ 35 điểm Dẫn chứng + Phân tích trở lên trong Thử thách dẫn chứng.',
      earned: hasResearcher,
      progressLabel: hasResearcher ? 'Đã đạt' : 'Cần ≥ 35đ phân tích & dẫn chứng',
    },
    {
      id: 'badge-messenger',
      title: 'Sứ giả di sản',
      criteria: 'Chinh phục ít nhất 4/7 trò chơi khác nhau và có lượt phân tích đạt tại Đối thoại sử thi.',
      earned: distinctGamesCompleted.size >= 4 && hasDialogue,
      progressLabel: `${distinctGamesCompleted.size}/4 trò chơi`,
    },
  ];
}

export function playArenaChime(kind: 'correct' | 'wrong' | 'victory') {
  if (kind === 'correct' || kind === 'victory') {
    playCorrectSound();
  } else {
    playWrongSound();
  }
}
