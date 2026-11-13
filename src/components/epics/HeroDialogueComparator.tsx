import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { HERO_COMPARISON_PROFILES } from '../../data/literaryCurriculumData';

interface HeroDialogueComparatorProps {
  defaultHeroA?: string;
  defaultHeroB?: string;
}

export const HeroDialogueComparator: React.FC<HeroDialogueComparatorProps> = ({
  defaultHeroA = 'hero-dam-san',
  defaultHeroB = 'hero-odysseus',
}) => {
  const [heroAId, setHeroAId] = useState(defaultHeroA);
  const [heroBId, setHeroBId] = useState(defaultHeroB);

  const heroA =
    HERO_COMPARISON_PROFILES.find((h) => h.id === heroAId) || HERO_COMPARISON_PROFILES[0];
  const heroB =
    HERO_COMPARISON_PROFILES.find((h) => h.id === heroBId) || HERO_COMPARISON_PROFILES[2];

  const rows: Array<{
    criterion: string;
    valueA: string;
    valueB: string;
  }> = [
    {
      criterion: 'Bối cảnh xuất hiện',
      valueA: heroA.appearanceContext,
      valueB: heroB.appearanceContext,
    },
    {
      criterion: 'Khát vọng',
      valueA: heroA.aspiration,
      valueB: heroB.aspiration,
    },
    {
      criterion: 'Hành động',
      valueA: heroA.actions,
      valueB: heroB.actions,
    },
    {
      criterion: 'Phẩm chất',
      valueA: heroA.qualities,
      valueB: heroB.qualities,
    },
    {
      criterion: 'Quan hệ với cộng đồng',
      valueA: heroA.communityRelation,
      valueB: heroB.communityRelation,
    },
    {
      criterion: 'Số phận',
      valueA: heroA.fate,
      valueB: heroB.fate,
    },
    {
      criterion: 'Ý nghĩa biểu tượng',
      valueA: heroA.symbolicMeaning,
      valueB: heroB.symbolicMeaning,
    },
  ];

  return (
    <section className="bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sandstone pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-jade-700">
            <Scale className="w-4 h-4" />
            <span>Công cụ so sánh liên văn hóa</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
            ĐỐI THOẠI GIỮA NHỮNG NGƯỜI ANH HÙNG
          </h2>
          <p className="text-sm text-wood-700">
            Chọn hai nhân vật sử thi Việt Nam hoặc thế giới để đối chiếu trực quan qua 7 tiêu chí.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          <div>
            <label htmlFor="hero-select-a" className="block text-[11px] font-semibold text-wood-600 mb-1">
              Nhân vật thứ nhất
            </label>
            <select
              id="hero-select-a"
              value={heroA.id}
              onChange={(e) => setHeroAId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-parchment border border-sandstone rounded-lg font-medium text-wood-900 focus:outline-none focus:border-forest-700"
            >
              {HERO_COMPARISON_PROFILES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} · {h.workTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="hero-select-b" className="block text-[11px] font-semibold text-wood-600 mb-1">
              Nhân vật thứ hai
            </label>
            <select
              id="hero-select-b"
              value={heroB.id}
              onChange={(e) => setHeroBId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-parchment border border-sandstone rounded-lg font-medium text-wood-900 focus:outline-none focus:border-jade-700"
            >
              {HERO_COMPARISON_PROFILES.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} · {h.workTitle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm min-w-[680px]">
          <thead>
            <tr className="border-b border-sandstone bg-parchment/60">
              <th className="py-3.5 px-4 font-semibold text-wood-700 w-[20%]">Tiêu chí đối chiếu</th>
              <th className="py-3.5 px-4 font-serif text-lg font-bold text-forest-800 w-[40%]">
                {heroA.name}
                <span className="block font-sans text-xs font-normal text-wood-600">
                  {heroA.origin}
                </span>
              </th>
              <th className="py-3.5 px-4 font-serif text-lg font-bold text-jade-700 w-[40%]">
                {heroB.name}
                <span className="block font-sans text-xs font-normal text-wood-600">
                  {heroB.origin}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sandstone/80">
            {rows.map((row) => (
              <tr key={row.criterion} className="align-top hover:bg-parchment/30 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-wood-900">{row.criterion}</td>
                <td className="py-3.5 px-4 text-wood-800 leading-relaxed">{row.valueA}</td>
                <td className="py-3.5 px-4 text-wood-800 leading-relaxed">{row.valueB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
