import React, { useState } from 'react';
import { Award, RotateCcw } from 'lucide-react';
import { STEM_FOUR_LEVEL_RUBRIC } from '../../data/arenaAndStemData';
import { RubricLevelKey } from '../../types/museum';

const LEVEL_KEYS: RubricLevelKey[] = ['chua_dat', 'dat', 'kha', 'tot'];

const LEVEL_STYLES: Record<
  RubricLevelKey,
  { headerBg: string; selectedCell: string; badgeText: string }
> = {
  chua_dat: {
    headerBg: 'bg-terracotta-100/70 text-terracotta-900',
    selectedCell: 'bg-terracotta-50 border-terracotta-600 ring-1 ring-terracotta-600/40',
    badgeText: 'text-terracotta-800',
  },
  dat: {
    headerBg: 'bg-parchment text-wood-900',
    selectedCell: 'bg-parchment border-wood-700 ring-1 ring-wood-700/30',
    badgeText: 'text-wood-800',
  },
  kha: {
    headerBg: 'bg-gold-100/80 text-wood-900',
    selectedCell: 'bg-gold-50 border-gold-600 ring-1 ring-gold-600/40',
    badgeText: 'text-gold-700',
  },
  tot: {
    headerBg: 'bg-forest-100/80 text-forest-900',
    selectedCell: 'bg-forest-50 border-forest-700 ring-1 ring-forest-700/40',
    badgeText: 'text-forest-800',
  },
};

function getRankSummary(score: number, ratedCount: number): string {
  if (ratedCount < 4) return 'Chọn đủ 4 tiêu chí để tính xếp loại tự đánh giá';
  if (score >= 14) return 'Xếp loại: TỐT · Sản phẩm xuất sắc sẵn sàng trưng bày mẫu';
  if (score >= 11) return 'Xếp loại: KHÁ · Đạt chuẩn nội dung, thẩm mỹ và STEM';
  if (score >= 7) return 'Xếp loại: ĐẠT · Hoàn thành yêu cầu cơ bản';
  return 'Xếp loại: CHƯA ĐẠT · Cần bổ sung nội dung và độ bền mô hình';
}

export const StemRubricSection: React.FC = () => {
  const [selectedLevels, setSelectedLevels] = useState<
    Record<string, RubricLevelKey | undefined>
  >({});

  const ratedEntries = Object.entries(selectedLevels).filter(
    (entry): entry is [string, RubricLevelKey] => Boolean(entry[1])
  );

  const totalScore = ratedEntries.reduce((sum, [criterionId, lvl]) => {
    const found = STEM_FOUR_LEVEL_RUBRIC.find((c) => c.id === criterionId);
    return sum + (found ? found.levels[lvl].scorePoints : 0);
  }, 0);

  const handleSelect = (criterionId: string, level: RubricLevelKey) => {
    setSelectedLevels((prev) => ({
      ...prev,
      [criterionId]: prev[criterionId] === level ? undefined : level,
    }));
  };

  return (
    <section className="space-y-6">
      <div className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-sandstone pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-wood-900">
              <Award className="w-5 h-5 text-gold-600" />
              <h2 className="font-serif text-2xl font-bold">
                Tiêu chí đánh giá sản phẩm STEM (Rubric 4 tiêu chí × 4 mức)
              </h2>
            </div>
            <p className="text-sm text-wood-700 leading-relaxed">
              Áp dụng cho cả Mô hình Nhà dài Ê-đê và Bản đồ Con đường đến Nữ thần Mặt Trời. Học sinh hoặc giáo viên có thể nhấp trực tiếp vào từng ô mức độ để tự chấm hoặc chấm chéo giữa các nhóm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-parchment border border-sandstone text-right">
              <p className="text-[11px] font-medium text-wood-600">
                Tổng điểm đánh giá ({ratedEntries.length}/4 tiêu chí)
              </p>
              <p className="font-mono tabular-nums text-lg font-bold text-wood-900">
                {totalScore} / 16 điểm
              </p>
            </div>
            {ratedEntries.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedLevels({})}
                className="px-3 py-2 text-xs font-semibold bg-parchment text-wood-800 border border-sandstone rounded-lg hover:border-gold-500 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-3 rounded-xl bg-parchment/80 border border-sandstone text-xs sm:text-sm font-semibold text-wood-900">
          {getRankSummary(totalScore, ratedEntries.length)}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="border-b border-sandstone">
                <th className="py-3 px-3 text-xs font-bold uppercase tracking-wide text-wood-700 w-[22%]">
                  Tiêu chí đánh giá
                </th>
                <th className={`py-3 px-3 text-xs font-bold uppercase tracking-wide rounded-tl-lg w-[19.5%] ${LEVEL_STYLES.chua_dat.headerBg}`}>
                  Chưa đạt (1đ)
                </th>
                <th className={`py-3 px-3 text-xs font-bold uppercase tracking-wide w-[19.5%] ${LEVEL_STYLES.dat.headerBg}`}>
                  Đạt (2đ)
                </th>
                <th className={`py-3 px-3 text-xs font-bold uppercase tracking-wide w-[19.5%] ${LEVEL_STYLES.kha.headerBg}`}>
                  Khá (3đ)
                </th>
                <th className={`py-3 px-3 text-xs font-bold uppercase tracking-wide rounded-tr-lg w-[19.5%] ${LEVEL_STYLES.tot.headerBg}`}>
                  Tốt (4đ)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sandstone">
              {STEM_FOUR_LEVEL_RUBRIC.map((criterion) => {
                const chosen = selectedLevels[criterion.id];
                return (
                  <tr key={criterion.id} className="align-top">
                    <td className="py-4 px-3 pr-4">
                      <p className="text-[11px] font-mono text-wood-500">
                        Tiêu chí {criterion.orderNumber}
                      </p>
                      <p className="text-sm font-bold text-wood-900 mt-0.5">
                        {criterion.criterionName}
                      </p>
                      <p className="text-xs text-wood-600 mt-1 leading-relaxed">
                        {criterion.weightLabel}
                      </p>
                    </td>

                    {LEVEL_KEYS.map((lvlKey) => {
                      const info = criterion.levels[lvlKey];
                      const isSelected = chosen === lvlKey;
                      return (
                        <td key={lvlKey} className="p-2">
                          <button
                            type="button"
                            onClick={() => handleSelect(criterion.id, lvlKey)}
                            className={`w-full h-full min-h-[116px] text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? LEVEL_STYLES[lvlKey].selectedCell
                                : 'bg-parchment/35 border-sandstone/80 hover:border-gold-500 hover:bg-parchment/70'
                            }`}
                          >
                            <span className="text-xs text-wood-800 leading-relaxed">
                              {info.descriptor}
                            </span>
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                isSelected ? LEVEL_STYLES[lvlKey].badgeText : 'text-wood-500'
                              }`}
                            >
                              {isSelected ? `✓ Đã chọn · ${info.scorePoints}đ` : `${info.label} · ${info.scorePoints}đ`}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
