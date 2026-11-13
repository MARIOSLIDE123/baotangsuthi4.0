import React, { useState } from 'react';
import { ArrowRight, BookMarked, Edit3 } from 'lucide-react';
import {
  getMergedVietnamDossiers,
  saveDossierOverride,
} from '../services/curriculumStorageService';
import { EpicDossier, MuseumRouteId } from '../types/museum';
import { SafeImage } from '../components/common/SafeImage';
import { EmptyState } from '../components/common/StateFeedback';
import { HeroDialogueComparator } from '../components/epics/HeroDialogueComparator';

interface VietnamEpicsPageProps {
  onNavigate: (route: MuseumRouteId) => void;
  onRecordWorkStudy?: (
    moduleId: 'vietnam-epics' | 'world-epics',
    workTitle: string,
    actionKey: string,
    label: string
  ) => void;
}

export const VietnamEpicsPage: React.FC<VietnamEpicsPageProps> = ({
  onNavigate,
  onRecordWorkStudy,
}) => {
  const [works, setWorks] = useState<EpicDossier[]>(() => getMergedVietnamDossiers());
  const [selectedId, setSelectedId] = useState<string>(works[0]?.id || 'vn-dam-san');
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [recordedWorkIds, setRecordedWorkIds] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState(false);
  const [editPlot, setEditPlot] = useState('');
  const [editRefNote, setEditRefNote] = useState('');

  if (works.length === 0) {
    return (
      <EmptyState
        title="Chưa có dữ liệu sử thi Việt Nam"
        description="Vui lòng kiểm tra tệp literaryCurriculumData.ts để bổ sung hồ sơ tác phẩm."
      />
    );
  }

  const activeWork = works.find((w) => w.id === selectedId) || works[0];

  const handleSelectWork = (work: EpicDossier) => {
    setSelectedId(work.id);
    setEditMode(false);
    setEditPlot(work.plotSummary);
    setEditRefNote(work.referenceNote);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDossierOverride(activeWork.id, {
      plotSummary: editPlot.trim() || activeWork.plotSummary,
      referenceNote: editRefNote.trim() || activeWork.referenceNote,
    });
    setWorks(getMergedVietnamDossiers());
    setEditMode(false);
  };

  return (
    <div className="space-y-10 pb-14">
      <header className="border-b border-sandstone pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-medium text-wood-600">
            Khu vực 2 · Thư viện sử thi Tây Nguyên và các dân tộc Việt Nam
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
            Đại ngàn sử thi Việt Nam
          </h1>
          <p className="text-sm sm:text-base text-wood-700 leading-relaxed">
            Hồ sơ tác phẩm có cấu trúc tách riêng dữ liệu học liệu. Các trích đoạn cụ thể chờ giáo viên chọn bộ sách giáo khoa được ghi rõ là CẦN BỔ SUNG TƯ LIỆU.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dam-san-journey')}
          className="px-4 py-2 text-xs sm:text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors inline-flex items-center gap-2 cursor-pointer self-start lg:self-auto"
        >
          <span>Trải nghiệm Theo dấu Đăm Săn</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Work Selector */}
      <div className="flex flex-wrap gap-2">
        {works.map((work) => {
          const active = work.id === activeWork.id;
          return (
            <button
              key={work.id}
              type="button"
              onClick={() => handleSelectWork(work)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-wood-900 text-cream'
                  : 'bg-parchment text-wood-800 border border-sandstone hover:border-gold-500'
              }`}
            >
              {work.title}
            </button>
          );
        })}
      </div>

      {/* 10-Field Dossier View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl overflow-hidden border border-sandstone bg-wood-950">
            <SafeImage
              src={activeWork.imagePath}
              alt={activeWork.imageAlt}
              className="w-full h-64 object-cover"
            />
          </div>

          <div className="p-5 rounded-xl bg-parchment/75 border border-sandstone space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-900">Thông tin định danh tác phẩm</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-sandstone/70 pb-1.5">
                <dt className="text-wood-600">Tên tác phẩm</dt>
                <dd className="font-semibold text-wood-900 text-right">{activeWork.title}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-sandstone/70 pb-1.5">
                <dt className="text-wood-600">Cộng đồng văn hóa</dt>
                <dd className="font-medium text-wood-900 text-right">{activeWork.culturalCommunity}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-sandstone/70 pb-1.5">
                <dt className="text-wood-600">Khu vực phân bố</dt>
                <dd className="font-medium text-wood-900 text-right">{activeWork.distributionArea}</dd>
              </div>
              <div>
                <dt className="text-wood-600 mb-1">Nhân vật trung tâm</dt>
                <dd className="font-medium text-wood-900 leading-relaxed">
                  {activeWork.centralCharacter}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <article className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
              Hồ sơ tác phẩm: {activeWork.title}
            </h2>
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
                  Tư liệu trích đoạn bổ sung
                </label>
                <textarea
                  rows={3}
                  value={editRefNote}
                  onChange={(e) => setEditRefNote(e.target.value)}
                  className="w-full p-3 text-sm bg-cream border border-sandstone rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
              >
                Lưu hồ sơ tác phẩm
              </button>
            </form>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-800">
                  Giới thiệu tác phẩm
                </h3>
                <p className="text-sm sm:text-base text-wood-800 leading-relaxed">
                  {activeWork.introduction}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest-800">
                  Cốt truyện khái quát
                </h3>
                <p className="text-sm sm:text-base text-wood-800 leading-relaxed">
                  {activeWork.plotSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-parchment/65 border border-sandstone space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-wood-900">
                    Đặc điểm nghệ thuật
                  </h3>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-wood-800">
                    {activeWork.artisticFeatures.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-parchment/65 border border-sandstone space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-wood-900">
                    Giá trị văn hóa
                  </h3>
                  <p className="text-sm text-wood-800 leading-relaxed">{activeWork.culturalValue}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-parchment/85 border border-gold-500/40 text-xs sm:text-sm text-wood-800 space-y-1">
                <p className="font-semibold text-gold-600 flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4" />
                  <span>Ghi chú nguồn tư liệu văn bản</span>
                </p>
                <p>{activeWork.referenceNote}</p>
              </div>
            </>
          )}

          {/* Reading Questions & Applied Mission */}
          <div className="pt-4 border-t border-sandstone space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-wood-900">Câu hỏi đọc hiểu</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-wood-800">
                {activeWork.readingQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`vn-mission-${activeWork.id}`}
                className="block text-sm font-bold text-forest-800"
              >
                Nhiệm vụ vận dụng: {activeWork.appliedMission}
              </label>
              <textarea
                id={`vn-mission-${activeWork.id}`}
                rows={3}
                value={studentNotes[activeWork.id] || ''}
                onChange={(e) =>
                  setStudentNotes((prev) => ({
                    ...prev,
                    [activeWork.id]: e.target.value,
                  }))
                }
                placeholder="Ghi dàn ý hoặc câu trả lời của em tại đây..."
                className="w-full p-3.5 text-sm bg-cream border border-sandstone rounded-xl focus:outline-none focus:border-forest-700"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRecordedWorkIds((prev) => ({ ...prev, [activeWork.id]: true }));
                    onRecordWorkStudy?.(
                      'vietnam-epics',
                      activeWork.title,
                      `study_${activeWork.id}`,
                      `Đã đọc hiểu & ghi chú tác phẩm ${activeWork.title}`
                    );
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
                >
                  {recordedWorkIds[activeWork.id]
                    ? `Đã ghi nhận tìm hiểu: ${activeWork.title}`
                    : 'Lưu ghi chú & Xác nhận tìm hiểu tác phẩm'}
                </button>
                <span className="text-[11px] text-wood-600">
                  Mở khóa tiến độ khi tìm hiểu ít nhất 2 tác phẩm Việt Nam
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Hero Comparison Tool */}
      <HeroDialogueComparator defaultHeroA="hero-dam-san" defaultHeroB="hero-xinh-nha" />
    </div>
  );
};
