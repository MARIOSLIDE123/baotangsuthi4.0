import { ExplorerPassportState } from '../types/museum';
import {
  getMergedConceptCards,
  getMergedVietnamDossiers,
  getMergedWorldDossiers,
} from './curriculumStorageService';
import { SUN_GODDESS_STATIONS } from '../data/damSanJourneyData';
import { CORE_SEVEN_WINGS } from '../data/navigation';

export interface AiGuideTurn {
  role: 'user' | 'model';
  text: string;
}

export interface AiQuotaStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetInSeconds: number;
}

export interface AiGuideResult {
  ok: boolean;
  configured: boolean;
  reply?: string;
  model?: string;
  quota?: AiQuotaStatus;
  error?: string;
}

export function buildApprovedLibraryContext(): string {
  const concepts = getMergedConceptCards()
    .map((c) => `- Khái niệm "${c.title}": ${c.explanation}`)
    .join('\n');

  const vnWorks = getMergedVietnamDossiers()
    .map(
      (d) =>
        `- ${d.title} (${d.culturalCommunity}): ${d.plotSummary} | Nghệ thuật: ${d.artisticFeatures.join('; ')}`
    )
    .join('\n');

  const worldWorks = getMergedWorldDossiers()
    .map(
      (d) =>
        `- ${d.title} (${d.culturalCommunity}): ${d.plotSummary} | Nghệ thuật: ${d.artisticFeatures.join('; ')}`
    )
    .join('\n');

  const damSanJourney = SUN_GODDESS_STATIONS.map(
    (s) => `- ${s.title}: ${s.studySummary} (${s.verbatimReferenceNote})`
  ).join('\n');

  let teacherVerbatim = '';
  try {
    teacherVerbatim = (localStorage.getItem('suthiso_damsan_teacher_source_v1') || '').trim();
  } catch {
    teacherVerbatim = '';
  }

  return [
    '[KHÁI NIỆM THỂ LOẠI ĐÃ DUYỆT]',
    concepts,
    '[SỬ THI VIỆT NAM ĐÃ DUYỆT]',
    vnWorks,
    '[SỬ THI THẾ GIỚI ĐÃ DUYỆT]',
    worldWorks,
    '[MẠCH ĐỌC HIỂU ĐĂM SĂN ĐI BẮT NỮ THẦN MẶT TRỜI]',
    damSanJourney,
    teacherVerbatim
      ? `[VĂN BẢN NGUỒN NGUYÊN VĂN DO GIÁO VIÊN NẠP]\n${teacherVerbatim.slice(0, 2500)}`
      : '[VĂN BẢN NGUỒN NGUYÊN VĂN]: Chưa có bản trích nguyên văn do giáo viên nạp thêm; không tự bịa hoặc tự xác nhận nguyên văn từng chữ.',
    '[LƯU Ý MÔ PHỎNG NGHỆ THUẬT]: Nhà dài Ê-đê 3D và Bản đồ 3D Con đường đến Nữ thần Mặt Trời là mô hình mô phỏng nghệ thuật phục vụ giáo dục, không khẳng định là bản phục dựng khảo cổ chính xác tuyệt đối.',
  ].join('\n');
}

export function buildStudentProgressContext(passport?: ExplorerPassportState): string {
  if (!passport) return '';
  const pendingWings = CORE_SEVEN_WINGS.filter((w) => {
    if (w.id === 'museum-3d') return passport.completed3DHotspots.length < 3;
    if (w.id === 'dam-san-journey') return passport.completedMilestones.length < 4;
    if (w.id === 'hero-arena') return passport.arenaAttempts === 0;
    return !passport.visitedZones.includes(w.id);
  }).map((w) => w.title);

  return [
    `Học sinh: ${passport.studentName} (${passport.className})`,
    `Số phân khu đã ghé: ${passport.visitedZones.length}/11`,
    `Bảo tàng Nhà dài 3D: ${passport.completed3DHotspots.length}/8 hiện vật (${passport.museum3DScore} điểm)`,
    `Hành trình Con đường đến Nữ thần Mặt Trời: ${passport.completedMilestones.length}/4 trạm hoàn thành`,
    `Đấu trường anh hùng ca: ${passport.arenaAttempts} lượt thi, điểm cao nhất ${passport.arenaBestScore}`,
    `Nhiệm vụ tiếp theo gợi ý: ${pendingWings[0] || 'Ôn tập tổng hợp và hoàn thiện sản phẩm STEM'}`,
  ].join('\n');
}

