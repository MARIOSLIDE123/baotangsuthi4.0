import React, { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Edit3 } from 'lucide-react';
import {
  getMergedConceptCards,
  saveConceptOverride,
} from '../services/curriculumStorageService';
import { EpicConceptCard, MuseumRouteId } from '../types/museum';
import { SafeImage } from '../components/common/SafeImage';
import { EpicMindMap } from '../components/epics/EpicMindMap';

interface EpicGatePageProps {
  onNavigate: (route: MuseumRouteId) => void;
  onRecordConceptCheck?: (card: EpicConceptCard, isCorrect: boolean) => void;
}

export const EpicGatePage: React.FC<EpicGatePageProps> = ({
  onNavigate,
  onRecordConceptCheck,
}) => {
  const [cards, setCards] = useState<EpicConceptCard[]>(() => getMergedConceptCards());
  const [selectedId, setSelectedId] = useState<string>(cards[0]?.id || 'concept-definition');
  const [chosenAnswers, setChosenAnswers] = useState<Record<string, number>>({});
  const [submittedIds, setSubmittedIds] = useState<Record<string, boolean>>({});
  const [teacherEditMode, setTeacherEditMode] = useState(false);
  const [editExplanation, setEditExplanation] = useState('');
  const [editExample, setEditExample] = useState('');

  const activeCard = cards.find((c) => c.id === selectedId) || cards[0];

  const handleSelectCard = (card: EpicConceptCard) => {
    setSelectedId(card.id);
    setTeacherEditMode(false);
    setEditExplanation(card.explanation);
    setEditExample(card.example);
  };

  const handleSaveTeacherEdit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConceptOverride(activeCard.id, {
      explanation: editExplanation.trim() || activeCard.explanation,
      example: editExample.trim() || activeCard.example,
    });
    setCards(getMergedConceptCards());
    setTeacherEditMode(false);
  };

  const chosen = chosenAnswers[activeCard.id];
  const isSubmitted = Boolean(submittedIds[activeCard.id]);
  const isCorrect = isSubmitted && chosen === activeCard.correctIndex;

  return (
    <div className="space-y-10 pb-14">
      <header className="border-b border-sandstone pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-medium text-wood-600">
            Khu vực 1 · Cánh cửa sử thi (9 chuyên đề nền tảng Ngữ văn 10)
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
            Cánh cửa sử thi
          </h1>
          <p className="text-sm sm:text-base text-wood-700 leading-relaxed">
            Khám phá 9 thẻ kiến thức cốt lõi về thể loại sử thi kèm nhiệm vụ tự kiểm tra và sơ đồ tư duy tương tác.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('vietnam-epics')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Đại ngàn sử thi Việt Nam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('world-epics')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 transition-colors cursor-pointer"
          >
            Sử thi thế giới
          </button>
        </div>
      </header>

      {/* 9 Exploration Concept Cards Selector + Active Reader */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          {cards.map((card) => {
            const active = card.id === activeCard.id;
            const passed =
              submittedIds[card.id] && chosenAnswers[card.id] === card.correctIndex;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectCard(card)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  active
                    ? 'bg-wood-900 text-cream border-wood-900 shadow-sm'
                    : 'bg-cream text-wood-900 border-sandstone hover:border-gold-500'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      active ? 'text-gold-400' : 'text-wood-500'
                    }`}
                  >
                    {card.index}
                  </span>
                  <span className="font-serif text-lg font-bold text-left break-words">{card.title}</span>
                </div>
                {passed && (
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${active ? 'text-gold-400' : 'text-forest-700'}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <article className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl overflow-hidden">
          <div className="h-56 sm:h-64 overflow-hidden border-b border-sandstone bg-wood-950">
            <SafeImage
              src={activeCard.imagePath}
              alt={activeCard.imageAlt}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-wood-600">
                <BookOpen className="w-4 h-4 text-gold-600" />
                <span>Chuyên đề {activeCard.index} / 09</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditExplanation(activeCard.explanation);
                  setEditExample(activeCard.example);
                  setTeacherEditMode((prev) => !prev);
                }}
                className="text-xs font-semibold text-jade-700 hover:text-forest-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{teacherEditMode ? 'Hủy chỉnh sửa' : 'Giáo viên bổ sung tư liệu'}</span>
              </button>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wood-900">
              {activeCard.title}
            </h2>

            {teacherEditMode ? (
              <form onSubmit={handleSaveTeacherEdit} className="space-y-4 bg-parchment/70 p-4 rounded-xl border border-sandstone">
                <div>
                  <label className="block text-xs font-semibold text-wood-800 mb-1">
                    Giải thích ngắn
                  </label>
                  <textarea
                    rows={3}
                    value={editExplanation}
                    onChange={(e) => setEditExplanation(e.target.value)}
                    className="w-full p-3 text-sm bg-cream border border-sandstone rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-wood-800 mb-1">
                    Ví dụ / Trích dẫn nguồn (theo bộ SGK đang dạy)
                  </label>
                  <textarea
                    rows={2}
                    value={editExample}
                    onChange={(e) => setEditExample(e.target.value)}
                    className="w-full p-3 text-sm bg-cream border border-sandstone rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 cursor-pointer"
                >
                  Lưu cập nhật học liệu
                </button>
              </form>
            ) : (
              <>
                <p className="text-base text-wood-800 leading-relaxed max-w-prose">
                  {activeCard.explanation}
                </p>

                <div className="p-4 rounded-xl bg-parchment/75 border border-sandstone space-y-1.5">
                  <p className="text-xs font-semibold text-gold-600">Ví dụ minh họa &amp; Nguồn</p>
                  <p className="text-sm text-wood-800 leading-relaxed">{activeCard.example}</p>
                </div>
              </>
            )}

            {/* Self-check Task */}
            <div className="pt-4 border-t border-sandstone space-y-3">
              <h3 className="text-sm font-bold text-forest-800">
                Nhiệm vụ tự kiểm tra: {activeCard.selfCheckQuestion}
              </h3>

              <div className="space-y-2">
                {activeCard.selfCheckOptions.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setChosenAnswers((prev) => ({ ...prev, [activeCard.id]: idx }));
                      setSubmittedIds((prev) => ({ ...prev, [activeCard.id]: false }));
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors cursor-pointer ${
                      chosen === idx
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
                disabled={chosen === undefined}
                onClick={() => {
                  setSubmittedIds((prev) => ({ ...prev, [activeCard.id]: true }));
                  if (chosen !== undefined && onRecordConceptCheck) {
                    onRecordConceptCheck(activeCard, chosen === activeCard.correctIndex);
                  }
                }}
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Kiểm tra đáp án
              </button>

              {isSubmitted && (
                <div
                  className={`p-3.5 rounded-xl border text-sm ${
                    isCorrect
                      ? 'bg-forest-800/10 border-forest-700/40 text-forest-800'
                      : 'bg-amber-50 border-amber-300 text-wood-900'
                  }`}
                >
                  {isCorrect
                    ? activeCard.selfCheckFeedback
                    : 'Chưa đúng, bạn hãy đọc lại phần giải thích ngắn ở trên và chọn lại nhé.'}
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* Expandable / Collapsible Mind Map */}
      <EpicMindMap />
    </div>
  );
};
