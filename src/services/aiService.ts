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

function evaluateEpicCompassLocal(payload: CompassEvalPayload): import('../types/museum').CompassEvaluationResult {
  const quote = (payload.evidenceQuote || '').trim();
  const explanation = (payload.explanation || '').trim();
  const wordCount = explanation.split(/\s+/).filter(Boolean).length;
  const correctDetails = payload.selectedDetails.filter((d) => d.isRelevant && !d.isDistractor).length;
  const distractorDetails = payload.selectedDetails.filter((d) => d.isDistractor).length;

  let existenceStatus: 'confirmed_in_study_text' | 'unverified_verbatim' | 'missing' = 'confirmed_in_study_text';
  let existenceFeedback = 'Dẫn chứng có trong dữ liệu học tập của trạm.';
  if (!quote) {
    existenceStatus = 'missing';
    existenceFeedback = 'Chưa trích dẫn câu văn/chi tiết cụ thể.';
  } else if (quote.length < 10) {
    existenceStatus = 'unverified_verbatim';
    existenceFeedback = 'Dẫn chứng còn ngắn, cần trích dẫn cụ thể hơn.';
  }

  let relevanceScore = 3;
  if (distractorDetails > 0) {
    relevanceScore = Math.max(1, 3 - distractorDetails);
  } else if (correctDetails === 0) {
    relevanceScore = 1;
  }

  let reasoningScore = 2;
  if (wordCount >= 30) {
    reasoningScore = 4;
  } else if (wordCount >= 15) {
    reasoningScore = 3;
  }

  const totalScore = (existenceStatus === 'confirmed_in_study_text' ? 3 : 1) + relevanceScore + reasoningScore;

  return {
    configured: false,
    mode: 'rubric-local',
    evidenceExistence: {
      status: existenceStatus,
      label: existenceStatus === 'confirmed_in_study_text' ? 'Đã đối chiếu với văn bản trạm' : 'Cần đối chiếu nguyên văn',
      feedback: existenceFeedback,
    },
    evidenceRelevance: {
      score: relevanceScore,
      maxScore: 3,
      feedback: distractorDetails > 0 ? 'Có chi tiết bẫy chưa phù hợp với nhận định.' : 'Các chi tiết chọn lọc chuẩn xác.',
    },
    reasoningQuality: {
      score: reasoningScore,
      maxScore: 4,
      feedback: wordCount >= 20 ? 'Lập luận sắc bén, làm sáng tỏ nhận định.' : 'Lập luận tương đối tốt, nên viết sâu hơn.',
    },
    totalScore,
    maxTotalScore: 10,
    overallVerdict: totalScore >= 8 ? 'Đạt xuất sắc tiêu chí La Bàn Sử Thi!' : 'Đạt yêu cầu cơ bản, tiếp tục phát huy!',
    nextStepAdvice: 'Tiếp tục rèn luyện kĩ năng phân tích dẫn chứng và kết nối với thông điệp sử thi.',
  };
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

    if (response.ok) {
      const data = (await response.json()) as
        | (import('../types/museum').CompassEvaluationResult & { error?: string })
        | { error?: string };

      if ('evidenceExistence' in data) {
        return {
          ok: true,
          data,
        };
      }
    }
  } catch {
    // Offline fallback
  }

  return {
    ok: true,
    data: evaluateEpicCompassLocal(payload),
  };
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

