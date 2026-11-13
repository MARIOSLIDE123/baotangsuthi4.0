export type MuseumRouteId =
  | 'home'
  | 'epic-gate'
  | 'vietnam-epics'
  | 'world-epics'
  | 'museum-3d'
  | 'dam-san-journey'
  | 'hero-arena'
  | 'stem-studio'
  | 'passport'
  | 'ai-assistant'
  | 'teacher-admin';

export interface MuseumZoneInfo {
  id: MuseumRouteId;
  orderLabel: string;
  title: string;
  shortTitle: string;
  category: 'explore' | 'archive' | 'interactive' | 'learning' | 'admin';
  subtitle: string;
  guideTip: string;
  stampCode: string;
}

export interface CoreWingExhibition {
  id: MuseumRouteId;
  orderNumber: string;
  title: string;
  shortDescription: string;
  imagePath: string;
  imageAlt: string;
  ctaLabel: string;
}

export interface EpicConceptCard {
  id: string;
  index: string;
  title: string;
  imagePath: string;
  imageAlt: string;
  explanation: string;
  example: string;
  selfCheckQuestion: string;
  selfCheckOptions: string[];
  correctIndex: number;
  selfCheckFeedback: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  note: string;
  children?: MindMapNode[];
}

export interface EpicDossier {
  id: string;
  region: 'vietnam' | 'world';
  title: string;
  culturalCommunity: string;
  distributionArea: string;
  cultureRegionId?: 'greece' | 'india' | 'mesopotamia';
  imagePath: string;
  imageAlt: string;
  introduction: string;
  plotSummary: string;
  plotSteps: Array<{ step: string; detail: string }>;
  centralCharacter: string;
  characterProfile: {
    name: string;
    role: string;
    keyConflict: string;
    representativeTrait: string;
  };
  artisticFeatures: string[];
  culturalValue: string;
  readingQuestions: string[];
  appliedMission: string;
  comparisonQuestion?: string;
  connectionMission?: string;
  referenceNote: string;
}

export interface HeroComparisonProfile {
  id: string;
  name: string;
  workTitle: string;
  origin: string;
  appearanceContext: string;
  aspiration: string;
  actions: string;
  qualities: string;
  communityRelation: string;
  fate: string;
  symbolicMeaning: string;
}

