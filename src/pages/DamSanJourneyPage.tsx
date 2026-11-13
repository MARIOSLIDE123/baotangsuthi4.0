import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Eye,
  Lock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { SUN_GODDESS_STATIONS } from '../data/damSanJourneyData';
import { CompassEvaluationResult, StationStatus, SunGoddessStation } from '../types/museum';
import { SafeImage } from '../components/common/SafeImage';
import { SunGoddess3DMap, renderStationEmblem } from '../components/threeD/SunGoddess3DMap';
import { EpicCompassLab } from '../components/epics/EpicCompassLab';

interface DamSanJourneyPageProps {
  completedMilestones: string[];
  onCompleteMilestone: (milestoneId: string) => void;
  onRecordLayerAttempt?: (
    stationTitle: string,
    layerLabel: string,
    isCorrect: boolean
  ) => void;
  onCompassEvaluated?: (
    claimStatement: string,
    stationTitle: string,
    result: CompassEvaluationResult
  ) => void;
  reducedMotion?: boolean;
}

export const DamSanJourneyPage: React.FC<DamSanJourneyPageProps> = ({
  completedMilestones,
  onCompleteMilestone,
  onRecordLayerAttempt,
  onCompassEvaluated,
  reducedMotion = false,
}) => {
  const [activeStationId, setActiveStationId] = useState<SunGoddessStation['id']>('stage-1');
  const [activeLayerIndex, setActiveLayerIndex] = useState<0 | 1 | 2>(0);
  const [teacherFreeExplore, setTeacherFreeExplore] = useState(false);

  // Track layer answers & completion across all 4 stations (3 layers each = 12 layers)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [submittedLayers, setSubmittedLayers] = useState<Record<string, boolean>>({});
  const [completedLayers, setCompletedLayers] = useState<Record<string, boolean>>(() => {
    // Pre-mark all 3 layers if a station was already marked completed in Passport
    const initial: Record<string, boolean> = {};
    SUN_GODDESS_STATIONS.forEach((st) => {
      if (completedMilestones.includes(st.id)) {
        st.layers.forEach((layer) => {
          initial[layer.id] = true;
        });
      }
    });
    return initial;
  });
  const [reflectionNotes, setReflectionNotes] = useState<Record<string, string>>({});
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const getStationStatus = useMemo(() => {
    return (stationId: SunGoddessStation['id']): StationStatus => {
      if (completedMilestones.includes(stationId)) return 'completed';
      const idx = SUN_GODDESS_STATIONS.findIndex((s) => s.id === stationId);
      if (idx <= 0) return 'active';
      const prevId = SUN_GODDESS_STATIONS[idx - 1].id;
      if (completedMilestones.includes(prevId)) return 'active';
      return 'locked';
    };
  }, [completedMilestones]);

  const activeStation =
    SUN_GODDESS_STATIONS.find((s) => s.id === activeStationId) || SUN_GODDESS_STATIONS[0];
  const activeStationStatus = getStationStatus(activeStation.id);
  const canInteractWithActive = teacherFreeExplore || activeStationStatus !== 'locked';
  const activeLayer = activeStation.layers[activeLayerIndex];

  const stationCompletedLayerCount = activeStation.layers.filter(
    (l) => completedLayers[l.id]
  ).length;
  const isStationFullySolved =
    completedMilestones.includes(activeStation.id) ||
    stationCompletedLayerCount === activeStation.layers.length;

  const handleSelectStation = (stationId: SunGoddessStation['id']) => {
    const status = getStationStatus(stationId);
    setActiveStationId(stationId);
    setActiveLayerIndex(0);

    if (!teacherFreeExplore && status === 'locked') {
      const idx = SUN_GODDESS_STATIONS.findIndex((s) => s.id === stationId);
      const prevStation = SUN_GODDESS_STATIONS[Math.max(0, idx - 1)];
      setLockedNotice(
        `Trạm ${idx + 1} đang ở trạng thái Chưa khám phá. Hãy hoàn thành đủ 3 lớp nhiệm vụ ở "${prevStation.title}" để mở khóa chặng tiếp theo (hoặc bật Chế độ Hội giảng GV để xem trước).`
      );
    } else {
      setLockedNotice(null);
    }
  };

  const handleCheckLayer = () => {
    const chosen = selectedOptions[activeLayer.id];
    if (chosen === undefined) return;
    setSubmittedLayers((prev) => ({ ...prev, [activeLayer.id]: true }));
    const correct = chosen === activeLayer.correctIndex;
    onRecordLayerAttempt?.(activeStation.title, activeLayer.layerLabel, correct);

    if (correct) {
      const nextCompletedLayers = { ...completedLayers, [activeLayer.id]: true };
      setCompletedLayers(nextCompletedLayers);

      const allDoneForStation = activeStation.layers.every(
        (l) => nextCompletedLayers[l.id]
      );
      if (allDoneForStation) {
        onCompleteMilestone(activeStation.id);
      }
    }
  };

  const currentStationIdx = SUN_GODDESS_STATIONS.findIndex((s) => s.id === activeStation.id);
  const nextStation =
    currentStationIdx < SUN_GODDESS_STATIONS.length - 1
      ? SUN_GODDESS_STATIONS[currentStationIdx + 1]
      : null;

  const chosenOption = selectedOptions[activeLayer.id];
  const isSubmitted = Boolean(submittedLayers[activeLayer.id]);
  const isCorrect =
    completedLayers[activeLayer.id] ||
    (isSubmitted && chosenOption === activeLayer.correctIndex);

  const completedStationCount = SUN_GODDESS_STATIONS.filter((s) =>
    completedMilestones.includes(s.id)
  ).length;

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <header className="border-b border-sandstone pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-medium text-wood-600">
            Phân khu 06 · Trải nghiệm đọc hiểu trọng tâm tiết hội giảng Ngữ văn 10
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
            Con Đường Đến Nữ Thần Mặt Trời
          </h1>
          <p className="text-sm sm:text-base text-wood-700 leading-relaxed">
            Hành trình tương tác theo dấu Đăm Săn qua 4 trạm nhiệm vụ 3 lớp (Khám phá sự kiện · Giải mã nghệ thuật · Suy ngẫm ý nghĩa) và luyện lập luận cùng Chiếc La Bàn Sử Thi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <span className="text-sm font-semibold text-forest-800 font-mono tabular-nums bg-parchment px-4 py-2 rounded-lg border border-sandstone">
            Hoàn thành: {completedStationCount}/{SUN_GODDESS_STATIONS.length} trạm
          </span>

          <button
            type="button"
            onClick={() => {
              setTeacherFreeExplore((prev) => !prev);
              setLockedNotice(null);
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              teacherFreeExplore
                ? 'bg-wood-900 text-gold-400 border-wood-900'
                : 'bg-cream text-wood-800 border-sandstone hover:border-gold-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{teacherFreeExplore ? 'Hội giảng GV: Đang mở đủ 4 trạm' : 'Chế độ Hội giảng GV'}</span>
          </button>

          <a
            href="#epic-compass-section"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest-700 text-cream hover:bg-forest-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-gold-400" />
            <span>Chiếc La Bàn Sử Thi</span>
          </a>
        </div>
      </header>

      {/* 3D Adventure Map */}
      <SunGoddess3DMap
        stations={SUN_GODDESS_STATIONS}
        activeStationId={activeStationId}
        getStationStatus={getStationStatus}
        onSelectStation={handleSelectStation}
        reducedMotion={reducedMotion}
      />

      {lockedNotice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-sm text-wood-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{lockedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectStation('stage-1')}
            className="px-3 py-1.5 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 cursor-pointer"
          >
            Về Trạm 1
          </button>
        </div>
      )}

      {/* Active Station Workspace */}
      <section aria-label={activeStation.title} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Station Dossier, Objectives & Study Context */}
        <aside className="lg:col-span-5 rounded-2xl overflow-hidden border border-sandstone bg-cream">
          <div className="relative h-60 bg-wood-950">
            <SafeImage
              src={activeStation.imagePath}
              alt={activeStation.imageAlt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wood-950 via-wood-950/35 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-cream space-y-1">
              <div className="flex items-center gap-2 text-xs text-gold-400">
                {renderStationEmblem(activeStation.emblemType, 'w-4 h-4')}
                <MapPin className="w-3.5 h-3.5" />
                <span>{activeStation.locationLabel}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold leading-snug">
                {activeStation.title}
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-forest-800">
                Mục tiêu trạm
              </p>
              <p className="text-sm font-medium text-wood-900 leading-relaxed">
                {activeStation.objective}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-sandstone">
              <p className="text-xs font-semibold uppercase tracking-wider text-wood-600">
                4 Nhiệm vụ trọng tâm tại trạm
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-wood-800">
                {activeStation.tasksChecklist.map((task, idx) => (
                  <li key={task} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-forest-700 font-semibold mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-parchment/75 border border-sandstone space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-wood-900">
                <BookOpen className="w-3.5 h-3.5 text-forest-700" />
                <span>Mạch sự kiện học tập</span>
              </div>
              <p className="text-xs sm:text-sm text-wood-800 leading-relaxed">
                {activeStation.studySummary}
              </p>
              <p className="text-[11px] text-wood-600 leading-relaxed pt-1 border-t border-sandstone/70">
                {activeStation.verbatimReferenceNote}
              </p>
            </div>
          </div>
        </aside>

        {/* Right: 3 Mission Layers */}
        <div className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sandstone pb-4">
            <div>
              <p className="text-xs text-wood-600">Nhiệm vụ đọc hiểu 3 lớp</p>
              <h3 className="font-serif text-2xl font-bold text-wood-900">
                {activeStation.shortName}
              </h3>
            </div>
            <span className="text-xs font-mono tabular-nums text-forest-800 bg-parchment px-3 py-1.5 rounded-lg border border-sandstone">
              Tiến độ trạm: {stationCompletedLayerCount}/3 lớp
            </span>
          </div>

          {!canInteractWithActive ? (
            <div className="p-6 rounded-xl bg-parchment/60 border border-sandstone text-center space-y-3">
              <Lock className="w-7 h-7 text-wood-600 mx-auto" />
              <p className="font-serif text-xl font-bold text-wood-900">
                Trạm đang khóa — Chưa khám phá
              </p>
              <p className="text-sm text-wood-700 max-w-md mx-auto leading-relaxed">
                Hãy hoàn thành 3 lớp nhiệm vụ ở trạm trước để mở đường ánh sáng dẫn tới trạm này, hoặc bật <strong>Chế độ Hội giảng GV</strong> để trình chiếu tự do.
              </p>
            </div>
          ) : (
            <>
              {/* 3-Layer Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeStation.layers.map((layer, idx) => {
                  const isLayerActive = activeLayerIndex === idx;
                  const isLayerDone = Boolean(completedLayers[layer.id]);
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => setActiveLayerIndex(idx as 0 | 1 | 2)}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isLayerActive
                          ? 'bg-wood-900 text-cream border-wood-900'
                          : 'bg-parchment/60 text-wood-900 border-sandstone hover:border-gold-500'
                      }`}
                    >
                      <span className="text-xs font-semibold leading-snug">
                        {layer.layerLabel}
                      </span>
                      {isLayerDone && (
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isLayerActive ? 'text-gold-400' : 'text-forest-700'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Layer Task Content */}
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-parchment/55 border border-sandstone space-y-1.5">
                  <p className="text-xs font-semibold text-forest-800">
                    {activeLayer.focusHeading}
                  </p>
                  <p className="text-sm text-wood-800 leading-relaxed">
                    {activeLayer.contextExcerpt}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-wood-900 leading-snug">
                    Câu hỏi đọc hiểu: {activeLayer.question}
                  </h4>

                  <div className="space-y-2.5">
                    {activeLayer.options.map((opt, idx) => {
                      const chosen = chosenOption === idx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [activeLayer.id]: idx,
                            }));
                            setSubmittedLayers((prev) => ({
                              ...prev,
                              [activeLayer.id]: false,
                            }));
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                            chosen
                              ? 'bg-parchment border-forest-700 font-medium text-wood-900'
                              : 'bg-cream border-sandstone text-wood-800 hover:bg-parchment/40'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Reflection Note */}
                <div className="space-y-1.5 pt-2">
                  <label
                    htmlFor={`reflection-${activeLayer.id}`}
                    className="block text-xs font-semibold text-wood-700"
                  >
                    Ghi chép suy luận cá nhân · {activeLayer.reflectionPrompt}
                  </label>
                  <textarea
                    id={`reflection-${activeLayer.id}`}
                    rows={2}
                    value={reflectionNotes[activeLayer.id] || ''}
                    onChange={(e) =>
                      setReflectionNotes((prev) => ({
                        ...prev,
                        [activeLayer.id]: e.target.value,
                      }))
                    }
                    placeholder="Viết ngắn gọn ý kiến hoặc chi tiết em tâm đắc để trao đổi trên lớp..."
                    className="w-full p-3 text-sm rounded-xl bg-parchment/35 border border-sandstone text-wood-900 focus:outline-none focus:border-forest-700"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    disabled={chosenOption === undefined}
                    onClick={handleCheckLayer}
                    className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Kiểm tra lớp nhiệm vụ {activeLayer.layerNumber}
                  </button>

                  {activeLayerIndex < 2 ? (
                    <button
                      type="button"
                      onClick={() => setActiveLayerIndex((activeLayerIndex + 1) as 1 | 2)}
                      className="px-4 py-2 text-xs sm:text-sm font-medium text-wood-800 border border-sandstone rounded-lg hover:border-gold-500 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Sang Lớp {activeLayerIndex + 2}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : nextStation && isStationFullySolved ? (
                    <button
                      type="button"
                      onClick={() => handleSelectStation(nextStation.id)}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Mở khóa &amp; sang Trạm {nextStation.stepNumber}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>

                {/* Instant Pedagogical Feedback */}
                {(isSubmitted || completedLayers[activeLayer.id]) && (
                  <div
                    className={`p-4 rounded-xl border text-sm leading-relaxed ${
                      isCorrect
                        ? 'bg-forest-800/10 border-forest-700/40 text-forest-800'
                        : 'bg-amber-50 border-amber-300 text-wood-900'
                    }`}
                  >
                    <p className="font-semibold mb-1">
                      {isCorrect
                        ? `Chính xác! Đã ghi nhận ${activeLayer.layerLabel}.`
                        : 'Chưa chính xác, hãy đọc lại mạch sự kiện bên trái và chọn lại nhé.'}
                    </p>
                    {isCorrect && <p>{activeLayer.explanation}</p>}
                  </div>
                )}

                {isStationFullySolved && (
                  <div className="p-4 rounded-xl bg-wood-900 text-cream flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-sm">
                      <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>
                        <strong>Hoàn thành {activeStation.title}!</strong>{' '}
                        {nextStation
                          ? `Trạm ${nextStation.stepNumber} đã được mở khóa trên bản đồ 3D.`
                          : 'Bạn đã hoàn thành toàn bộ 4 trạm tới Cung điện Nữ thần Mặt Trời!'}
                      </span>
                    </div>
                    {nextStation && (
                      <button
                        type="button"
                        onClick={() => handleSelectStation(nextStation.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 cursor-pointer whitespace-nowrap"
                      >
                        Đi tới Trạm {nextStation.stepNumber}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Special Feature: CHIẾC LA BÀN SỬ THI */}
      <EpicCompassLab
        activeStationId={activeStationId}
        onCompassEvaluated={onCompassEvaluated}
      />
    </div>
  );
};
