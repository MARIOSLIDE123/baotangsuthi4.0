import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Compass,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { COMPASS_CLAIMS, STUDY_TEXT_DETAILS, SUN_GODDESS_STATIONS } from '../../data/damSanJourneyData';
import { evaluateEpicCompass } from '../../services/aiService';
import { CompassEvaluationResult, SunGoddessStation } from '../../types/museum';

const TEACHER_SOURCE_STORAGE_KEY = 'suthiso_damsan_teacher_source_v1';

interface EpicCompassLabProps {
  activeStationId: SunGoddessStation['id'];
  onCompassEvaluated?: (
    claimStatement: string,
    stationTitle: string,
    result: CompassEvaluationResult
  ) => void;
}

export const EpicCompassLab: React.FC<EpicCompassLabProps> = ({
  activeStationId,
  onCompassEvaluated,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string>(COMPASS_CLAIMS[0].id);
  const [customClaimText, setCustomClaimText] = useState<string>('');
  const [useCustomClaim, setUseCustomClaim] = useState(false);

  const [selectedDetailIds, setSelectedDetailIds] = useState<string[]>([]);
  const [evidenceQuote, setEvidenceQuote] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');

  const [showTeacherSource, setShowTeacherSource] = useState(false);
  const [teacherSourceText, setTeacherSourceText] = useState<string>(() => {
    try {
      return localStorage.getItem(TEACHER_SOURCE_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [sourceSavedMsg, setSourceSavedMsg] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<CompassEvaluationResult | null>(null);

  const activeClaim = useMemo(
    () => COMPASS_CLAIMS.find((c) => c.id === selectedClaimId) || COMPASS_CLAIMS[0],
    [selectedClaimId]
  );

  const effectiveClaimStatement = useCustomClaim && customClaimText.trim()
    ? customClaimText.trim()
    : activeClaim.statement;

  const activeStationTitle = useMemo(() => {
    const targetStationId = useCustomClaim ? activeStationId : activeClaim.stationId;
    return SUN_GODDESS_STATIONS.find((s) => s.id === targetStationId)?.title || 'Con đường đến Nữ thần Mặt Trời';
  }, [useCustomClaim, activeStationId, activeClaim.stationId]);

  const toggleDetail = (detailId: string) => {
    setSelectedDetailIds((prev) =>
      prev.includes(detailId) ? prev.filter((id) => id !== detailId) : [...prev, detailId]
    );
    setResult(null);
    setErrorMsg(null);
  };

  const handleSaveTeacherSource = () => {
    try {
      localStorage.setItem(TEACHER_SOURCE_STORAGE_KEY, teacherSourceText.trim());
      setSourceSavedMsg(true);
      setTimeout(() => setSourceSavedMsg(false), 2000);
    } catch {
      // Ignore storage failures
    }
  };

  const handleResetWorkspace = () => {
    setSelectedDetailIds([]);
    setEvidenceQuote('');
    setExplanation('');
    setResult(null);
    setErrorMsg(null);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const chosenDetails = STUDY_TEXT_DETAILS.filter((d) => selectedDetailIds.includes(d.id)).map(
      (d) => ({
        label: d.label,
        isRelevant: useCustomClaim ? !d.isDistractor : d.relevantClaimIds.includes(activeClaim.id),
        isDistractor: Boolean(d.isDistractor),
        distractorReason: d.distractorReason,
      })
    );

    const response = await evaluateEpicCompass({
      claimStatement: effectiveClaimStatement,
      stationTitle: activeStationTitle,
      selectedDetails: chosenDetails,
      evidenceQuote,
      explanation,
      teacherSourceText,
    });

    setLoading(false);
    if (!response.ok || !response.data) {
      setErrorMsg(response.error || 'Không thể chấm bài lúc này.');
      return;
    }

    setResult(response.data);
    onCompassEvaluated?.(effectiveClaimStatement, activeStationTitle, response.data);
  };

  return (
    <section
      id="epic-compass-section"
      aria-label="Chiếc La Bàn Sử Thi – Công cụ tìm dẫn chứng và lập luận văn học"
      className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-sandstone pb-5">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-forest-800">
            Tính năng trọng tâm tiết hội giảng · Đánh giá 3 thành phần cùng Gemini
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-wood-900 text-gold-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
              CHIẾC LA BÀN SỬ THI
            </h2>
          </div>
          <p className="text-sm text-wood-700 leading-relaxed">
            Rèn kĩ năng đọc hiểu cốt lõi: <strong>chọn chi tiết văn bản</strong> → <strong>nhập dẫn chứng</strong> → <strong>lí giải mối liên hệ</strong> với nhận định văn học. Hệ thống không tự xác nhận trích dẫn nguyên văn khi chưa có văn bản nguồn đối chiếu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTeacherSource((prev) => !prev)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-sandstone bg-parchment hover:border-gold-500 text-wood-900 inline-flex items-center gap-1.5 cursor-pointer self-start lg:self-auto whitespace-nowrap shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-forest-700" />
          <span>
            {teacherSourceText.trim()
              ? 'Văn bản nguồn GV: Đã nạp'
              : 'Nạp văn bản nguồn đối chiếu (GV)'}
          </span>
        </button>
      </div>

      {/* Collapsible Teacher Reference Source Panel */}
      {showTeacherSource && (
        <div className="p-4 sm:p-5 rounded-xl bg-parchment/85 border border-sandstone space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-wood-900">
              Kho văn bản nguồn đối chiếu nguyên văn (Dành cho Giáo viên hội giảng)
            </h3>
            <span className="text-xs text-wood-600">
              {teacherSourceText.trim()
                ? `${teacherSourceText.trim().split(/\s+/).length} từ đã lưu cục bộ`
                : 'CẦN BỔ SUNG TƯ LIỆU (SGK Ngữ văn 10 đang dạy)'}
            </span>
          </div>
          <p className="text-xs text-wood-700 leading-relaxed">
            Dán đoạn trích nguyên văn từ bản in SGK Ngữ văn 10 của lớp bạn vào đây để Chiếc La Bàn Sử Thi đối chiếu trực tiếp câu chữ học sinh trích dẫn. Nếu để trống, hệ thống sẽ kiểm tra theo chi tiết học liệu và cảnh báo minh bạch thay vì xác nhận bừa câu trích.
          </p>
          <textarea
            rows={4}
            value={teacherSourceText}
            onChange={(e) => setTeacherSourceText(e.target.value)}
            placeholder="Dán đoạn trích nguyên văn Đăm Săn đi bắt Nữ thần Mặt Trời (tùy chọn)..."
            className="w-full p-3 text-sm rounded-lg bg-cream border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveTeacherSource}
              className="px-4 py-1.5 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 transition-colors cursor-pointer"
            >
              {sourceSavedMsg ? 'Đã lưu văn bản nguồn' : 'Lưu văn bản nguồn'}
            </button>
            {teacherSourceText && (
              <button
                type="button"
                onClick={() => {
                  setTeacherSourceText('');
                  try {
                    localStorage.removeItem(TEACHER_SOURCE_STORAGE_KEY);
                  } catch {
                    // Ignore
                  }
                }}
                className="px-3 py-1.5 text-xs text-wood-700 hover:text-wood-900 cursor-pointer"
              >
                Xóa văn bản đã nạp
              </button>
            )}
          </div>
        </div>
      )}

      {/* Claim Selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-wood-700">
            Chọn nhận định văn học cần chứng minh
          </span>
          <button
            type="button"
            onClick={() => {
              setUseCustomClaim((prev) => !prev);
              setResult(null);
            }}
            className="text-xs font-medium text-forest-800 hover:underline cursor-pointer"
          >
            {useCustomClaim ? 'Quay lại nhận định gợi ý' : 'Giáo viên nhập nhận định riêng'}
          </button>
        </div>

        {!useCustomClaim ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMPASS_CLAIMS.map((claim, idx) => {
              const active = claim.id === selectedClaimId;
              return (
                <button
                  key={claim.id}
                  type="button"
                  onClick={() => {
                    setSelectedClaimId(claim.id);
                    setResult(null);
                    setErrorMsg(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-wood-900 text-cream border-wood-900'
                      : 'bg-parchment/55 text-wood-900 border-sandstone hover:border-gold-500'
                  }`}
                >
                  <p className={`font-mono text-[11px] mb-1 ${active ? 'text-gold-400' : 'text-wood-500'}`}>
                    NHẬN ĐỊNH 0{idx + 1} · TRẠM 0{claim.stationId.replace('stage-', '')}
                  </p>
                  <p className="font-serif text-base font-bold leading-snug">
                    “{claim.statement}”
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={customClaimText}
            onChange={(e) => setCustomClaimText(e.target.value)}
            placeholder="Nhập nhận định văn học mới cho tiết hội giảng..."
            className="w-full p-3.5 text-sm rounded-xl bg-parchment/50 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
          />
        )}

        <div className="p-4 rounded-xl bg-wood-950 text-cream space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold">
            Nhận định đang phân tích
          </p>
          <p className="font-serif text-xl sm:text-2xl font-bold leading-snug text-cream">
            “{effectiveClaimStatement}”
          </p>
          {!useCustomClaim && (
            <p className="text-xs text-cream/80 pt-1">{activeClaim.focusHint}</p>
          )}
        </div>
      </div>

      {/* Main 2-Column Interactive Compass Form & Rubric Result */}
      <form onSubmit={handleEvaluate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3 Student Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Text Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-wood-900">
                1. Chọn chi tiết văn bản phù hợp (gồm cả chi tiết nhiễu để rèn sàng lọc)
              </label>
              <span className="text-xs font-mono tabular-nums text-wood-600">
                Đã chọn: {selectedDetailIds.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {STUDY_TEXT_DETAILS.map((detail) => {
                const checked = selectedDetailIds.includes(detail.id);
                return (
                  <button
                    key={detail.id}
                    type="button"
                    onClick={() => toggleDetail(detail.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-colors flex items-start gap-3 cursor-pointer ${
                      checked
                        ? 'bg-parchment border-forest-700 text-wood-900 font-medium'
                        : 'bg-cream border-sandstone text-wood-800 hover:bg-parchment/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked
                          ? 'bg-forest-700 border-forest-700 text-cream'
                          : 'border-wood-500 bg-cream'
                      }`}
                    >
                      {checked && <CheckCircle2 className="w-3 h-3" />}
                    </span>
                    <span className="leading-relaxed">{detail.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Enter Evidence */}
          <div className="space-y-2">
            <label htmlFor="compass-evidence" className="block text-sm font-semibold text-wood-900">
              2. Nhập dẫn chứng cụ thể từ văn bản học tập
            </label>
            <textarea
              id="compass-evidence"
              rows={3}
              value={evidenceQuote}
              onChange={(e) => {
                setEvidenceQuote(e.target.value);
                setResult(null);
              }}
              placeholder="Ghi lại chi tiết sự kiện, hành động, lời nói của nhân vật hoặc câu trích đối chiếu từ SGK (nếu có)..."
              className="w-full p-3.5 text-sm rounded-xl bg-parchment/40 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
            />
          </div>

          {/* Step 3: Explain Connection */}
          <div className="space-y-2">
            <label htmlFor="compass-explanation" className="block text-sm font-semibold text-wood-900">
              3. Giải thích mối liên hệ giữa dẫn chứng và nhận định
            </label>
            <textarea
              id="compass-explanation"
              rows={4}
              value={explanation}
              onChange={(e) => {
                setExplanation(e.target.value);
                setResult(null);
              }}
              placeholder="Phân tích cụ thể: Dẫn chứng trên thể hiện phẩm chất/nghệ thuật gì? Vì sao điều đó làm sáng tỏ nhận định văn học đã nêu? (Tránh chỉ nhận xét chung chung)"
              className="w-full p-3.5 text-sm rounded-xl bg-parchment/40 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-900">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 disabled:opacity-60 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đối chiếu &amp; đánh giá...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Kiểm tra cùng Chiếc La Bàn Sử Thi</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetWorkspace}
              className="px-4 py-2.5 text-xs sm:text-sm font-medium border border-sandstone rounded-lg text-wood-700 hover:text-wood-900 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>
          </div>
        </div>

        {/* Right: 3-Component Rubric Evaluation Panel */}
        <aside className="lg:col-span-5 bg-parchment/65 border border-sandstone rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-sandstone pb-3">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-forest-700" />
              <h3 className="font-serif text-xl font-bold text-wood-900">
                Bảng đánh giá 3 thành phần
              </h3>
            </div>
            {result && (
              <span className="font-mono tabular-nums text-lg font-bold text-forest-800">
                {result.totalScore}/{result.maxTotalScore} đ
              </span>
            )}
          </div>

          {!result ? (
            <div className="space-y-4 text-xs sm:text-sm text-wood-700 leading-relaxed">
              <p>
                Khi bạn nhấn kiểm tra, Chiếc La Bàn Sử Thi sẽ chấm theo 3 tiêu chí Ngữ văn chặt chẽ:
              </p>
              <ul className="space-y-2.5">
                <li className="p-3 rounded-xl bg-cream border border-sandstone">
                  <p className="font-semibold text-wood-900">1. Dẫn chứng có tồn tại trong văn bản không (0–3đ)</p>
                  <p className="text-xs text-wood-600 mt-0.5">
                    Phát hiện chi tiết nhầm hồi khác; không tự xác nhận trích dẫn nguyên văn nếu thiếu văn bản nguồn.
                  </p>
                </li>
                <li className="p-3 rounded-xl bg-cream border border-sandstone">
                  <p className="font-semibold text-wood-900">2. Dẫn chứng có phù hợp với nhận định không (0–3đ)</p>
                  <p className="text-xs text-wood-600 mt-0.5">
                    Kiểm tra mức độ trúng đích giữa chi tiết chọn và luận điểm cần chứng minh.
                  </p>
                </li>
                <li className="p-3 rounded-xl bg-cream border border-sandstone">
                  <p className="font-semibold text-wood-900">3. Phần lí giải có làm rõ vấn đề không (0–4đ)</p>
                  <p className="text-xs text-wood-600 mt-0.5">
                    Nếu thiếu dẫn chứng hoặc chỉ nhận xét chung chung, hệ thống từ chối cho điểm phân tích tối đa.
                  </p>
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-wood-600">
                <span>
                  Kết luận: <strong className="text-wood-900">{result.overallVerdict}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>{result.mode === 'gemini' ? 'Đánh giá bởi Gemini' : 'Rubric cục bộ'}</span>
              </div>

              {result.verbatimCaution && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-wood-900 flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{result.verbatimCaution}</span>
                </div>
              )}

              {/* Component 1: Existence */}
              <div className="p-4 rounded-xl bg-cream border border-sandstone space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-wood-900">
                    1. Tính xác thực trong văn bản
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800">
                    {result.evidenceExistence.status === 'confirmed_in_study_text' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                    ) : result.evidenceExistence.status === 'missing' ||
                      result.evidenceExistence.status === 'mismatch' ? (
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{result.evidenceExistence.label}</span>
                  </span>
                </div>
                <p className="text-xs text-wood-700 leading-relaxed">
                  {result.evidenceExistence.feedback}
                </p>
              </div>

              {/* Component 2: Relevance */}
              <div className="p-4 rounded-xl bg-cream border border-sandstone space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-wood-900">
                    2. Độ phù hợp với nhận định
                  </span>
                  <span className="font-mono tabular-nums text-xs font-bold text-wood-900">
                    {result.evidenceRelevance.score}/{result.evidenceRelevance.maxScore}
                  </span>
                </div>
                <p className="text-xs text-wood-700 leading-relaxed">
                  {result.evidenceRelevance.feedback}
                </p>
              </div>

              {/* Component 3: Reasoning */}
              <div className="p-4 rounded-xl bg-cream border border-sandstone space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-wood-900">
                    3. Chất lượng lí giải &amp; phân tích
                  </span>
                  <span className="font-mono tabular-nums text-xs font-bold text-wood-900">
                    {result.reasoningQuality.score}/{result.reasoningQuality.maxScore}
                  </span>
                </div>
                <p className="text-xs text-wood-700 leading-relaxed">
                  {result.reasoningQuality.feedback}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-wood-900 text-cream text-xs leading-relaxed space-y-1">
                <p className="font-semibold text-gold-400">Gợi ý nâng cấp bài viết:</p>
                <p>{result.nextStepAdvice}</p>
              </div>
            </div>
          )}
        </aside>
      </form>
    </section>
  );
};
