import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  DoorOpen,
  Eye,
  EyeOff,
  Flame,
  Layers,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ExhibitionMode,
  LONGHOUSE_3D_CONFIG,
} from '../config/longhouse3dConfig';
import { MUSEUM_3D_HOTSPOTS } from '../data/museum3dData';
import { Museum3DHotspot, MuseumRouteId } from '../types/museum';
import {
  EdeLonghouseScene,
  QualityPreset,
  TourPoint,
  TOUR_POINTS,
} from '../components/threeD/EdeLonghouseScene';
import { SafeImage } from '../components/common/SafeImage';
import { playCorrectSound, playWrongSound } from '../services/ambientAudioService';

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
  const [currentTourPointId, setCurrentTourPointId] = useState('tp-entrance');
  const navigateTourRef = useRef<((id: string) => void) | null>(null);

  const [activeHotspot, setActiveHotspot] = useState<Museum3DHotspot | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'mission' | 'khanStory' | 'khanArt'>('info');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isChantingKhan, setIsChantingKhan] = useState(false);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [is169Fullscreen, setIs169Fullscreen] = useState(false);
  const [exhibitionMode, setExhibitionMode] = useState<ExhibitionMode>('daily');
  const [screenshotNonce, setScreenshotNonce] = useState<number | null>(null);
  const [hideHud, setHideHud] = useState(false);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsChantingKhan(false);
  }, []);

  const handleToggleChantKhan = () => {
    if (!activeHotspot?.khanStoryText || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (isChantingKhan) {
      stopSpeech();
      return;
    }
    stopSpeech();
    const utter = new SpeechSynthesisUtterance(activeHotspot.khanStoryText);
    utter.lang = 'vi-VN';
    utter.rate = 0.88; // Giọng ngâm trầm bổng, khoan thai của nghệ nhân
    utter.pitch = 0.92;
    utter.onend = () => setIsChantingKhan(false);
    utter.onerror = () => setIsChantingKhan(false);
    setIsChantingKhan(true);
    window.speechSynthesis.speak(utter);
  };

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
    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
    onHotspotAttempt?.(activeHotspot, correct);
    if (correct) {
      onCompleteHotspot(activeHotspot.id, activeHotspot.points);
    }
  };

  // Arrow navigation handler
  const handleArrowNav = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (activeHotspot || pauseMenuOpen || mapModalOpen) return;
    const point = TOUR_POINTS.find((p) => p.id === currentTourPointId);
    const nextId = point?.neighbors[dir];
    if (nextId) {
      setCurrentTourPointId(nextId);
      navigateTourRef.current?.(nextId);
    }
  };

  const currentPoint = TOUR_POINTS.find((p) => p.id === currentTourPointId);
  const exploredCount = completedHotspots.length;
  const totalCount = MUSEUM_3D_HOTSPOTS.length;
  const progressPct = Math.round((exploredCount / totalCount) * 100);

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

      {/* Full-Height 3D Tour Viewport with 16:9 Cinema Aspect */}
      <div
        className={`relative transition-all duration-300 ${
          is169Fullscreen
            ? 'fixed inset-0 z-50 w-screen h-screen bg-wood-950 flex flex-col'
            : 'w-full aspect-[16/9] min-h-[520px] max-h-[860px] rounded-2xl overflow-hidden border border-sandstone shadow-xl'
        }`}
      >
        <EdeLonghouseScene
          quality={quality}
          exhibitionMode={exhibitionMode}
          cameraMode="tour"
          completedHotspotIds={completedHotspots}
          screenshotNonce={screenshotNonce}
          currentTourPointId={currentTourPointId}
          onInteractHotspot={handleOpenHotspot}
          onNavigateFnReady={(fn) => { navigateTourRef.current = fn; }}
          onTourPointChange={(_, id) => setCurrentTourPointId(id)}
          onExitFallback={() => onNavigate('home')}
        />

        {/* Floating Quick Action: Hiện lại giao diện khi đang ở chế độ ẩn UI */}
        {hideHud && (
          <button
            type="button"
            onClick={() => setHideHud(false)}
            className="absolute top-3 right-3 z-30 px-3.5 py-2 rounded-xl bg-wood-950/80 backdrop-blur-md border border-gold-400 text-gold-400 font-semibold text-xs flex items-center gap-1.5 shadow-lg hover:bg-wood-900 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Hiện giao diện</span>
          </button>
        )}

        {/* HUD Top-Center: Chế độ Camera & Chụp ảnh */}
        {!hideHud && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 pointer-events-auto max-w-[92%]">
            {/* Chế độ trưng bày: Sinh hoạt thường ngày / Lễ hội & Diễn xướng */}
            <button
              type="button"
              onClick={() =>
                setExhibitionMode((prev) => (prev === 'daily' ? 'festive' : 'daily'))
              }
              title="Chuyển chế độ trưng bày di sản"
              className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md ${
                exhibitionMode === 'festive'
                  ? 'bg-gold-500/90 border-gold-400 text-wood-950 shadow-gold-500/20'
                  : 'bg-wood-950/80 border-white/15 text-cream hover:border-gold-400'
              }`}
            >
              {exhibitionMode === 'festive' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-wood-950" />
                  <span>Lễ hội &amp; Diễn xướng</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-gold-400" />
                  <span>Sinh hoạt thường ngày</span>
                </>
              )}
            </button>

            {/* Orbit view toggle */}
            <div className="flex items-center p-1 rounded-xl bg-wood-950/80 backdrop-blur-md border border-white/15 text-xs text-cream shadow-md">
              <button
                type="button"
                onClick={() => setExhibitionMode((prev) => prev)}
                title="Xoay 360° quan sát kiến trúc toàn cảnh"
                className="px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 text-cream/80 hover:text-cream"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xoay 360°</span>
              </button>
            </div>

            {/* Photo mode: Chụp ảnh màn hình & Ẩn UI */}
            <div className="flex items-center gap-1 bg-wood-950/80 backdrop-blur-md border border-white/15 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setScreenshotNonce(Date.now())}
                title="Chụp ảnh màn hình 3D (Tải file PNG)"
                className="p-1.5 text-cream/90 hover:text-gold-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Chụp ảnh 3D"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setHideHud(true)}
                title="Ẩn giao diện để chiêm ngưỡng kiến trúc"
                className="p-1.5 text-cream/90 hover:text-gold-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Ẩn giao diện"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* HUD Top-Left: Tour Point & Progress */}
        {!hideHud && (
          <div className="absolute top-3 left-3 z-20 max-w-[260px] sm:max-w-xs bg-wood-950/75 backdrop-blur-md border border-white/15 rounded-xl p-3.5 text-cream space-y-2 pointer-events-auto">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gold-400">📍 {currentPoint?.label ?? 'Cửa vào Gian Gah'}</span>
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
        )}

        {/* HUD Top-Right: Settings & Fullscreen Toggle */}
        {!hideHud && (
          <div className="absolute top-3 right-3 z-20 flex items-start gap-2 pointer-events-auto">
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
                aria-label="Mở danh sách điểm tham quan"
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
        )}

        {/* Arrow Navigation Panel – Bottom Center */}
        {!hideHud && !activeHotspot && !pauseMenuOpen && !mapModalOpen && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 select-none pointer-events-auto">
            {/* Current position label */}
            <div className="px-4 py-1.5 rounded-lg bg-wood-950/80 backdrop-blur-sm text-gold-400 text-xs font-semibold text-center mb-1 border border-gold-500/30">
              📍 {currentPoint?.label ?? ''}
            </div>

            {/* UP */}
            <button
              type="button"
              onClick={() => handleArrowNav('up')}
              disabled={!currentPoint?.neighbors.up}
              className="w-14 h-14 rounded-2xl bg-wood-900/85 backdrop-blur-md border border-gold-500/40 text-gold-400 text-2xl shadow-lg hover:bg-wood-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
            >
              ↑
            </button>

            {/* LEFT / DOWN / RIGHT */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleArrowNav('left')}
                disabled={!currentPoint?.neighbors.left}
                className="w-14 h-14 rounded-2xl bg-wood-900/85 backdrop-blur-md border border-gold-500/40 text-gold-400 text-2xl shadow-lg hover:bg-wood-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => handleArrowNav('down')}
                disabled={!currentPoint?.neighbors.down}
                className="w-14 h-14 rounded-2xl bg-wood-900/85 backdrop-blur-md border border-gold-500/40 text-gold-400 text-2xl shadow-lg hover:bg-wood-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => handleArrowNav('right')}
                disabled={!currentPoint?.neighbors.right}
                className="w-14 h-14 rounded-2xl bg-wood-900/85 backdrop-blur-md border border-gold-500/40 text-gold-400 text-2xl shadow-lg hover:bg-wood-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
              >
                →
              </button>
            </div>

            <p className="text-cream/60 text-[10px] mt-1">
              Nhấn mũi tên để di chuyển · Nhấp đúp vào vật thể để tìm hiểu
            </p>
          </div>
        )}

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
                  Đóng ✕
                </button>
              </div>

              {/* Action Buttons: ĐỌC THÔNG TIN · NGHE KỂ KHAN · TÌM HIỂU NGHỆ THUẬT · NGHE THUYẾT MINH · LÀM NHIỆM VỤ */}
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

                {activeHotspot.khanStoryText && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalTab('khanStory');
                      handleToggleChantKhan();
                    }}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                      modalTab === 'khanStory'
                        ? 'bg-gold-500 text-wood-950 shadow-md font-bold'
                        : 'bg-amber-100/80 text-wood-900 border border-gold-500 hover:bg-gold-400'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isChantingKhan ? 'DỪNG DIỄN XƯỚNG KHAN' : 'NGHE KỂ KHAN'}</span>
                  </button>
                )}

                {activeHotspot.khanArtDetail && (
                  <button
                    type="button"
                    onClick={() => setModalTab('khanArt')}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      modalTab === 'khanArt'
                        ? 'bg-wood-900 text-cream'
                        : 'bg-parchment text-wood-800 border border-sandstone'
                    }`}
                  >
                    TÌM HIỂU NGHỆ THUẬT KỂ KHAN
                  </button>
                )}

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
              ) : modalTab === 'khanStory' ? (
                <div className="space-y-4 bg-amber-50/70 border border-gold-400 p-5 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-gold-300 pb-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Trích đoạn diễn xướng sử thi Đăm Săn
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleChantKhan}
                      className="px-3 py-1 text-xs font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 cursor-pointer"
                    >
                      {isChantingKhan ? 'Dừng đọc' : 'Phát giọng nghệ nhân'}
                    </button>
                  </div>
                  <p className="font-serif italic text-base sm:text-lg text-wood-950 leading-relaxed pl-4 border-l-3 border-gold-500">
                    {activeHotspot.khanStoryText}
                  </p>
                  <p className="text-xs text-wood-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-gold-200">
                    💡 <em>Gợi ý đọc hiểu:</em> Chú ý nghệ thuật so sánh, phóng đại đặc trưng của sử thi Tây Nguyên: "vượt một đồi tranh", "vượt một đồi nứa", "bắp chân to như cây xà ngang", "khiên chạm cây rừng vang như sấm rền".
                  </p>
                </div>
              ) : modalTab === 'khanArt' ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-wood-950 text-cream space-y-3 border border-gold-500/40">
                    <h3 className="font-serif text-lg font-bold text-gold-400">
                      Nghệ thuật hát kể Khan – Di sản văn hóa phi vật thể Quốc gia
                    </h3>
                    <p className="text-sm text-cream/90 leading-relaxed">
                      {activeHotspot.khanArtDetail}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-wood-800">
                    <div className="p-3.5 rounded-xl border border-sandstone bg-parchment">
                      <p className="font-bold text-wood-900 mb-1">🔥 Không gian diễn xướng</p>
                      <p>Bên bếp lửa bập bùng giữa Gian Gah, khi buôn làng đã gác lại việc nương rẫy, quây quần nghe kể từ chập tối tới rạng sáng.</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-sandstone bg-parchment">
                      <p className="font-bold text-wood-900 mb-1">👥 Môi trường cộng đồng</p>
                      <p>Người nghe không chỉ thưởng thức mà còn tiếp sức cho nghệ nhân bằng tiếng trầm trồ, hò reo theo từng chiến công của Đăm Săn.</p>
                    </div>
                  </div>
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
                            Hoàn thành! +{activeHotspot.points} điểm · Mở khóa dấu ấn "
                            {activeHotspot.badgeReward}"
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

        {/* Map Modal – Tour Points Overview */}
        {mapModalOpen && (
          <div className="absolute inset-0 z-30 bg-wood-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl max-h-[88%] overflow-y-auto bg-cream text-wood-900 border border-sandstone rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-sandstone pb-3">
                <h2 className="font-serif text-2xl font-bold">Các điểm tham quan 3D</h2>
                <button
                  type="button"
                  onClick={() => setMapModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-parchment border border-sandstone rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              {/* Tour Points Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TOUR_POINTS.map((pt) => {
                  const isActive = pt.id === currentTourPointId;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => {
                        setCurrentTourPointId(pt.id);
                        navigateTourRef.current?.(pt.id);
                        setMapModalOpen(false);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-gold-500/20 border-gold-500 text-wood-900'
                          : 'bg-parchment border-sandstone hover:border-gold-500'
                      }`}
                    >
                      <p className="text-xs font-semibold text-forest-700">
                        {isActive ? '📍 Đang ở đây' : `Khu ${pt.area}`}
                      </p>
                      <p className="text-sm font-bold text-wood-900">{pt.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* Hotspot checklist */}
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

        {/* Pause & Settings Menu */}
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
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuality('high')}
                    className={`px-2.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      quality === 'high'
                        ? 'bg-wood-900 text-cream border-wood-900'
                        : 'bg-parchment text-wood-800 border-sandstone'
                    }`}
                  >
                    Cao (PC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality('medium')}
                    className={`px-2.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      quality === 'medium'
                        ? 'bg-wood-900 text-cream border-wood-900'
                        : 'bg-parchment text-wood-800 border-sandstone'
                    }`}
                  >
                    Vừa (Laptop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality('low')}
                    className={`px-2.5 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      quality === 'low'
                        ? 'bg-wood-900 text-cream border-wood-900'
                        : 'bg-parchment text-wood-800 border-sandstone'
                    }`}
                  >
                    Nhẹ (Mobile)
                  </button>
                </div>
              </div>

              {/* Quick tour point navigation */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-wood-700">Di chuyển nhanh đến:</p>
                <div className="grid grid-cols-1 gap-2">
                  {['tp-entrance', 'tp-hearth', 'tp-gong'].map((tpId) => {
                    const tp = TOUR_POINTS.find((p) => p.id === tpId);
                    if (!tp) return null;
                    return (
                      <button
                        key={tp.id}
                        type="button"
                        onClick={() => {
                          setCurrentTourPointId(tp.id);
                          navigateTourRef.current?.(tp.id);
                          setPauseMenuOpen(false);
                        }}
                        className="w-full py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 cursor-pointer text-left px-3"
                      >
                        📍 {tp.label}
                      </button>
                    );
                  })}
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
