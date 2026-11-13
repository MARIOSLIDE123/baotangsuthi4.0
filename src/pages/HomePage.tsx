import React from 'react';
import {
  ArrowRight,
  Award,
  Box,
  CheckCircle2,
  Clock,
  Compass,
  Play,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  ZapOff,
} from 'lucide-react';
import { CORE_SEVEN_WINGS } from '../data/navigation';
import { DAM_SAN_MILESTONES } from '../data/damSanJourneyData';
import {
  CoreWingId,
  ExplorerPassportState,
  ModuleProgressStatus,
  MuseumRouteId,
  ServiceConnectionStatus,
} from '../types/museum';
import { SafeImage } from '../components/common/SafeImage';

interface HomePageProps {
  passport: ExplorerPassportState;
  serviceStatus: ServiceConnectionStatus;
  audioEnabled: boolean;
  reducedMotion: boolean;
  onToggleAudio: () => void;
  onToggleReducedMotion: () => void;
  onReplayIntro: () => void;
  onNavigate: (route: MuseumRouteId) => void;
}

const WING_STATUS_META: Record<
  ModuleProgressStatus,
  { label: string; colorClass: string; ctaHint: string }
> = {
  not_started: {
    label: 'Chưa khám phá',
    colorClass: 'text-cream/85',
    ctaHint: 'Chưa bắt đầu · Nhấn để khám phá',
  },
  in_progress: {
    label: 'Đang khám phá',
    colorClass: 'text-gold-300',
    ctaHint: 'Đang thực hiện nhiệm vụ',
  },
  completed: {
    label: 'Đã hoàn thành',
    colorClass: 'text-gold-400',
    ctaHint: 'Đã hoàn thành mục tiêu',
  },
};

