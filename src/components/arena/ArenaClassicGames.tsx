import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  HelpCircle,
  Lock,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  ARENA_QUESTIONS,
  HERO_MATCH_ROUNDS,
  MYSTERY_PUZZLES,
  TIMELINE_ROUNDS,
  shuffleArray,
  shuffleOptionsWithIndex,
} from '../../data/arenaAndStemData';
import {
  ArenaReviewItem,
  ArenaScoreBreakdown,
  TimelineEventItem,
} from '../../types/museum';
import { playArenaChime } from '../../services/arenaStorageService';
import { SafeImage } from '../common/SafeImage';

export interface GameFinishPayload {
  breakdown: ArenaScoreBreakdown;
  correctCount: number;
  wrongCount: number;
  totalItems: number;
  reviewItems: ArenaReviewItem[];
}

export interface LiveProgressUpdate {
  stepIndex: number;
  totalSteps: number;
  correctCount: number;
  wrongCount: number;
  currentScore: number;
}

interface GameProps {
  onProgress: (p: LiveProgressUpdate) => void;
  onFinish: (payload: GameFinishPayload) => void;
}

/* -------------------------------------------------------------------------- */
/* GAME 1: GIẢI MÃ SỬ THI                                                     */
/* -------------------------------------------------------------------------- */
export const DecodeEpicGame: React.FC<GameProps> = ({ onProgress, onFinish }) => {
  const questions = useMemo(
    () => shuffleArray(ARENA_QUESTIONS).map((q) => shuffleOptionsWithIndex(q)),
    []
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [questionStartMs, setQuestionStartMs] = useState<number>(() => Date.now());
  const [baseScore, setBaseScore] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reviewItems, setReviewItems] = useState<ArenaReviewItem[]>([]);

  const q = questions[index];

  const handleConfirm = () => {
    if (selected === null || checked) return;
    setChecked(true);
    const isRight = selected === q.correctIndex;
    const elapsedSec = (Date.now() - questionStartMs) / 1000;
    // Speed bonus capped cleanly at +2 pts only on accurate answer within 15s
    const earnedSpeed = isRight ? (elapsedSec <= 8 ? 2 : elapsedSec <= 15 ? 1 : 0) : 0;

    const nextBase = baseScore + (isRight ? 10 : 0);
    const nextSpeed = speedBonus + earnedSpeed;
    const nextCorrect = correctCount + (isRight ? 1 : 0);
    const nextWrong = wrongCount + (isRight ? 0 : 1);

    setBaseScore(nextBase);
    setSpeedBonus(nextSpeed);
    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);

    setReviewItems((prev) => [
      ...prev,
      {
        prompt: q.prompt,
        yourAnswer: q.choices[selected],
        correctAnswer: q.choices[q.correctIndex],
        explanation: q.feedback,
      },
    ]);

    if (!isRight) {
      playArenaChime('wrong');
    } else {
      playArenaChime('correct');
    }

    onProgress({
      stepIndex: index + 1,
      totalSteps: questions.length,
      correctCount: nextCorrect,
      wrongCount: nextWrong,
      currentScore: nextBase + nextSpeed,
    });
  };

  const handleNext = () => {
    if (index >= questions.length - 1) {
      const completionBonus = 15;
      playArenaChime('victory');
      onFinish({
        breakdown: {
          baseScore,
          speedBonus,
          completionBonus,
          analysisBonus: 0,
          evidenceBonus: 0,
          totalScore: baseScore + speedBonus + completionBonus,
        },
        correctCount,
        wrongCount,
        totalItems: questions.length,
        reviewItems,
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
    setQuestionStartMs(Date.now());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-wood-600 border-b border-sandstone pb-3">
        <span>Chủ đề: {q.category} · 4 lựa chọn đã xáo trộn ngẫu nhiên</span>
        <span className="font-mono tabular-nums font-semibold">
          Câu {index + 1}/{questions.length}
        </span>
      </div>

      {q.excerpt && (
        <blockquote className="p-4 rounded-xl bg-parchment/70 border border-sandstone font-serif text-lg italic text-wood-900">
          {q.excerpt}
        </blockquote>
      )}

      <h3 className="font-serif text-2xl font-bold text-wood-900 leading-snug">{q.prompt}</h3>

      <div className="space-y-2.5">
        {q.choices.map((choice, idx) => {
          const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
          const isSelected = selected === idx;
          const isTrue = idx === q.correctIndex;
          let cls = 'bg-cream border-sandstone text-wood-800 hover:bg-parchment/45';
          if (checked) {
            if (isTrue) cls = 'bg-forest-800/10 border-forest-700 text-forest-800 font-semibold';
            else if (isSelected) cls = 'bg-red-50 border-red-400 text-red-900';
          } else if (isSelected) {
            cls = 'bg-parchment border-wood-900 font-medium text-wood-900';
          }

          return (
            <button
              key={choice}
              type="button"
              disabled={checked}
              onClick={() => setSelected(idx)}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-colors cursor-pointer flex items-start gap-3 ${cls}`}
            >
              <span className="font-mono font-bold shrink-0">{letter}.</span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>

      {checked && (
        <div className="p-4 rounded-xl bg-parchment border border-sandstone text-sm text-wood-900 leading-relaxed space-y-1">
          <p className="font-semibold text-forest-800">
            {selected === q.correctIndex ? 'Chính xác!' : `Chưa chính xác · Đáp án đúng là ${['A', 'B', 'C', 'D'][q.correctIndex]}`}
          </p>
          <p>{q.feedback}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!checked ? (
          <button
            type="button"
            disabled={selected === null}
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Xác nhận đáp án
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
          >
            {index >= questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
          </button>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* GAME 2: AI LÀ ANH HÙNG? (Ghép nhân vật với Tác phẩm / Phẩm chất / Sự kiện) */
/* -------------------------------------------------------------------------- */
export const HeroMatchGame: React.FC<GameProps> = ({ onProgress, onFinish }) => {
  const rounds = useMemo(
    () =>
      HERO_MATCH_ROUNDS.map((r) => ({
        ...r,
        leftItems: shuffleArray(r.pairs),
        rightItems: shuffleArray(r.pairs),
      })),
    []
  );

  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [roundFeedback, setRoundFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [baseScore, setBaseScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reviewItems, setReviewItems] = useState<ArenaReviewItem[]>([]);

  const totalPairsAllRounds = rounds.reduce((acc, r) => acc + r.pairs.length, 0);
  const currentRound = rounds[roundIdx];

  const handlePickRight = (rightPairId: string) => {
    if (!selectedLeftId || matchedIds.includes(rightPairId)) return;

    const leftPair = currentRound.pairs.find((p) => p.id === selectedLeftId);
    const rightPair = currentRound.pairs.find((p) => p.id === rightPairId);
    if (!leftPair || !rightPair) return;

    const isMatch = leftPair.id === rightPair.id;
    const nextCorrect = correctCount + (isMatch ? 1 : 0);
    const nextWrong = wrongCount + (isMatch ? 0 : 1);
    const nextBase = baseScore + (isMatch ? 10 : 0);

    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);
    setBaseScore(nextBase);
    setSelectedLeftId(null);

    if (isMatch) {
      const nextMatched = [...matchedIds, leftPair.id];
      setMatchedIds(nextMatched);
      setRoundFeedback({ ok: true, text: `Chuẩn xác: ${leftPair.heroName} — ${leftPair.explanation}` });
      setReviewItems((prev) => [
        ...prev,
        {
          prompt: `${currentRound.dimensionLabel}: ${leftPair.heroName}`,
          yourAnswer: leftPair.targetText,
          correctAnswer: leftPair.targetText,
          explanation: leftPair.explanation,
        },
      ]);
      playArenaChime('correct');

      const doneSoFar =
        rounds.slice(0, roundIdx).reduce((a, r) => a + r.pairs.length, 0) + nextMatched.length;
      onProgress({
        stepIndex: doneSoFar,
        totalSteps: totalPairsAllRounds,
        correctCount: nextCorrect,
        wrongCount: nextWrong,
        currentScore: nextBase,
      });
    } else {
      setRoundFeedback({
        ok: false,
        text: `Chưa khớp giữa ${leftPair.heroName} và "${rightPair.targetText}". Hãy đọc kĩ lại đặc trưng nhân vật nhé!`,
      });
      setReviewItems((prev) => [
        ...prev,
        {
          prompt: `${currentRound.dimensionLabel}: ${leftPair.heroName}`,
          yourAnswer: rightPair.targetText,
          correctAnswer: leftPair.targetText,
          explanation: leftPair.explanation,
        },
      ]);
      playArenaChime('wrong');

      const doneSoFar =
        rounds.slice(0, roundIdx).reduce((a, r) => a + r.pairs.length, 0) + matchedIds.length;
      onProgress({
        stepIndex: doneSoFar,
        totalSteps: totalPairsAllRounds,
        correctCount: nextCorrect,
        wrongCount: nextWrong,
        currentScore: nextBase,
      });
    }
  };

  const allRoundMatched = matchedIds.length === currentRound.pairs.length;

  const handleNextRound = () => {
    if (roundIdx >= rounds.length - 1) {
      const completionBonus = 15;
      playArenaChime('victory');
      onFinish({
        breakdown: {
          baseScore,
          speedBonus: 2,
          completionBonus,
          analysisBonus: 0,
          evidenceBonus: 0,
          totalScore: baseScore + 2 + completionBonus,
        },
        correctCount,
        wrongCount,
        totalItems: totalPairsAllRounds,
        reviewItems,
      });
      return;
    }
    setRoundIdx((r) => r + 1);
    setMatchedIds([]);
    setSelectedLeftId(null);
    setRoundFeedback(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone pb-3">
        <div>
          <p className="text-xs font-semibold text-forest-800">{currentRound.dimensionLabel}</p>
          <p className="text-sm text-wood-700">{currentRound.instruction}</p>
        </div>
        <span className="font-mono tabular-nums text-xs font-semibold text-wood-600">
          Vòng {roundIdx + 1}/{rounds.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Heroes */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-wood-600">
            1. Chọn nhân vật sử thi
          </p>
          {currentRound.leftItems.map((pair) => {
            const done = matchedIds.includes(pair.id);
            const active = selectedLeftId === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                disabled={done}
                onClick={() => setSelectedLeftId(pair.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                  done
                    ? 'bg-forest-800/10 border-forest-700/50 text-forest-800 opacity-85'
                    : active
                      ? 'bg-wood-900 text-cream border-wood-900'
                      : 'bg-cream border-sandstone text-wood-900 hover:border-gold-500'
                }`}
              >
                <span className="font-serif text-lg font-bold">{pair.heroName}</span>
                {done && <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Column: Target Work / Quality / Event */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-wood-600">
            2. Chọn thông tin tương ứng
          </p>
          {currentRound.rightItems.map((pair) => {
            const done = matchedIds.includes(pair.id);
            return (
              <button
                key={pair.id}
                type="button"
                disabled={done || !selectedLeftId}
                onClick={() => handlePickRight(pair.id)}
                className={`w-full text-left p-4 rounded-xl border text-sm transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                  done
                    ? 'bg-forest-800/10 border-forest-700/50 text-forest-800'
                    : selectedLeftId
                      ? 'bg-parchment/55 border-sandstone text-wood-900 hover:border-gold-500'
                      : 'bg-cream border-sandstone text-wood-600 opacity-75'
                }`}
              >
                <span className="leading-relaxed">{pair.targetText}</span>
                {done && <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {roundFeedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
            roundFeedback.ok
              ? 'bg-forest-800/10 border-forest-700/40 text-forest-800'
              : 'bg-amber-50 border-amber-300 text-wood-900'
          }`}
        >
          {roundFeedback.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          )}
          <span>{roundFeedback.text}</span>
        </div>
      )}

      {allRoundMatched && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNextRound}
            className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
          >
            {roundIdx >= rounds.length - 1 ? 'Xem kết quả' : `Sang ${rounds[roundIdx + 1].dimensionLabel.split('·')[0]}`}
          </button>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* GAME 3: DÒNG THỜI GIAN SỬ THI (Drag & Drop + Up/Down Order)                */
/* -------------------------------------------------------------------------- */
function getShuffledTimeline(events: TimelineEventItem[]): TimelineEventItem[] {
  let candidate = shuffleArray(events);
  // Guarantee initial display isn't already in exact chronological order
  if (candidate.every((item, idx) => item.order === idx + 1) && candidate.length > 1) {
    candidate = [candidate[1], candidate[0], ...candidate.slice(2)];
  }
  return candidate;
}

export const TimelineOrderGame: React.FC<GameProps> = ({ onProgress, onFinish }) => {
  const rounds = useMemo(() => shuffleArray(TIMELINE_ROUNDS), []);
  const [roundIdx, setRoundIdx] = useState(0);
  const [orderedEvents, setOrderedEvents] = useState<TimelineEventItem[]>(() =>
    getShuffledTimeline(rounds[0].events)
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const [baseScore, setBaseScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reviewItems, setReviewItems] = useState<ArenaReviewItem[]>([]);

  const round = rounds[roundIdx];

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (checked || toIdx < 0 || toIdx >= orderedEvents.length || fromIdx === toIdx) return;
    const copy = [...orderedEvents];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setOrderedEvents(copy);
  };

  const handleConfirmOrder = () => {
    if (checked) return;
    setChecked(true);
    const allInOrder = orderedEvents.every((ev, idx) => ev.order === idx + 1);
    const nextCorrect = correctCount + (allInOrder ? 1 : 0);
    const nextWrong = wrongCount + (allInOrder ? 0 : 1);
    const nextBase = baseScore + (allInOrder ? 15 : 0);

    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);
    setBaseScore(nextBase);

    setReviewItems((prev) => [
      ...prev,
      {
        prompt: `Dòng thời gian: ${round.workTitle}`,
        yourAnswer: orderedEvents.map((e, i) => `${i + 1}) ${e.text}`).join(' → '),
        correctAnswer: [...round.events]
          .sort((a, b) => a.order - b.order)
          .map((e) => `${e.order}) ${e.text}`)
          .join(' → '),
        explanation: round.explanation,
      },
    ]);

    if (allInOrder) {
      playArenaChime('correct');
    } else {
      playArenaChime('wrong');
    }

    onProgress({
      stepIndex: roundIdx + 1,
      totalSteps: rounds.length,
      correctCount: nextCorrect,
      wrongCount: nextWrong,
      currentScore: nextBase,
    });
  };

  const handleNext = () => {
    if (roundIdx >= rounds.length - 1) {
      const completionBonus = 15;
      playArenaChime('victory');
      onFinish({
        breakdown: {
          baseScore,
          speedBonus: 0,
          completionBonus,
          analysisBonus: 0,
          evidenceBonus: 0,
          totalScore: baseScore + completionBonus,
        },
        correctCount,
        wrongCount,
        totalItems: rounds.length,
        reviewItems,
      });
      return;
    }
    const nextRound = rounds[roundIdx + 1];
    setRoundIdx(roundIdx + 1);
    setOrderedEvents(getShuffledTimeline(nextRound.events));
    setChecked(false);
    setDragIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone pb-3">
        <div>
          <p className="text-xs font-semibold text-forest-800">{round.workTitle}</p>
          <p className="text-sm text-wood-700">
            {round.instruction} (Kéo thả thẻ sự kiện hoặc dùng nút mũi tên lên/xuống)
          </p>
        </div>
        <span className="font-mono tabular-nums text-xs font-semibold text-wood-600">
          Chuỗi {roundIdx + 1}/{rounds.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {orderedEvents.map((ev, idx) => {
          const isExactSlot = ev.order === idx + 1;
          let slotStyle = 'bg-cream border-sandstone text-wood-900';
          if (checked) {
            slotStyle = isExactSlot
              ? 'bg-forest-800/10 border-forest-700 text-forest-800'
              : 'bg-amber-50 border-amber-400 text-wood-900';
          } else if (dragIndex === idx) {
            slotStyle = 'bg-parchment border-gold-500 opacity-75';
          }

          return (
            <div
              key={ev.id}
              draggable={!checked}
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) {
                  moveItem(dragIndex, idx);
                  setDragIndex(null);
                }
              }}
              className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-3 ${slotStyle} ${
                !checked ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-wood-500 shrink-0 mt-1" />
                <span className="font-mono tabular-nums text-xs font-bold bg-parchment px-2 py-1 rounded border border-sandstone shrink-0">
                  Bước {idx + 1}
                </span>
                <p className="text-sm leading-relaxed">{ev.text}</p>
              </div>

              {!checked ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, idx - 1)}
                    aria-label="Di chuyển lên"
                    className="p-1.5 rounded-lg border border-sandstone bg-parchment/60 hover:border-gold-500 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === orderedEvents.length - 1}
                    onClick={() => moveItem(idx, idx + 1)}
                    aria-label="Di chuyển xuống"
                    className="p-1.5 rounded-lg border border-sandstone bg-parchment/60 hover:border-gold-500 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-xs font-mono shrink-0">
                  {isExactSlot ? 'Đúng vị trí' : `Thứ tự đúng: #${ev.order}`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {checked && (
        <div className="p-4 rounded-xl bg-parchment border border-sandstone text-sm text-wood-900 leading-relaxed">
          <p className="font-semibold text-forest-800 mb-1">Giải thích trình tự sử thi:</p>
          <p>{round.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!checked ? (
          <button
            type="button"
            onClick={handleConfirmOrder}
            className="px-5 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 transition-colors cursor-pointer"
          >
            Kiểm tra trình tự
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
          >
            {roundIdx >= rounds.length - 1 ? 'Xem kết quả' : 'Chuỗi tiếp theo'}
          </button>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* GAME 4: MẢNH GHÉP BÍ ẨN (Unlock tiles + match artwork with epic info)     */
/* -------------------------------------------------------------------------- */
export const MysteryTilesGame: React.FC<GameProps> = ({ onProgress, onFinish }) => {
  const puzzles = useMemo(
    () =>
      MYSTERY_PUZZLES.map((p) => {
        const shuffledTiles = p.tileQuestions.map((tq) => shuffleOptionsWithIndex(tq));
        const shuffledMatch = shuffleOptionsWithIndex({
          choices: p.matchOptions,
          correctIndex: p.correctMatchIndex,
        });
        return {
          ...p,
          tileQuestions: shuffledTiles,
          matchOptions: shuffledMatch.choices,
          correctMatchIndex: shuffledMatch.correctIndex,
        };
      }),
    []
  );

  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [unlockedTiles, setUnlockedTiles] = useState<number[]>([]);
  const [activeTileIdx, setActiveTileIdx] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [tileFeedback, setTileFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [matchMode, setMatchMode] = useState(false);
  const [matchSelected, setMatchSelected] = useState<number | null>(null);
  const [matchChecked, setMatchChecked] = useState(false);

  const [baseScore, setBaseScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reviewItems, setReviewItems] = useState<ArenaReviewItem[]>([]);

  const puzzle = puzzles[puzzleIdx];
  const totalSteps = puzzles.length * 5; // 4 tiles + 1 image match per puzzle
  const activeTile = puzzle.tileQuestions[activeTileIdx];

  const handleAnswerTile = () => {
    if (selectedChoice === null) return;
    const isRight = selectedChoice === activeTile.correctIndex;
    const nextCorrect = correctCount + (isRight ? 1 : 0);
    const nextWrong = wrongCount + (isRight ? 0 : 1);
    const nextBase = baseScore + (isRight ? 10 : 0);

    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);
    setBaseScore(nextBase);

    setReviewItems((prev) => [
      ...prev,
      {
        prompt: activeTile.prompt,
        yourAnswer: activeTile.choices[selectedChoice],
        correctAnswer: activeTile.choices[activeTile.correctIndex],
        explanation: activeTile.explanation,
      },
    ]);

    if (isRight) {
      playArenaChime('correct');
      const nextUnlocked = unlockedTiles.includes(activeTileIdx)
        ? unlockedTiles
        : [...unlockedTiles, activeTileIdx];
      setUnlockedTiles(nextUnlocked);
      setTileFeedback({
        ok: true,
        msg: `Đã mở khóa Mảnh ghép ${activeTileIdx + 1}! ${activeTile.explanation}`,
      });

      const progressSoFar = puzzleIdx * 5 + nextUnlocked.length;
      onProgress({
        stepIndex: progressSoFar,
        totalSteps,
        correctCount: nextCorrect,
        wrongCount: nextWrong,
        currentScore: nextBase,
      });

      // Automatically move to next locked tile or match phase
      const remaining = [0, 1, 2, 3].find((t) => !nextUnlocked.includes(t));
      if (remaining !== undefined) {
        setActiveTileIdx(remaining);
        setSelectedChoice(null);
      } else {
        setMatchMode(true);
      }
    } else {
      playArenaChime('wrong');
      setTileFeedback({
        ok: false,
        msg: `Chưa chính xác. Gợi ý: ${activeTile.explanation}`,
      });
      onProgress({
        stepIndex: puzzleIdx * 5 + unlockedTiles.length,
        totalSteps,
        correctCount: nextCorrect,
        wrongCount: nextWrong,
        currentScore: nextBase,
      });
    }
  };

  const handleCheckImageMatch = () => {
    if (matchSelected === null || matchChecked) return;
    setMatchChecked(true);
    const isRight = matchSelected === puzzle.correctMatchIndex;
    const nextCorrect = correctCount + (isRight ? 1 : 0);
    const nextWrong = wrongCount + (isRight ? 0 : 1);
    const nextBase = baseScore + (isRight ? 15 : 0);

    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);
    setBaseScore(nextBase);

    setReviewItems((prev) => [
      ...prev,
      {
        prompt: puzzle.matchQuestion,
        yourAnswer: puzzle.matchOptions[matchSelected],
        correctAnswer: puzzle.matchOptions[puzzle.correctMatchIndex],
        explanation: puzzle.summaryFact,
      },
    ]);

    if (isRight) {
      playArenaChime('correct');
    } else {
      playArenaChime('wrong');
    }

    onProgress({
      stepIndex: (puzzleIdx + 1) * 5,
      totalSteps,
      correctCount: nextCorrect,
      wrongCount: nextWrong,
      currentScore: nextBase,
    });
  };

  const handleNextPuzzle = () => {
    if (puzzleIdx >= puzzles.length - 1) {
      const completionBonus = 15;
      playArenaChime('victory');
      onFinish({
        breakdown: {
          baseScore,
          speedBonus: 0,
          completionBonus,
          analysisBonus: 0,
          evidenceBonus: 0,
          totalScore: baseScore + completionBonus,
        },
        correctCount,
        wrongCount,
        totalItems: totalSteps,
        reviewItems,
      });
      return;
    }
    setPuzzleIdx(puzzleIdx + 1);
    setUnlockedTiles([]);
    setActiveTileIdx(0);
    setSelectedChoice(null);
    setTileFeedback(null);
    setMatchMode(false);
    setMatchSelected(null);
    setMatchChecked(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: 2x2 Mystery Tile Artwork Board */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-wood-600">
          <span>{puzzle.title}</span>
          <span className="font-mono tabular-nums font-semibold">
            Đã mở {unlockedTiles.length}/4 mảnh ghép
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-sandstone bg-wood-950 aspect-video">
          <SafeImage
            src={puzzle.imagePath}
            alt={puzzle.imageAlt}
            className="w-full h-full object-cover"
          />

          {/* 4 Overlay Tiles */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {[0, 1, 2, 3].map((tileIdx) => {
              const revealed = unlockedTiles.includes(tileIdx);
              const isFocused = !matchMode && activeTileIdx === tileIdx;
              return (
                <button
                  key={tileIdx}
                  type="button"
                  disabled={revealed || matchMode}
                  onClick={() => {
                    setActiveTileIdx(tileIdx);
                    setSelectedChoice(null);
                    setTileFeedback(null);
                  }}
                  className={`transition-all duration-300 flex flex-col items-center justify-center gap-1 border border-white/10 ${
                    revealed
                      ? 'bg-transparent opacity-0 pointer-events-none'
                      : isFocused
                        ? 'bg-wood-900/92 text-gold-400 ring-2 ring-inset ring-gold-400 cursor-pointer'
                        : 'bg-wood-950/95 text-cream/75 hover:bg-wood-900/90 cursor-pointer'
                  }`}
                >
                  {!revealed && (
                    <>
                      {isFocused ? (
                        <HelpCircle className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      <span className="text-xs font-mono font-semibold">
                        Mảnh {tileIdx + 1}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-wood-600 leading-relaxed">
          {unlockedTiles.length === 4
            ? `Bức tranh đã lộ diện hoàn toàn! (${puzzle.cultureLabel})`
            : 'Trả lời đúng câu hỏi tương ứng để mở từng mảnh ghép che bức tranh sử thi.'}
        </p>
      </div>

      {/* Right: Tile Question or Final Artwork-Info Match */}
      <div className="lg:col-span-7 space-y-5">
        {!matchMode ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {[0, 1, 2, 3].map((tIdx) => {
                const done = unlockedTiles.includes(tIdx);
                const cur = activeTileIdx === tIdx;
                return (
                  <button
                    key={tIdx}
                    type="button"
                    disabled={done}
                    onClick={() => {
                      setActiveTileIdx(tIdx);
                      setSelectedChoice(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                      done
                        ? 'bg-forest-800/10 border-forest-700/40 text-forest-800'
                        : cur
                          ? 'bg-wood-900 text-gold-400 border-wood-900'
                          : 'bg-parchment/60 border-sandstone text-wood-700'
                    }`}
                  >
                    {done ? `Mảnh ${tIdx + 1} · Đã mở` : `Mảnh ${tIdx + 1}`}
                  </button>
                );
              })}
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-wood-900 leading-snug">
              {activeTile.prompt}
            </h3>

            <div className="space-y-2">
              {activeTile.choices.map((c, idx) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedChoice(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                    selectedChoice === idx
                      ? 'bg-parchment border-wood-900 font-medium text-wood-900'
                      : 'bg-cream border-sandstone text-wood-800 hover:bg-parchment/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {tileFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-sm ${
                  tileFeedback.ok
                    ? 'bg-forest-800/10 border-forest-700/40 text-forest-800'
                    : 'bg-amber-50 border-amber-300 text-wood-900'
                }`}
              >
                {tileFeedback.msg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={selectedChoice === null}
                onClick={handleAnswerTile}
                className="px-5 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 disabled:opacity-50 cursor-pointer"
              >
                Mở mảnh ghép {activeTileIdx + 1}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest-800">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Nhiệm vụ ghép hình với thông tin</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-wood-900">
              {puzzle.matchQuestion}
            </h3>

            <div className="space-y-2.5">
              {puzzle.matchOptions.map((opt, idx) => {
                const isSelected = matchSelected === idx;
                const isTrue = idx === puzzle.correctMatchIndex;
                let cls = 'bg-cream border-sandstone text-wood-800 hover:bg-parchment/40';
                if (matchChecked) {
                  if (isTrue) cls = 'bg-forest-800/10 border-forest-700 text-forest-800 font-semibold';
                  else if (isSelected) cls = 'bg-red-50 border-red-400 text-red-900';
                } else if (isSelected) {
                  cls = 'bg-parchment border-wood-900 font-medium text-wood-900';
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={matchChecked}
                    onClick={() => setMatchSelected(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors cursor-pointer ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {matchChecked && (
              <div className="p-4 rounded-xl bg-parchment border border-sandstone text-sm text-wood-900">
                <p className="font-semibold text-forest-800 mb-1">
                  {matchSelected === puzzle.correctMatchIndex ? 'Ghép hình chính xác!' : 'Chưa chính xác'}
                </p>
                <p>{puzzle.summaryFact}</p>
              </div>
            )}

            <div className="flex justify-end">
              {!matchChecked ? (
                <button
                  type="button"
                  disabled={matchSelected === null}
                  onClick={handleCheckImageMatch}
                  className="px-5 py-2.5 text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 disabled:opacity-50 cursor-pointer"
                >
                  Xác nhận thông tin bức tranh
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextPuzzle}
                  className="px-5 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
                >
                  {puzzleIdx >= puzzles.length - 1 ? 'Xem kết quả' : 'Sang bức tranh tiếp theo'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