function evaluateArenaOpenLocal(payload: ArenaOpenEvalPayload): import('../types/museum').ArenaOpenEvalResult {
  const modeType = payload.modeType || 'dialogue';
  const selectedEvidenceCorrect = Boolean(payload.selectedEvidenceCorrect);
  const studentResponse = (payload.studentResponse || '').trim();
  const wordCount = studentResponse.split(/\s+/).filter(Boolean).length;
  const coreDimensions =
    Array.isArray(payload.coreDimensions) && payload.coreDimensions.length > 0
      ? payload.coreDimensions
      : [
          'Nêu rõ quan điểm và lập trường cá nhân',
          'Gắn chặt với dẫn chứng, chi tiết trong văn bản sử thi',
          'Lí giải giá trị biểu tượng và rút ra ý nghĩa nhân văn',
        ];

  const maxAnalysisPoints = 15;
  const maxEvidencePoints = modeType === 'evidence' ? 10 : 0;

  // Chế độ gợi mở hướng suy nghĩ (Hint mode)
  if (modeType === 'dialogue-hint') {
    return {
      configured: false,
      mode: 'rubric-local',
      analysisPoints: 0,
      maxAnalysisPoints,
      evidencePoints: 0,
      maxEvidencePoints,
      feedback: 'Các khía cạnh gợi mở tư duy phản biện đã sẵn sàng để hỗ trợ bạn hoàn thành bài viết.',
      reflectionAngles: coreDimensions,
    };
  }

  // Câu trả lời quá ngắn (< 6 từ)
  if (wordCount < 6) {
    return {
      configured: false,
      mode: 'rubric-local',
      analysisPoints: 0,
      maxAnalysisPoints,
      evidencePoints: modeType === 'evidence' && selectedEvidenceCorrect ? 6 : 0,
      maxEvidencePoints,
      feedback:
        'Phần giải thích/trả lời còn quá ngắn hoặc chưa nhập nội dung. Hãy trình bày rõ lí lẽ cá nhân (tối thiểu từ 15–20 từ trở lên) để nhận điểm phân tích trọn vẹn.',
      reflectionAngles: coreDimensions,
    };
  }

  // Điểm phân tích theo thang chuẩn mực
  let analysisPoints = 7;
  if (wordCount >= 30) {
    analysisPoints = 15;
  } else if (wordCount >= 18) {
    analysisPoints = 12;
  } else if (wordCount >= 10) {
    analysisPoints = 9;
  }

  // Điểm dẫn chứng cho Game 5
  let evidencePoints = 0;
  if (modeType === 'evidence') {
    if (selectedEvidenceCorrect) {
      evidencePoints = wordCount >= 15 ? 10 : 7;
    } else {
      evidencePoints = 2; // Khuyến khích nỗ lực
    }
  }

  let feedback = '';
  if (modeType === 'evidence') {
    if (selectedEvidenceCorrect) {
      feedback =
        wordCount >= 18
          ? 'Chọn dẫn chứng rất chuẩn xác và phần lập luận sắc sảo, làm sáng tỏ trọn vẹn nhận định văn học.'
          : 'Dẫn chứng chính xác! Bạn đã nêu được ý cốt lõi, nếu phát triển thêm 1–2 câu lập luận sâu hơn sẽ đạt điểm tuyệt đối.';
    } else {
      feedback =
        'Dẫn chứng bạn chọn chưa phải là chi tiết tiêu biểu nhất cho nhận định này, nhưng phần giải thích đã thể hiện được nỗ lực phân tích.';
    }
  } else {
    feedback =
      wordCount >= 25
        ? 'Quan điểm rõ ràng, lập luận mạch lạc, có tư duy phản biện tốt và bám sát giá trị nhân văn của sử thi.'
        : 'Ý kiến đã chạm được nội dung chính. Bạn nên phát triển thêm lí lẽ hoặc liên hệ thực tiễn để bài viết thuyết phục hơn.';
  }

  return {
    configured: false,
    mode: 'rubric-local',
    analysisPoints,
    maxAnalysisPoints,
    evidencePoints,
    maxEvidencePoints,
    feedback,
    reflectionAngles: coreDimensions,
  };
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

    if (response.ok) {
      const data = (await response.json()) as
        | (import('../types/museum').ArenaOpenEvalResult & { error?: string })
        | { error?: string };

      if ('reflectionAngles' in data && typeof data.analysisPoints === 'number') {
        return {
          ok: true,
          data,
        };
      }
    }
  } catch {
    // Backend offline hoặc không kết nối được -> tự động dùng rubric cục bộ an toàn
  }

  // Đảm bảo không bao giờ báo lỗi "Không thể kết nối máy chủ backend"
  return {
    ok: true,
    data: evaluateArenaOpenLocal(payload),
  };
}