export const HomePage: React.FC<HomePageProps> = ({
  passport,
  serviceStatus,
  audioEnabled,
  reducedMotion,
  onToggleAudio,
  onToggleReducedMotion,
  onReplayIntro,
  onNavigate,
}) => {
  const getWingStatus = (wingId: MuseumRouteId): ModuleProgressStatus => {
    const prog = passport.moduleProgress?.[wingId as CoreWingId];
    return prog?.status || 'not_started';
  };

  const completedCoreCount = CORE_SEVEN_WINGS.filter(
    (w) => getWingStatus(w.id) === 'completed'
  ).length;
  const inProgressCoreCount = CORE_SEVEN_WINGS.filter(
    (w) => getWingStatus(w.id) === 'in_progress'
  ).length;
  const progressPercent = Math.round((completedCoreCount / CORE_SEVEN_WINGS.length) * 100);

  // Badges computed honestly from real learner activity & cloud badges
  const hasBadge = (idFragment: string) =>
    (passport.earnedBadges || []).some((b) => b.badgeId.includes(idFragment));

  const badges = [
    {
      id: 'badge-gate',
      title: 'Người mở cổng sử thi',
      earned: getWingStatus('epic-gate') === 'completed' || hasBadge('epic_gate'),
      rule: 'Hoàn thành kiểm tra kiến thức tại Cánh cửa sử thi',
    },
    {
      id: 'badge-3d',
      title: 'Khách viếng Nhà dài 3D',
      earned:
        passport.completed3DHotspots.length >= 3 ||
        getWingStatus('museum-3d') === 'completed',
      rule: `Hoàn thành ít nhất 3 điểm trong Bảo tàng 3D (${passport.completed3DHotspots.length}/8)`,
    },
    {
      id: 'badge-damsan',
      title: 'Bạn đồng hành Đăm Săn',
      earned:
        passport.completedMilestones.length >= DAM_SAN_MILESTONES.length ||
        getWingStatus('dam-san-journey') === 'completed',
      rule: `Hoàn thành ${DAM_SAN_MILESTONES.length} trạm Con đường đến Nữ thần Mặt Trời`,
    },
    {
      id: 'badge-arena',
      title: 'Chiến binh Anh hùng ca',
      earned:
        getWingStatus('hero-arena') === 'completed' || passport.arenaBestScore >= 10,
      rule: `Tham gia Đấu trường Anh hùng ca (${passport.arenaAttempts} lượt · cao nhất ${passport.arenaBestScore}đ)`,
    },
  ];

  // Next recommended mission
  const nextWing =
    CORE_SEVEN_WINGS.find((w) => getWingStatus(w.id) !== 'completed') || CORE_SEVEN_WINGS[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Museum Experience Comfort & Ambience Bar */}
      <section
        aria-label="Điều khiển trải nghiệm không gian bảo tàng"
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-parchment/80 border border-sandstone rounded-xl text-xs"
      >
        <div className="flex flex-wrap items-center gap-2 text-wood-800">
          <Compass className="w-4 h-4 text-forest-700 shrink-0" />
          <span className="font-medium">
            Xin chào, <strong className="text-wood-900">{passport.studentName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-semibold text-forest-800">
            {passport.totalScore} điểm
          </span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onNavigate('passport')}
            className="text-wood-700 hover:text-forest-800 underline underline-offset-2 cursor-pointer"
          >
            {passport.uid
              ? `Đồng bộ đám mây (${passport.className})`
              : serviceStatus.firebase.configured
                ? 'Đăng nhập Hộ chiếu để đồng bộ lớp'
                : 'Chế độ Demo'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleAudio}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              audioEnabled
                ? 'bg-forest-700 text-cream border-forest-700'
                : 'bg-cream text-wood-800 border-sandstone hover:border-gold-500'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Âm thanh nền: Bật' : 'Âm thanh nền: Tắt'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleReducedMotion}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              reducedMotion
                ? 'bg-wood-900 text-gold-400 border-wood-900'
                : 'bg-cream text-wood-800 border-sandstone hover:border-gold-500'
            }`}
          >
            <ZapOff className="w-3.5 h-3.5" />
            <span>{reducedMotion ? 'Giảm chuyển động: Bật' : 'Giảm chuyển động'}</span>
          </button>

          <button
            type="button"
            onClick={onReplayIntro}
            className="px-3 py-1.5 rounded-lg border border-sandstone bg-cream text-wood-800 hover:border-gold-500 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Màn hình mở đầu</span>
          </button>
        </div>
      </section>

      {/* Main Museum Showcase + Guide Character */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-wood-950 text-cream border border-wood-800 min-h-[380px] sm:min-h-[430px] flex items-end shadow-md">
          <SafeImage
            src="/src/assets/images/hero_tay_nguyen_museum_1794539117734.jpg"
            alt="Đại sảnh Bảo tàng Sử thi Xuyên Không với Nhà dài Ê-đê giữa đại ngàn"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wood-950 via-wood-950/60 to-wood-950/15" />

          <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-gold-400">
              Đại sảnh Bảo tàng · Ngữ văn lớp 10
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-cream">
              Bảo Tàng Sử Thi Xuyên Không
            </h1>
            <p className="text-sm sm:text-base text-cream/90 leading-relaxed">
              Hành trình từ đại ngàn Tây Nguyên đến những thiên anh hùng ca của nhân loại. Hãy bước qua 7 phân hệ trưng bày để giải mã văn bản và sáng tạo di sản số.
            </p>
            <div className="pt-1 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('museum-3d')}
                className="px-5 py-2.5 text-sm font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Tham quan Nhà dài 3D</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('epic-gate')}
                className="px-5 py-2.5 text-sm font-semibold bg-wood-900/85 text-cream border border-cream/25 rounded-lg hover:bg-wood-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Bắt đầu từ Cánh cửa sử thi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Guide Character Spotlight Card: SỨ GIẢ ĐẠI NGÀN */}
        <aside className="lg:col-span-4 bg-wood-900 text-cream border border-wood-800 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="relative h-56 sm:h-64 overflow-hidden bg-wood-950">
            <SafeImage
              src="/src/assets/images/su_gia_dai_ngan_1794539491712.jpg"
              alt="Sứ Giả Đại Ngàn – Người kể chuyện sử thi đồng hành"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-wood-900 to-transparent" />
          </div>

          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest uppercase text-gold-400">
                Nhân vật đồng hành
              </p>
              <h2 className="font-serif text-2xl font-bold text-cream">SỨ GIẢ ĐẠI NGÀN</h2>
              <p className="text-sm text-cream/85 leading-relaxed">
                “Mỗi gian phòng là một mảnh ghép ký ức của người xưa. Bạn có thể bắt đầu bằng Cánh cửa sử thi hoặc trò chuyện trực tiếp cùng mình bất cứ lúc nào!”
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('ai-assistant')}
              className="w-full px-4 py-2.5 text-sm font-semibold bg-forest-700 text-cream rounded-lg hover:bg-forest-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Hỏi đáp cùng Sứ Giả AI</span>
            </button>
          </div>
        </aside>
      </section>

      {/* Center: 7 Visual Museum Exploration Wings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-sandstone pb-4">
          <div>
            <p className="text-xs font-medium text-wood-600">Trung tâm bảo tàng</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-wood-900">
              Bảy phân hệ khám phá sử thi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-wood-700 font-mono tabular-nums">
            Hoàn thành: {completedCoreCount}/{CORE_SEVEN_WINGS.length} · Đang khám phá:{' '}
            {inProgressCoreCount}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CORE_SEVEN_WINGS.map((wing, index) => {
            const status = getWingStatus(wing.id);
            const meta = WING_STATUS_META[status];
            const modProg = passport.moduleProgress?.[wing.id as CoreWingId];
            const isHeroSpan = index === 3;
            return (
              <article
                key={wing.id}
                className={`museum-wing-card bg-cream border border-sandstone hover:border-gold-500 rounded-2xl overflow-hidden flex flex-col justify-between ${
                  isHeroSpan ? 'md:col-span-2 xl:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="relative h-52 sm:h-56 overflow-hidden bg-wood-950 border-b border-sandstone">
                    <SafeImage
                      src={wing.imagePath}
                      alt={wing.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wood-950/65 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-cream">
                      <span className="font-mono tabular-nums font-semibold tracking-wider">
                        PHÂN HỆ {wing.orderNumber}
                      </span>
                      <span className={`font-medium flex items-center gap-1 ${meta.colorClass}`}>
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
                        ) : status === 'in_progress' ? (
                          <Clock className="w-3.5 h-3.5 text-gold-300" />
                        ) : null}
                        <span>{meta.label}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2.5">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-wood-900">
                      {wing.title}
                    </h3>
                    <p className="text-sm text-wood-700 leading-relaxed">
                      {wing.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-sandstone/60 gap-2">
                  <span className="text-xs text-wood-600 font-mono tabular-nums">
                    {modProg
                      ? `${modProg.actionsCompleted.length}/${modProg.requiredActionsCount} bước · ${modProg.scoreEarned}đ`
                      : meta.ctaHint}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(wing.id)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold bg-wood-900 text-cream rounded-lg hover:bg-forest-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>{wing.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom: Exploration Progress, Badges & Next Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-parchment/75 border border-sandstone rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-wood-900">
                Tiến độ khám phá &amp; Huy hiệu sử thi
              </h2>
              <p className="text-sm text-wood-700 mt-0.5">
                Phân hệ chỉ tính Đã hoàn thành khi em hoàn tất nhiệm vụ thực tế bên trong.
              </p>
            </div>
            <span className="font-mono tabular-nums text-lg font-bold text-forest-800">
              {progressPercent}%
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-sandstone overflow-hidden">
            <div
              className="h-full bg-forest-700 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  badge.earned
                    ? 'bg-cream border-gold-500/70 text-wood-900'
                    : 'bg-cream/55 border-sandstone text-wood-600'
                }`}
              >
                <Award
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    badge.earned ? 'text-gold-600' : 'text-wood-400'
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold">
                    {badge.title}{' '}
                    <span className="text-xs font-normal">
                      · {badge.earned ? 'Đã đạt' : 'Chưa đạt'}
                    </span>
                  </p>
                  <p className="text-xs mt-0.5 opacity-85">{badge.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Mission Card */}
        <aside className="lg:col-span-4 bg-wood-900 text-cream border border-wood-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
              <Shield className="w-4 h-4" />
              <span>Nhiệm vụ tiếp theo</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-cream">{nextWing.title}</h3>
            <p className="text-sm text-cream/80 leading-relaxed">{nextWing.shortDescription}</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onNavigate(nextWing.id)}
              className="w-full px-5 py-3 text-sm font-semibold bg-gold-500 text-wood-950 rounded-lg hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Thực hiện nhiệm vụ ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-wood-800 text-xs text-cream/75">
              <button
                type="button"
                onClick={() => onNavigate('passport')}
                className="hover:text-gold-400 underline underline-offset-4 cursor-pointer"
              >
                Xem Hộ chiếu đầy đủ
              </button>
              <button
                type="button"
                onClick={() => onNavigate('teacher-admin')}
                className="hover:text-gold-400 underline underline-offset-4 cursor-pointer"
              >
                Góc giáo viên
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};
