import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function createApiApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get(['/api/health', '/health'], (_req, res) => {
    res.json({ status: 'ok', service: 'su-thi-so-4-0' });
  });

  app.get(['/api/config/status', '/config/status'], (_req, res) => {
    const geminiConfigured = Boolean(
      process.env.GEMINI_API_KEY?.trim() && process.env.GEMINI_API_KEY.trim() !== 'MY_GEMINI_API_KEY'
    );
    let hasAppletFirebaseConfig = false;
    try {
      const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(cfgPath)) {
        const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as { projectId?: string };
        hasAppletFirebaseConfig = Boolean(
          parsed.projectId && parsed.projectId !== 'remixed-project-id'
        );
      }
    } catch {
      hasAppletFirebaseConfig = false;
    }

    const firebaseConfigured = Boolean(
      hasAppletFirebaseConfig ||
        process.env.FIREBASE_PROJECT_ID?.trim() ||
        process.env.VITE_FIREBASE_PROJECT_ID?.trim()
    );
    const legacyBoardUrl = process.env.PADLET_BOARD_URL?.trim() || null;
    const houseEmbedUrl = process.env.PADLET_HOUSE_EMBED_URL?.trim() || null;
    const journeyEmbedUrl = process.env.PADLET_JOURNEY_EMBED_URL?.trim() || null;
    const padletConfigured = Boolean(houseEmbedUrl || journeyEmbedUrl || legacyBoardUrl);

    res.json({
      gemini: {
        configured: geminiConfigured,
        mode: geminiConfigured ? 'live' : 'pending',
        model: 'gemini-4-hydrogen',
      },
      firebase: {
        configured: firebaseConfigured,
        mode: firebaseConfigured ? 'live' : 'demo',
      },
      padlet: {
        configured: padletConfigured,
        url: legacyBoardUrl || houseEmbedUrl || journeyEmbedUrl,
        houseEmbedUrl,
        journeyEmbedUrl,
      },
    });
  });

  // Server-side sliding-window rate limiter for AI learning assistant (20 turns / 15 min per client)
  const AI_RATE_LIMIT_MAX = 20;
  const AI_RATE_WINDOW_MS = 15 * 60 * 1000;
  const aiRateBucket = new Map<string, number[]>();

  function getClientKey(req: express.Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || 'local';
    return ip || 'local';
  }

  function inspectRateLimit(req: express.Request, consume: boolean) {
    const key = getClientKey(req);
    const now = Date.now();
    const recent = (aiRateBucket.get(key) || []).filter((ts) => now - ts < AI_RATE_WINDOW_MS);

    if (!consume) {
      const oldest = recent[0];
      return {
        allowed: recent.length < AI_RATE_LIMIT_MAX,
        remaining: Math.max(0, AI_RATE_LIMIT_MAX - recent.length),
        limit: AI_RATE_LIMIT_MAX,
        resetInSeconds: oldest ? Math.max(1, Math.ceil((oldest + AI_RATE_WINDOW_MS - now) / 1000)) : 0,
      };
    }

    if (recent.length >= AI_RATE_LIMIT_MAX) {
      aiRateBucket.set(key, recent);
      const oldest = recent[0];
      return {
        allowed: false,
        remaining: 0,
        limit: AI_RATE_LIMIT_MAX,
        resetInSeconds: oldest ? Math.max(1, Math.ceil((oldest + AI_RATE_WINDOW_MS - now) / 1000)) : 60,
      };
    }

    recent.push(now);
    aiRateBucket.set(key, recent);
    const oldest = recent[0];
    return {
      allowed: true,
      remaining: Math.max(0, AI_RATE_LIMIT_MAX - recent.length),
      limit: AI_RATE_LIMIT_MAX,
      resetInSeconds: oldest ? Math.max(1, Math.ceil((oldest + AI_RATE_WINDOW_MS - now) / 1000)) : 0,
    };
  }

  app.get(['/api/ai/quota', '/ai/quota'], (req, res) => {
    const quota = inspectRateLimit(req, false);
    res.json(quota);
  });

  app.post(['/api/ai/guide', '/ai/guide'], async (req, res) => {
    const {
      mode = 'chat',
      message,
      topic,
      claim,
      evidence,
      studentContext,
      approvedLibraryContext,
      history,
    } = req.body as {
      mode?: 'chat' | 'evidence-check';
      message?: string;
      topic?: string;
      claim?: string;
      evidence?: string;
      studentContext?: string;
      approvedLibraryContext?: string;
      history?: Array<{ role: 'user' | 'model'; text: string }>;
    };

    const effectiveMessage =
      mode === 'evidence-check'
        ? `Nhận định cần kiểm tra: "${(claim || '').trim()}"\nDẫn chứng học sinh đưa ra: "${(evidence || '').trim()}"${message?.trim() ? `\nGhi chú thêm của học sinh: ${message.trim()}` : ''}`
        : (message || '').trim();

    if (!effectiveMessage) {
      res.status(400).json({ error: 'Vui lòng nhập câu hỏi hoặc nhận định và dẫn chứng cần trao đổi.' });
      return;
    }

    if (mode === 'evidence-check' && (!(claim || '').trim() || !(evidence || '').trim())) {
      res.status(400).json({
        error: 'Vui lòng nhập đầy đủ cả Nhận định và Dẫn chứng để Sứ Giả Đại Ngàn kiểm tra.',
      });
      return;
    }

    const quota = inspectRateLimit(req, true);
    if (!quota.allowed) {
      res.status(429).json({
        configured: Boolean(getGeminiClient()),
        quota,
        error: `Bạn đã dùng hết ${quota.limit} lượt hỏi trong phiên 15 phút để bảo đảm nhịp tự suy nghĩ. Vui lòng đọc lại văn bản và thử lại sau ${Math.ceil(quota.resetInSeconds / 60)} phút.`,
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        configured: false,
        quota,
        error:
          'Dịch vụ Gemini API chưa được cấu hình khóa truy cập trên máy chủ. Hiện đang ở chế độ chờ cấu hình.',
      });
      return;
    }

    try {
      const baseRules = [
        'Bạn là "SỨ GIẢ ĐẠI NGÀN – TRỢ LÝ KHÁM PHÁ SỬ THI", nhân vật đồng hành học tập dành cho học sinh lớp 10 trong Bảo tàng Sử thi Xuyên Không (Sử Thi Số 4.0).',
        '',
        'QUY TẮC SƯ PHẠM BẮT BUỘC:',
        '1. ĐỐI TƯỢNG & NGÔN NGỮ: Dùng tiếng Việt trong sáng, gần gũi, khích lệ, phù hợp học sinh lớp 10; tránh thuật ngữ quá hàn lâm, khó hiểu.',
        '2. KHÔNG LÀM BÀI THAY HỌC SINH: Khi học sinh hỏi câu hỏi đọc hiểu (ví dụ: "Vì sao Đăm Săn muốn đến gặp Nữ thần Mặt Trời?"), KHÔNG đưa ngay đáp án hoàn chỉnh để chép. Hãy dùng phương pháp gợi mở 2–3 bước (gợi xác định mục tiêu -> tìm chi tiết -> suy ngẫm ý nghĩa), rồi mời học sinh trả lời. Chỉ đào sâu thêm sau khi học sinh đã nêu suy nghĩ ở lượt sau.',
        '3. ƯU TIÊN THƯ VIỆN ĐÃ DUYỆT: Bám sát kho học liệu được giáo viên duyệt bên dưới. Tuyệt đối KHÔNG tự bịa câu trích dẫn nguyên văn từ tác phẩm.',
        '4. TRUNG THỰC KHI CHƯA CHẮC CHẮN: Nếu học sinh trích một câu nguyên văn hoặc hỏi chi tiết bản dịch vùng miền mà không có trong học liệu nguồn bên dưới, phải nói rõ là "chưa đủ dữ liệu văn bản nguồn đối chiếu để xác minh chính xác từng chữ" chứ không đoán bừa.',
        '5. PHÂN BIỆT RÕ VĂN BẢN VÀ MÔ PHỎNG NGHỆ THUẬT: Khi nhắc tới Nhà dài Ê-đê 3D hay Bản đồ 3D Con đường đến Nữ thần Mặt Trời, phải nêu rõ đó là không gian mô phỏng nghệ thuật phục vụ giáo dục, phân biệt rạch ròi với chi tiết trong văn bản sử thi.',
        '6. PHẠM VI HỖ TRỢ (8 chức năng): Khái niệm sử thi, nhân vật, sự kiện, đặc điểm nghệ thuật, gợi ý tìm dẫn chứng, giải thích đoạn văn, so sánh hai nhân vật, và nhắc/hướng dẫn nhiệm vụ học sinh đang thực hiện.',
      ];

      if (mode === 'evidence-check') {
        baseRules.push(
          '',
          'CHẾ ĐỘ HIỆN TẠI: KIỂM TRA DẪN CHỨNG.',
          'Hãy phản hồi mạch lạc theo đúng 4 mục sau:',
          '- **1. Kiểm chứng & Mức độ phù hợp**: Đối chiếu nhận định và dẫn chứng với học liệu giáo viên đã duyệt. Nếu chưa có bản in nguyên văn để đối chiếu từng chữ, hãy nói rõ sự chưa chắc chắn đó (không tự bịa hay xác nhận bừa câu trích).',
          '- **2. Điểm còn thiếu**: Chỉ ra phần chứng minh hoặc liên kết còn khuyết.',
          '- **3. Gợi ý cách diễn đạt**: Gợi hướng viết câu nối dẫn chứng -> nhận định (không viết hộ cả bài văn hoàn chỉnh).',
          '- **4. Câu hỏi gợi mở tiếp**: Đặt 1 câu hỏi nhỏ để học sinh tự hoàn thiện.'
        );
      }

      const systemInstruction = [
        ...baseRules,
        topic ? `\nChủ đề học sinh đang chọn: ${topic}` : '',
        studentContext ? `\nTiến độ & nhiệm vụ hiện tại của học sinh:\n${studentContext}` : '',
        approvedLibraryContext
          ? `\nTHƯ VIỆN HỌC LIỆU ĐÃ ĐƯỢC GIÁO VIÊN DUYỆT (ưu tiên tham chiếu):\n${approvedLibraryContext}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const recentTurns = Array.isArray(history)
        ? history
            .slice(-8)
            .map(
              (item) =>
                `${item.role === 'user' ? 'Học sinh' : 'Sứ Giả Đại Ngàn'}: ${item.text}`
            )
            .join('\n')
        : '';

      const prompt = recentTurns
        ? `Lịch sử hội thoại trong phiên:\n${recentTurns}\n\nLượt mới của học sinh:\n${effectiveMessage}`
        : effectiveMessage;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({
        configured: true,
        quota,
        reply: response.text || 'Chưa nhận được phản hồi từ trợ lý AI. Vui lòng thử lại.',
        model: 'gemini-4-hydrogen',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi kết nối Gemini API';
      res.status(500).json({
        configured: true,
        quota,
        error: `Không thể xử lý yêu cầu AI lúc này: ${msg}`,
      });
    }
  });

  app.post(['/api/ai/evaluate-compass', '/ai/evaluate-compass'], async (req, res) => {
    const body = req.body as {
      claimStatement?: string;
      stationTitle?: string;
      selectedDetails?: Array<{ label: string; isRelevant: boolean; isDistractor?: boolean; distractorReason?: string }>;
      evidenceQuote?: string;
      explanation?: string;
      teacherSourceText?: string;
    };

    const claimStatement = (body.claimStatement || '').trim();
    const stationTitle = (body.stationTitle || 'Hành trình Đăm Săn').trim();
    const selectedDetails = Array.isArray(body.selectedDetails) ? body.selectedDetails : [];
    const evidenceQuote = (body.evidenceQuote || '').trim();
    const explanation = (body.explanation || '').trim();
    const teacherSourceText = (body.teacherSourceText || '').trim();

    if (!claimStatement) {
      res.status(400).json({ error: 'Thiếu nhận định văn học cần đánh giá.' });
      return;
    }

    const normalize = (txt: string) =>
      txt
        .toLowerCase()
        .replace(/[“”"‘’'`.,;:!?()[\]—–-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const hasSelectedDetails = selectedDetails.length > 0;
    const hasTypedEvidence = evidenceQuote.length >= 10;
    const hasDistractor = selectedDetails.some((d) => d.isDistractor);
    const hasRelevantDetail = selectedDetails.some((d) => d.isRelevant && !d.isDistractor);

    // 1. Missing Evidence Guard (No evidence at all)
    if (!hasSelectedDetails && !hasTypedEvidence) {
      res.json({
        configured: Boolean(getGeminiClient()),
        mode: 'rubric-local',
        evidenceExistence: {
          status: 'missing',
          label: 'Thiếu căn cứ văn bản',
          feedback:
            'Bạn chưa chọn chi tiết văn bản và chưa nhập dẫn chứng. Trong đọc hiểu Ngữ văn, mọi nhận định đều cần căn cứ cụ thể từ tác phẩm.',
        },
        evidenceRelevance: {
          score: 0,
          maxScore: 3,
          feedback: 'Chưa có dẫn chứng để đối chiếu mức độ phù hợp với nhận định.',
        },
        reasoningQuality: {
          score: explanation.length > 20 ? 1 : 0,
          maxScore: 4,
          feedback:
            'Không thể cho điểm phân tích cao khi lập luận thiếu dẫn chứng làm điểm tựa. Hãy bổ sung chi tiết văn bản trước khi lí giải.',
        },
        totalScore: explanation.length > 20 ? 1 : 0,
        maxTotalScore: 10,
        overallVerdict: 'Cần bổ sung căn cứ từ văn bản',
        nextStepAdvice:
          'Bước 1: Chọn ít nhất 1 chi tiết đúng trong văn bản học tập ở phía trên. Bước 2: Nhập dẫn chứng cụ thể rồi mới viết phần giải thích mối liên hệ.',
        verbatimCaution: null,
      });
      return;
    }

    // 2. Check Verbatim Source Verification honestly
    const cleanQuote = normalize(evidenceQuote.replace(/[“”"]/g, ''));
    const cleanTeacherText = normalize(teacherSourceText);
    const matchedTeacherVerbatim =
      Boolean(cleanTeacherText) && cleanQuote.length >= 8 && cleanTeacherText.includes(cleanQuote);

    const looksLikeDirectQuote =
      evidenceQuote.includes('“') ||
      evidenceQuote.includes('"') ||
      evidenceQuote.split(/\s+/).length >= 5;

    let verbatimCaution: string | null = null;
    if (hasTypedEvidence && !matchedTeacherVerbatim && looksLikeDirectQuote) {
      verbatimCaution = teacherSourceText
        ? 'Câu dẫn chứng bạn nhập không khớp nguyên văn với đoạn trích giáo viên đã nạp. Hệ thống không tự xác nhận độ chính xác từng chữ của trích dẫn.'
        : 'Chưa có văn bản nguồn nguyên văn để đối chiếu từng chữ cho câu dẫn chứng bạn nhập. Hệ thống chỉ đánh giá theo chi tiết học liệu đã chọn, không tự xác nhận trích dẫn nguyên văn là chính xác.';
    } else if (!hasTypedEvidence && hasSelectedDetails) {
      verbatimCaution =
        'Bạn mới chọn chi tiết sự kiện tóm tắt; hãy nhập thêm dẫn chứng cụ thể vào ô dẫn chứng để lập luận thuyết phục hơn.';
    }

    // 3. Check whether explanation is superficial/generic
    const wordCount = explanation.split(/\s+/).filter(Boolean).length;
    const isVagueReasoning = wordCount < 18 || !hasTypedEvidence;

    const ai = getGeminiClient();
    if (!ai) {
      const existenceStatus = hasDistractor && !hasRelevantDetail
        ? 'mismatch'
        : matchedTeacherVerbatim || hasRelevantDetail
          ? 'confirmed_in_study_text'
          : 'unverified_verbatim';
      const existenceScore = existenceStatus === 'confirmed_in_study_text' ? 3 : existenceStatus === 'unverified_verbatim' ? 1 : 0;
      const relevanceScore = hasRelevantDetail && !hasDistractor ? (hasTypedEvidence ? 3 : 2) : hasRelevantDetail ? 1 : 0;
      const rawReasonScore = wordCount >= 30 && hasTypedEvidence ? 3 : wordCount >= 14 ? 2 : 1;
      const reasonScore = isVagueReasoning ? Math.min(rawReasonScore, 2) : rawReasonScore;
      const total = Math.min(10, existenceScore + relevanceScore + reasonScore);

      res.json({
        configured: false,
        mode: 'rubric-local',
        evidenceExistence: {
          status: existenceStatus,
          label:
            existenceStatus === 'confirmed_in_study_text'
              ? 'Có cơ sở trong học liệu trạm'
              : existenceStatus === 'mismatch'
                ? 'Chi tiết chọn chưa khớp văn bản'
                : 'Chưa đủ văn bản nguồn đối chiếu nguyên văn',
          feedback:
            existenceStatus === 'confirmed_in_study_text'
              ? 'Chi tiết bạn chọn khớp với mạch sự kiện của đoạn trích trong học liệu.'
              : existenceStatus === 'mismatch'
                ? selectedDetails.find((d) => d.isDistractor)?.distractorReason ||
                  'Chi tiết bạn chọn thuộc hồi khác hoặc không có trong đoạn trích Đăm Săn đi bắt Nữ thần Mặt Trời.'
                : 'Chưa xác nhận được nguyên văn dẫn chứng do chưa có văn bản nguồn đầy đủ.',
        },
        evidenceRelevance: {
          score: relevanceScore,
          maxScore: 3,
          feedback:
            relevanceScore >= 2
              ? 'Chi tiết đã chọn có khả năng làm sáng tỏ nhận định văn học.'
              : 'Cần chọn đúng chi tiết liên quan trực tiếp đến nhận định và bổ sung dẫn chứng cụ thể.',
        },
        reasoningQuality: {
          score: reasonScore,
          maxScore: 4,
          feedback: isVagueReasoning
            ? 'Phần giải thích còn ngắn hoặc còn chung chung (chưa phân tích rõ cơ chế gắn kết từ dẫn chứng sang nhận định), nên chưa thể đạt điểm tối đa.'
            : 'Lập luận có hướng kết nối chi tiết với ý nghĩa nhân vật. Hãy đối chiếu thêm đánh giá của Gemini khi máy chủ AI sẵn sàng.',
        },
        totalScore: total,
        maxTotalScore: 10,
        overallVerdict:
          total >= 8
            ? 'Đạt tốt theo rubric cơ bản (Chế độ chấm cục bộ)'
            : total >= 5
              ? 'Đạt mức khá — Cần đào sâu phân tích chi tiết'
              : 'Cần củng cố dẫn chứng và lập luận',
        nextStepAdvice:
          'Hãy nêu rõ: (1) Chi tiết ấy cho thấy hành động/lời nói gì của nhân vật? (2) Chi tiết ấy chứng minh phẩm chất hoặc ý nghĩa tư tưởng nào trong nhận định?',
        verbatimCaution,
      });
      return;
    }

    try {
      const systemInstruction = [
        'Bạn là giám khảo Ngữ văn lớp 10 giàu kinh nghiệm, đóng vai trò hỗ trợ chấm Chiếc La Bàn Sử Thi theo rubric 3 thành phần.',
        'NGUYÊN TẮC BẮT BUỘC:',
        '1. KHÔNG ĐƯỢC tự xác nhận một câu trích dẫn nguyên văn của học sinh là chính xác từng chữ nếu matchedTeacherVerbatim=false. Phải ghi rõ là chưa có văn bản nguồn đối chiếu nguyên văn.',
        '2. Nếu học sinh thiếu dẫn chứng cụ thể (hasTypedEvidence=false) hoặc chọn chi tiết gây nhiễu (isDistractor=true), KHÔNG cho điểm tối đa và yêu cầu bổ sung căn cứ.',
        '3. KHÔNG cho điểm phân tích tối đa (reasoningQuality.score phải <= 2/4) nếu học sinh chỉ nhận xét chung chung, lặp lại nhận định hoặc viết sơ sài dưới 20 từ mà không phân tích từ dẫn chứng.',
        '4. Trả về tiếng Việt chuẩn xác, sư phạm, khích lệ nhưng nghiêm túc về học thuật.',
      ].join('\n');

      const evaluationPrompt = JSON.stringify({
        stationTitle,
        claimStatement,
        selectedDetails,
        evidenceQuote: evidenceQuote || '(Học sinh chưa nhập ô dẫn chứng)',
        explanation: explanation || '(Học sinh chưa nhập phần lí giải)',
        hasTypedEvidence,
        matchedTeacherVerbatim,
        teacherSourceProvided: Boolean(teacherSourceText),
        wordCountOfExplanation: wordCount,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Đánh giá bài làm Chiếc La Bàn Sử Thi sau theo rubric 3 thành phần (Tồn tại trong văn bản 0-3đ, Phù hợp với nhận định 0-3đ, Lí giải làm rõ vấn đề 0-4đ):\n${evaluationPrompt}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              existenceScore: { type: Type.INTEGER, description: 'Điểm thành phần 1 từ 0 đến 3' },
              existenceFeedback: { type: Type.STRING },
              relevanceScore: { type: Type.INTEGER, description: 'Điểm thành phần 2 từ 0 đến 3' },
              relevanceFeedback: { type: Type.STRING },
              reasoningScore: { type: Type.INTEGER, description: 'Điểm thành phần 3 từ 0 đến 4' },
              reasoningFeedback: { type: Type.STRING },
              overallVerdict: { type: Type.STRING },
              nextStepAdvice: { type: Type.STRING },
            },
            required: [
              'existenceScore',
              'existenceFeedback',
              'relevanceScore',
              'relevanceFeedback',
              'reasoningScore',
              'reasoningFeedback',
              'overallVerdict',
              'nextStepAdvice',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim()) as {
        existenceScore: number;
        existenceFeedback: string;
        relevanceScore: number;
        relevanceFeedback: string;
        reasoningScore: number;
        reasoningFeedback: string;
        overallVerdict: string;
        nextStepAdvice: string;
      };

      // Deterministic server-side rubric clamping so rules are 100% enforced
      const existenceStatus: 'confirmed_in_study_text' | 'unverified_verbatim' | 'missing' | 'mismatch' =
        hasDistractor && !hasRelevantDetail
          ? 'mismatch'
          : matchedTeacherVerbatim || (hasRelevantDetail && !looksLikeDirectQuote)
            ? 'confirmed_in_study_text'
            : hasRelevantDetail
              ? 'confirmed_in_study_text'
              : 'unverified_verbatim';

      let clampedExistence = Math.max(0, Math.min(3, Math.round(parsed.existenceScore ?? 0)));
      if (existenceStatus === 'mismatch') clampedExistence = Math.min(clampedExistence, 1);
      if (!hasTypedEvidence && !hasRelevantDetail) clampedExistence = 0;

      let clampedRelevance = Math.max(0, Math.min(3, Math.round(parsed.relevanceScore ?? 0)));
      if (!hasRelevantDetail) clampedRelevance = Math.min(clampedRelevance, 1);
      if (hasDistractor) clampedRelevance = Math.min(clampedRelevance, 2);

      let clampedReasoning = Math.max(0, Math.min(4, Math.round(parsed.reasoningScore ?? 0)));
      if (isVagueReasoning) {
        clampedReasoning = Math.min(clampedReasoning, 2);
      }

      const totalScore = Math.min(10, clampedExistence + clampedRelevance + clampedReasoning);

      res.json({
        configured: true,
        mode: 'gemini',
        evidenceExistence: {
          status: existenceStatus,
          label:
            existenceStatus === 'confirmed_in_study_text'
              ? matchedTeacherVerbatim
                ? 'Khớp văn bản nguồn & học liệu'
                : 'Có trong học liệu trạm'
              : existenceStatus === 'mismatch'
                ? 'Chi tiết chưa khớp văn bản'
                : 'Chưa có văn bản nguồn đối chiếu nguyên văn',
          feedback: parsed.existenceFeedback,
        },
        evidenceRelevance: {
          score: clampedRelevance,
          maxScore: 3,
          feedback: parsed.relevanceFeedback,
        },
        reasoningQuality: {
          score: clampedReasoning,
          maxScore: 4,
          feedback: isVagueReasoning && clampedReasoning <= 2
            ? `${parsed.reasoningFeedback} (Lưu ý: Hệ thống giới hạn điểm tối đa vì thiếu dẫn chứng cụ thể nhập tay hoặc phần lí giải còn ngắn/chung chung.)`
            : parsed.reasoningFeedback,
        },
        totalScore,
        maxTotalScore: 10,
        overallVerdict: parsed.overallVerdict,
        nextStepAdvice: parsed.nextStepAdvice,
        verbatimCaution,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi kết nối Gemini API';
      res.status(500).json({
        configured: true,
        error: `Không thể chấm Chiếc La Bàn Sử Thi lúc này: ${msg}`,
      });
    }
  });

  app.post(['/api/ai/evaluate-arena-open', '/ai/evaluate-arena-open'], async (req, res) => {
    const body = req.body as {
      modeType?: 'evidence' | 'dialogue' | 'dialogue-hint';
      promptTitle?: string;
      situationOrClaim?: string;
      selectedEvidenceCorrect?: boolean;
      selectedEvidenceText?: string;
      studentResponse?: string;
      coreDimensions?: string[];
    };

    const modeType = body.modeType || 'dialogue';
    const promptTitle = (body.promptTitle || '').trim();
    const situationOrClaim = (body.situationOrClaim || '').trim();
    const selectedEvidenceCorrect = Boolean(body.selectedEvidenceCorrect);
    const selectedEvidenceText = (body.selectedEvidenceText || '').trim();
    const studentResponse = (body.studentResponse || '').trim();
    const coreDimensions = Array.isArray(body.coreDimensions) ? body.coreDimensions : [];
    const wordCount = studentResponse.split(/\s+/).filter(Boolean).length;

    const maxAnalysisPoints = 15;
    const maxEvidencePoints = modeType === 'evidence' ? 10 : 0;

    // Hint-only mode for Game 6 before or alongside answering
    if (modeType !== 'dialogue-hint' && wordCount < 6) {
      res.json({
        configured: Boolean(getGeminiClient()),
        mode: 'rubric-local',
        analysisPoints: 0,
        maxAnalysisPoints,
        evidencePoints: modeType === 'evidence' && selectedEvidenceCorrect ? 6 : 0,
        maxEvidencePoints,
        feedback:
          'Phần giải thích/trả lời mở còn quá ngắn hoặc bị bỏ trống. Hãy trình bày rõ lí lẽ cá nhân (tối thiểu 15–20 từ) để nhận điểm phân tích.',
        reflectionAngles:
          coreDimensions.length > 0
            ? coreDimensions
            : ['Nêu rõ quan điểm cá nhân', 'Gắn với chi tiết/nhân vật trong văn bản', 'Rút ra ý nghĩa nhân văn'],
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      const localAnalysis =
        modeType === 'dialogue-hint'
          ? 0
          : wordCount >= 32
            ? 12
            : wordCount >= 18
              ? 9
              : 5;
      const localEvidence =
        modeType === 'evidence'
          ? selectedEvidenceCorrect
            ? wordCount >= 18
              ? 10
              : 7
            : 2
          : 0;
      res.json({
        configured: false,
        mode: 'rubric-local',
        analysisPoints: localAnalysis,
        maxAnalysisPoints,
        evidencePoints: localEvidence,
        maxEvidencePoints,
        feedback:
          modeType === 'dialogue-hint'
            ? 'Gợi ý khía cạnh suy nghĩ đã sẵn sàng từ học liệu trạm.'
            : wordCount < 18
              ? 'Câu trả lời đã nêu được ý chính nhưng còn ngắn, chưa phân tích sâu nên chưa đạt điểm tối đa.'
              : 'Lập luận rõ ràng, có bám sát tình huống sử thi. (Đang đánh giá theo rubric cục bộ).',
        reflectionAngles: coreDimensions,
      });
      return;
    }

    try {
      const systemInstruction = [
        'Bạn là cố vấn Ngữ văn lớp 10 trong Đấu Trường Anh Hùng Ca.',
        'Quy tắc chấm nghiêm ngặt:',
        '- KHÔNG cho điểm tối đa (analysisPoints <= 8/15) nếu câu trả lời chỉ nói chung chung dưới 18 từ hoặc không bám sát tình huống/dẫn chứng.',
        '- Nếu modeType="dialogue-hint", chỉ gợi mở 3 khía cạnh suy nghĩ súc tích để học sinh tự trả lời, KHÔNG làm bài hộ.',
        '- Luôn dùng tiếng Việt sư phạm, khích lệ và rõ ràng.',
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: JSON.stringify({
          modeType,
          promptTitle,
          situationOrClaim,
          selectedEvidenceCorrect: modeType === 'evidence' ? selectedEvidenceCorrect : undefined,
          selectedEvidenceText: selectedEvidenceText || undefined,
          studentResponse: studentResponse || '(Chưa nhập bài — chỉ xin gợi ý khía cạnh)',
          wordCount,
          referenceDimensions: coreDimensions,
        }),
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysisPoints: { type: Type.INTEGER, description: 'Điểm phân tích từ 0 đến 15' },
              evidencePoints: { type: Type.INTEGER, description: 'Điểm sử dụng dẫn chứng từ 0 đến 10 (0 nếu modeType là dialogue)' },
              feedback: { type: Type.STRING },
              reflectionAngles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 khía cạnh gợi mở tư duy cho học sinh',
              },
            },
            required: ['analysisPoints', 'evidencePoints', 'feedback', 'reflectionAngles'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim()) as {
        analysisPoints: number;
        evidencePoints: number;
        feedback: string;
        reflectionAngles: string[];
      };

      let analysisPoints =
        modeType === 'dialogue-hint'
          ? 0
          : Math.max(0, Math.min(maxAnalysisPoints, Math.round(parsed.analysisPoints ?? 0)));
      if (wordCount < 18 && modeType !== 'dialogue-hint') {
        analysisPoints = Math.min(analysisPoints, 8);
      }

      let evidencePoints =
        modeType === 'evidence'
          ? Math.max(0, Math.min(maxEvidencePoints, Math.round(parsed.evidencePoints ?? 0)))
          : 0;
      if (modeType === 'evidence' && !selectedEvidenceCorrect) {
        evidencePoints = Math.min(evidencePoints, 3);
      }

      res.json({
        configured: true,
        mode: 'gemini',
        analysisPoints,
        maxAnalysisPoints,
        evidencePoints,
        maxEvidencePoints,
        feedback: parsed.feedback,
        reflectionAngles:
          Array.isArray(parsed.reflectionAngles) && parsed.reflectionAngles.length > 0
            ? parsed.reflectionAngles.slice(0, 4)
            : coreDimensions,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Lỗi kết nối Gemini API';
      res.status(500).json({
        configured: true,
        error: `Không thể đánh giá phần trả lời mở lúc này: ${msg}`,
      });
    }
  });

  return app;
}

export const app = createApiApp();
export default app;
