import React, { useState } from 'react';
import { BookMarked, Edit3, User } from 'lucide-react';
import {
  getMergedWorldDossiers,
  saveDossierOverride,
} from '../services/curriculumStorageService';
import { EpicDossier } from '../types/museum';
import { SafeImage } from '../components/common/SafeImage';
import { WorldCultureMap } from '../components/epics/WorldCultureMap';
import { HeroDialogueComparator } from '../components/epics/HeroDialogueComparator';

interface WorldEpicsPageProps {
  onRecordWorkStudy?: (
    moduleId: 'vietnam-epics' | 'world-epics',
    workTitle: string,
    actionKey: string,
    label: string
  ) => void;
}

export const WorldEpicsPage: React.FC<WorldEpicsPageProps> = ({
  onRecordWorkStudy,
}) => {
  const [works, setWorks] = useState<EpicDossier[]>(() => getMergedWorldDossiers());
  const [regionFilter, setRegionFilter] = useState<'all' | 'greece' | 'india' | 'mesopotamia'>('all');
  const [selectedId, setSelectedId] = useState<string>(works[0]?.id || 'world-iliad');
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [recordedWorkIds, setRecordedWorkIds] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);
  const [editPlot, setEditPlot] = useState('');
  const [editRefNote, setEditRefNote] = useState('');

  const filteredWorks =
    regionFilter === 'all'
      ? works
      : works.filter((w) => w.cultureRegionId === regionFilter);

  const activeWork =
    filteredWorks.find((w) => w.id === selectedId) || filteredWorks[0] || works[0];

  const handleSelectRegion = (region: 'all' | 'greece' | 'india' | 'mesopotamia') => {
    setRegionFilter(region);
    if (region !== 'all') {
      const firstMatch = works.find((w) => w.cultureRegionId === region);
      if (firstMatch) setSelectedId(firstMatch.id);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDossierOverride(activeWork.id, {
      plotSummary: editPlot.trim() || activeWork.plotSummary,
      referenceNote: editRefNote.trim() || activeWork.referenceNote,
    });
    setWorks(getMergedWorldDossiers());
    setEditMode(false);
  };

  return (
    <div className="space-y-10 pb-14">
      <header className="border-b border-sandstone pb-6 space-y-2 max-w-3xl">
        <p className="text-xs font-medium text-wood-600">
          Khu vực 3 · Thư viện sử thi thế giới (Iliad, Odyssey, Ramayana, Mahabharata, Gilgamesh)
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
          Sử thi thế giới
        </h1>
        <p className="text-sm sm:text-base text-wood-700 leading-relaxed">
          Khám phá các kiệt tác sử thi cổ đại theo vùng văn hóa, theo dõi sơ đồ cốt truyện, hồ sơ nhân vật và đối thoại so sánh cùng anh hùng Tây Nguyên.
        </p>
      </header>

      {/* Interactive Cultural Region Map */}
      <WorldCultureMap selectedRegion={regionFilter} onSelectRegion={handleSelectRegion} />

      {/* Work Tabs */}
      <div className="flex flex-wrap gap-2">
        {filteredWorks.map((work) => {
          const active = work.id === activeWork.id;
          return (
            <button
              key={work.id}
              type="button"
              onClick={() => {
                setSelectedId(work.id);
                setEditMode(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-jade-700 text-cream'
                  : 'bg-parchment text-wood-800 border border-sandstone hover:border-jade-600'
              }`}
            >
              {work.title}
            </button>
          );
        })}
      </div>

      {/* Main Dossier + Character Profile + Plot Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl overflow-hidden border border-sandstone bg-wood-950">
            <SafeImage
              src={activeWork.imagePath}
              alt={activeWork.imageAlt}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Dedicated Character Profile */}
          <div className="p-5 rounded-xl bg-wood-900 text-cream border border-wood-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-400">
              <User className="w-4 h-4" />
              <span>Hồ sơ nhân vật trung tâm</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-cream">
              {activeWork.characterProfile.name}
            </h3>
            <dl className="space-y-2 text-xs sm:text-sm text-cream/85">
              <div>
                <dt className="text-cream/60">Vai trò:</dt>
                <dd>{activeWork.characterProfile.role}</dd>
              </div>
              <div>
                <dt className="text-cream/60">Xung đột tiêu biểu:</dt>
                <dd>{activeWork.characterProfile.keyConflict}</dd>
              </div>
              <div>
                <dt className="text-cream/60">Phẩm chất nổi bật:</dt>
                <dd>{activeWork.characterProfile.representativeTrait}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <article className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-sandstone pb-4">
            <div>
              <p className="text-xs text-wood-600">
                {activeWork.culturalCommunity} · {activeWork.distributionArea}
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900 mt-1">
                {activeWork.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditPlot(activeWork.plotSummary);
                setEditRefNote(activeWork.referenceNote);
                setEditMode((p) => !p);
              }}
              className="text-xs font-semibold text-jade-700 hover:text-forest-800 inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editMode ? 'Đóng sửa' : 'Giáo viên cập nhật'}</span>
            </button>
          </div>

          {editMode ? (
            <form
              onSubmit={handleSaveEdit}
              className="p-4 rounded-xl bg-parchment/80 border border-sandstone space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">
                  Cốt truyện khái quát
                </label>
                <textarea
                  rows={3}
                  value={editPlot}
                  onChange={(e) => setEditPlot(e.target.value)}
                  className="w-full p-3 text-sm bg-cream border border-sandstone rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-wood-800 mb-1">
                  Ghi chú trích đoạn nguồn
                </label>
                <textarea
                  rows={2}
                  value={editRefNote}
                  onChange={(e) => setEditRefNote(e.target.value)}
                  className="w-full p-3 text-sm bg-cream border border-sandstone rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
              >
                Lưu cập nhật
              </button>
            </form>
          ) : (
            <>
              <p className="text-sm sm:text-base text-wood-800 leading-relaxed">
                {activeWork.introduction}
              </p>

              {/* Plot Diagram (Sơ đồ cốt truyện) */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-jade-700">
                  Sơ đồ cốt truyện
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeWork.plotSteps.map((step, idx) => (
                    <div
                      key={step.step}
                      className="p-3.5 rounded-xl bg-parchment/65 border border-sandstone space-y-1"
                    >
                      <p className="font-mono text-[11px] text-wood-500">
                        Chặng 0{idx + 1} · {step.step}
                      </p>
                      <p className="text-sm text-wood-900 leading-relaxed">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-parchment/55 border border-sandstone space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-wood-900">
                    Đặc điểm nghệ thuật
                  </h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-wood-800">
                    {activeWork.artisticFeatures.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-parchment/55 border border-sandstone space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-wood-900">
                    Giá trị văn hóa
                  </h3>
                  <p className="text-sm text-wood-800 leading-relaxed">{activeWork.culturalValue}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-parchment/80 border border-gold-500/40 text-xs sm:text-sm text-wood-800 space-y-1">
                <p className="font-semibold text-gold-600 flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4" />
                  <span>Ghi chú văn bản &amp; trích đoạn</span>
                </p>
                <p>{activeWork.referenceNote}</p>
              </div>
            </>
          )}

          {/* Comparison Question & Connection Mission */}
          <div className="pt-4 border-t border-sandstone space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-parchment/50 border border-sandstone space-y-1.5">
                <p className="text-xs font-bold text-jade-700">Câu hỏi so sánh</p>
                <p className="text-wood-800 leading-relaxed">
                  {activeWork.comparisonQuestion || activeWork.readingQuestions[0]}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-parchment/50 border border-sandstone space-y-1.5">
                <p className="text-xs font-bold text-forest-800">Nhiệm vụ liên hệ</p>
                <p className="text-wood-800 leading-relaxed">
                  {activeWork.connectionMission || activeWork.appliedMission}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`world-note-${activeWork.id}`}
                className="block text-xs font-bold text-wood-800"
              >
                Ghi chú đối chiếu &amp; liên hệ cá nhân ({activeWork.title})
              </label>
              <textarea
                id={`world-note-${activeWork.id}`}
                rows={2}
                value={studentNotes[activeWork.id] || ''}
                onChange={(e) =>
                  setStudentNotes((prev) => ({
                    ...prev,
                    [activeWork.id]: e.target.value,
                  }))
                }
                placeholder="Ghi ngắn điểm tương đồng/khác biệt với anh hùng Đăm Săn..."
                className="w-full p-3 text-sm bg-cream border border-sandstone rounded-xl focus:outline-none focus:border-jade-700"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecordedWorkIds((prev) => ({ ...prev, [activeWork.id]: true }));
                    onRecordWorkStudy?.(
                      'world-epics',
                      activeWork.title,
                      `study_${activeWork.id}`,
                      `Đã tìm hiểu & đối chiếu tác phẩm ${activeWork.title}`
                    );
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-jade-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
                >
                  {recordedWorkIds[activeWork.id]
                    ? `Đã ghi nhận tìm hiểu: ${activeWork.title}`
                    : 'Lưu ghi chú & Ghi nhận tìm hiểu tác phẩm'}
                </button>
                <span className="text-[11px] text-wood-600">
                  Cần tìm hiểu ít nhất 2 tác phẩm Sử thi thế giới để hoàn thành phân hệ
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Interactive Hero Dialogue & Comparison Tool */}
      <HeroDialogueComparator defaultHeroA="hero-dam-san" defaultHeroB="hero-odysseus" />
    </div>
  );
};
