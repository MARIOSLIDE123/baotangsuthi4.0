import { User, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  AssignmentRecord,
  AssignmentSubmissionRecord,
  AvatarPresetId,
  BadgeRecord,
  ClassroomRecord,
  CoreWingId,
  ExplorerPassportState,
  ModuleProgressRecord,
  ModuleProgressStatus,
  MuseumRouteId,
  QuizAttemptRecord,
  UserProfileRecord,
  UserRole,
} from '../types/museum';
import {
  auth,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebaseClient';

const PASSPORT_STORAGE_KEY = 'suthiso_demo_passport_v3';

export const CORE_WING_IDS: CoreWingId[] = [
  'epic-gate',
  'vietnam-epics',
  'world-epics',
  'museum-3d',
  'dam-san-journey',
  'hero-arena',
  'stem-studio',
];

export const MODULE_REQUIRED_ACTIONS: Record<CoreWingId, number> = {
  'epic-gate': 4,
  'vietnam-epics': 2,
  'world-epics': 2,
  'museum-3d': 3,
  'dam-san-journey': 4,
  'hero-arena': 2,
  'stem-studio': 3,
};

export const AVATAR_PRESETS: Array<{
  id: AvatarPresetId;
  label: string;
  imagePath: string;
}> = [
  {
    id: 'dam-san',
    label: 'Anh hùng Đăm Săn',
    imagePath: '/src/assets/images/dam_san_epic_journey_1794539119260.jpg',
  },
  {
    id: 'hnhi',
    label: "Nàng H'Nhị Tây Nguyên",
    imagePath: '/src/assets/images/guide_character_hnhi_1794539118721.jpg',
  },
  {
    id: 'gong',
    label: 'Nghệ nhân Cồng chiêng',
    imagePath: '/src/assets/images/heritage_gong_brocade_1794539119394.jpg',
  },
  {
    id: 'sun',
    label: 'Nữ thần Mặt Trời',
    imagePath: '/src/assets/images/sun_goddess_palace_epic_1794540838277.jpg',
  },
];

export function resolveAvatarImage(
  preset: AvatarPresetId,
  avatarUrl?: string
): string {
  if (preset === 'google' && avatarUrl && avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  const found = AVATAR_PRESETS.find((p) => p.id === preset);
  return found ? found.imagePath : AVATAR_PRESETS[0].imagePath;
}

export function sanitizeFirestoreId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 120);
  return cleaned || 'id_default';
}

