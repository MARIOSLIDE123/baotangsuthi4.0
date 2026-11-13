import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  DEFAULT_CONFIG_STATUS,
  fetchServiceStatus,
} from './services/configService';
import { auth } from './services/firebaseClient';
import {
  fetchGlobalTeacherSettings,
  hydratePassportFromCloud,
  loadDemoPassport,
  markZoneVisitedDemo,
  recordModuleAction,
  recordQuizAttempt,
  resetDemoPassport,
  saveDemoPassport,
} from './services/firebaseService';
import { ambientAudio } from './services/ambientAudioService';
import {
  ArenaAttemptRecord,
  AvatarPresetId,
  CompassEvaluationResult,
  EpicConceptCard,
  ExplorerPassportState,
  Museum3DHotspot,
  MuseumRouteId,
  ServiceConnectionStatus,
  StemStudioTabId,
} from './types/museum';
import { MuseumIntroScreen } from './components/intro/MuseumIntroScreen';
import { MuseumHeader } from './components/common/MuseumHeader';
import { MuseumZoneDirectory } from './components/common/MuseumZoneDirectory';
import { GuideCharacterWidget } from './components/common/GuideCharacterWidget';
import { HomePage } from './pages/HomePage';
import { EpicGatePage } from './pages/EpicGatePage';
import { VietnamEpicsPage } from './pages/VietnamEpicsPage';
import { WorldEpicsPage } from './pages/WorldEpicsPage';
import { Museum3DPage } from './pages/Museum3DPage';
import { DamSanJourneyPage } from './pages/DamSanJourneyPage';
import { HeroArenaPage } from './pages/HeroArenaPage';
import { StemStudioPage } from './pages/StemStudioPage';
import { PassportPage } from './pages/PassportPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { TeacherAdminPage } from './pages/TeacherAdminPage';

const REDUCED_MOTION_KEY = 'suthiso_reduced_motion';

const VALID_ROUTES: MuseumRouteId[] = [
  'home',
  'epic-gate',
  'vietnam-epics',
  'world-epics',
  'museum-3d',
  'dam-san-journey',
  'hero-arena',
  'stem-studio',
  'passport',
  'ai-assistant',
  'teacher-admin',
];

const VALID_STEM_TABS: StemStudioTabId[] = [
  'house',
  'journey',
  'rubric',
  'gallery',
  'qr',
];

function getInitialDeepLink(): {
  hasZoneParam: boolean;
  route: MuseumRouteId;
  stemTab: StemStudioTabId;
} {
  if (typeof window === 'undefined') {
    return { hasZoneParam: false, route: 'home', stemTab: 'house' };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const zoneRaw = params.get('zone') as MuseumRouteId | null;
    const stemRaw = (params.get('stemTab') || params.get('stem')) as StemStudioTabId | null;
    const validRoute = zoneRaw && VALID_ROUTES.includes(zoneRaw) ? zoneRaw : 'home';
    const validStem = stemRaw && VALID_STEM_TABS.includes(stemRaw) ? stemRaw : 'house';
    return {
      hasZoneParam: Boolean(zoneRaw && VALID_ROUTES.includes(zoneRaw)),
      route: validRoute,
      stemTab: validStem,
    };
  } catch {
    return { hasZoneParam: false, route: 'home', stemTab: 'house' };
  }
}

function syncUrlQuery(route: MuseumRouteId, stemTab?: StemStudioTabId): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (route === 'home') {
      url.searchParams.delete('zone');
      url.searchParams.delete('stemTab');
      url.searchParams.delete('stem');
    } else {
      url.searchParams.set('zone', route);
      if (route === 'stem-studio' && stemTab) {
        url.searchParams.set('stemTab', stemTab);
      } else {
        url.searchParams.delete('stemTab');
        url.searchParams.delete('stem');
      }
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore history API restrictions
  }
}

