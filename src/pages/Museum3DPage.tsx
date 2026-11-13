import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  DoorOpen,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LONGHOUSE_3D_CONFIG } from '../config/longhouse3dConfig';
import { MUSEUM_3D_HOTSPOTS } from '../data/museum3dData';
import { Museum3DHotspot, MuseumRouteId } from '../types/museum';
import {
  EdeLonghouseScene,
  PlayerTelemetry,
  QualityPreset,
} from '../components/threeD/EdeLonghouseScene';
import { SafeImage } from '../components/common/SafeImage';

interface Museum3DPageProps {
  completedHotspots: string[];
  museum3DScore: number;
  onCompleteHotspot: (hotspotId: string, points: number) => void;
  onHotspotAttempt?: (hotspot: Museum3DHotspot, isCorrect: boolean) => void;
  onNavigate: (route: MuseumRouteId) => void;
}

export const Museum3DPage: React.FC<Museum3DPageProps> = ({
  completedHotspots,
  museum3DScore,
  onCompleteHotspot,
  onHotspotAttempt,
  onNavigate,
}) => {
  const [quality, setQuality] = useState<QualityPreset>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'low' : 'high'
  );
  const [telemetry, setTelemetry] = useState<PlayerTelemetry>({
    x: 0,
    z: 27.5,
    yaw: 0,
    area: 'A',
    nearestHotspot: null,
  });
  const [activeHotspot, setActiveHotspot] = useState<Museum3DHotspot | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'mission'>('info');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [teleportRequest, setTeleportRequest] = useState<{
    target: 'A' | 'B';
    nonce: number;
  } | null>(null);
  const [is169Fullscreen, setIs169Fullscreen] = useState(false);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const handleOpenHotspot = useCallback(
    (hotspot: Museum3DHotspot) => {
      stopSpeech();
      setActiveHotspot(hotspot);
      setModalTab('info');
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
    },
    [stopSpeech]
  );

  const handleCloseHotspot = () => {
    stopSpeech();
    setActiveHotspot(null);
  };

  const handleTogglePause = useCallback(() => {
    if (activeHotspot) {
      stopSpeech();
      setActiveHotspot(null);
      return;
    }
    if (mapModalOpen) {
      setMapModalOpen(false);
      return;
    }
    setPauseMenuOpen((prev) => !prev);
  }, [activeHotspot, mapModalOpen, stopSpeech]);

  const handleToggleNarration = () => {
    if (!activeHotspot || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    const utter = new SpeechSynthesisUtterance(activeHotspot.narrationText);
    utter.lang = 'vi-VN';
    utter.rate = 0.96;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const handleSubmitMission = () => {
    if (!activeHotspot || selectedAnswer === null) return;
    setAnswerSubmitted(true);
    const correct = selectedAnswer === activeHotspot.correctIndex;
    onHotspotAttempt?.(activeHotspot, correct);
    if (correct) {
      onCompleteHotspot(activeHotspot.id, activeHotspot.points);
    }
  };

  const triggerTeleport = (target: 'A' | 'B') => {
    setTeleportRequest({ target, nonce: Date.now() });
    setPauseMenuOpen(false);
    setMapModalOpen(false);
  };

  const isPausedOrModal = Boolean(activeHotspot || pauseMenuOpen || mapModalOpen);
  const exploredCount = completedHotspots.length;
  const totalCount = MUSEUM_3D_HOTSPOTS.length;
  const progressPct = Math.round((exploredCount / totalCount) * 100);

  // Convert 3D world coords (x in [-16, 16], z in [-16, 30]) to 120x150 SVG minimap
  const mapX = (wx: number) => Math.max(8, Math.min(112, ((wx + 16) / 32) * 120));
  const mapY = (wz: number) => Math.max(8, Math.min(142, ((wz + 16) / 46) * 150));

  return (
    <div className="space-y-4 pb-10">
      {/* Compact Top Simulation Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-parchment/75 border border-sandstone rounded-xl text-xs text-wood-800">
        <div>
          <strong className="text-wood-900">BẢO TÀNG 3D – KHÁM PHÁ NHÀ DÀI Ê-ĐÊ: </strong>
          <span>{LONGHOUSE_3D_CONFIG.simulationDisclaimer}</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-3 py-1.5 font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-center"
        >
          Thoát tham quan
        </button>
      </div>

      {/* Full-Height 3D First-Person Viewport with 16:9 Cinema Aspect */}
      <div
        className={`relative transition-all duration-300 ${
          is169Fullscreen
            ? 'fixed inset-0 z-50 w-screen h-screen bg-wood-950 flex flex-col'
            : 'w-full aspect-[16/9] min-h-[520px] max-h-[860px] rounded-2xl overflow-hidden border border-sandstone shadow-xl'
        }`}
      >
        <EdeLonghouseScene
          quality={quality}
          completedHotspotIds={completedHotspots}
          paused={isPausedOrModal}
          teleportRequest={teleportRequest}
          onTelemetryUpdate={setTelemetry}
          onInteractHotspot={handleOpenHotspot}
          onTogglePause={handleTogglePause}
          onExitFallback={() => onNavigate('home')}
        />

        {/* HUD Top-Left: Current Area & Progress */}
        <div className="absolute top-3 left-3 z-20 max-w-[260px] sm:max-w-xs bg-wood-950/75 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-cream space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-gold-400">
              {telemetry.area === 'A'
                ? 'Khu vực A · Bên ngoài nhà dài'
                : 'Khu vực B · Bên trong nhà dài'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-cream/85 font-mono tabular-nums">
            <span>
              Điểm khám phá: {exploredCount}/{totalCount}
            </span>
            <span className="text-gold-400">{museum3DScore} đ</span>
          </div>

          <div className="h-1.5 rounded-full bg-wood-800 overflow-hidden">
            <div
              className="h-full bg-gold-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* HUD Top-Right: Minimap & Settings & Fullscreen Toggle */}
        <div className="absolute top-3 right-3 z-20 flex items-start gap-2 pointer-events-auto">
          {/* Compact Live Radar Minimap (Desktop/Tablet) */}
          <button
            type="button"
            onClick={() => setMapModalOpen(true)}
            title="Mở bản đồ hành trình"
            className="hidden sm:block bg-wood-950/75 backdrop-blur-md border border-white/15 rounded-xl p-2 hover:border-gold-400 transition-colors cursor-pointer"
          >
            <svg width="96" height="118" viewBox="0 0 120 150" className="block">
              {/* Longhouse footprint */}
              <rect
                x={mapX(-4.8)}
                y={mapY(-13)}
                width={mapX(4.8) - mapX(-4.8)}
                height={mapY(13) - mapY(-13)}
                fill="rgba(194,140,44,0.18)"
                stroke="rgba(220,168,71,0.65)"
                strokeWidth="1.5"
              />
              {/* Pathway */}
              <line
                x1={mapX(0)}
                y1={mapY(13)}
                x2={mapX(0)}
                y2={mapY(29)}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="3"
              />
              {/* Hotspots */}
              {MUSEUM_3D_HOTSPOTS.map((hs) => {
                const done = completedHotspots.includes(hs.id);
                return (
                  <circle
                    key={hs.id}
                    cx={mapX(hs.position.x)}
                    cy={mapY(hs.position.z)}
                    r="3.2"
                    fill={done ? '#4ADE80' : '#DCA847'}
                  />
                );
              })}
              {/* Player marker */}
              <circle
                cx={mapX(telemetry.x)}
                cy={mapY(telemetry.z)}
                r="4.2"
                fill="#FFFFFF"
                stroke="#173D2B"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setIs169Fullscreen((prev) => !prev)}
              className="p-2.5 min-w-[42px] min-h-[42px] rounded-xl bg-wood-950/75 backdrop-blur-md border border-white/15 text-cream hover:border-gold-400 transition-colors cursor-pointer flex items-center justify-center shadow-md"
              title={is169Fullscreen ? 'Thu nhỏ 3D' : 'Toàn màn hình 3D (16:9)'}
              aria-label="Toàn màn hình 3D"
            >
              {is169Fullscreen ? <Minimize2 className="w-4 h-4 text-gold-400" /> : <Maximize2 className="w-4 h-4 text-gold-400" />}
            </button>

            <button
              type="button"
              onClick={() => setMapModalOpen(true)}
              className="p-2.5 min-w-[42px] min-h-[42px] rounded-xl bg-wood-950/75 backdrop-blur-md border border-white/15 text-cream hover:border-gold-400 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Mở bản đồ khu vực"
            >
              <MapIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setPauseMenuOpen(true)}
              className="p-2.5 min-w-[42px] min-h-[42px] rounded-xl bg-wood-950/75 backdrop-blur-md border border-white/15 text-cream hover:border-gold-400 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Cài đặt và tạm dừng"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Proximity Prompt: NHẤN E ĐỂ KHÁM PHÁ */}
        {telemetry.nearestHotspot && !activeHotspot && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <button
              type="button"
              onClick={() => handleOpenHotspot(telemetry.nearestHotspot!)}
              className="px-5 py-2.5 rounded-xl bg-gold-500 text-wood-950 font-semibold text-xs sm:text-sm shadow-lg hover:bg-gold-400 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              <span>NHẤN E ĐỂ KHÁM PHÁ · {telemetry.nearestHotspot.shortLabel}</span>
            </button>
          </div>
        )}

        {/* HUD Bottom Control Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-lg bg-wood-950/80 backdrop-blur-sm border border-white/10 text-[11px] text-cream/85 text-center max-w-[95%] pointer-events-none">
          <span className="hidden lg:inline">
            WASD / Mũi tên: Di chuyển · Kéo chuột: Xoay góc nhìn · E: Khám phá điểm sáng · ESC: Tạm dừng
          </span>
          <span className="lg:hidden">
            Joystick trái: Di chuyển · Vuốt phải: Xoay nhìn · Chạm nút vàng khi lại gần
          </span>
        </div>

        {/* Floating Hotspot Modal (Reading / Narration / Mission) */}
        {activeHotspot && (
          <div className="absolute inset-0 z-30 bg-wood-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[90%] overflow-y-auto bg-cream text-wood-900 border border-sandstone rounded-2xl shadow-2xl p-5 sm:p-7 space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-sandstone pb-3">
                <div>
                  <p className="text-xs font-medium text-forest-700">{activeHotspot.areaLabel}</p>
                  <h2 className="font-serif text-2xl font-bold text-wood-900">
                    {activeHotspot.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCloseHotspot}
                  className="px-3 py-1.5 text-xs font-semibold bg-parchment border border-sandstone rounded-lg hover:border-wood-900 cursor-pointer"
                >
                  Đóng (ESC)
                </button>
              </div>

              {/* Action Buttons: ĐỌC THÔNG TIN · NGHE THUYẾT MINH · LÀM NHIỆM VỤ */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setModalTab('info')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    modalTab === 'info'
                      ? 'bg-wood-900 text-cream'
                      : 'bg-parchment text-wood-800 border border-sandstone'
                  }`}
                >
                  ĐỌC THÔNG TIN
                </button>

                <button
                  type="button"
                  onClick={handleToggleNarration}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    isSpeaking
                      ? 'bg-gold-500 text-wood-950'
                      : 'bg-parchment text-wood-800 border border-sandstone hover:border-gold-500'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'DỪNG THUYẾT MINH' : 'NGHE THUYẾT MINH'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('mission')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'mission'
                      ? 'bg-forest-700 text-cream'
                      : 'bg-parchment text-wood-800 border border-sandstone hover:border-forest-700'
                  }`}
                >
                  <span>LÀM NHIỆM VỤ (+{activeHotspot.points}đ)</span>
                </button>
              </div>

              {modalTab === 'info' ? (
                <div className="space-y-4">
                  <div className="h-44 sm:h-52 rounded-xl overflow-hidden border border-sandstone">
                    <SafeImage
                      src={activeHotspot.imagePath}
                      alt={activeHotspot.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-wood-800 leading-relaxed">
                    {activeHotspot.description}
                  </p>
                  <p className="text-xs text-wood-700 bg-parchment/80 border border-sandstone p-3.5 rounded-xl leading-relaxed">
                    {activeHotspot.simulationNote}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold text-wood-900">
                    {activeHotspot.missionQuestion}
                  </h3>
                  <div className="space-y-2">
                    {activeHotspot.missionOptions.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedAnswer(idx);
                          setAnswerSubmitted(false);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                          selectedAnswer === idx
                            ? 'bg-parchment border-forest-700 font-semibold text-wood-900'
                            : 'bg-cream border-sandstone text-wood-800 hover:bg-parchment/50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={selectedAnswer === null}
                    onClick={handleSubmitMission}
                    className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Xác nhận câu trả lời
                  </button>

                  {answerSubmitted && (
                    <div
                      className={`p-4 rounded-xl border text-sm leading-relaxed ${
                        selectedAnswer === activeHotspot.correctIndex
                          ? 'bg-forest-800/10 border-forest-700/40 text-forest-800'
                          : 'bg-amber-50 border-amber-300 text-wood-900'
                      }`}
                    >
                      {selectedAnswer === activeHotspot.correctIndex ? (
                        <>
                          <p className="font-semibold mb-1">
                            Hoàn thành! +{activeHotspot.points} điểm · Mở khóa dấu ấn “
                            {activeHotspot.badgeReward}”
                          </p>
                          <p>{activeHotspot.missionExplanation}</p>
                        </>
                      ) : (
                        <p className="font-semibold">
                          Chưa chính xác, bạn hãy đọc lại thông tin điểm khám phá và chọn lại nhé.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Modal (Area A & B Overview + Quick Teleport) */}
        {mapModalOpen && (
          <div className="absolute inset-0 z-30 bg-wood-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl max-h-[88%] overflow-y-auto bg-cream text-wood-900 border border-sandstone rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-sandstone pb-3">
                <h2 className="font-serif text-2xl font-bold">Bản đồ 2 khu vực tham quan 3D</h2>
                <button
                  type="button"
                  onClick={() => setMapModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-parchment border border-sandstone rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => triggerTeleport('A')}
                  className="p-3.5 rounded-xl bg-parchment border border-sandstone hover:border-gold-500 text-left cursor-pointer"
                >
                  <p className="text-xs font-semibold text-forest-700">Khu vực A</p>
                  <p className="text-sm font-bold text-wood-900">Di chuyển tới Cổng ngoài</p>
                </button>

                <button
                  type="button"
                  onClick={() => triggerTeleport('B')}
                  className="p-3.5 rounded-xl bg-parchment border border-sandstone hover:border-gold-500 text-left cursor-pointer"
                >
                  <p className="text-xs font-semibold text-jade-700">Khu vực B</p>
                  <p className="text-sm font-bold text-wood-900">Di chuyển vào Trong nhà dài</p>
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-wood-700">
                  Danh sách {MUSEUM_3D_HOTSPOTS.length} điểm tương tác:
                </p>
                {MUSEUM_3D_HOTSPOTS.map((hs) => {
                  const done = completedHotspots.includes(hs.id);
                  return (
                    <div
                      key={hs.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-sandstone bg-parchment/40 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-wood-600">Khu {hs.area} · </span>
                        <span className="font-semibold text-wood-900">{hs.title}</span>
                      </div>
                      {done ? (
                        <span className="text-forest-700 font-semibold inline-flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã xong
                        </span>
                      ) : (
                        <span className="text-wood-500 shrink-0">Chưa khám phá</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pause & Settings Menu (ESC) */}
        {pauseMenuOpen && (
          <div className="absolute inset-0 z-30 bg-wood-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-cream text-wood-900 border border-sandstone rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-sandstone pb-3">
                <Pause className="w-5 h-5 text-forest-700" />
                <h2 className="font-serif text-2xl font-bold">Tạm dừng tham quan 3D</h2>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-wood-700">
                  Tối ưu hiệu suất đồ họa (khuyên dùng Tiết kiệm trên điện thoại yếu):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuality('high')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      quality === 'high'
                        ? 'bg-wood-900 text-cream border-wood-900'
                        : 'bg-parchment text-wood-800 border-sandstone'
                    }`}
                  >
                    Đồ họa cao
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality('low')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      quality === 'low'
                        ? 'bg-wood-900 text-cream border-wood-900'
                        : 'bg-parchment text-wood-800 border-sandstone'
                    }`}
                  >
                    Tiết kiệm (Nhẹ)
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPauseMenuOpen(false)}
                  className="w-full py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Tiếp tục tham quan</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerTeleport('A')}
                  className="w-full py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 cursor-pointer"
                >
                  Quay lại Cổng vào ngoài trời (Khu A)
                </button>
                <button
                  type="button"
                  onClick={() => triggerTeleport('B')}
                  className="w-full py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 cursor-pointer"
                >
                  Di chuyển vào Trong nhà dài (Khu B)
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="w-full py-2.5 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Thoát về Trang chủ bảo tàng</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
