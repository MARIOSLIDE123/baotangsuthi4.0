import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AiGuideTurn,
  AiQuotaStatus,
  askAiGuide,
  buildApprovedLibraryContext,
  buildStudentProgressContext,
  fetchAiQuota,
} from '../services/aiService';
import { ExplorerPassportState, ServiceConnectionStatus } from '../types/museum';
import { DemoModeBanner, ErrorState } from '../components/common/StateFeedback';
import { SafeImage } from '../components/common/SafeImage';

interface AiAssistantPageProps {
  serviceStatus: ServiceConnectionStatus;
  passport?: ExplorerPassportState;
}

const SESSION_CHAT_KEY = 'suthiso_ai_chat_history_v1';

const WELCOME_TURN: AiGuideTurn = {
  role: 'model',
  text: 'Chào bạn! Mình là SỨ GIẢ ĐẠI NGÀN – TRỢ LÝ KHÁM PHÁ SỬ THI.\n\nMình sẽ đồng hành gợi mở để bạn tự khám phá khái niệm, nhân vật, nghệ thuật, so sánh anh hùng và kiểm tra dẫn chứng Ngữ văn 10 (mình không làm bài thay ngay đâu nhé!). Bạn đang muốn tìm hiểu vấn đề gì hoặc cần xem lại nhiệm vụ hiện tại nào?',
};

interface SuggestedPromptItem {
  category: string;
  prompt: string;
}

