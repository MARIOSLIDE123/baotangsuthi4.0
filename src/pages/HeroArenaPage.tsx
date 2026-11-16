import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Grid2x2,
  ListOrdered,
  MessageSquareQuote,
  Play,
  RotateCcw,
  Sparkles,
  Swords,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';
import { ARENA_GAMES_META } from '../data/arenaAndStemData';
import {
  ArenaAttemptRecord,
  ArenaGameId,
  ArenaScoreBreakdown,
} from '../types/museum';
import {
  clearArenaAttempts,
  computeArenaBadges,
  loadArenaAttempts,
  saveArenaAttempt,
} from '../services/arenaStorageService';
import { SafeImage } from '../components/common/SafeImage';
import {
  DecodeEpicGame,
  GameFinishPayload,
  HeroMatchGame,
  LiveProgressUpdate,
  MysteryTilesGame,
  TimelineOrderGame,
} from '../components/arena/ArenaClassicGames';
import {
  EpicDialogueGame,
  EvidenceChallengeGame,
} from '../components/arena/ArenaDeepGames';
import { SunGoddessWheelGame } from '../components/arena/SunGoddessWheelGame';
import {
  ArenaBadgesAndResults,
  ArenaSummaryView,
} from '../components/arena/ArenaResultsPanel';

interface HeroArenaPageProps {
  bestScore: number;
  studentName?: string;
  className?: string;
  onFinishAttempt: (score: number, record?: ArenaAttemptRecord) => void;
}

type ArenaViewTab = 'arena' | 'badges-and-results';
type GameSessionState = 'LOBBY' | 'PLAYING' | 'SUMMARY';

