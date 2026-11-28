import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  Compass,
  Hammer,
  Layers,
  Mic,
  Package,
  Square,
} from 'lucide-react';
import {
  STEM_MISSION_01_HOUSE,
  STEM_MISSION_02_JOURNEY,
} from '../../data/arenaAndStemData';
import { MuseumRouteId, StemStudioTabId } from '../../types/museum';
import { StemRealPhotoGallery } from './StemRealPhotoGallery';
import { StemLonghouseVideoPlayer } from './StemLonghouseVideoPlayer';
import { Lesson52PresentationSlidesSection } from './Lesson52PresentationSlidesSection';

const HOUSE_STEPS_KEY = 'suthiso_stem_house_steps_v1';
const JOURNEY_STEPS_KEY = 'suthiso_stem_journey_steps_v1';

function loadCheckedSteps(storageKey: string): number[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function saveCheckedSteps(storageKey: string, steps: number[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(steps));
  } catch {
    // Ignore storage unavailability
  }
}

interface StemHouseMissionPanelProps {
  onNavigate: (route: MuseumRouteId) => void;
  onSwitchTab: (tab: StemStudioTabId) => void;
}

export const StemHouseMissionPanel: React.FC<StemHouseMissionPanelProps> = ({
  onNavigate,
  onSwitchTab,
}) => {
  const [doneSteps, setDoneSteps] = useState<number[]>(() =>
    loadCheckedSteps(HOUSE_STEPS_KEY)
  );

  useEffect(() => {
    saveCheckedSteps(HOUSE_STEPS_KEY, doneSteps);
  }, [doneSteps]);

  const toggleStep = (stepNumber: number) => {
    setDoneSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((n) => n !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const completedCount = doneSteps.length;
  const totalSteps = STEM_MISSION_01_HOUSE.fabricationSteps.length;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-cream border border-sandstone rounded-2xl overflow-hidden">
        <div className="lg:col-span-5 relative min-h-[240px]">
          <img
            src={STEM_MISSION_01_HOUSE.imagePath}
            alt={STEM_MISSION_01_HOUSE.imageAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wood-900/75 via-wood-900/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-cream space-y-1">
            <p className="text-xs font-mono tracking-wider text-gold-300">
              {STEM_MISSION_01_HOUSE.code}
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
              {STEM_MISSION_01_HOUSE.title}
            </h2>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <p className="text-sm text-wood-700 leading-relaxed">
              {STEM_MISSION_01_HOUSE.subtitle}
            </p>
            <div className="p-4 rounded-xl bg-parchment/80 border border-sandstone space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-forest-800">
                Mục tiêu nhiệm vụ
              </p>
              <p className="text-sm text-wood-900 leading-relaxed">
                {STEM_MISSION_01_HOUSE.objective}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('museum-3d')}
              className="px-4 py-2 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Quan sát Bảo tàng 3D Nhà dài Ê-đê</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('gallery')}
              className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
            >
              Nộp ảnh lên Bảo tàng Padlet
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('qr')}
              className="px-4 py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 transition-colors cursor-pointer"
            >
              Lấy mã QR gắn mô hình
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-6 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-wood-900">
            <BookOpen className="w-5 h-5 text-jade-700" />
            <h3 className="font-serif text-xl font-bold">
              Kiến thức văn hóa cần tìm hiểu
            </h3>
          </div>
          <ul className="space-y-3">
            {STEM_MISSION_01_HOUSE.culturalKnowledge.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-parchment/60 border border-sandstone/70 text-sm text-wood-800 leading-relaxed"
              >
                <span className="font-mono text-xs font-bold text-forest-800 tabular-nums shrink-0 mt-0.5">
                  0{idx + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-6 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-wood-900">
            <Package className="w-5 h-5 text-gold-600" />
            <h3 className="font-serif text-xl font-bold">Vật liệu gợi ý</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STEM_MISSION_01_HOUSE.suggestedMaterials.map((mat) => (
              <div
                key={mat.name}
                className="p-3.5 rounded-xl bg-parchment/60 border border-sandstone/70 space-y-1"
              >
                <p className="text-sm font-bold text-wood-900">{mat.name}</p>
                <p className="text-xs text-wood-700 leading-relaxed">{mat.usageNote}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-wood-900">
          <Compass className="w-5 h-5 text-forest-700" />
          <h3 className="font-serif text-xl font-bold">Quy trình thiết kế</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEM_MISSION_01_HOUSE.designProcess.map((phase) => (
            <div
              key={phase.phase}
              className="p-4 rounded-xl bg-parchment/70 border border-sandstone space-y-1.5"
            >
              <p className="text-xs font-bold text-forest-800 font-mono">
                {phase.phase}
              </p>
              <p className="text-xs text-wood-800 leading-relaxed">{phase.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-wood-900">
            <Hammer className="w-5 h-5 text-terracotta-700" />
            <h3 className="font-serif text-xl font-bold">Các bước chế tạo</h3>
          </div>
          <span className="text-xs font-mono tabular-nums font-semibold text-forest-800 bg-parchment border border-sandstone px-3 py-1 rounded-md">
            Tiến độ nhóm: {completedCount}/{totalSteps} bước
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {STEM_MISSION_01_HOUSE.fabricationSteps.map((step) => {
            const checked = doneSteps.includes(step.stepNumber);
            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => toggleStep(step.stepNumber)}
                className={`text-left p-4 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${
                  checked
                    ? 'bg-forest-50/70 border-forest-600/50'
                    : 'bg-parchment/50 border-sandstone hover:border-gold-500'
                }`}
              >
                <span className="mt-0.5 shrink-0 text-forest-700">
                  {checked ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5 text-wood-500" />
                  )}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-wood-900">
                    Bước {step.stepNumber}: {step.title}
                  </p>
                  <p className="text-xs text-wood-700 leading-relaxed">{step.detail}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Video & Hình ảnh thực tế học sinh lắp mô hình nhà dài Ê-đê (Sản phẩm STEM) */}
        <div className="mt-8 pt-6 border-t border-sandstone space-y-6">
          <StemLonghouseVideoPlayer />
          <StemRealPhotoGallery />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-6 bg-cream border border-sandstone rounded-2xl p-6 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-wood-900">
              <Layers className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif text-xl font-bold">Tiêu chí đánh giá</h3>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('rubric')}
              className="text-xs font-semibold text-forest-800 hover:underline cursor-pointer"
            >
              Xem Rubric 4 mức →
            </button>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-sm text-wood-800 leading-relaxed">
            {STEM_MISSION_01_HOUSE.evaluationCriteria.map((criterion, idx) => (
              <li key={idx}>{criterion}</li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-6 bg-cream border border-sandstone rounded-2xl p-6 space-y-3.5">
          <div className="flex items-center gap-2 text-wood-900">
            <Mic className="w-5 h-5 text-forest-700" />
            <h3 className="font-serif text-xl font-bold">Yêu cầu thuyết minh</h3>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-sm text-wood-800 leading-relaxed">
            {STEM_MISSION_01_HOUSE.presentationRequirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

interface StemJourneyMissionPanelProps {
  onNavigate: (route: MuseumRouteId) => void;
  onSwitchTab: (tab: StemStudioTabId) => void;
}

export const StemJourneyMissionPanel: React.FC<StemJourneyMissionPanelProps> = ({
  onNavigate,
  onSwitchTab,
}) => {
  const [doneSteps, setDoneSteps] = useState<number[]>(() =>
    loadCheckedSteps(JOURNEY_STEPS_KEY)
  );

  useEffect(() => {
    saveCheckedSteps(JOURNEY_STEPS_KEY, doneSteps);
  }, [doneSteps]);

  const toggleStep = (stepNumber: number) => {
    setDoneSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((n) => n !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-cream border border-sandstone rounded-2xl overflow-hidden">
        <div className="lg:col-span-5 relative min-h-[240px]">
          <img
            src={STEM_MISSION_02_JOURNEY.imagePath}
            alt={STEM_MISSION_02_JOURNEY.imageAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wood-900/75 via-wood-900/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-cream space-y-1">
            <p className="text-xs font-mono tracking-wider text-gold-300">
              {STEM_MISSION_02_JOURNEY.code}
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
              {STEM_MISSION_02_JOURNEY.title}
            </h2>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <p className="text-sm text-wood-700 leading-relaxed">
              {STEM_MISSION_02_JOURNEY.subtitle}
            </p>
            <div className="p-4 rounded-xl bg-parchment/80 border border-sandstone space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-forest-800">
                Mục tiêu nhiệm vụ
              </p>
              <p className="text-sm text-wood-900 leading-relaxed">
                {STEM_MISSION_02_JOURNEY.objective}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('dam-san-journey')}
              className="px-4 py-2 text-xs font-semibold bg-wood-900 text-cream rounded-lg hover:bg-wood-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ôn 4 trạm tại Theo dấu Đăm Săn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('gallery')}
              className="px-4 py-2 text-xs font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors cursor-pointer"
            >
              Nộp bản đồ lên Padlet
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('qr')}
              className="px-4 py-2 text-xs font-semibold bg-parchment text-wood-900 border border-sandstone rounded-lg hover:border-gold-500 transition-colors cursor-pointer"
            >
              Tạo mã QR gắn bản đồ
            </button>
          </div>
        </div>
      </section>

      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-wood-900">
          <Compass className="w-5 h-5 text-gold-600" />
          <h3 className="font-serif text-xl font-bold">
            6 Yêu cầu bắt buộc trên bản đồ hành trình của Đăm Săn
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEM_MISSION_02_JOURNEY.requiredComponents.map((comp) => (
            <article
              key={comp.title}
              className="p-4 rounded-xl bg-parchment/60 border border-sandstone space-y-1.5"
            >
              <h4 className="text-sm font-bold text-wood-900">{comp.title}</h4>
              <p className="text-xs text-wood-700 leading-relaxed">{comp.requirement}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-wood-900">
          <Package className="w-5 h-5 text-forest-700" />
          <h3 className="font-serif text-xl font-bold">
            Khuyến khích sáng tạo chất liệu (vật lí &amp; sản phẩm số)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEM_MISSION_02_JOURNEY.creativeFormats.map((fmt) => (
            <div
              key={fmt.format}
              className="p-4 rounded-xl bg-parchment/70 border border-sandstone space-y-1.5"
            >
              <p className="text-sm font-bold text-forest-900">{fmt.format}</p>
              <p className="text-xs text-wood-700 leading-relaxed">{fmt.examples}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-cream border border-sandstone rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-serif text-xl font-bold text-wood-900">
              Quy trình thực hiện bản đồ hành trình
            </h3>
            <span className="text-xs font-mono tabular-nums font-semibold text-forest-800 bg-parchment border border-sandstone px-2.5 py-1 rounded">
              {doneSteps.length}/{STEM_MISSION_02_JOURNEY.implementationSteps.length} bước
            </span>
          </div>
          <div className="space-y-3">
            {STEM_MISSION_02_JOURNEY.implementationSteps.map((step) => {
              const checked = doneSteps.includes(step.stepNumber);
              return (
                <button
                  key={step.stepNumber}
                  type="button"
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${
                    checked
                      ? 'bg-forest-50/70 border-forest-600/50'
                      : 'bg-parchment/50 border-sandstone hover:border-gold-500'
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-forest-700">
                    {checked ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-wood-500" />
                    )}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-wood-900">
                      Bước {step.stepNumber}: {step.title}
                    </p>
                    <p className="text-xs text-wood-700 leading-relaxed">{step.detail}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-5 bg-cream border border-sandstone rounded-2xl p-6 space-y-3.5">
          <div className="flex items-center gap-2 text-wood-900">
            <Mic className="w-5 h-5 text-terracotta-700" />
            <h3 className="font-serif text-xl font-bold">Yêu cầu thuyết minh</h3>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-sm text-wood-800 leading-relaxed">
            {STEM_MISSION_02_JOURNEY.presentationRequirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSwitchTab('rubric')}
              className="text-xs font-semibold text-forest-800 hover:underline cursor-pointer"
            >
              Đối chiếu với bảng Rubric 4 mức đánh giá →
            </button>
          </div>
        </section>
      </div>

      {/* Sản phẩm trình chiếu 4 Tổ chuẩn bị cho Tiết 52 - Đăm Săn đi bắt Nữ thần Mặt Trời */}
      <div className="pt-4 border-t border-sandstone">
        <Lesson52PresentationSlidesSection />
      </div>
    </div>
  );
};