function isoFromTimestamp(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export function buildEmptyModuleProgress(
  studentUid = 'guest'
): Record<CoreWingId, ModuleProgressRecord> {
  const now = new Date().toISOString();
  const record = {} as Record<CoreWingId, ModuleProgressRecord>;
  for (const mod of CORE_WING_IDS) {
    record[mod] = {
      progressId: `${sanitizeFirestoreId(studentUid)}__${mod}`,
      studentUid: sanitizeFirestoreId(studentUid),
      classId: '',
      teacherUid: '',
      moduleId: mod,
      status: 'not_started',
      actionsCompleted: [],
      exploredWorks: [],
      requiredActionsCount: MODULE_REQUIRED_ACTIONS[mod],
      scoreEarned: 0,
      lastActivityLabel: 'Chưa bắt đầu hoạt động',
      createdAtIso: now,
      updatedAtIso: now,
    };
  }
  return record;
}

export const INITIAL_DEMO_PASSPORT: ExplorerPassportState = {
  uid: null,
  studentName: 'Học sinh trải nghiệm',
  school: 'Trường THPT (Chưa liên kết)',
  className: 'Lớp 10',
  classId: '',
  joinCode: '',
  teacherUid: '',
  avatarPreset: 'dam-san',
  avatarUrl: '',
  role: 'student',
  visitedZones: ['home'],
  completedMilestones: [],
  completed3DHotspots: [],
  museum3DScore: 0,
  arenaBestScore: 0,
  arenaAttempts: 0,
  moduleProgress: buildEmptyModuleProgress('guest'),
  exploredWorks: [],
  earnedBadges: [],
  quizAttempts: [],
  completedAssignmentsCount: 0,
  totalScore: 0,
  lastUpdatedIso: new Date().toISOString(),
};

export function computeTotalScore(state: ExplorerPassportState): number {
  const modulePoints = CORE_WING_IDS.reduce(
    (sum, mod) => sum + (state.moduleProgress?.[mod]?.scoreEarned || 0),
    0
  );
  const badgeBonus = (state.earnedBadges || []).reduce(
    (sum, b) => sum + (b.pointsBonus || 0),
    0
  );
  const arenaPoints = state.arenaBestScore || 0;
  return Math.max(state.totalScore || 0, modulePoints + arenaPoints + badgeBonus);
}

export function loadDemoPassport(): ExplorerPassportState {
  try {
    const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return INITIAL_DEMO_PASSPORT;
    const parsed = JSON.parse(raw) as Partial<ExplorerPassportState>;
    const defaults = buildEmptyModuleProgress(parsed.uid || 'guest');
    const mergedProgress = { ...defaults };
    if (parsed.moduleProgress) {
      for (const mod of CORE_WING_IDS) {
        if (parsed.moduleProgress[mod]) {
          mergedProgress[mod] = {
            ...defaults[mod],
            ...parsed.moduleProgress[mod],
          };
        }
      }
    }
    const next: ExplorerPassportState = {
      ...INITIAL_DEMO_PASSPORT,
      ...parsed,
      visitedZones: Array.isArray(parsed.visitedZones) ? parsed.visitedZones : ['home'],
      completedMilestones: Array.isArray(parsed.completedMilestones)
        ? parsed.completedMilestones
        : [],
      completed3DHotspots: Array.isArray(parsed.completed3DHotspots)
        ? parsed.completed3DHotspots
        : [],
      moduleProgress: mergedProgress,
      exploredWorks: Array.isArray(parsed.exploredWorks) ? parsed.exploredWorks : [],
      earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
      quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
      museum3DScore: typeof parsed.museum3DScore === 'number' ? parsed.museum3DScore : 0,
    };
    return {
      ...next,
      totalScore: computeTotalScore(next),
    };
  } catch {
    return INITIAL_DEMO_PASSPORT;
  }
}

export function saveDemoPassport(state: ExplorerPassportState): ExplorerPassportState {
  const next: ExplorerPassportState = {
    ...state,
    totalScore: computeTotalScore(state),
    lastUpdatedIso: new Date().toISOString(),
  };
  try {
    localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage failures
  }
  return next;
}

/**
 * Navigation ONLY marks 'in_progress' when the module was 'not_started' —
 * NEVER marks a module as 'completed' just because a student opened the page.
 */
export function markZoneVisitedDemo(
  current: ExplorerPassportState,
  zoneId: MuseumRouteId
): ExplorerPassportState {
  const visitedZones = current.visitedZones.includes(zoneId)
    ? current.visitedZones
    : [...current.visitedZones, zoneId];

  const isCore = (CORE_WING_IDS as string[]).includes(zoneId);
  if (!isCore) {
    if (visitedZones === current.visitedZones) return current;
    return saveDemoPassport({ ...current, visitedZones });
  }

  const modId = zoneId as CoreWingId;
  const existingMod = current.moduleProgress[modId];
  if (existingMod && existingMod.status !== 'not_started') {
    if (visitedZones === current.visitedZones) return current;
    return saveDemoPassport({ ...current, visitedZones });
  }

  const now = new Date().toISOString();
  const updatedMod: ModuleProgressRecord = {
    ...(existingMod || buildEmptyModuleProgress(current.uid || 'guest')[modId]),
    status: 'in_progress',
    lastActivityLabel: 'Đã mở phân hệ, đang khám phá nội dung',
    updatedAtIso: now,
  };

  return saveDemoPassport({
    ...current,
    visitedZones,
    moduleProgress: {
      ...current.moduleProgress,
      [modId]: updatedMod,
    },
  });
}

export function resetDemoPassport(): ExplorerPassportState {
  try {
    localStorage.removeItem(PASSPORT_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return INITIAL_DEMO_PASSPORT;
}

// === Firebase Authentication ===

export async function signInWithGoogleFirebase(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

// === Firestore User Profile & Classroom Join ===

export async function ensureCloudUserProfile(
  fbUser: User
): Promise<UserProfileRecord> {
  const path = `users/${fbUser.uid}`;
  const userRef = doc(db, 'users', fbUser.uid);
  const isBootstrapAdmin =
    fbUser.emailVerified &&
    fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const profile: UserProfileRecord = {
        uid: fbUser.uid,
        displayName: String(data.displayName || fbUser.displayName || 'Học sinh'),
        school: String(data.school || ''),
        className: String(data.className || 'Lớp 10'),
        classId: String(data.classId || ''),
        joinCode: String(data.joinCode || ''),
        teacherUid: String(data.teacherUid || ''),
        avatarPreset: (data.avatarPreset as AvatarPresetId) || 'dam-san',
        avatarUrl: String(data.avatarUrl || ''),
        role: (data.role as UserRole) || 'student',
        totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
        createdAtIso: isoFromTimestamp(data.createdAt),
        updatedAtIso: isoFromTimestamp(data.updatedAt),
      };
      if (isBootstrapAdmin && profile.role !== 'admin') {
        await updateDoc(userRef, {
          role: 'admin',
          updatedAt: serverTimestamp(),
        });
        profile.role = 'admin';
      }
      return profile;
    }

    const defaultRole: UserRole = isBootstrapAdmin ? 'admin' : 'student';
    const initialPreset: AvatarPresetId = fbUser.photoURL ? 'google' : 'dam-san';
    const cleanPayload = {
      uid: fbUser.uid,
      displayName: (fbUser.displayName || 'Học sinh lớp 10').slice(0, 80),
      school: '',
      className: defaultRole === 'admin' ? 'Quản trị / Ngữ văn' : 'Lớp 10',
      classId: '',
      joinCode: '',
      teacherUid: '',
      avatarPreset: initialPreset,
      avatarUrl: (fbUser.photoURL || '').slice(0, 500),
      role: defaultRole,
      totalScore: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, cleanPayload);
    const nowIso = new Date().toISOString();
    return {
      ...cleanPayload,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function lookupClassroomByJoinCode(
  joinCode: string
): Promise<ClassroomRecord | null> {
  const cleanCode = sanitizeFirestoreId(joinCode.trim().toUpperCase());
  if (cleanCode.length < 3) return null;
  const path = `classes/${cleanCode}`;
  try {
    const snap = await getDoc(doc(db, 'classes', cleanCode));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      classId: String(d.classId || cleanCode),
      name: String(d.name || ''),
      school: String(d.school || ''),
      academicYear: String(d.academicYear || '2025-2026'),
      joinCode: String(d.joinCode || cleanCode),
      teacherUid: String(d.teacherUid || ''),
      teacherName: String(d.teacherName || ''),
      isActive: Boolean(d.isActive),
      createdAtIso: isoFromTimestamp(d.createdAt),
      updatedAtIso: isoFromTimestamp(d.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateStudentProfileCloud(
  uid: string,
  input: {
    displayName: string;
    school: string;
    className: string;
    joinCode: string;
    avatarPreset: AvatarPresetId;
    avatarUrl?: string;
  }
): Promise<{
  profile: UserProfileRecord;
  joinedClass: ClassroomRecord | null;
}> {
  const cleanJoinCode = input.joinCode.trim().toUpperCase();
  let classId = '';
  let teacherUid = '';
  let joinedClass: ClassroomRecord | null = null;

  if (cleanJoinCode) {
    joinedClass = await lookupClassroomByJoinCode(cleanJoinCode);
    if (!joinedClass || !joinedClass.isActive) {
      throw new Error(
        `Không tìm thấy lớp đang hoạt động với mã "${cleanJoinCode}". Hãy kiểm tra lại mã lớp do giáo viên cung cấp.`
      );
    }
    classId = joinedClass.classId;
    teacherUid = joinedClass.teacherUid;
  }

  const path = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    await updateDoc(userRef, {
      displayName: input.displayName.trim().slice(0, 80) || 'Học sinh',
      school: (input.school.trim() || joinedClass?.school || '').slice(0, 120),
      className: (input.className.trim() || joinedClass?.name || 'Lớp 10').slice(0, 40),
      classId: classId.slice(0, 64),
      joinCode: cleanJoinCode.slice(0, 24),
      teacherUid: teacherUid.slice(0, 128),
      avatarPreset: input.avatarPreset,
      avatarUrl: (input.avatarUrl || '').slice(0, 500),
      updatedAt: serverTimestamp(),
    });

    const refreshed = await getDoc(userRef);
    const d = refreshed.data()!;
    return {
      joinedClass,
      profile: {
        uid,
        displayName: String(d.displayName),
        school: String(d.school),
        className: String(d.className),
        classId: String(d.classId),
        joinCode: String(d.joinCode),
        teacherUid: String(d.teacherUid),
        avatarPreset: d.avatarPreset as AvatarPresetId,
        avatarUrl: String(d.avatarUrl || ''),
        role: d.role as UserRole,
        totalScore: typeof d.totalScore === 'number' ? d.totalScore : 0,
        createdAtIso: isoFromTimestamp(d.createdAt),
        updatedAtIso: isoFromTimestamp(d.updatedAt),
      },
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// === Cloud Hydration & Action-Based Progress Sync ===

export async function hydratePassportFromCloud(
  fbUser: User,
  localState: ExplorerPassportState
): Promise<ExplorerPassportState> {
  const profile = await ensureCloudUserProfile(fbUser);

  const progressMap = buildEmptyModuleProgress(profile.uid);
  const exploredWorksSet = new Set<string>(localState.exploredWorks || []);
  let attempts: QuizAttemptRecord[] = [];
  let badges: BadgeRecord[] = [];
  let completedAssignmentsCount = 0;

  try {
    const progressSnap = await getDocs(
      query(
        collection(db, 'learningProgress'),
        where('studentUid', '==', profile.uid)
      )
    );
    progressSnap.forEach((docSnap) => {
      const d = docSnap.data();
      const mod = d.moduleId as CoreWingId;
      if (CORE_WING_IDS.includes(mod)) {
        const works = Array.isArray(d.exploredWorks) ? (d.exploredWorks as string[]) : [];
        works.forEach((w) => exploredWorksSet.add(w));
        progressMap[mod] = {
          progressId: docSnap.id,
          studentUid: profile.uid,
          classId: String(d.classId || ''),
          teacherUid: String(d.teacherUid || ''),
          moduleId: mod,
          status: (d.status as ModuleProgressStatus) || 'not_started',
          actionsCompleted: Array.isArray(d.actionsCompleted)
            ? (d.actionsCompleted as string[])
            : [],
          exploredWorks: works,
          requiredActionsCount:
            typeof d.requiredActionsCount === 'number'
              ? d.requiredActionsCount
              : MODULE_REQUIRED_ACTIONS[mod],
          scoreEarned: typeof d.scoreEarned === 'number' ? d.scoreEarned : 0,
          lastActivityLabel: String(d.lastActivityLabel || ''),
          createdAtIso: isoFromTimestamp(d.createdAt),
          updatedAtIso: isoFromTimestamp(d.updatedAt),
        };
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'learningProgress');
  }

  try {
    const attemptsSnap = await getDocs(
      query(
        collection(db, 'quizAttempts'),
        where('studentUid', '==', profile.uid)
      )
    );
    attempts = attemptsSnap.docs
      .map((docSnap) => {
        const d = docSnap.data();
        return {
          attemptId: docSnap.id,
          studentUid: String(d.studentUid),
          studentName: String(d.studentName),
          classId: String(d.classId || ''),
          teacherUid: String(d.teacherUid || ''),
          moduleId: d.moduleId as CoreWingId,
          activityType: d.activityType as QuizAttemptRecord['activityType'],
          activityTitle: String(d.activityTitle),
          workTitle: String(d.workTitle || ''),
          difficultTopic: String(d.difficultTopic || ''),
          score: Number(d.score || 0),
          maxScore: Number(d.maxScore || 1),
          correctCount: Number(d.correctCount || 0),
          wrongCount: Number(d.wrongCount || 0),
          createdAtIso: isoFromTimestamp(d.createdAt),
        };
      })
      .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizAttempts');
  }

  try {
    const badgesSnap = await getDocs(
      query(
        collection(db, 'badges'),
        where('studentUid', '==', profile.uid)
      )
    );
    badges = badgesSnap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        badgeDocId: docSnap.id,
        recordType: d.recordType as BadgeRecord['recordType'],
        badgeId: String(d.badgeId),
        badgeTitle: String(d.badgeTitle),
        criteria: String(d.criteria),
        studentUid: String(d.studentUid || ''),
        classId: String(d.classId || ''),
        teacherUid: String(d.teacherUid || ''),
        awardedBy: (d.awardedBy as 'system' | 'teacher') || 'system',
        pointsBonus: Number(d.pointsBonus || 0),
        createdAtIso: isoFromTimestamp(d.createdAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'badges');
  }

  if (profile.classId) {
    try {
      const assignSnap = await getDocs(
        query(collection(db, 'assignments'), where('isPublished', '==', true))
      );
      for (const aDoc of assignSnap.docs) {
        if (aDoc.data().classId === profile.classId) {
          const subSnap = await getDoc(
            doc(db, 'assignments', aDoc.id, 'submissions', profile.uid)
          );
          if (subSnap.exists()) {
            completedAssignmentsCount += 1;
          }
        }
      }
    } catch {
      // Optional assignments check
    }
  }

  const arenaAttemptsList = attempts.filter((a) => a.activityType === 'arena_game');
  const bestArena = arenaAttemptsList.reduce(
    (max, a) => Math.max(max, a.score),
    localState.arenaBestScore || 0
  );

  const modulePoints = CORE_WING_IDS.reduce(
    (sum, mod) => sum + (progressMap[mod]?.scoreEarned || 0),
    0
  );
  const badgeBonus = badges.reduce((sum, b) => sum + (b.pointsBonus || 0), 0);
  const computedTotalScore = Math.max(
    profile.totalScore,
    modulePoints + bestArena + badgeBonus
  );

  const hydrated: ExplorerPassportState = {
    ...localState,
    uid: profile.uid,
    studentName: profile.displayName,
    school: profile.school || localState.school,
    className: profile.className || localState.className,
    classId: profile.classId,
    joinCode: profile.joinCode,
    teacherUid: profile.teacherUid,
    avatarPreset: profile.avatarPreset,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    moduleProgress: progressMap,
    exploredWorks: Array.from(exploredWorksSet),
    earnedBadges: badges,
    quizAttempts: attempts,
    arenaBestScore: bestArena,
    arenaAttempts: Math.max(localState.arenaAttempts, arenaAttemptsList.length),
    completedAssignmentsCount,
    totalScore: computedTotalScore,
  };

  return saveDemoPassport(hydrated);
}

/**
 * Record real learner action for a core module.
 * Transitions: not_started -> in_progress -> completed (only when actionsCompleted >= requiredActionsCount).
 */
export async function recordModuleAction(
  current: ExplorerPassportState,
  params: {
    moduleId: CoreWingId;
    actionKey: string;
    activityLabel: string;
    workTitle?: string;
    scoreDelta?: number;
    forceComplete?: boolean;
  }
): Promise<ExplorerPassportState> {
  const prevMod =
    current.moduleProgress[params.moduleId] ||
    buildEmptyModuleProgress(current.uid || 'guest')[params.moduleId];

  const isNewAction = !prevMod.actionsCompleted.includes(params.actionKey);
  const nextActions = isNewAction
    ? [...prevMod.actionsCompleted, params.actionKey].slice(0, 30)
    : prevMod.actionsCompleted;

  const nextWorks =
    params.workTitle && !prevMod.exploredWorks.includes(params.workTitle)
      ? [...prevMod.exploredWorks, params.workTitle].slice(0, 20)
      : prevMod.exploredWorks;

  const globalWorks =
    params.workTitle && !current.exploredWorks.includes(params.workTitle)
      ? [...current.exploredWorks, params.workTitle].slice(0, 40)
      : current.exploredWorks;

  const requiredCount = MODULE_REQUIRED_ACTIONS[params.moduleId];
  const reachedTarget =
    Boolean(params.forceComplete) || nextActions.length >= requiredCount;

  const nextStatus: ModuleProgressStatus =
    prevMod.status === 'completed' || reachedTarget ? 'completed' : 'in_progress';

  const safeDelta = isNewAction ? Math.max(0, Math.min(40, params.scoreDelta || 0)) : 0;
  const nextScoreEarned = Math.min(200, prevMod.scoreEarned + safeDelta);
  const nowIso = new Date().toISOString();

  const updatedMod: ModuleProgressRecord = {
    ...prevMod,
    studentUid: current.uid || 'guest',
    classId: current.classId || '',
    teacherUid: current.teacherUid || '',
    status: nextStatus,
    actionsCompleted: nextActions,
    exploredWorks: nextWorks,
    requiredActionsCount: requiredCount,
    scoreEarned: nextScoreEarned,
    lastActivityLabel: params.activityLabel.slice(0, 140),
    updatedAtIso: nowIso,
  };

  let nextBadges = [...current.earnedBadges];
  if (nextStatus === 'completed') {
    const systemBadgeId = `badge_mod_${params.moduleId.replace(/-/g, '_')}`;
    const alreadyEarned = nextBadges.some((b) => b.badgeId === systemBadgeId);
    if (!alreadyEarned) {
      const badgeDocId = `${sanitizeFirestoreId(current.uid || 'guest')}__${systemBadgeId}`;
      const newBadge: BadgeRecord = {
        badgeDocId,
        recordType: 'awarded',
        badgeId: systemBadgeId,
        badgeTitle: `Hoàn thành ${params.moduleId.replace(/-/g, ' ').toUpperCase()}`,
        criteria: `Hoàn tất các nhiệm vụ thực tế tại phân hệ ${params.moduleId}`,
        studentUid: current.uid || 'guest',
        classId: current.classId || '',
        teacherUid: current.teacherUid || '',
        awardedBy: 'system',
        pointsBonus: 10,
        createdAtIso: nowIso,
      };
      nextBadges.push(newBadge);
      if (current.uid && auth.currentUser?.uid === current.uid) {
        try {
          await setDoc(doc(db, 'badges', badgeDocId), {
            badgeDocId,
            recordType: 'awarded',
            badgeId: systemBadgeId,
            badgeTitle: newBadge.badgeTitle.slice(0, 80),
            criteria: newBadge.criteria.slice(0, 180),
            studentUid: current.uid,
            classId: current.classId || '',
            teacherUid: current.teacherUid || '',
            awardedBy: 'system',
            pointsBonus: 10,
            createdAt: serverTimestamp(),
          });
        } catch {
          // Badge may already exist or offline
        }
      }
    }
  }

  if (current.uid && auth.currentUser?.uid === current.uid) {
    const progressId = `${sanitizeFirestoreId(current.uid)}__${params.moduleId}`;
    const path = `learningProgress/${progressId}`;
    const docRef = doc(db, 'learningProgress', progressId);
    try {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        await updateDoc(docRef, {
          classId: (current.classId || '').slice(0, 64),
          teacherUid: (current.teacherUid || '').slice(0, 128),
          status: nextStatus,
          actionsCompleted: nextActions,
          exploredWorks: nextWorks,
          requiredActionsCount: requiredCount,
          scoreEarned: nextScoreEarned,
          lastActivityLabel: updatedMod.lastActivityLabel,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(docRef, {
          progressId,
          studentUid: current.uid,
          classId: (current.classId || '').slice(0, 64),
          teacherUid: (current.teacherUid || '').slice(0, 128),
          moduleId: params.moduleId,
          status: nextStatus,
          actionsCompleted: nextActions,
          exploredWorks: nextWorks,
          requiredActionsCount: requiredCount,
          scoreEarned: nextScoreEarned,
          lastActivityLabel: updatedMod.lastActivityLabel,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  return saveDemoPassport({
    ...current,
    exploredWorks: globalWorks,
    earnedBadges: nextBadges,
    moduleProgress: {
      ...current.moduleProgress,
      [params.moduleId]: updatedMod,
    },
  });
}

/**
 * Record an immutable quiz/game/reading/3D/compass attempt.
 */
export async function recordQuizAttempt(
  current: ExplorerPassportState,
  input: Omit<
    QuizAttemptRecord,
    'attemptId' | 'studentUid' | 'studentName' | 'classId' | 'teacherUid' | 'createdAtIso'
  >
): Promise<ExplorerPassportState> {
  const safeMax = Math.max(1, Math.min(250, Math.round(input.maxScore)));
  const safeScore = Math.max(0, Math.min(safeMax, Math.round(input.score)));
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const record: QuizAttemptRecord = {
    attemptId,
    studentUid: current.uid || 'guest',
    studentName: current.studentName.slice(0, 80) || 'Học sinh',
    classId: current.classId || '',
    teacherUid: current.teacherUid || '',
    moduleId: input.moduleId,
    activityType: input.activityType,
    activityTitle: input.activityTitle.slice(0, 120),
    workTitle: input.workTitle.slice(0, 120),
    difficultTopic: input.difficultTopic.slice(0, 120),
    score: safeScore,
    maxScore: safeMax,
    correctCount: Math.max(0, Math.min(100, input.correctCount)),
    wrongCount: Math.max(0, Math.min(100, input.wrongCount)),
    createdAtIso: nowIso,
  };

  if (current.uid && auth.currentUser?.uid === current.uid) {
    const path = `quizAttempts/${attemptId}`;
    try {
      await setDoc(doc(db, 'quizAttempts', attemptId), {
        ...record,
        studentUid: current.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  return saveDemoPassport({
    ...current,
    quizAttempts: [record, ...(current.quizAttempts || [])].slice(0, 50),
  });
}

// === Teacher Admin Cloud Operations ===

export interface TeacherDashboardPayload {
  classes: ClassroomRecord[];
  students: UserProfileRecord[];
  progressRecords: ModuleProgressRecord[];
  quizAttempts: QuizAttemptRecord[];
  badges: BadgeRecord[];
  assignments: AssignmentRecord[];
  submissionsCountByAssignment: Record<string, number>;
}

export async function fetchTeacherDashboardData(
  callerUid: string,
  callerRole: UserRole
): Promise<TeacherDashboardPayload> {
  const isAdmin = callerRole === 'admin';

  let classes: ClassroomRecord[] = [];
  let students: UserProfileRecord[] = [];
  let progressRecords: ModuleProgressRecord[] = [];
  let quizAttempts: QuizAttemptRecord[] = [];
  let badges: BadgeRecord[] = [];
  let assignments: AssignmentRecord[] = [];
  const submissionsCountByAssignment: Record<string, number> = {};

  try {
    const classQ = isAdmin
      ? query(collection(db, 'classes'))
      : query(collection(db, 'classes'), where('teacherUid', '==', callerUid));
    const snap = await getDocs(classQ);
    classes = snap.docs.map((d) => {
      const data = d.data();
      return {
        classId: d.id,
        name: String(data.name || ''),
        school: String(data.school || ''),
        academicYear: String(data.academicYear || '2025-2026'),
        joinCode: String(data.joinCode || d.id),
        teacherUid: String(data.teacherUid || ''),
        teacherName: String(data.teacherName || ''),
        isActive: Boolean(data.isActive),
        createdAtIso: isoFromTimestamp(data.createdAt),
        updatedAtIso: isoFromTimestamp(data.updatedAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'classes');
  }

  try {
    const userQ = isAdmin
      ? query(collection(db, 'users'))
      : query(collection(db, 'users'), where('teacherUid', '==', callerUid));
    const snap = await getDocs(userQ);
    students = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        displayName: String(data.displayName || ''),
        school: String(data.school || ''),
        className: String(data.className || ''),
        classId: String(data.classId || ''),
        joinCode: String(data.joinCode || ''),
        teacherUid: String(data.teacherUid || ''),
        avatarPreset: (data.avatarPreset as AvatarPresetId) || 'dam-san',
        avatarUrl: String(data.avatarUrl || ''),
        role: (data.role as UserRole) || 'student',
        totalScore: Number(data.totalScore || 0),
        createdAtIso: isoFromTimestamp(data.createdAt),
        updatedAtIso: isoFromTimestamp(data.updatedAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }

  try {
    const progQ = isAdmin
      ? query(collection(db, 'learningProgress'))
      : query(
          collection(db, 'learningProgress'),
          where('teacherUid', '==', callerUid)
        );
    const snap = await getDocs(progQ);
    progressRecords = snap.docs.map((d) => {
      const data = d.data();
      return {
        progressId: d.id,
        studentUid: String(data.studentUid),
        classId: String(data.classId || ''),
        teacherUid: String(data.teacherUid || ''),
        moduleId: data.moduleId as CoreWingId,
        status: data.status as ModuleProgressStatus,
        actionsCompleted: Array.isArray(data.actionsCompleted)
          ? (data.actionsCompleted as string[])
          : [],
        exploredWorks: Array.isArray(data.exploredWorks)
          ? (data.exploredWorks as string[])
          : [],
        requiredActionsCount: Number(data.requiredActionsCount || 1),
        scoreEarned: Number(data.scoreEarned || 0),
        lastActivityLabel: String(data.lastActivityLabel || ''),
        createdAtIso: isoFromTimestamp(data.createdAt),
        updatedAtIso: isoFromTimestamp(data.updatedAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'learningProgress');
  }

  try {
    const attQ = isAdmin
      ? query(collection(db, 'quizAttempts'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'quizAttempts'),
          where('teacherUid', '==', callerUid)
        );
    const snap = await getDocs(attQ);
    quizAttempts = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          attemptId: d.id,
          studentUid: String(data.studentUid),
          studentName: String(data.studentName),
          classId: String(data.classId || ''),
          teacherUid: String(data.teacherUid || ''),
          moduleId: data.moduleId as CoreWingId,
          activityType: data.activityType as QuizAttemptRecord['activityType'],
          activityTitle: String(data.activityTitle),
          workTitle: String(data.workTitle || ''),
          difficultTopic: String(data.difficultTopic || ''),
          score: Number(data.score || 0),
          maxScore: Number(data.maxScore || 1),
          correctCount: Number(data.correctCount || 0),
          wrongCount: Number(data.wrongCount || 0),
          createdAtIso: isoFromTimestamp(data.createdAt),
        };
      })
      .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'quizAttempts');
  }

  try {
    const badgeQ = isAdmin
      ? query(collection(db, 'badges'))
      : query(collection(db, 'badges'), where('teacherUid', '==', callerUid));
    const snap = await getDocs(badgeQ);
    badges = snap.docs.map((d) => {
      const data = d.data();
      return {
        badgeDocId: d.id,
        recordType: data.recordType as BadgeRecord['recordType'],
        badgeId: String(data.badgeId),
        badgeTitle: String(data.badgeTitle),
        criteria: String(data.criteria),
        studentUid: String(data.studentUid || ''),
        classId: String(data.classId || ''),
        teacherUid: String(data.teacherUid || ''),
        awardedBy: (data.awardedBy as 'system' | 'teacher') || 'teacher',
        pointsBonus: Number(data.pointsBonus || 0),
        createdAtIso: isoFromTimestamp(data.createdAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'badges');
  }

  try {
    const assignQ = isAdmin
      ? query(collection(db, 'assignments'))
      : query(
          collection(db, 'assignments'),
          where('teacherUid', '==', callerUid)
        );
    const snap = await getDocs(assignQ);
    assignments = snap.docs.map((d) => {
      const data = d.data();
      return {
        assignmentId: d.id,
        classId: String(data.classId),
        teacherUid: String(data.teacherUid),
        moduleId: data.moduleId as CoreWingId,
        title: String(data.title),
        description: String(data.description),
        maxPoints: Number(data.maxPoints || 10),
        isPublished: Boolean(data.isPublished),
        createdAtIso: isoFromTimestamp(data.createdAt),
        updatedAtIso: isoFromTimestamp(data.updatedAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'assignments');
  }

  return {
    classes,
    students,
    progressRecords,
    quizAttempts,
    badges,
    assignments,
    submissionsCountByAssignment,
  };
}

export async function createClassroomCloud(
  teacherUid: string,
  teacherName: string,
  input: { name: string; school: string; academicYear: string; joinCode: string }
): Promise<ClassroomRecord> {
  const cleanCode = sanitizeFirestoreId(input.joinCode.trim().toUpperCase()).slice(0, 24);
  if (cleanCode.length < 3) {
    throw new Error('Mã lớp phải có ít nhất 3 ký tự chữ hoặc số.');
  }
  const path = `classes/${cleanCode}`;
  const docRef = doc(db, 'classes', cleanCode);
  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      throw new Error(`Mã lớp "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác.`);
    }
    const payload = {
      classId: cleanCode,
      name: input.name.trim().slice(0, 40),
      school: input.school.trim().slice(0, 120),
      academicYear: input.academicYear.trim().slice(0, 20) || '2025-2026',
      joinCode: cleanCode,
      teacherUid,
      teacherName: teacherName.trim().slice(0, 80) || 'Giáo viên Ngữ văn',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload);
    const nowIso = new Date().toISOString();
    return {
      ...payload,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleClassroomActiveCloud(
  classId: string,
  isActive: boolean
): Promise<void> {
  const path = `classes/${classId}`;
  try {
    await updateDoc(doc(db, 'classes', classId), {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserByAdminOrTeacherCloud(
  targetUid: string,
  updates: {
    role?: UserRole;
    totalScore?: number;
    className?: string;
  }
): Promise<void> {
  const path = `users/${targetUid}`;
  try {
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.role) payload.role = updates.role;
    if (typeof updates.totalScore === 'number') {
      payload.totalScore = Math.max(0, Math.min(100000, updates.totalScore));
    }
    if (typeof updates.className === 'string') {
      payload.className = updates.className.slice(0, 40);
    }
    await updateDoc(doc(db, 'users', targetUid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function awardBadgeToStudentCloud(params: {
  studentUid: string;
  classId: string;
  teacherUid: string;
  badgeTitle: string;
  criteria: string;
  pointsBonus: number;
}): Promise<BadgeRecord> {
  const badgeId = `custom_${Date.now()}`;
  const badgeDocId = `${sanitizeFirestoreId(params.studentUid)}__${badgeId}`;
  const path = `badges/${badgeDocId}`;
  try {
    const payload = {
      badgeDocId,
      recordType: 'awarded' as const,
      badgeId,
      badgeTitle: params.badgeTitle.trim().slice(0, 80),
      criteria: params.criteria.trim().slice(0, 180),
      studentUid: params.studentUid,
      classId: params.classId.slice(0, 64),
      teacherUid: params.teacherUid,
      awardedBy: 'teacher' as const,
      pointsBonus: Math.max(0, Math.min(50, Math.round(params.pointsBonus))),
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'badges', badgeDocId), payload);
    return {
      ...payload,
      createdAtIso: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createAssignmentCloud(params: {
  classId: string;
  teacherUid: string;
  moduleId: CoreWingId;
  title: string;
  description: string;
  maxPoints: number;
}): Promise<AssignmentRecord> {
  const assignmentId = `asg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const path = `assignments/${assignmentId}`;
  try {
    const payload = {
      assignmentId,
      classId: params.classId,
      teacherUid: params.teacherUid,
      moduleId: params.moduleId,
      title: params.title.trim().slice(0, 120),
      description: params.description.trim().slice(0, 600),
      maxPoints: Math.max(1, Math.min(100, Math.round(params.maxPoints))),
      isPublished: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'assignments', assignmentId), payload);
    const nowIso = new Date().toISOString();
    return {
      ...payload,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchClassAssignmentsAndSubmissions(
  classId: string,
  studentUid?: string
): Promise<{
  assignments: AssignmentRecord[];
  mySubmissions: Record<string, AssignmentSubmissionRecord>;
}> {
  if (!classId) return { assignments: [], mySubmissions: {} };
  try {
    const q = query(
      collection(db, 'assignments'),
      where('isPublished', '==', true)
    );
    const snap = await getDocs(q);
    const assignments = snap.docs
      .filter((d) => d.data().classId === classId)
      .map((d) => {
        const data = d.data();
        return {
          assignmentId: d.id,
          classId: String(data.classId),
          teacherUid: String(data.teacherUid),
          moduleId: data.moduleId as CoreWingId,
          title: String(data.title),
          description: String(data.description),
          maxPoints: Number(data.maxPoints || 10),
          isPublished: Boolean(data.isPublished),
          createdAtIso: isoFromTimestamp(data.createdAt),
          updatedAtIso: isoFromTimestamp(data.updatedAt),
        };
      });

    const mySubmissions: Record<string, AssignmentSubmissionRecord> = {};
    if (studentUid) {
      for (const asg of assignments) {
        const subSnap = await getDoc(
          doc(db, 'assignments', asg.assignmentId, 'submissions', studentUid)
        );
        if (subSnap.exists()) {
          const sd = subSnap.data();
          mySubmissions[asg.assignmentId] = {
            studentUid,
            studentName: String(sd.studentName),
            classId: String(sd.classId),
            teacherUid: String(sd.teacherUid),
            responseSummary: String(sd.responseSummary),
            status: sd.status as 'submitted' | 'graded',
            score: Number(sd.score || 0),
            teacherFeedback: String(sd.teacherFeedback || ''),
            createdAtIso: isoFromTimestamp(sd.createdAt),
            updatedAtIso: isoFromTimestamp(sd.updatedAt),
          };
        }
      }
    }
    return { assignments, mySubmissions };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'assignments');
  }
}

export async function submitAssignmentCloud(params: {
  assignment: AssignmentRecord;
  studentUid: string;
  studentName: string;
  responseSummary: string;
}): Promise<AssignmentSubmissionRecord> {
  const path = `assignments/${params.assignment.assignmentId}/submissions/${params.studentUid}`;
  const docRef = doc(
    db,
    'assignments',
    params.assignment.assignmentId,
    'submissions',
    params.studentUid
  );
  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        responseSummary: params.responseSummary.trim().slice(0, 1200),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        studentUid: params.studentUid,
        studentName: params.studentName.trim().slice(0, 80) || 'Học sinh',
        classId: params.assignment.classId,
        teacherUid: params.assignment.teacherUid,
        responseSummary: params.responseSummary.trim().slice(0, 1200),
        status: 'submitted',
        score: 0,
        teacherFeedback: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    const nowIso = new Date().toISOString();
    return {
      studentUid: params.studentUid,
      studentName: params.studentName,
      classId: params.assignment.classId,
      teacherUid: params.assignment.teacherUid,
      responseSummary: params.responseSummary.trim().slice(0, 1200),
      status: 'submitted',
      score: 0,
      teacherFeedback: '',
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTeacherSettingsCloud(
  teacherUid: string,
  settings: {
    houseEmbedUrl: string;
    journeyEmbedUrl: string;
    presentationMode: boolean;
  }
): Promise<void> {
  const path = 'teacherSettings/global';
  try {
    await setDoc(doc(db, 'teacherSettings', 'global'), {
      settingId: 'global',
      teacherUid,
      houseEmbedUrl: settings.houseEmbedUrl.trim().slice(0, 500),
      journeyEmbedUrl: settings.journeyEmbedUrl.trim().slice(0, 500),
      presentationMode: Boolean(settings.presentationMode),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchGlobalTeacherSettings(): Promise<{
  houseEmbedUrl: string;
  journeyEmbedUrl: string;
  presentationMode: boolean;
} | null> {
  if (!auth.currentUser) return null;
  try {
    const snap = await getDoc(doc(db, 'teacherSettings', 'global'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      houseEmbedUrl: String(d.houseEmbedUrl || ''),
      journeyEmbedUrl: String(d.journeyEmbedUrl || ''),
      presentationMode: Boolean(d.presentationMode),
    };
  } catch {
    return null;
  }
}

export async function fetchSubmissionsForAssignmentCloud(
  assignmentId: string,
  callerUid: string,
  callerRole: UserRole
): Promise<AssignmentSubmissionRecord[]> {
  const path = `assignments/${assignmentId}/submissions`;
  try {
    const subCol = collection(db, 'assignments', assignmentId, 'submissions');
    const q =
      callerRole === 'admin'
        ? query(subCol)
        : query(subCol, where('teacherUid', '==', callerUid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const sd = d.data();
      return {
        studentUid: String(sd.studentUid || d.id),
        studentName: String(sd.studentName || 'Học sinh'),
        classId: String(sd.classId || ''),
        teacherUid: String(sd.teacherUid || ''),
        responseSummary: String(sd.responseSummary || ''),
        status: (sd.status as 'submitted' | 'graded') || 'submitted',
        score: Number(sd.score || 0),
        teacherFeedback: String(sd.teacherFeedback || ''),
        createdAtIso: isoFromTimestamp(sd.createdAt),
        updatedAtIso: isoFromTimestamp(sd.updatedAt),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function gradeAssignmentSubmissionCloud(params: {
  assignmentId: string;
  studentUid: string;
  score: number;
  maxPoints: number;
  teacherFeedback: string;
}): Promise<void> {
  const path = `assignments/${params.assignmentId}/submissions/${params.studentUid}`;
  const docRef = doc(
    db,
    'assignments',
    params.assignmentId,
    'submissions',
    params.studentUid
  );
  try {
    await updateDoc(docRef, {
      status: 'graded',
      score: Math.max(0, Math.min(params.maxPoints, Math.round(params.score))),
      teacherFeedback: params.teacherFeedback.trim().slice(0, 600),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