export default function App() {
  const initialLink = getInitialDeepLink();
  const [showIntro, setShowIntro] = useState(!initialLink.hasZoneParam);
  const [activeRoute, setActiveRoute] = useState<MuseumRouteId>(initialLink.route);
  const [stemTab, setStemTab] = useState<StemStudioTabId>(initialLink.stemTab);
  const [passport, setPassport] = useState<ExplorerPassportState>(() =>
    loadDemoPassport()
  );
  const passportRef = useRef<ExplorerPassportState>(passport);
  useEffect(() => {
    passportRef.current = passport;
  }, [passport]);

  const [serviceStatus, setServiceStatus] = useState<ServiceConnectionStatus>(
    DEFAULT_CONFIG_STATUS
  );
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(REDUCED_MOTION_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      // Ignore storage access errors
    }
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  });

  const refreshStatus = useCallback(async () => {
    const status = await fetchServiceStatus();
    if (auth.currentUser) {
      const cloudSettings = await fetchGlobalTeacherSettings();
      if (cloudSettings) {
        const houseUrl =
          status.padlet.houseEmbedUrl || cloudSettings.houseEmbedUrl || null;
        const journeyUrl =
          status.padlet.journeyEmbedUrl || cloudSettings.journeyEmbedUrl || null;
        status.padlet = {
          configured: Boolean(houseUrl || journeyUrl),
          url: houseUrl || journeyUrl,
          houseEmbedUrl: houseUrl,
          journeyEmbedUrl: journeyUrl,
        };
      }
    }
    setServiceStatus(status);
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Listen for Firebase Authentication changes & hydrate cloud Passport + Padlet settings
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const hydrated = await hydratePassportFromCloud(fbUser, passportRef.current);
          passportRef.current = hydrated;
          setPassport(hydrated);
          await refreshStatus();
        } catch (err) {
          console.error('Lỗi đồng bộ hồ sơ Firebase:', err);
        }
      } else {
        setPassport((prev) => {
          if (!prev.uid) return prev;
          const signedOut = saveDemoPassport({
            ...prev,
            uid: null,
            role: 'student',
            classId: '',
            joinCode: '',
            teacherUid: '',
          });
          passportRef.current = signedOut;
          return signedOut;
        });
      }
    });
    return () => unsub();
  }, [refreshStatus]);

  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  const handleToggleAudio = useCallback(() => {
    const next = ambientAudio.toggle();
    setAudioEnabled(next);
  }, []);

  const handleToggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(REDUCED_MOTION_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const handleEnterMuseum = useCallback(() => {
    setShowIntro(false);
    setActiveRoute('home');
    syncUrlQuery('home');
  }, []);

  const handleNavigate = useCallback(
    (route: MuseumRouteId) => {
      setActiveRoute(route);
      // Opening a zone ONLY marks 'in_progress' if 'not_started' — never marks 'completed'
      setPassport((prev) => {
        const next = markZoneVisitedDemo(prev, route);
        passportRef.current = next;
        return next;
      });
      syncUrlQuery(route, route === 'stem-studio' ? stemTab : undefined);
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [reducedMotion, stemTab]
  );

  const handleChangeStemTab = useCallback(
    (tab: StemStudioTabId) => {
      setStemTab(tab);
      syncUrlQuery('stem-studio', tab);
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [reducedMotion]
  );

  const handleRecordConceptCheck = useCallback(
    async (card: EpicConceptCard, isCorrect: boolean) => {
      try {
        let next = await recordQuizAttempt(passportRef.current, {
          moduleId: 'epic-gate',
          activityType: 'concept_check',
          activityTitle: `Cánh cửa sử thi · ${card.title}`,
          workTitle: card.title,
          difficultTopic: isCorrect ? '' : `Khái niệm: ${card.title}`,
          score: isCorrect ? 10 : 0,
          maxScore: 10,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
        });
        if (isCorrect) {
          next = await recordModuleAction(next, {
            moduleId: 'epic-gate',
            actionKey: `concept_${card.id}`,
            activityLabel: `Hoàn thành tự kiểm tra: ${card.title}`,
            scoreDelta: 10,
          });
        }
        passportRef.current = next;
        setPassport(next);
      } catch {
        // Handled safely in service
      }
    },
    []
  );

  const handleRecordWorkStudy = useCallback(
    async (
      moduleId: 'vietnam-epics' | 'world-epics',
      workTitle: string,
      actionKey: string,
      label: string
    ) => {
      try {
        const next = await recordModuleAction(passportRef.current, {
          moduleId,
          actionKey,
          activityLabel: label,
          workTitle,
          scoreDelta: 15,
        });
        passportRef.current = next;
        setPassport(next);
      } catch {
        // Handled safely
      }
    },
    []
  );

  const handleComplete3DHotspot = useCallback(async (hotspotId: string, points: number) => {
    let base = passportRef.current;
    if (!base.completed3DHotspots.includes(hotspotId)) {
      base = saveDemoPassport({
        ...base,
        completed3DHotspots: [...base.completed3DHotspots, hotspotId],
        museum3DScore: base.museum3DScore + points,
      });
      passportRef.current = base;
      setPassport(base);
    }
    try {
      const next = await recordModuleAction(base, {
        moduleId: 'museum-3d',
        actionKey: `hotspot_${hotspotId}`,
        activityLabel: `Khám phá điểm chạm 3D: ${hotspotId}`,
        workTitle: 'Không gian Nhà dài Ê-đê',
        scoreDelta: points,
      });
      passportRef.current = next;
      setPassport(next);
    } catch {
      // Handled safely
    }
  }, []);

  const handleHotspotAttempt = useCallback(
    async (hotspot: Museum3DHotspot, isCorrect: boolean) => {
      try {
        const next = await recordQuizAttempt(passportRef.current, {
          moduleId: 'museum-3d',
          activityType: 'museum_3d',
          activityTitle: `Bảo tàng 3D · ${hotspot.title}`,
          workTitle: 'Nhà dài Ê-đê',
          difficultTopic: isCorrect ? '' : `Không gian 3D: ${hotspot.title}`,
          score: isCorrect ? hotspot.points : 0,
          maxScore: hotspot.points,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
        });
        passportRef.current = next;
        setPassport(next);
      } catch {
        // Handled safely
      }
    },
    []
  );

  const handleCompleteMilestone = useCallback(async (milestoneId: string) => {
    let base = passportRef.current;
    if (!base.completedMilestones.includes(milestoneId)) {
      base = saveDemoPassport({
        ...base,
        completedMilestones: [...base.completedMilestones, milestoneId],
      });
      passportRef.current = base;
      setPassport(base);
    }
    try {
      const next = await recordModuleAction(base, {
        moduleId: 'dam-san-journey',
        actionKey: `station_${milestoneId}`,
        activityLabel: `Hoàn thành trạm ${milestoneId} Hành trình Đăm Săn`,
        workTitle: 'Đăm Săn đi bắt Nữ thần Mặt Trời',
        scoreDelta: 25,
      });
      passportRef.current = next;
      setPassport(next);
    } catch {
      // Handled safely
    }
  }, []);

  const handleRecordLayerAttempt = useCallback(
    async (stationTitle: string, layerLabel: string, isCorrect: boolean) => {
      try {
        const next = await recordQuizAttempt(passportRef.current, {
          moduleId: 'dam-san-journey',
          activityType: 'reading_comprehension',
          activityTitle: `${stationTitle} · ${layerLabel}`,
          workTitle: 'Đăm Săn đi bắt Nữ thần Mặt Trời',
          difficultTopic: isCorrect ? '' : `${stationTitle} (${layerLabel})`,
          score: isCorrect ? 10 : 0,
          maxScore: 10,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
        });
        passportRef.current = next;
        setPassport(next);
      } catch {
        // Handled safely
      }
    },
    []
  );

  const handleCompassEvaluated = useCallback(
    async (_claimStatement: string, stationTitle: string, result: CompassEvaluationResult) => {
      try {
        const passed = result.totalScore >= Math.ceil(result.maxTotalScore * 0.6);
        let next = await recordQuizAttempt(passportRef.current, {
          moduleId: 'dam-san-journey',
          activityType: 'compass_analysis',
          activityTitle: `Chiếc la bàn sử thi · ${stationTitle}`,
          workTitle: 'Sử thi Đăm Săn',
          difficultTopic: passed ? '' : `Dẫn chứng & Lập luận (${stationTitle})`,
          score: result.totalScore,
          maxScore: result.maxTotalScore,
          correctCount: passed ? 1 : 0,
          wrongCount: passed ? 0 : 1,
        });
        next = await recordModuleAction(next, {
          moduleId: 'dam-san-journey',
          actionKey: `compass_${stationTitle.replace(/\s+/g, '_').slice(0, 20)}`,
          activityLabel: `Phân tích dẫn chứng: ${stationTitle}`,
          workTitle: 'Đăm Săn đi bắt Nữ thần Mặt Trời',
          scoreDelta: Math.min(20, result.totalScore),
        });
        passportRef.current = next;
        setPassport(next);
      } catch {
        // Handled safely
      }
    },
    []
  );

  const handleFinishArena = useCallback(
    async (score: number, record?: ArenaAttemptRecord) => {
      let base = saveDemoPassport({
        ...passportRef.current,
        arenaBestScore: Math.max(passportRef.current.arenaBestScore, score),
        arenaAttempts: passportRef.current.arenaAttempts + 1,
      });
      passportRef.current = base;
      setPassport(base);

      try {
        const maxPossible = Math.max(score, (record?.totalItems || 5) * 20, 20);
        let next = await recordQuizAttempt(base, {
          moduleId: 'hero-arena',
          activityType: 'arena_game',
          activityTitle: record?.gameTitle || 'Đấu trường Anh hùng ca',
          workTitle: 'Tổng hợp Sử thi lớp 10',
          difficultTopic:
            record && record.wrongCount > 0 ? record.gameTitle : '',
          score,
          maxScore: maxPossible,
          correctCount: record?.correctCount || 0,
          wrongCount: record?.wrongCount || 0,
        });
        next = await recordModuleAction(next, {
          moduleId: 'hero-arena',
          actionKey: `arena_${record?.gameId || 'session'}`,
          activityLabel: `Hoàn thành trò chơi: ${record?.gameTitle || 'Đấu trường'}`,
          scoreDelta: Math.min(35, Math.max(10, Math.round(score / 4))),
        });
        passportRef.current = next;
        setPassport(next);
      } catch {
        // Handled safely
      }
    },
    []
  );

  const handleRecordStemAction = useCallback(
    async (actionKey: string, label: string) => {
      try {
        const next = await recordModuleAction(passportRef.current, {
          moduleId: 'stem-studio',
          actionKey,
          activityLabel: label,
          scoreDelta: 20,
        });
        passportRef.current = next;
        setPassport(next);
      } catch {
        // Handled safely
      }
    },
    []
  );

  const handleUpdateDemoProfile = useCallback(
    (profile: {
      studentName: string;
      school: string;
      className: string;
      joinCode: string;
      avatarPreset: AvatarPresetId;
    }) => {
      setPassport((prev) => {
        const next = saveDemoPassport({
          ...prev,
          ...profile,
        });
        passportRef.current = next;
        return next;
      });
    },
    []
  );

  const handleSyncPassport = useCallback((next: ExplorerPassportState) => {
    const saved = saveDemoPassport(next);
    passportRef.current = saved;
    setPassport(saved);
  }, []);

  const handleResetDemo = useCallback(() => {
    const reset = resetDemoPassport();
    passportRef.current = reset;
    setPassport(reset);
  }, []);

  const renderActivePage = () => {
    switch (activeRoute) {
      case 'home':
        return (
          <HomePage
            passport={passport}
            serviceStatus={serviceStatus}
            audioEnabled={audioEnabled}
            reducedMotion={reducedMotion}
            onToggleAudio={handleToggleAudio}
            onToggleReducedMotion={handleToggleReducedMotion}
            onReplayIntro={() => setShowIntro(true)}
            onNavigate={handleNavigate}
          />
        );
      case 'epic-gate':
        return (
          <EpicGatePage
            onNavigate={handleNavigate}
            onRecordConceptCheck={handleRecordConceptCheck}
          />
        );
      case 'vietnam-epics':
        return (
          <VietnamEpicsPage
            onNavigate={handleNavigate}
            onRecordWorkStudy={handleRecordWorkStudy}
          />
        );
      case 'world-epics':
        return <WorldEpicsPage onRecordWorkStudy={handleRecordWorkStudy} />;
      case 'museum-3d':
        return (
          <Museum3DPage
            completedHotspots={passport.completed3DHotspots}
            museum3DScore={passport.museum3DScore}
            onCompleteHotspot={handleComplete3DHotspot}
            onHotspotAttempt={handleHotspotAttempt}
            onNavigate={handleNavigate}
          />
        );
      case 'dam-san-journey':
        return (
          <DamSanJourneyPage
            completedMilestones={passport.completedMilestones}
            onCompleteMilestone={handleCompleteMilestone}
            onRecordLayerAttempt={handleRecordLayerAttempt}
            onCompassEvaluated={handleCompassEvaluated}
            reducedMotion={reducedMotion}
          />
        );
      case 'hero-arena':
        return (
          <HeroArenaPage
            bestScore={passport.arenaBestScore}
            studentName={passport.studentName}
            className={passport.className}
            onFinishAttempt={handleFinishArena}
          />
        );
      case 'stem-studio':
        return (
          <StemStudioPage
            serviceStatus={serviceStatus}
            activeTab={stemTab}
            studentName={passport.studentName}
            className={passport.className}
            completedStemActions={
              passport.moduleProgress?.['stem-studio']?.actionsCompleted || []
            }
            onRecordStemAction={handleRecordStemAction}
            onChangeTab={handleChangeStemTab}
            onNavigate={handleNavigate}
          />
        );
      case 'passport':
        return (
          <PassportPage
            passport={passport}
            serviceStatus={serviceStatus}
            onUpdateDemoProfile={handleUpdateDemoProfile}
            onSyncPassport={handleSyncPassport}
            onResetDemo={handleResetDemo}
            onNavigate={handleNavigate}
          />
        );
      case 'ai-assistant':
        return <AiAssistantPage serviceStatus={serviceStatus} passport={passport} />;
      case 'teacher-admin':
        return (
          <TeacherAdminPage
            passport={passport}
            serviceStatus={serviceStatus}
            onRefreshStatus={refreshStatus}
          />
        );
      default:
        return (
          <HomePage
            passport={passport}
            serviceStatus={serviceStatus}
            audioEnabled={audioEnabled}
            reducedMotion={reducedMotion}
            onToggleAudio={handleToggleAudio}
            onToggleReducedMotion={handleToggleReducedMotion}
            onReplayIntro={() => setShowIntro(true)}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-cream text-wood-900 ${reducedMotion ? 'reduced-motion' : ''}`}
    >
      <AnimatePresence>
        {showIntro && (
          <MuseumIntroScreen
            audioEnabled={audioEnabled}
            reducedMotion={reducedMotion}
            onToggleAudio={handleToggleAudio}
            onToggleReducedMotion={handleToggleReducedMotion}
            onEnterMuseum={handleEnterMuseum}
          />
        )}
      </AnimatePresence>

      <div className="tay-nguyen-fret" aria-hidden="true" />

      <MuseumHeader
        activeRoute={activeRoute}
        studentName={passport.studentName}
        onNavigate={handleNavigate}
      />

      <MuseumZoneDirectory
        activeRoute={activeRoute}
        visitedZones={passport.visitedZones}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6">
        <motion.div
          key={activeRoute}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {renderActivePage()}
        </motion.div>
      </main>

      {!showIntro && (
        <GuideCharacterWidget
          activeRoute={activeRoute}
          onOpenAiAssistant={() => handleNavigate('ai-assistant')}
        />
      )}

      <footer className="border-t border-sandstone bg-parchment/50 py-6 mt-auto">
        <div className="max-w-[1760px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-wood-600">
          <p className="font-medium text-wood-800">
            Sử Thi Số 4.0 – Bảo Tàng Sử Thi Xuyên Không · Ngữ văn lớp 10
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="hover:text-wood-900 cursor-pointer"
            >
              Màn hình mở đầu
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('epic-gate')}
              className="hover:text-wood-900 cursor-pointer"
            >
              Cánh cửa sử thi
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('museum-3d')}
              className="hover:text-wood-900 cursor-pointer"
            >
              Bảo tàng 3D
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('teacher-admin')}
              className="hover:text-wood-900 cursor-pointer"
            >
              Quản trị giáo viên
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
