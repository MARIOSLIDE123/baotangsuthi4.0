import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { ArenaAttemptRecord, ArenaBadgeStatus } from '../../types/museum';
import { maskStudentNameForClassBoard } from '../../services/arenaStorageService';

interface ArenaSummaryViewProps {
  attempt: ArenaAttemptRecord;
  badges: ArenaBadgeStatus[];
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onOpenLeaderboard: () => void;
  canRetry?: boolean;
}

export const ArenaSummaryView: React.FC<ArenaSummaryViewProps> = ({
  attempt,
  badges,
  onPlayAgain,
  onBackToLobby,
  onOpenLeaderboard,
  canRetry = true,
}) => {
  const { breakdown } = attempt;
  const startStr = new Date(attempt.startedAtIso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const endStr = new Date(attempt.completedAtIso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <section
      aria-label="Tổng kết lượt thi Đấu trường anh hùng ca"
      className="relative overflow-hidden rounded-2xl border border-gold-500/60 bg-wood-950 text-cream p-6 sm:p-10 space-y-8 shadow-xl"
    >
      {/* Epic Golden Spotlight Effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[280px] rounded-full bg-gold-500/20 blur-3xl"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-wood-800 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">
            Vinh danh Đấu trường · {attempt.gameTitle}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500 text-wood-950 flex items-center justify-center shrink-0 shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream">
                Hoàn thành thử thách!
              </h2>
              <p className="text-xs sm:text-sm text-cream/75 mt-0.5">
                Học sinh: <strong>{attempt.studentName}</strong> · Lớp: <strong>{attempt.className}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-wood-900/90 border border-gold-500/40 rounded-2xl px-6 py-4 shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gold-400">Tổng điểm lượt chơi</p>
            <p className="font-mono tabular-nums text-4xl font-bold text-gold-400">
              {attempt.score}
            </p>
          </div>
          <div className="h-10 w-px bg-wood-700" />
          <div className="text-xs space-y-1 font-mono tabular-nums">
            <p className="text-emerald-300">Đúng: {attempt.correctCount}</p>
            <p className="text-amber-300">Sai: {attempt.wrongCount}</p>
            <p className="text-cream/75">
              {startStr} → {endStr}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Dimension Score Breakdown */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Điểm đọc hiểu cơ bản', val: breakdown.baseScore },
          { label: 'Thưởng tốc độ hợp lí', val: breakdown.speedBonus },
          { label: 'Điểm hoàn thành', val: breakdown.completionBonus },
          { label: 'Điểm phân tích', val: breakdown.analysisBonus },
          { label: 'Điểm sử dụng dẫn chứng', val: breakdown.evidenceBonus },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3.5 rounded-xl bg-wood-900/80 border border-wood-800 space-y-1"
          >
            <p className="text-[11px] text-cream/75 leading-snug">{item.label}</p>
            <p className="font-mono tabular-nums text-xl font-bold text-gold-400">
              +{item.val}
            </p>
          </div>
        ))}
      </div>

      {/* Earned Badges Snapshot */}
      <div className="relative z-10 p-4 rounded-xl bg-wood-900/70 border border-wood-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
          <span>
            Huy hiệu vàng đã đạt:{' '}
            <strong className="font-mono tabular-nums text-gold-400">
              {earnedBadges.length}/{badges.length}
            </strong>
            {earnedBadges.length > 0 && (
              <span className="text-cream/80">
                {' '}
                ({earnedBadges.map((b) => b.title).join(', ')})
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="text-xs font-semibold text-gold-400 hover:underline cursor-pointer"
        >
          Xem huy hiệu &amp; bảng lớp
        </button>
      </div>

      {/* Questions Requiring Review */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-cream">
          <BookOpen className="w-4 h-4 text-gold-400" />
          <span>
            Những câu cần ôn tập ({attempt.reviewItems.length})
          </span>
        </div>

        {attempt.reviewItems.length === 0 ? (
          <div className="p-4 rounded-xl bg-forest-800/30 border border-emerald-500/40 text-sm text-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Xuất sắc! Bạn không mắc lỗi sai nào ở lượt chơi này.</span>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {attempt.reviewItems.map((item, idx) => (
              <div
                key={`${item.prompt}-${idx}`}
                className="p-4 rounded-xl bg-wood-900 border border-wood-800 space-y-1.5 text-xs sm:text-sm"
              >
                <p className="font-semibold text-cream">{item.prompt}</p>
                <p className="text-amber-300">Lựa chọn của bạn: {item.yourAnswer}</p>
                <p className="text-emerald-300">Đáp án chuẩn: {item.correctAnswer}</p>
                <p className="text-cream/80 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
        {canRetry ? (
          <button
            type="button"
            onClick={onPlayAgain}
            className="px-5 py-2.5 text-sm font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử lại lần cuối (Lượt 2/2)</span>
          </button>
        ) : (
          <div className="px-4 py-2.5 text-xs font-semibold bg-wood-900 border border-gold-500/40 text-gold-300 rounded-lg inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Đã hoàn thành 2/2 lượt (1 lần làm + 1 lần thử lại)</span>
          </div>
        )}
        <button
          type="button"
          onClick={onBackToLobby}
          className="px-5 py-2.5 text-sm font-semibold bg-wood-800 text-cream border border-wood-700 rounded-lg hover:bg-wood-700 transition-colors cursor-pointer"
        >
          Chọn trò chơi khác
        </button>
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="px-4 py-2.5 text-sm font-medium text-gold-300 hover:text-gold-200 underline underline-offset-4 cursor-pointer"
        >
          Xem kết quả &amp; huy hiệu lớp
        </button>
      </div>
    </section>
  );
};

interface ArenaBadgesAndResultsProps {
  attempts: ArenaAttemptRecord[];
  badges: ArenaBadgeStatus[];
  currentClassName: string;
  onClearHistory: () => void;
}

export const ArenaBadgesAndResults: React.FC<ArenaBadgesAndResultsProps> = ({
  attempts,
  badges,
  currentClassName,
  onClearHistory,
}) => {
  const classes = useMemo(() => {
    const set = new Set<string>(['Tất cả lớp']);
    if (currentClassName.trim()) set.add(currentClassName.trim());
    attempts.forEach((a) => {
      if (a.className.trim()) set.add(a.className.trim());
    });
    return Array.from(set);
  }, [attempts, currentClassName]);

  const [selectedClass, setSelectedClass] = useState<string>('Tất cả lớp');

  const filteredAttempts = useMemo(() => {
    const list =
      selectedClass === 'Tất cả lớp'
        ? attempts
        : attempts.filter((a) => a.className.trim() === selectedClass);
    return [...list].sort((a, b) => b.score - a.score);
  }, [attempts, selectedClass]);

  return (
    <div className="space-y-10">
      {/* 5 Golden Arena Badges */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-sandstone pb-3">
          <div>
            <p className="text-xs font-medium text-wood-600">
              Hệ thống danh hiệu thực chất · Chỉ mở khi đạt đủ tiêu chí
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
              Năm Huy Hiệu Vàng Anh Hùng Ca
            </h2>
          </div>
          <span className="font-mono tabular-nums text-sm font-semibold text-forest-800">
            Đã đạt: {badges.filter((b) => b.earned).length}/{badges.length} huy hiệu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                badge.earned
                  ? 'bg-wood-900 text-cream border-gold-500 shadow-md'
                  : 'bg-cream text-wood-800 border-sandstone'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      badge.earned
                        ? 'bg-gold-500 text-wood-950'
                        : 'bg-parchment text-wood-500 border border-sandstone'
                    }`}
                  >
                    {badge.earned ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-semibold font-mono ${
                      badge.earned ? 'text-gold-400' : 'text-wood-500'
                    }`}
                  >
                    {badge.progressLabel}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold leading-snug">
                  {badge.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    badge.earned ? 'text-cream/80' : 'text-wood-600'
                  }`}
                >
                  {badge.criteria}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Class Results Table (Privacy-First) + Personal Review Log */}
      <section className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sandstone pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-forest-700" />
              <h2 className="font-serif text-2xl font-bold text-wood-900">
                Bảng kết quả theo lớp &amp; Nhật kí ôn tập
              </h2>
            </div>
            <p className="text-xs text-wood-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span>
                Bảo mật học sinh: Tên đầy đủ được tự động viết tắt ẩn danh trên bảng xếp hạng chung theo lớp.
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {classes.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-wood-900 text-cream border-wood-900'
                    : 'bg-parchment/60 text-wood-800 border-sandstone hover:border-gold-500'
                }`}
              >
                {cls}
              </button>
            ))}

            {attempts.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="px-3 py-1.5 text-xs text-wood-600 hover:text-wood-900 cursor-pointer"
              >
                Xóa lịch sử Demo
              </button>
            )}
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="p-8 rounded-xl bg-parchment/50 border border-sandstone text-center text-sm text-wood-700">
            Chưa có lượt thi nào được lưu cho bộ lọc lớp này. Hãy hoàn thành ít nhất một trò chơi trong Đấu trường để ghi nhận kết quả thực tế.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-sandstone text-wood-600">
                  <th className="py-2.5 pr-4 font-semibold">Học sinh (Ẩn danh)</th>
                  <th className="py-2.5 pr-4 font-semibold">Lớp</th>
                  <th className="py-2.5 pr-4 font-semibold">Trò chơi</th>
                  <th className="py-2.5 pr-4 font-semibold">Thời gian hoàn thành</th>
                  <th className="py-2.5 pr-4 font-semibold">Đúng / Sai</th>
                  <th className="py-2.5 font-semibold text-right">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sandstone/70">
                {filteredAttempts.map((rec) => (
                  <tr key={rec.id} className="text-wood-900">
                    <td className="py-3 pr-4 font-medium">
                      {maskStudentNameForClassBoard(rec.studentName)}
                    </td>
                    <td className="py-3 pr-4 text-wood-700">{rec.className}</td>
                    <td className="py-3 pr-4">{rec.gameTitle}</td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-xs text-wood-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rec.completedAtIso).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums">
                      <span className="text-forest-800">{rec.correctCount}</span> /{' '}
                      <span className="text-amber-700">{rec.wrongCount}</span>
                    </td>
                    <td className="py-3 font-mono tabular-nums font-bold text-right text-wood-900">
                      {rec.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Personal Missed Items Study List */}
        {attempts.some((a) => a.reviewItems.length > 0) && (
          <div className="pt-4 border-t border-sandstone space-y-3">
            <h3 className="font-serif text-xl font-bold text-wood-900">
              Kho câu cần ôn tập cá nhân (từ các lượt vừa chơi)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attempts
                .flatMap((a) =>
                  a.reviewItems.map((rev) => ({
                    ...rev,
                    gameTitle: a.gameTitle,
                  }))
                )
                .slice(0, 6)
                .map((rev, idx) => (
                  <div
                    key={`${rev.prompt}-${idx}`}
                    className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-1 text-xs"
                  >
                    <p className="font-semibold text-forest-800">{rev.gameTitle}</p>
                    <p className="font-medium text-wood-900">{rev.prompt}</p>
                    <p className="text-forest-800">Đáp án đúng: {rev.correctAnswer}</p>
                    <p className="text-wood-700">{rev.explanation}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