export interface JourneyMilestone {
  id: string;
  stepNumber: number;
  title: string;
  locationLabel: string;
  narrative: string;
  keyQuote: string;
  comprehensionQuestion: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type StationStatus = 'locked' | 'active' | 'completed';

export type MissionLayerType = 'event' | 'artistry' | 'meaning';

export interface MissionLayerTask {
  id: string;
  layerType: MissionLayerType;
  layerNumber: 1 | 2 | 3;
  layerLabel: string;
  focusHeading: string;
  contextExcerpt: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reflectionPrompt: string;
}

export interface SunGoddessStation {
  id: 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4';
  stepNumber: 1 | 2 | 3 | 4;
  shortName: string;
  title: string;
  emblemType: 'torch' | 'mountain' | 'sun' | 'scroll';
  locationLabel: string;
  objective: string;
  tasksChecklist: [string, string, string, string];
  imagePath: string;
  imageAlt: string;
  studySummary: string;
  verbatimReferenceNote: string;
  mapCoords: { x: number; y: number; z: number };
  layers: [MissionLayerTask, MissionLayerTask, MissionLayerTask];
}

export interface CompassTextDetail {
  id: string;
  stationId: 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4';
  label: string;
  relevantClaimIds: string[];
  isDistractor?: boolean;
  distractorReason?: string;
}

export interface CompassClaim {
  id: string;
  stationId: 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4';
  statement: string;
  focusHint: string;
  rubricKeywords: string[];
}

export interface CompassEvaluationResult {
  configured: boolean;
  mode: 'gemini' | 'rubric-local';
  evidenceExistence: {
    status: 'confirmed_in_study_text' | 'unverified_verbatim' | 'missing' | 'mismatch';
    label: string;
    feedback: string;
  };
  evidenceRelevance: {
    score: number;
    maxScore: number;
    feedback: string;
  };
  reasoningQuality: {
    score: number;
    maxScore: number;
    feedback: string;
  };
  totalScore: number;
  maxTotalScore: number;
  overallVerdict: string;
  nextStepAdvice: string;
  verbatimCaution: string | null;
}

export interface ArenaQuestion {
  id: string;
  category: 'Thể loại' | 'Đăm Săn' | 'Sử thi thế giới' | 'Dẫn chứng';
  prompt: string;
  excerpt?: string;
  choices: string[];
  correctIndex: number;
  feedback: string;
}

export type ArenaGameId =
  | 'decode'
  | 'who-is-hero'
  | 'timeline'
  | 'mystery-tiles'
  | 'evidence-challenge'
  | 'epic-dialogue';

export interface ArenaGameMeta {
  id: ArenaGameId;
  orderNumber: string;
  title: string;
  subtitle: string;
  durationSeconds: number;
  scoringFocus: string;
}

export type HeroMatchDimension = 'work' | 'quality' | 'event';

export interface HeroMatchPair {
  id: string;
  heroName: string;
  targetText: string;
  explanation: string;
}

export interface HeroMatchRound {
  id: string;
  dimension: HeroMatchDimension;
  dimensionLabel: string;
  instruction: string;
  pairs: HeroMatchPair[];
}

export interface TimelineEventItem {
  id: string;
  text: string;
  order: number;
}

export interface TimelineRound {
  id: string;
  workTitle: string;
  instruction: string;
  events: TimelineEventItem[];
  explanation: string;
}

export interface MysteryTileQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface MysteryPuzzleItem {
  id: string;
  title: string;
  imagePath: string;
  imageAlt: string;
  cultureLabel: string;
  tileQuestions: [MysteryTileQuestion, MysteryTileQuestion, MysteryTileQuestion, MysteryTileQuestion];
  matchQuestion: string;
  matchOptions: string[];
  correctMatchIndex: number;
  summaryFact: string;
}

export interface EvidenceChallengeItem {
  id: string;
  claim: string;
  workTitle: string;
  evidenceChoices: string[];
  correctIndex: number;
  rubricKeywords: string[];
  explanation: string;
}

export interface DialogueScenarioItem {
  id: string;
  title: string;
  workTitle: string;
  situation: string;
  openQuestion: string;
  coreDimensions: string[];
}

export interface ArenaScoreBreakdown {
  baseScore: number;
  speedBonus: number;
  completionBonus: number;
  analysisBonus: number;
  evidenceBonus: number;
  totalScore: number;
}

export interface ArenaReviewItem {
  prompt: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface ArenaAttemptRecord {
  id: string;
  studentName: string;
  className: string;
  gameId: ArenaGameId;
  gameTitle: string;
  startedAtIso: string;
  completedAtIso: string;
  score: number;
  breakdown: ArenaScoreBreakdown;
  correctCount: number;
  wrongCount: number;
  totalItems: number;
  reviewItems: ArenaReviewItem[];
}

export type ArenaBadgeId =
  | 'badge-explorer'
  | 'badge-decoder'
  | 'badge-warrior'
  | 'badge-researcher'
  | 'badge-messenger';

export interface ArenaBadgeStatus {
  id: ArenaBadgeId;
  title: string;
  criteria: string;
  earned: boolean;
  progressLabel: string;
}

export interface ArenaOpenEvalResult {
  configured: boolean;
  mode: 'gemini' | 'rubric-local';
  analysisPoints: number;
  maxAnalysisPoints: number;
  evidencePoints: number;
  maxEvidencePoints: number;
  feedback: string;
  reflectionAngles: string[];
}

export type StemStudioTabId = 'house' | 'journey' | 'rubric' | 'gallery' | 'qr';

export interface StemProjectTemplate {
  id: string;
  title: string;
  disciplinaryLink: string;
  description: string;
  deliverables: string[];
  materialHint: string;
}

export interface StemHouseMission {
  code: string;
  title: string;
  subtitle: string;
  imagePath: string;
  imageAlt: string;
  objective: string;
  culturalKnowledge: string[];
  suggestedMaterials: Array<{ name: string; usageNote: string }>;
  designProcess: Array<{ phase: string; summary: string }>;
  fabricationSteps: Array<{ stepNumber: number; title: string; detail: string }>;
  evaluationCriteria: string[];
  presentationRequirements: string[];
}

export interface StemJourneyMission {
  code: string;
  title: string;
  subtitle: string;
  imagePath: string;
  imageAlt: string;
  objective: string;
  requiredComponents: Array<{ title: string; requirement: string }>;
  creativeFormats: Array<{ format: string; examples: string }>;
  implementationSteps: Array<{ stepNumber: number; title: string; detail: string }>;
  presentationRequirements: string[];
}

export type RubricLevelKey = 'chua_dat' | 'dat' | 'kha' | 'tot';

export interface StemRubricCriterion {
  id: string;
  orderNumber: string;
  criterionName: string;
  weightLabel: string;
  levels: Record<
    RubricLevelKey,
    {
      label: string;
      scorePoints: number;
      descriptor: string;
    }
  >;
}

export interface StemQrTargetPreset {
  id: 'qr-house' | 'qr-journey' | 'qr-gallery';
  label: string;
  shortTag: string;
  description: string;
  stemTab: StemStudioTabId;
  fileSlug: string;
}

export interface Museum3DHotspot {
  id: string;
  area: 'A' | 'B';
  areaLabel: string;
  title: string;
  shortLabel: string;
  position: { x: number; y: number; z: number };
  triggerRadius: number;
  imagePath: string;
  description: string;
  simulationNote: string;
  narrationText: string;
  missionQuestion: string;
  missionOptions: string[];
  correctIndex: number;
  missionExplanation: string;
  points: number;
  badgeReward: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export type AvatarPresetId = 'dam-san' | 'hnhi' | 'gong' | 'sun' | 'google';

export type ModuleProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type CoreWingId =
  | 'epic-gate'
  | 'vietnam-epics'
  | 'world-epics'
  | 'museum-3d'
  | 'dam-san-journey'
  | 'hero-arena'
  | 'stem-studio';

export interface UserProfileRecord {
  uid: string;
  displayName: string;
  school: string;
  className: string;
  classId: string;
  joinCode: string;
  teacherUid: string;
  avatarPreset: AvatarPresetId;
  avatarUrl: string;
  role: UserRole;
  totalScore: number;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface ClassroomRecord {
  classId: string;
  name: string;
  school: string;
  academicYear: string;
  joinCode: string;
  teacherUid: string;
  teacherName: string;
  isActive: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface ModuleProgressRecord {
  progressId: string;
  studentUid: string;
  classId: string;
  teacherUid: string;
  moduleId: CoreWingId;
  status: ModuleProgressStatus;
  actionsCompleted: string[];
  exploredWorks: string[];
  requiredActionsCount: number;
  scoreEarned: number;
  lastActivityLabel: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface QuizAttemptRecord {
  attemptId: string;
  studentUid: string;
  studentName: string;
  classId: string;
  teacherUid: string;
  moduleId: CoreWingId;
  activityType:
    | 'arena_game'
    | 'reading_comprehension'
    | 'compass_analysis'
    | 'concept_check'
    | 'museum_3d';
  activityTitle: string;
  workTitle: string;
  difficultTopic: string;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  createdAtIso: string;
}

export interface BadgeRecord {
  badgeDocId: string;
  recordType: 'definition' | 'awarded';
  badgeId: string;
  badgeTitle: string;
  criteria: string;
  studentUid: string;
  classId: string;
  teacherUid: string;
  awardedBy: 'system' | 'teacher';
  pointsBonus: number;
  createdAtIso: string;
}

export interface AssignmentRecord {
  assignmentId: string;
  classId: string;
  teacherUid: string;
  moduleId: CoreWingId;
  title: string;
  description: string;
  maxPoints: number;
  isPublished: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface AssignmentSubmissionRecord {
  studentUid: string;
  studentName: string;
  classId: string;
  teacherUid: string;
  responseSummary: string;
  status: 'submitted' | 'graded';
  score: number;
  teacherFeedback: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface ActivityHistoryEntry {
  id: string;
  title: string;
  moduleLabel: string;
  detail: string;
  scoreLabel: string;
  timestampIso: string;
}

export interface ExplorerPassportState {
  uid: string | null;
  studentName: string;
  school: string;
  className: string;
  classId: string;
  joinCode: string;
  teacherUid: string;
  avatarPreset: AvatarPresetId;
  avatarUrl: string;
  role: UserRole;
  visitedZones: MuseumRouteId[];
  completedMilestones: string[];
  completed3DHotspots: string[];
  museum3DScore: number;
  arenaBestScore: number;
  arenaAttempts: number;
  moduleProgress: Record<CoreWingId, ModuleProgressRecord>;
  exploredWorks: string[];
  earnedBadges: BadgeRecord[];
  quizAttempts: QuizAttemptRecord[];
  completedAssignmentsCount: number;
  totalScore: number;
  lastUpdatedIso: string;
}

export interface ServiceConnectionStatus {
  gemini: {
    configured: boolean;
    mode: 'live' | 'pending';
    model: string;
  };
  firebase: {
    configured: boolean;
    mode: 'live' | 'demo';
  };
  padlet: {
    configured: boolean;
    url: string | null;
    houseEmbedUrl: string | null;
    journeyEmbedUrl: string | null;
  };
}