export async function fetchAiQuota(): Promise<AiQuotaStatus | null> {
  try {
    const res = await fetch('/api/ai/quota');
    if (!res.ok) return null;
    return (await res.json()) as AiQuotaStatus;
  } catch {
    return null;
  }
}

export async function askAiGuide(params: {
  mode?: 'chat' | 'evidence-check';
  message: string;
  topic?: string;
  claim?: string;
  evidence?: string;
  studentContext?: string;
  approvedLibraryContext?: string;
  history?: AiGuideTurn[];
}): Promise<AiGuideResult> {
  try {
    const response = await fetch('/api/ai/guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = (await response.json()) as {
      configured?: boolean;
      reply?: string;
      model?: string;
      quota?: AiQuotaStatus;
      error?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        configured: data.configured ?? false,
        quota: data.quota,
        error: data.error || 'Không thể kết nối tới trợ lý AI trên máy chủ.',
      };
    }

    return {
      ok: true,
      configured: true,
      reply: data.reply,
      model: data.model,
      quota: data.quota,
    };
  } catch {
    return {
      ok: false,
      configured: false,
      error: 'Không thể liên hệ máy chủ backend. Vui lòng kiểm tra kết nối.',
    };
  }
}

export interface CompassEvalPayload {
  claimStatement: string;
  stationTitle: string;
  selectedDetails: Array<{
    label: string;
    isRelevant: boolean;
    isDistractor?: boolean;
    distractorReason?: string;
  }>;
  evidenceQuote: string;
  explanation: string;
  teacherSourceText?: string;
}

export async function evaluateEpicCompass(
  payload: CompassEvalPayload
): Promise<{
  ok: boolean;
  data?: import('../types/museum').CompassEvaluationResult;
  error?: string;
}> {
  try {
    const response = await fetch('/api/ai/evaluate-compass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as
      | (import('../types/museum').CompassEvaluationResult & { error?: string })
      | { error?: string };

    if (!response.ok || !('evidenceExistence' in data)) {
      return {
        ok: false,
        error: data.error || 'Không thể chấm bài Chiếc La Bàn Sử Thi lúc này.',
      };
    }

    return {
      ok: true,
      data,
    };
  } catch {
    return {
      ok: false,
      error: 'Không thể kết nối máy chủ đánh giá. Vui lòng thử lại.',
    };
  }
}

export interface ArenaOpenEvalPayload {
  modeType: 'evidence' | 'dialogue' | 'dialogue-hint';
  promptTitle: string;
  situationOrClaim: string;
  selectedEvidenceCorrect?: boolean;
  selectedEvidenceText?: string;
  studentResponse: string;
  coreDimensions: string[];
}

export async function evaluateArenaOpenResponse(
  payload: ArenaOpenEvalPayload
): Promise<{
  ok: boolean;
  data?: import('../types/museum').ArenaOpenEvalResult;
  error?: string;
}> {
  try {
    const response = await fetch('/api/ai/evaluate-arena-open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as
      | (import('../types/museum').ArenaOpenEvalResult & { error?: string })
      | { error?: string };

    if (!response.ok || !('reflectionAngles' in data)) {
      return {
        ok: false,
        error: data.error || 'Không thể đánh giá câu trả lời lúc này.',
      };
    }

    return {
      ok: true,
      data,
    };
  } catch {
    return {
      ok: false,
      error: 'Không thể kết nối máy chủ backend. Vui lòng thử lại.',
    };
  }
}