function renderGameIcon(gameId: ArenaGameId, className = 'w-5 h-5') {
  switch (gameId) {
    case 'decode':
      return <Swords className={className} />;
    case 'who-is-hero':
      return <Users className={className} />;
    case 'timeline':
      return <ListOrdered className={className} />;
    case 'mystery-tiles':
      return <Grid2x2 className={className} />;
    case 'evidence-challenge':
      return <Compass className={className} />;
    case 'epic-dialogue':
      return <MessageSquareQuote className={className} />;
    case 'sun-goddess-wheel':
      return <Sparkles className={className} />;
  }
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const HeroArenaPage: React.FC<HeroArenaPageProps> = ({
  bestScore,
  studentName = 'Khách tham quan',
  className = 'Lớp 10 · Ngữ văn',
  onFinishAttempt,
}) => {
  const [viewTab, setViewTab] = useState<ArenaViewTab>('arena');
  const [sessionState, setSessionState] = useState<GameSessionState>('LOBBY');
  const [activeGameId, setActiveGameId] = useState<ArenaGameId>('decode');
  const [gameInstanceKey, setGameInstanceKey] = useState(1);

  const [attempts, setAttempts] = useState<ArenaAttemptRecord[]>(() => loadArenaAttempts());
  const [lastAttempt, setLastAttempt] = useState<ArenaAttemptRecord | null>(null);

  const [startedAtIso, setStartedAtIso] = useState<string>(() => new Date().toISOString());
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [liveProgress, setLiveProgress] = useState<LiveProgressUpdate>({
    stepIndex: 0,
    totalSteps: 1,
    correctCount: 0,
    wrongCount: 0,
    currentScore: 0,
  });

  const badges = useMemo(() => computeArenaBadges(attempts), [attempts]);
  const activeGameMeta =
    ARENA_GAMES_META.find((g) => g.id === activeGameId) || ARENA_GAMES_META[0];

  const liveProgressRef = useRef(liveProgress);
  useEffect(() => {
    liveProgressRef.current = liveProgress;
  }, [liveProgress]);

  const handleFinishGame = useCallback(
    (payload: GameFinishPayload) => {
      const completedAtIso = new Date().toISOString();
      const record: ArenaAttemptRecord = {
        id: `arena-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentName,
        className,
        gameId: activeGameMeta.id,
        gameTitle: activeGameMeta.title,
        startedAtIso,
        completedAtIso,
        score: payload.breakdown.totalScore,
        breakdown: payload.breakdown,
        correctCount: payload.correctCount,
        wrongCount: payload.wrongCount,
        totalItems: payload.totalItems,
        reviewItems: payload.reviewItems,
      };

      const nextAttempts = saveArenaAttempt(record);
      setAttempts(nextAttempts);
      setLastAttempt(record);
      setSessionState('SUMMARY');
      onFinishAttempt(record.score, record);
    },
    [studentName, className, activeGameMeta, startedAtIso, onFinishAttempt]
  );

  // Countdown clock during active gameplay
  useEffect(() => {
    if (sessionState !== 'PLAYING') return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          // Gracefully record partial progress when countdown ends
          const p = liveProgressRef.current;
          const partialBreakdown: ArenaScoreBreakdown = {
            baseScore: p.currentScore,
            speedBonus: 0,
            completionBonus: 0,
            analysisBonus: 0,
            evidenceBonus: 0,
            totalScore: p.currentScore,
          };
          handleFinishGame({
            breakdown: partialBreakdown,
            correctCount: p.correctCount,
            wrongCount: p.wrongCount,
            totalItems: Math.max(p.totalSteps, 1),
            reviewItems: [],
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [sessionState, handleFinishGame]);

  const startGame = (gameId: ArenaGameId) => {
    const meta = ARENA_GAMES_META.find((g) => g.id === gameId) || ARENA_GAMES_META[0];
    setActiveGameId(gameId);
    setGameInstanceKey((k) => k + 1);
    setStartedAtIso(new Date().toISOString());
    setTimeLeft(meta.durationSeconds);
    setLiveProgress({
      stepIndex: 0,
      totalSteps: 1,
      correctCount: 0,
      wrongCount: 0,
      currentScore: 0,
    });
    setSessionState('PLAYING');
    setViewTab('arena');
  };

  const handleViewCurrentResults = () => {
    const p = liveProgressRef.current;
    handleFinishGame({
      breakdown: {
        baseScore: p.currentScore,
        speedBonus: 0,
        completionBonus: 0,
        analysisBonus: 0,
        evidenceBonus: 0,
        totalScore: p.currentScore,
      },
      correctCount: p.correctCount,
      wrongCount: p.wrongCount,
      totalItems: Math.max(p.totalSteps, 1),
      reviewItems: [],
    });
  };

  const progressPercent = Math.min(
    100,
    Math.round((liveProgress.stepIndex / Math.max(1, liveProgress.totalSteps)) * 100)
  );

  const earnedBadgesCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Arena Header Banner */}
      <section className="relative rounded-2xl overflow-hidden border border-wood-800 bg-wood-950 text-cream">
        <SafeImage
          src="/assets/images/zone_hero_arena_1794539494779.jpg"
          alt="Đấu trường Anh hùng ca với khiên đồng và ánh sáng vàng sử thi"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-wood-950 via-wood-950/85 to-wood-950/60" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              Phân khu 07 · Hệ thống 6 trò chơi học tập tương tác
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cream leading-tight">
              Đấu Trường Anh Hùng Ca
            </h1>
            <p className="text-sm sm:text-base text-cream/85 leading-relaxed">
              Chinh phục 6 thử thách đọc hiểu từ trắc nghiệm giải mã, ghép nhân vật, kéo thả dòng thời gian, mở mảnh ghép bí ẩn đến dẫn chứng và đối thoại cùng AI. Tốc độ chỉ cộng thưởng nhẹ — chất lượng đọc hiểu và phân tích luôn quyết định chiến thắng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-wood-900/90 border border-gold-500/40 rounded-xl px-4 py-2.5 text-xs space-y-0.5">
              <span className="text-cream/70 block">Kỷ lục điểm cao nhất</span>
              <span className="font-mono tabular-nums text-xl font-bold text-gold-400">
                {bestScore} đ
              </span>
            </div>
            <div className="bg-wood-900/90 border border-gold-500/40 rounded-xl px-4 py-2.5 text-xs space-y-0.5">
              <span className="text-cream/70 block">Huy hiệu vàng</span>
              <span className="font-mono tabular-nums text-xl font-bold text-gold-400">
                {earnedBadgesCount}/{badges.length}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs between Arena Games & Badges/Class Results */}
        <div className="relative z-10 px-6 sm:px-8 py-3 bg-wood-900/80 border-t border-wood-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewTab('arena')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer ${
                viewTab === 'arena'
                  ? 'bg-gold-500 text-wood-950'
                  : 'bg-wood-950 text-cream/85 hover:text-cream border border-wood-700'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Sàn đấu 6 trò chơi</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('badges-and-results')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer ${
                viewTab === 'badges-and-results'
                  ? 'bg-gold-500 text-wood-950'
                  : 'bg-wood-950 text-cream/85 hover:text-cream border border-wood-700'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Huy hiệu vàng &amp; Bảng kết quả lớp</span>
            </button>
          </div>

          <p className="text-xs text-cream/75">
            Học sinh: <strong className="text-cream">{studentName}</strong> ·{' '}
            <span>{className}</span>
          </p>
        </div>
      </section>

      {viewTab === 'badges-and-results' ? (
        <ArenaBadgesAndResults
          attempts={attempts}
          badges={badges}
          currentClassName={className}
          onClearHistory={() => setAttempts(clearArenaAttempts())}
        />
      ) : sessionState === 'LOBBY' ? (
        /* 6-Game Selection Grid */
        <section aria-label="Danh sách 6 trò chơi Đấu trường" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-sandstone pb-3">
            <div>
              <p className="text-xs font-medium text-wood-600">Chọn thử thách muốn tham gia</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
                Sáu Môn Thi Đấu Trường Anh Hùng Ca
              </h2>
            </div>
            <span className="text-xs text-wood-600">
              Câu hỏi &amp; đáp án tự động xáo trộn mỗi lượt chơi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ARENA_GAMES_META.map((game) => {
              const gameAttempts = attempts.filter((a) => a.gameId === game.id);
              const topForGame = gameAttempts.reduce((max, a) => Math.max(max, a.score), 0);

              return (
                <article
                  key={game.id}
                  className="museum-wing-card bg-cream border border-sandstone hover:border-gold-500 rounded-2xl p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-gold-600">
                        TRÒ CHƠI {game.orderNumber}
                      </span>
                      <span className="font-mono tabular-nums text-xs text-wood-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatSeconds(game.durationSeconds)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-wood-900 text-gold-400 flex items-center justify-center shrink-0">
                        {renderGameIcon(game.id, 'w-5 h-5')}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-wood-900 leading-snug">
                        {game.title}
                      </h3>
                    </div>

                    <p className="text-sm text-wood-700 leading-relaxed">{game.subtitle}</p>
                    <p className="text-xs text-forest-800 font-medium">
                      Trọng tâm: {game.scoringFocus}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-sandstone/70 flex items-center justify-between gap-3">
                    <span className="text-xs font-mono tabular-nums text-wood-600">
                      {gameAttempts.length > 0
                        ? `Kỷ lục: ${topForGame}đ (${gameAttempts.length} lượt)`
                        : 'Chưa thi đấu'}
                    </span>
                    <button
                      type="button"
                      onClick={() => startGame(game.id)}
                      className="px-4 py-2 text-xs sm:text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5 text-gold-400" />
                      <span>Vào thi đấu</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : sessionState === 'SUMMARY' && lastAttempt ? (
        <ArenaSummaryView
          attempt={lastAttempt}
          badges={badges}
          onPlayAgain={() => startGame(activeGameId)}
          onBackToLobby={() => setSessionState('LOBBY')}
          onOpenLeaderboard={() => setViewTab('badges-and-results')}
        />
      ) : (
        /* Active Game Arena Surface + Live HUD */
        <section className="space-y-6">
          {/* Unified Arena HUD */}
          <div className="bg-wood-900 text-cream border border-wood-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-500 text-wood-950 flex items-center justify-center shrink-0">
                  {renderGameIcon(activeGameMeta.id, 'w-4 h-4')}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold">
                    Trò chơi {activeGameMeta.orderNumber}
                  </p>
                  <h2 className="font-serif text-xl font-bold text-cream leading-none">
                    {activeGameMeta.title}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm font-mono tabular-nums">
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    timeLeft <= 30 ? 'text-amber-300' : 'text-cream'
                  }`}
                >
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span>{formatSeconds(timeLeft)}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đúng: {liveProgress.correctCount}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <XCircle className="w-4 h-4" />
                  <span>Sai: {liveProgress.wrongCount}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-gold-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>Điểm: {liveProgress.currentScore}</span>
                </span>
              </div>
            </div>

            {/* Progress Bar + Utility Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-wood-950 overflow-hidden border border-wood-700">
                  <div
                    className="h-full bg-gold-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="font-mono tabular-nums text-xs text-cream/80 shrink-0">
                  {progressPercent}%
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startGame(activeGameId)}
                  className="px-3 py-1.5 text-xs font-medium bg-wood-950 hover:bg-wood-800 text-cream border border-wood-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gold-400" />
                  <span>Chơi lại</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewCurrentResults}
                  className="px-3 py-1.5 text-xs font-medium bg-gold-500 text-wood-950 hover:bg-gold-400 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Xem kết quả</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionState('LOBBY')}
                  className="px-3 py-1.5 text-xs text-cream/75 hover:text-cream inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Đổi trò chơi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Game Board */}
          <div className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8">
            {activeGameId === 'decode' && (
              <DecodeEpicGame
                key={`decode-${gameInstanceKey}`}
                onProgress={setLiveProgress}
                onFinish={handleFinishGame}
              />
            )}
            {activeGameId === 'who-is-hero' && (
              <HeroMatchGame
                key={`match-${gameInstanceKey}`}
                onProgress={setLiveProgress}
                onFinish={handleFinishGame}
              />
            )}
            {activeGameId === 'timeline' && (
              <TimelineOrderGame
                key={`timeline-${gameInstanceKey}`}
                onProgress={setLiveProgress}
                onFinish={handleFinishGame}
              />
            )}
            {activeGameId === 'mystery-tiles' && (
              <MysteryTilesGame
                key={`tiles-${gameInstanceKey}`}
                onProgress={setLiveProgress}
                onFinish={handleFinishGame}
              />
            )}
            {activeGameId === 'evidence-challenge' && (
              <EvidenceChallengeGame
                key={`evidence-${gameInstanceKey}`}
                onProgress={setLiveProgress}
                onFinish={handleFinishGame}
              />
            )}
            {activeGameId === 'epic-dialogue' && (
              <EpicDialogueGame
                key={`dialogue-${gameInstanceKey}`}
                onProgress={setLiveProgress}
                onFinish={handleFinishGame}
              />
            )}
            {activeGameId === 'sun-goddess-wheel' && (
              <SunGoddessWheelGame
                key={`wheel-${gameInstanceKey}`}
                onProgress={setLiveProgress}
                onFinish={handleFinishGame}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};