const EIGHT_CAPABILITY_PROMPTS: SuggestedPromptItem[] = [
  {
    category: 'Khái niệm sử thi',
    prompt: 'Thế nào là nhân vật anh hùng sử thi và điểm khác biệt với nhân vật truyện cổ tích?',
  },
  {
    category: 'Nhân vật',
    prompt: 'Vì sao Đăm Săn muốn đến gặp Nữ thần Mặt Trời?',
  },
  {
    category: 'Sự kiện',
    prompt: 'Sự kiện Đăm Săn ba lần gọi dân làng Mtao Mxây đi theo mình mang ý nghĩa gì?',
  },
  {
    category: 'Đặc điểm nghệ thuật',
    prompt: 'Phép so sánh – phóng đại trong cảnh Đăm Săn múa khiên có tác dụng nghệ thuật ra sao?',
  },
  {
    category: 'Gợi ý tìm dẫn chứng',
    prompt: 'Gợi ý cho em cách tìm dẫn chứng chứng minh tinh thần thượng võ của Đăm Săn.',
  },
  {
    category: 'Giải thích đoạn văn',
    prompt: 'Giúp em giải thích ý nghĩa đoạn Đăm Săn kiên quyết ra về dù được cảnh báo rừng sáp đen tan chảy.',
  },
  {
    category: 'So sánh hai nhân vật',
    prompt: 'Hướng dẫn em so sánh điểm giống và khác nhau giữa Đăm Săn và Ô-đi-xê.',
  },
  {
    category: 'Nhiệm vụ đang thực hiện',
    prompt: 'Dựa trên tiến độ hiện tại của em trong bảo tàng, em nên ưu tiên thực hiện nhiệm vụ nào tiếp theo?',
  },
];

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  serviceStatus,
  passport,
}) => {
  const [assistantMode, setAssistantMode] = useState<'chat' | 'evidence-check'>('chat');
  const [topic, setTopic] = useState('Đọc hiểu Sử thi Ngữ văn 10');
  const [input, setInput] = useState('');

  // Evidence check mode fields
  const [claimInput, setClaimInput] = useState('');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [evidenceNoteInput, setEvidenceNoteInput] = useState('');

  const [turns, setTurns] = useState<AiGuideTurn[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as AiGuideTurn[];
        }
      }
    } catch {
      // Ignore storage access errors
    }
    return [WELCOME_TURN];
  });

  const [quota, setQuota] = useState<AiQuotaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Optional Web Speech TTS & Voice Input (non-blocking)
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const supportsTts = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const supportsVoiceInput =
    typeof window !== 'undefined' &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  useEffect(() => {
    fetchAiQuota().then((q) => {
      if (q) setQuota(q);
    });
    return () => {
      if (supportsTts) window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, [supportsTts]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_CHAT_KEY, JSON.stringify(turns.slice(-24)));
    } catch {
      // Ignore storage failures
    }
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [turns]);

  const handleClearConversation = () => {
    if (supportsTts) window.speechSynthesis.cancel();
    setSpeakingIdx(null);
    setTurns([WELCOME_TURN]);
    setErrorMsg(null);
    try {
      sessionStorage.removeItem(SESSION_CHAT_KEY);
    } catch {
      // Ignore
    }
  };

  const handleToggleSpeak = (idx: number, text: string) => {
    if (!supportsTts) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''));
    utter.lang = 'vi-VN';
    utter.rate = 0.98;
    utter.onend = () => setSpeakingIdx(null);
    utter.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utter);
  };

  const handleToggleVoiceInput = () => {
    if (!supportsVoiceInput) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    try {
      const Ctor =
        (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => unknown })
          .webkitSpeechRecognition;
      if (!Ctor) return;
      const rec = new Ctor() as {
        lang: string;
        interimResults: boolean;
        onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
      rec.lang = 'vi-VN';
      rec.interimResults = false;
      rec.onresult = (ev) => {
        const transcript = ev.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const submitChatMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setErrorMsg(null);
    const nextHistory: AiGuideTurn[] = [...turns, { role: 'user', text: trimmed }];
    setTurns(nextHistory);
    setInput('');
    setLoading(true);

    const res = await askAiGuide({
      mode: 'chat',
      message: trimmed,
      topic,
      studentContext: buildStudentProgressContext(passport),
      approvedLibraryContext: buildApprovedLibraryContext(),
      history: turns,
    });

    setLoading(false);
    if (res.quota) setQuota(res.quota);

    if (!res.ok || !res.reply) {
      setErrorMsg(res.error || 'Không thể nhận phản hồi từ máy chủ Gemini API.');
      return;
    }

    setTurns([...nextHistory, { role: 'model', text: res.reply }]);
  };

  const submitEvidenceCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput.trim() || !evidenceInput.trim() || loading) return;

    setErrorMsg(null);
    const userSummary = `[Kiểm tra dẫn chứng]\n• Nhận định: ${claimInput.trim()}\n• Dẫn chứng: ${evidenceInput.trim()}${
      evidenceNoteInput.trim() ? `\n• Lí giải thêm: ${evidenceNoteInput.trim()}` : ''
    }`;
    const nextHistory: AiGuideTurn[] = [...turns, { role: 'user', text: userSummary }];
    setTurns(nextHistory);
    setAssistantMode('chat');
    setLoading(true);

    const res = await askAiGuide({
      mode: 'evidence-check',
      message: evidenceNoteInput.trim(),
      topic,
      claim: claimInput.trim(),
      evidence: evidenceInput.trim(),
      studentContext: buildStudentProgressContext(passport),
      approvedLibraryContext: buildApprovedLibraryContext(),
      history: turns,
    });

    setLoading(false);
    if (res.quota) setQuota(res.quota);

    if (!res.ok || !res.reply) {
      setErrorMsg(res.error || 'Không thể kiểm tra dẫn chứng lúc này.');
      return;
    }

    setTurns([...nextHistory, { role: 'model', text: res.reply }]);
  };

  return (
    <div className="space-y-6 pb-14">
      <header className="border-b border-sandstone pb-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <p className="text-xs font-medium text-wood-600">
            Phân khu 10 · Trợ lý học tập Ngữ văn lớp 10 (Gemini backend)
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
            SỨ GIẢ ĐẠI NGÀN – TRỢ LÝ KHÁM PHÁ SỬ THI
          </h1>
          <p className="text-sm text-wood-700 leading-relaxed">
            Hỏi đáp gợi mở 8 chủ đề đọc hiểu và kiểm tra dẫn chứng đối chiếu từ kho học liệu giáo viên đã duyệt — không làm bài thay học sinh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-wood-700 shrink-0">
          <span>
            {serviceStatus.gemini.configured
              ? `Gemini (${serviceStatus.gemini.model})`
              : 'Chờ cấu hình GEMINI_API_KEY'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-semibold text-forest-800">
            {quota
              ? `Lượt hỏi phiên: ${quota.remaining}/${quota.limit}`
              : 'Giới hạn 20 lượt / 15 phút'}
          </span>
        </div>
      </header>

      {!serviceStatus.gemini.configured && (
        <DemoModeBanner
          serviceName="Gemini API"
          detail="Chưa phát hiện GEMINI_API_KEY trên máy chủ backend. Khi khóa được cấu hình trong Secrets phía máy chủ, Sứ Giả Đại Ngàn sẽ phản hồi trực tiếp qua /api/ai/guide."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Persona, Mode Switcher, Topic, 8-Capability Suggested Prompts */}
        <aside className="lg:col-span-4 bg-cream border border-sandstone rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-3">
            <SafeImage
              src="/src/assets/images/su_gia_dai_ngan_1794539491712.jpg"
              alt="Sứ Giả Đại Ngàn – Trợ lý Khám phá Sử thi"
              className="w-14 h-14 rounded-xl object-cover border border-sandstone shrink-0"
            />
            <div>
              <h2 className="font-serif text-xl font-bold text-wood-900 leading-tight">
                SỨ GIẢ ĐẠI NGÀN
              </h2>
              <p className="text-xs text-wood-600 mt-0.5">
                Gợi mở tư duy · Bám sát học liệu lớp 10
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-parchment rounded-xl border border-sandstone">
            <button
              type="button"
              onClick={() => setAssistantMode('chat')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                assistantMode === 'chat'
                  ? 'bg-wood-900 text-cream'
                  : 'text-wood-700 hover:text-wood-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Trò chuyện</span>
            </button>
            <button
              type="button"
              onClick={() => setAssistantMode('evidence-check')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                assistantMode === 'evidence-check'
                  ? 'bg-wood-900 text-cream'
                  : 'text-wood-700 hover:text-wood-900'
              }`}
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Kiểm tra dẫn chứng</span>
            </button>
          </div>

          {/* Focus Topic */}
          <div className="space-y-1.5">
            <label htmlFor="ai-topic" className="block text-xs font-semibold text-wood-800">
              Mạch kiến thức trọng tâm
            </label>
            <select
              id="ai-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-cream border border-sandstone rounded-lg focus:outline-none focus:border-forest-700"
            >
              <option value="Đọc hiểu Sử thi Ngữ văn 10">Đọc hiểu Sử thi Ngữ văn 10</option>
              <option value="Đăm Săn chiến thắng Mtao Mxây">
                Đăm Săn chiến thắng Mtao Mxây
              </option>
              <option value="Đăm Săn đi bắt Nữ thần Mặt Trời">
                Đăm Săn đi bắt Nữ thần Mặt Trời
              </option>
              <option value="Sử thi Việt Nam (Xing Nhã, Đẻ đất đẻ nước, Đăm Noi)">
                Sử thi Việt Nam (Xing Nhã, Đẻ đất đẻ nước)
              </option>
              <option value="Sử thi Thế giới (Iliad, Odyssey, Ramayana, Gilgamesh)">
                Sử thi Thế giới (Iliad, Odyssey, Ramayana)
              </option>
              <option value="Sản phẩm STEM & Nhiệm vụ bảo tàng">
                Sản phẩm STEM &amp; Nhiệm vụ bảo tàng
              </option>
            </select>
          </div>

          {/* 8 Functional Suggested Prompts */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-wood-800">
              Câu hỏi gợi ý theo 8 chức năng:
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {EIGHT_CAPABILITY_PROMPTS.map((item) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => {
                    setAssistantMode('chat');
                    submitChatMessage(item.prompt);
                  }}
                  className="w-full text-left p-3 text-xs text-wood-800 bg-parchment/65 border border-sandstone rounded-lg hover:border-gold-500 transition-colors cursor-pointer space-y-0.5"
                >
                  <span className="font-semibold text-forest-800 block">{item.category}</span>
                  <span className="leading-relaxed block">{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rules Transparency Box */}
          <div className="p-3.5 rounded-xl bg-parchment/60 border border-sandstone text-[11px] text-wood-700 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-wood-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-forest-700" />
              <span>Nguyên tắc đồng hành</span>
            </p>
            <p>
              • Gợi mở từng bước thay vì làm hộ · Ưu tiên kho học liệu giáo viên đã duyệt · Không tự bịa câu trích dẫn · Phân biệt rõ văn bản với mô phỏng 3D.
            </p>
          </div>
        </aside>

        {/* Right Workspace: Text Chat OR Evidence Checker */}
        <section className="lg:col-span-8 bg-cream border border-sandstone rounded-2xl flex flex-col h-[720px] lg:h-[calc(100vh-250px)] min-h-[600px] overflow-hidden">
          {/* Top Utility Toolbar */}
          <div className="px-5 py-3 bg-parchment/60 border-b border-sandstone flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-wood-700">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>
                {assistantMode === 'chat'
                  ? `Hội thoại phiên học (${turns.length} lượt)`
                  : 'Chế độ kiểm tra nhận định & dẫn chứng theo học liệu duyệt'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearConversation}
              className="px-3 py-1.5 text-xs font-medium text-wood-700 hover:text-wood-900 border border-sandstone bg-cream rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa cuộc trò chuyện</span>
            </button>
          </div>

          {assistantMode === 'evidence-check' ? (
            <form
              onSubmit={submitEvidenceCheck}
              className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5"
            >
              <div className="p-4 rounded-xl bg-parchment/65 border border-sandstone text-xs sm:text-sm text-wood-800 leading-relaxed">
                Nhập <strong>nhận định</strong> và <strong>dẫn chứng</strong> của bạn. Sứ Giả Đại Ngàn sẽ đối chiếu với thư viện sử thi đã được giáo viên duyệt, chỉ ra điểm phù hợp, chỗ còn thiếu và gợi hướng diễn đạt (không tự xác nhận nguyên văn nếu chưa có bản trích nguồn).
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ec-claim" className="block text-sm font-semibold text-wood-900">
                  1. Nhận định văn học của bạn
                </label>
                <input
                  id="ec-claim"
                  type="text"
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Ví dụ: Đăm Săn là người anh hùng mang vẻ đẹp thượng võ và khát vọng phi thường."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-parchment/35 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ec-evidence" className="block text-sm font-semibold text-wood-900">
                  2. Dẫn chứng từ văn bản sử thi
                </label>
                <textarea
                  id="ec-evidence"
                  rows={3}
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  placeholder="Nhập chi tiết, sự việc hoặc câu trích dẫn bạn muốn kiểm tra..."
                  className="w-full p-3.5 text-sm rounded-xl bg-parchment/35 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ec-note" className="block text-sm font-semibold text-wood-900">
                  3. Cách bạn đang định giải thích (tùy chọn)
                </label>
                <textarea
                  id="ec-note"
                  rows={2}
                  value={evidenceNoteInput}
                  onChange={(e) => setEvidenceNoteInput(e.target.value)}
                  placeholder="Viết nháp 1–2 câu giải thích mối liên hệ để được góp ý cách diễn đạt..."
                  className="w-full p-3.5 text-sm rounded-xl bg-parchment/35 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
                />
              </div>

              {errorMsg && <ErrorState title="Thông báo từ máy chủ AI" message={errorMsg} />}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAssistantMode('chat')}
                  className="text-xs font-medium text-wood-700 hover:text-wood-900 underline underline-offset-4 cursor-pointer"
                >
                  Quay lại lịch sử trò chuyện
                </button>
                <button
                  type="submit"
                  disabled={!claimInput.trim() || !evidenceInput.trim() || loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 disabled:opacity-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gửi Sứ Giả kiểm tra dẫn chứng</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              <div ref={chatScrollRef} className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
                {turns.map((turn, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                        turn.role === 'user'
                          ? 'bg-forest-700 text-cream'
                          : 'bg-parchment border border-sandstone text-wood-900'
                      }`}
                    >
                      {turn.text}
                    </div>
                    {turn.role === 'model' && supportsTts && (
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(i, turn.text)}
                        className="mt-1 px-2 py-0.5 text-[11px] text-wood-600 hover:text-wood-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {speakingIdx === i ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>Dừng đọc</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Nghe gợi ý</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-wood-600">
                    <Loader2 className="w-4 h-4 animate-spin text-gold-600" />
                    <span>Sứ Giả Đại Ngàn đang đối chiếu học liệu và chuẩn bị câu hỏi gợi mở...</span>
                  </div>
                )}

                {errorMsg && <ErrorState title="Thông báo từ máy chủ AI" message={errorMsg} />}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitChatMessage(input);
                }}
                className="p-4 border-t border-sandstone bg-parchment/50 flex items-center gap-2.5"
              >
                {supportsVoiceInput && (
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    title={listening ? 'Dừng nhận giọng nói' : 'Nói câu hỏi (Tiếng Việt)'}
                    aria-label={listening ? 'Dừng nhận giọng nói' : 'Nói câu hỏi'}
                    className={`p-2.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      listening
                        ? 'bg-red-600 text-cream border-red-600'
                        : 'bg-cream text-wood-700 border-sandstone hover:border-gold-500'
                    }`}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc câu trả lời gợi mở của em..."
                  className="flex-1 px-4 py-2.5 text-sm bg-cream border border-sandstone rounded-lg focus:outline-none focus:border-forest-700"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-4 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi</span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
