import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Lightbulb,
  Loader2,
  MessageSquareQuote,
  Sparkles,
} from 'lucide-react';
import {
  DIALOGUE_SCENARIOS,
  EVIDENCE_CHALLENGES,
  shuffleArray,
  shuffleOptionsWithIndex,
} from '../../data/arenaAndStemData';
import { evaluateArenaOpenResponse } from '../../services/aiService';
import { ArenaOpenEvalResult, ArenaReviewItem } from '../../types/museum';
import { playArenaChime } from '../../services/arenaStorageService';
import { GameFinishPayload, LiveProgressUpdate } from './ArenaClassicGames';

interface DeepGameProps {
  onProgress: (p: LiveProgressUpdate) => void;
  onFinish: (payload: GameFinishPayload) => void;
}

/* -------------------------------------------------------------------------- */
/* GAME 5: THỬ THÁCH DẪN CHỨNG                                                */
/* -------------------------------------------------------------------------- */
export const EvidenceChallengeGame: React.FC<DeepGameProps> = ({ onProgress, onFinish }) => {
  const challenges = useMemo(
    () =>
      shuffleArray(EVIDENCE_CHALLENGES).map((item) => {
        const shuffled = shuffleOptionsWithIndex({
          choices: item.evidenceChoices,
          correctIndex: item.correctIndex,
        });
        return {
          ...item,
          evidenceChoices: shuffled.choices,
          correctIndex: shuffled.correctIndex,
        };
      }),
    []
  );

  const [idx, setIdx] = useState(0);
  const [selectedEv, setSelectedEv] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<ArenaOpenEvalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [baseScore, setBaseScore] = useState(0);
  const [evidenceBonus, setEvidenceBonus] = useState(0);
  const [analysisBonus, setAnalysisBonus] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reviewItems, setReviewItems] = useState<ArenaReviewItem[]>([]);

  const item = challenges[idx];

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEv === null || evalResult) return;
    setLoading(true);
    setErrorMsg(null);

    const isRightChoice = selectedEv === item.correctIndex;
    const response = await evaluateArenaOpenResponse({
      modeType: 'evidence',
      promptTitle: item.workTitle,
      situationOrClaim: item.claim,
      selectedEvidenceCorrect: isRightChoice,
      selectedEvidenceText: item.evidenceChoices[selectedEv],
      studentResponse: explanation,
      coreDimensions: item.rubricKeywords,
    });

    setLoading(false);
    if (!response.ok || !response.data) {
      setErrorMsg(response.error || 'Không thể đánh giá phần giải thích lúc này.');
      return;
    }

    const resData = response.data;
    setEvalResult(resData);

    const nextCorrect = correctCount + (isRightChoice ? 1 : 0);
    const nextWrong = wrongCount + (isRightChoice ? 0 : 1);
    const nextBase = baseScore + (isRightChoice ? 10 : 0);
    const nextEvBonus = evidenceBonus + resData.evidencePoints;
    const nextAnalysisBonus = analysisBonus + resData.analysisPoints;

    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);
    setBaseScore(nextBase);
    setEvidenceBonus(nextEvBonus);
    setAnalysisBonus(nextAnalysisBonus);

    if (isRightChoice) {
      playArenaChime('correct');
    } else {
      playArenaChime('wrong');
      setReviewItems((prev) => [
        ...prev,
        {
          prompt: `Nhận định (${item.workTitle}): "${item.claim}"`,
          yourAnswer: item.evidenceChoices[selectedEv],
          correctAnswer: item.evidenceChoices[item.correctIndex],
          explanation: item.explanation,
        },
      ]);
    }

    onProgress({
      stepIndex: idx + 1,
      totalSteps: challenges.length,
      correctCount: nextCorrect,
      wrongCount: nextWrong,
      currentScore: nextBase + nextEvBonus + nextAnalysisBonus,
    });
  };

  const handleNext = () => {
    if (idx >= challenges.length - 1) {
      const completionBonus = 15;
      playArenaChime('victory');
      onFinish({
        breakdown: {
          baseScore,
          speedBonus: 0,
          completionBonus,
          analysisBonus,
          evidenceBonus,
          totalScore: baseScore + evidenceBonus + analysisBonus + completionBonus,
        },
        correctCount,
        wrongCount,
        totalItems: challenges.length,
        reviewItems,
      });
      return;
    }
    setIdx(idx + 1);
    setSelectedEv(null);
    setExplanation('');
    setEvalResult(null);
    setErrorMsg(null);
  };

  return (
    <form onSubmit={handleEvaluate} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone pb-3">
        <span className="text-xs font-semibold text-forest-800">
          Văn bản: {item.workTitle} · Chọn dẫn chứng &amp; Giải thích
        </span>
        <span className="font-mono tabular-nums text-xs font-semibold text-wood-600">
          Nhận định {idx + 1}/{challenges.length}
        </span>
      </div>

      <div className="p-5 rounded-xl bg-wood-950 text-cream space-y-1.5">
        <p className="text-[11px] uppercase tracking-widest text-gold-400 font-semibold">
          Nhận định văn học
        </p>
        <p className="font-serif text-xl sm:text-2xl font-bold leading-snug">
          “{item.claim}”
        </p>
      </div>

      <div className="space-y-2.5">
        <label className="block text-sm font-semibold text-wood-900">
          1. Chọn dẫn chứng văn bản phù hợp nhất (đã xáo trộn):
        </label>
        {item.evidenceChoices.map((ev, cIdx) => {
          const isSelected = selectedEv === cIdx;
          const isTrue = cIdx === item.correctIndex;
          let cls = 'bg-cream border-sandstone text-wood-800 hover:bg-parchment/45';
          if (evalResult) {
            if (isTrue) cls = 'bg-forest-800/10 border-forest-700 text-forest-800 font-semibold';
            else if (isSelected) cls = 'bg-red-50 border-red-400 text-red-900';
          } else if (isSelected) {
            cls = 'bg-parchment border-wood-900 font-medium text-wood-900';
          }

          return (
            <button
              key={ev}
              type="button"
              disabled={Boolean(evalResult)}
              onClick={() => setSelectedEv(cIdx)}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-colors cursor-pointer ${cls}`}
            >
              {ev}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <label htmlFor="ev-explain" className="block text-sm font-semibold text-wood-900">
          2. Giải thích vì sao dẫn chứng vừa chọn làm sáng tỏ nhận định (bắt buộc để tính Điểm phân tích):
        </label>
        <textarea
          id="ev-explain"
          rows={3}
          disabled={Boolean(evalResult)}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Nêu rõ hành động/chi tiết trong dẫn chứng cho thấy phẩm chất hay nghệ thuật gì, từ đó chứng minh nhận định..."
          className="w-full p-3.5 text-sm rounded-xl bg-parchment/40 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
          {errorMsg}
        </div>
      )}

      {evalResult && (
        <div className="p-5 rounded-xl bg-parchment/85 border border-sandstone space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone pb-2">
            <span className="font-semibold text-wood-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-forest-700" />
              Đánh giá dẫn chứng &amp; phân tích
            </span>
            <span className="font-mono tabular-nums text-xs font-bold text-forest-800">
              Dẫn chứng: +{evalResult.evidencePoints}/{evalResult.maxEvidencePoints}đ · Phân tích: +{evalResult.analysisPoints}/{evalResult.maxAnalysisPoints}đ
            </span>
          </div>
          <p className="text-wood-900 leading-relaxed">{evalResult.feedback}</p>
          <p className="text-xs text-wood-700">
            <strong>Đáp án chuẩn:</strong> {item.explanation}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        {!evalResult ? (
          <button
            type="submit"
            disabled={selectedEv === null || loading}
            className="px-5 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Xác nhận &amp; chấm điểm phân tích</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
          >
            {idx >= challenges.length - 1 ? 'Xem kết quả' : 'Nhận định tiếp theo'}
          </button>
        )}
      </div>
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/* GAME 6: ĐỐI THOẠI SỬ THI (Tình huống + Câu hỏi mở + AI gợi ý khía cạnh)   */
/* -------------------------------------------------------------------------- */
export const EpicDialogueGame: React.FC<DeepGameProps> = ({ onProgress, onFinish }) => {
  const scenarios = useMemo(() => shuffleArray(DIALOGUE_SCENARIOS), []);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [hintAngles, setHintAngles] = useState<string[] | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<ArenaOpenEvalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [baseScore, setBaseScore] = useState(0);
  const [analysisBonus, setAnalysisBonus] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reviewItems, setReviewItems] = useState<ArenaReviewItem[]>([]);

  const item = scenarios[idx];

  const handleRequestAiHints = async () => {
    setHintLoading(true);
    setErrorMsg(null);
    const res = await evaluateArenaOpenResponse({
      modeType: 'dialogue-hint',
      promptTitle: item.title,
      situationOrClaim: `${item.situation}\nCâu hỏi: ${item.openQuestion}`,
      studentResponse: answer,
      coreDimensions: item.coreDimensions,
    });
    setHintLoading(false);
    if (res.ok && res.data) {
      setHintAngles(res.data.reflectionAngles);
    } else {
      setHintAngles(item.coreDimensions);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (evalResult) return;
    setEvalLoading(true);
    setErrorMsg(null);

    const res = await evaluateArenaOpenResponse({
      modeType: 'dialogue',
      promptTitle: item.title,
      situationOrClaim: `${item.situation}\nCâu hỏi: ${item.openQuestion}`,
      studentResponse: answer,
      coreDimensions: item.coreDimensions,
    });

    setEvalLoading(false);
    if (!res.ok || !res.data) {
      setErrorMsg(res.error || 'Không thể đánh giá câu trả lời mở lúc này.');
      return;
    }

    const resData = res.data;
    setEvalResult(resData);
    const passed = resData.analysisPoints >= 7;
    const nextCorrect = correctCount + (passed ? 1 : 0);
    const nextWrong = wrongCount + (passed ? 0 : 1);
    const nextBase = baseScore + (passed ? 10 : 0);
    const nextAnalysis = analysisBonus + resData.analysisPoints;

    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);
    setBaseScore(nextBase);
    setAnalysisBonus(nextAnalysis);

    if (passed) {
      playArenaChime('correct');
    } else {
      playArenaChime('wrong');
      setReviewItems((prev) => [
        ...prev,
        {
          prompt: `${item.title}: ${item.openQuestion}`,
          yourAnswer: answer.trim() || '(Chưa viết đầy đủ)',
          correctAnswer: item.coreDimensions.join(' | '),
          explanation: resData.feedback,
        },
      ]);
    }

    onProgress({
      stepIndex: idx + 1,
      totalSteps: scenarios.length,
      correctCount: nextCorrect,
      wrongCount: nextWrong,
      currentScore: nextBase + nextAnalysis,
    });
  };

  const handleNext = () => {
    if (idx >= scenarios.length - 1) {
      const completionBonus = 15;
      playArenaChime('victory');
      onFinish({
        breakdown: {
          baseScore,
          speedBonus: 0,
          completionBonus,
          analysisBonus,
          evidenceBonus: 0,
          totalScore: baseScore + analysisBonus + completionBonus,
        },
        correctCount,
        wrongCount,
        totalItems: scenarios.length,
        reviewItems,
      });
      return;
    }
    setIdx(idx + 1);
    setAnswer('');
    setHintAngles(null);
    setEvalResult(null);
    setErrorMsg(null);
  };

  return (
    <form onSubmit={handleSubmitResponse} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone pb-3">
        <span className="text-xs font-semibold text-forest-800">
          {item.title} · {item.workTitle}
        </span>
        <span className="font-mono tabular-nums text-xs font-semibold text-wood-600">
          Tình huống {idx + 1}/{scenarios.length}
        </span>
      </div>

      <div className="p-5 rounded-xl bg-parchment/80 border border-sandstone space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-wood-700 uppercase tracking-wider">
          <MessageSquareQuote className="w-4 h-4 text-forest-700" />
          <span>Tình huống đặt vấn đề</span>
        </div>
        <p className="text-sm sm:text-base text-wood-900 leading-relaxed">{item.situation}</p>
        <p className="font-serif text-xl font-bold text-wood-900 pt-1">{item.openQuestion}</p>
      </div>

      {/* AI Reflection Angles Suggestion */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleRequestAiHints}
          disabled={hintLoading}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-sandstone bg-cream hover:border-gold-500 text-wood-900 inline-flex items-center gap-1.5 cursor-pointer"
        >
          {hintLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Lightbulb className="w-3.5 h-3.5 text-gold-600" />
          )}
          <span>AI gợi ý các khía cạnh cần suy nghĩ</span>
        </button>

        {hintAngles && (
          <div className="p-4 rounded-xl bg-wood-900 text-cream space-y-2">
            <p className="text-xs font-semibold text-gold-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Các khía cạnh gợi mở từ Sứ Giả AI (không làm bài hộ):
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm text-cream/90">
              {hintAngles.map((angle, i) => (
                <li key={angle} className="flex items-start gap-2">
                  <span className="font-mono text-gold-400">0{i + 1}.</span>
                  <span>{angle}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="dialogue-answer" className="block text-sm font-semibold text-wood-900">
          Câu trả lời mở của em:
        </label>
        <textarea
          id="dialogue-answer"
          rows={4}
          disabled={Boolean(evalResult)}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Trình bày quan điểm của em từ 3–5 câu, kết nối giữa chi tiết sử thi và giá trị nhân sinh..."
          className="w-full p-4 text-sm rounded-xl bg-parchment/35 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
          {errorMsg}
        </div>
      )}

      {evalResult && (
        <div className="p-5 rounded-xl bg-forest-800/10 border border-forest-700/40 space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-forest-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Nhận xét từ {evalResult.mode === 'gemini' ? 'Gemini AI' : 'Rubric cục bộ'}
            </span>
            <span className="font-mono tabular-nums font-bold text-forest-800">
              Điểm phân tích: +{evalResult.analysisPoints}/{evalResult.maxAnalysisPoints}đ
            </span>
          </div>
          <p className="text-wood-900 leading-relaxed">{evalResult.feedback}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!evalResult ? (
          <button
            type="submit"
            disabled={evalLoading || !answer.trim()}
            className="px-5 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
          >
            {evalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Gửi bài &amp; chấm điểm phân tích</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
          >
            {idx >= scenarios.length - 1 ? 'Xem kết quả' : 'Tình huống tiếp theo'}
          </button>
        )}
      </div>
    </form>
  );
};
