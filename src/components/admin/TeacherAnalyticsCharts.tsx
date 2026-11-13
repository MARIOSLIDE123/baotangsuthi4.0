import React, { useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  PieChart,
  Users,
} from 'lucide-react';
import { CORE_SEVEN_WINGS } from '../../data/navigation';
import {
  CoreWingId,
  ModuleProgressRecord,
  QuizAttemptRecord,
  UserProfileRecord,
} from '../../types/museum';

interface TeacherAnalyticsChartsProps {
  students: UserProfileRecord[];
  progressRecords: ModuleProgressRecord[];
  quizAttempts: QuizAttemptRecord[];
}

const ACTIVITY_TYPE_LABELS: Record<QuizAttemptRecord['activityType'], string> = {
  concept_check: 'Cánh cửa sử thi (Kiểm tra khái niệm)',
  museum_3d: 'Bảo tàng 3D (Điểm chạm kiến thức)',
  reading_comprehension: 'Đọc hiểu văn bản (4 trạm Đăm Săn)',
  compass_analysis: 'Chiếc la bàn sử thi (Dẫn chứng)',
  arena_game: 'Đấu trường Anh hùng ca',
};

export const TeacherAnalyticsCharts: React.FC<TeacherAnalyticsChartsProps> = ({
  students,
  progressRecords,
  quizAttempts,
}) => {
  const learnerStudents = useMemo(
    () => students.filter((s) => s.role === 'student'),
    [students]
  );
  const denominator = Math.max(1, learnerStudents.length || students.length);

  // Chart 1: Completion & in-progress rate per core module
  const moduleStats = useMemo(() => {
    return CORE_SEVEN_WINGS.map((wing) => {
      const modId = wing.id as CoreWingId;
      const rows = progressRecords.filter((p) => p.moduleId === modId);
      const completed = rows.filter((p) => p.status === 'completed').length;
      const inProgress = rows.filter((p) => p.status === 'in_progress').length;
      const completedPct = Math.round((completed / denominator) * 100);
      const inProgressPct = Math.min(
        100 - completedPct,
        Math.round((inProgress / denominator) * 100)
      );
      return {
        id: modId,
        label: wing.title,
        completed,
        inProgress,
        completedPct,
        inProgressPct,
      };
    });
  }, [progressRecords, denominator]);

  // Chart 2: Average score (%) by task/activity type
  const taskScoreStats = useMemo(() => {
    const types: QuizAttemptRecord['activityType'][] = [
      'concept_check',
      'museum_3d',
      'reading_comprehension',
      'compass_analysis',
      'arena_game',
    ];
    return types.map((t) => {
      const filtered = quizAttempts.filter((a) => a.activityType === t);
      if (filtered.length === 0) {
        return { type: t, label: ACTIVITY_TYPE_LABELS[t], avgPct: 0, count: 0 };
      }
      const totalPct = filtered.reduce((sum, a) => {
        const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
        return sum + Math.min(100, pct);
      }, 0);
      return {
        type: t,
        label: ACTIVITY_TYPE_LABELS[t],
        avgPct: Math.round(totalPct / filtered.length),
        count: filtered.length,
      };
    });
  }, [quizAttempts]);

  // Chart 3: Student engagement distribution (completed / in_progress / not_started slots across students)
  const engagementStats = useMemo(() => {
    const targetStudents = learnerStudents.length > 0 ? learnerStudents : students;
    let activeLearners = 0;
    let fullyCompletedSlots = 0;
    let inProgressSlots = 0;
    const totalSlots = Math.max(1, targetStudents.length * CORE_SEVEN_WINGS.length);

    for (const st of targetStudents) {
      const stMods = progressRecords.filter((p) => p.studentUid === st.uid);
      const stAttempts = quizAttempts.filter((a) => a.studentUid === st.uid);
      const comp = stMods.filter((m) => m.status === 'completed').length;
      const inProg = stMods.filter((m) => m.status === 'in_progress').length;
      fullyCompletedSlots += comp;
      inProgressSlots += inProg;
      if (comp > 0 || inProg > 0 || stAttempts.length > 0) {
        activeLearners += 1;
      }
    }

    const notStartedSlots = Math.max(
      0,
      totalSlots - fullyCompletedSlots - inProgressSlots
    );

    const compPct = Math.round((fullyCompletedSlots / totalSlots) * 100);
    const inProgPct = Math.round((inProgressSlots / totalSlots) * 100);
    const notStartedPct = Math.max(0, 100 - compPct - inProgPct);

    return {
      totalStudents: targetStudents.length,
      activeLearners,
      engagementRate: targetStudents.length
        ? Math.round((activeLearners / targetStudents.length) * 100)
        : 0,
      compPct,
      inProgPct,
      notStartedPct,
      fullyCompletedSlots,
      inProgressSlots,
      notStartedSlots,
    };
  }, [learnerStudents, students, progressRecords, quizAttempts]);

  // Chart 4: Difficult topics (where students had wrong answers or < 65% score)
  const difficultTopics = useMemo(() => {
    const map = new Map<
      string,
      { topic: string; wrongTotal: number; attempts: number; sumPct: number }
    >();

    for (const att of quizAttempts) {
      const label = (att.difficultTopic || att.activityTitle || '').trim();
      if (!label) continue;
      const pct = att.maxScore > 0 ? (att.score / att.maxScore) * 100 : 100;
      if (att.wrongCount > 0 || pct < 75) {
        const prev = map.get(label) || {
          topic: label,
          wrongTotal: 0,
          attempts: 0,
          sumPct: 0,
        };
        prev.wrongTotal += Math.max(1, att.wrongCount);
        prev.attempts += 1;
        prev.sumPct += pct;
        map.set(label, prev);
      }
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgPct: Math.round(item.sumPct / Math.max(1, item.attempts)),
      }))
      .sort((a, b) => b.wrongTotal - a.wrongTotal)
      .slice(0, 6);
  }, [quizAttempts]);

  // SVG Donut math for Chart 3
  const r = 44;
  const circ = 2 * Math.PI * r;
  const compStroke = (engagementStats.compPct / 100) * circ;
  const inProgStroke = (engagementStats.inProgPct / 100) * circ;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Chart 1: Tỷ lệ hoàn thành từng phân hệ */}
      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-wood-600">Biểu đồ 01</p>
            <h3 className="font-serif text-xl font-bold text-wood-900">
              Tỷ lệ hoàn thành từng phân hệ
            </h3>
          </div>
          <BarChart3 className="w-5 h-5 text-forest-700 shrink-0" />
        </div>

        <div className="space-y-3">
          {moduleStats.map((m) => (
            <div key={m.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-wood-800 truncate">{m.label}</span>
                <span className="font-mono tabular-nums text-wood-600 shrink-0">
                  Hoàn thành {m.completedPct}% · Đang học {m.inProgressPct}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-parchment border border-sandstone/70 overflow-hidden flex">
                <div
                  className="bg-forest-700 h-full transition-all"
                  style={{ width: `${m.completedPct}%` }}
                  title={`Đã hoàn thành: ${m.completed} học sinh`}
                />
                <div
                  className="bg-gold-500 h-full transition-all"
                  style={{ width: `${m.inProgressPct}%` }}
                  title={`Đang khám phá: ${m.inProgress} học sinh`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-sandstone/60 text-xs text-wood-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-forest-700 inline-block" />
            <span>Đã hoàn thành</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gold-500 inline-block" />
            <span>Đang khám phá</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-parchment border border-sandstone inline-block" />
            <span>Chưa khám phá</span>
          </span>
        </div>
      </section>

      {/* Chart 2: Điểm trung bình từng nhiệm vụ */}
      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-wood-600">Biểu đồ 02</p>
            <h3 className="font-serif text-xl font-bold text-wood-900">
              Điểm trung bình từng nhiệm vụ (%)
            </h3>
          </div>
          <BookOpenCheck className="w-5 h-5 text-gold-600 shrink-0" />
        </div>

        <div className="space-y-3.5">
          {taskScoreStats.map((t) => (
            <div key={t.type} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-wood-800 truncate">{t.label}</span>
                <span className="font-mono tabular-nums font-semibold text-wood-900 shrink-0">
                  {t.count > 0 ? `${t.avgPct}% (${t.count} lượt)` : 'Chưa có lượt'}
                </span>
              </div>
              <div className="h-3 rounded-full bg-parchment border border-sandstone/70 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    t.avgPct >= 75
                      ? 'bg-forest-700'
                      : t.avgPct >= 50
                        ? 'bg-gold-500'
                        : 'bg-terracotta-700'
                  }`}
                  style={{ width: `${t.avgPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chart 3: Mức độ tham gia của học sinh */}
      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-wood-600">Biểu đồ 03</p>
            <h3 className="font-serif text-xl font-bold text-wood-900">
              Mức độ tham gia của học sinh
            </h3>
          </div>
          <PieChart className="w-5 h-5 text-jade-700 shrink-0" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          <div className="relative w-36 h-36 shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="#e6dccb"
                strokeWidth="16"
              />
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="#2d5a43"
                strokeWidth="16"
                strokeDasharray={`${compStroke} ${circ}`}
                strokeDashoffset={0}
              />
              <circle
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke="#d69e2e"
                strokeWidth="16"
                strokeDasharray={`${inProgStroke} ${circ}`}
                strokeDashoffset={-compStroke}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono tabular-nums text-xl font-bold text-wood-900">
                {engagementStats.engagementRate}%
              </span>
              <span className="text-[10px] text-wood-600">Đã tham gia</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 text-xs w-full">
            <div className="p-3 rounded-xl bg-parchment/70 border border-sandstone flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-wood-800">
                <Users className="w-4 h-4 text-forest-700" />
                <span>Học sinh có hoạt động thực tế</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-wood-900">
                {engagementStats.activeLearners}/{engagementStats.totalStudents}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-forest-700/10 border border-forest-700/30">
                <p className="font-mono tabular-nums font-bold text-forest-800 text-sm">
                  {engagementStats.compPct}%
                </p>
                <p className="text-[11px] text-wood-700">Hoàn thành</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gold-500/15 border border-gold-500/40">
                <p className="font-mono tabular-nums font-bold text-wood-900 text-sm">
                  {engagementStats.inProgPct}%
                </p>
                <p className="text-[11px] text-wood-700">Đang học</p>
              </div>
              <div className="p-2.5 rounded-lg bg-parchment border border-sandstone">
                <p className="font-mono tabular-nums font-bold text-wood-700 text-sm">
                  {engagementStats.notStartedPct}%
                </p>
                <p className="text-[11px] text-wood-600">Chưa học</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chart 4: Những nội dung học sinh còn gặp khó khăn */}
      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-wood-600">Biểu đồ 04</p>
            <h3 className="font-serif text-xl font-bold text-wood-900">
              Những nội dung học sinh còn gặp khó khăn
            </h3>
          </div>
          <AlertTriangle className="w-5 h-5 text-terracotta-700 shrink-0" />
        </div>

        {difficultTopics.length === 0 ? (
          <div className="p-5 rounded-xl bg-parchment/60 border border-sandstone text-sm text-wood-700">
            Chưa ghi nhận chủ đề sai sót nổi bật nào trong lớp (hoặc học sinh chưa thực hiện bài kiểm tra).
          </div>
        ) : (
          <div className="space-y-3">
            {difficultTopics.map((item) => {
              const difficultyBar = Math.min(100, Math.max(15, 100 - item.avgPct));
              return (
                <div key={item.topic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-wood-900 truncate">{item.topic}</span>
                    <span className="font-mono tabular-nums text-terracotta-700 shrink-0">
                      {item.wrongTotal} lượt sai · TB {item.avgPct}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-parchment border border-sandstone/70 overflow-hidden">
                    <div
                      className="h-full bg-terracotta-700 transition-all"
                      style={{ width: `${difficultyBar}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
