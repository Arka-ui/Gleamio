/* ============================================================
   Gleamio — Core Type Definitions
   ============================================================ */

// ── Element Types ───────────────────────────────────────────

export type ElementType =
  | 'text'
  | 'image'
  | 'shape'
  | 'icon'
  | 'video'
  | 'audio'
  | 'table'
  | 'chart'
  | 'iframe'
  | 'button'
  | 'group'
  | 'widget';

export type ShapeKind = 'rectangle' | 'circle' | 'triangle' | 'star' | 'polygon' | 'arrow' | 'line' | 'custom';

export interface GleamElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  name: string;
  groupId?: string;

  // Type-specific props
  content?: string;          // text content / HTML
  src?: string;              // image/video/audio URL
  shapeKind?: ShapeKind;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  iframeSrc?: string;
  chartData?: unknown;
  widgetType?: WidgetType;
  widgetConfig?: Record<string, unknown>;

  // Interactions
  interactions?: Interaction[];

  // Animations
  animations?: ElementAnimation[];

  // Mask / crop
  clipPath?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

// ── Interactions ────────────────────────────────────────────

export type TriggerType = 'click' | 'hover' | 'timer' | 'widgetResult';

export type ActionType =
  | 'openModal'
  | 'showTooltip'
  | 'goToPage'
  | 'scrollToAnchor'
  | 'openUrl'
  | 'zoomFullscreen'
  | 'playSound'
  | 'fireEffect'
  | 'showHideElement'
  | 'dragDrop'
  | 'paintMode';

export type VisualEffect = 'confetti' | 'fireworks' | 'snow' | 'hearts' | 'stars';

export interface Interaction {
  id: string;
  trigger: TriggerType;
  action: ActionType;
  // Action configuration
  targetPageId?: string;
  targetElementId?: string;
  url?: string;
  modalContent?: string;
  tooltipText?: string;
  soundUrl?: string;
  effectType?: VisualEffect;
  showOrHide?: 'show' | 'hide' | 'toggle';
  timerDelay?: number;
  dragTargetZone?: string;
  isCorrect?: boolean;
}

// ── Animations ──────────────────────────────────────────────

export type AnimationStage = 'entrance' | 'exit' | 'continuous' | 'hover';

export type AnimationEffect =
  | 'fadeIn' | 'fadeOut'
  | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown'
  | 'zoomIn' | 'zoomOut'
  | 'bounce' | 'pulse' | 'shake' | 'flip' | 'rotate'
  | 'typewriter' | 'blur';

export interface ElementAnimation {
  id: string;
  stage: AnimationStage;
  effect: AnimationEffect;
  duration: number;     // ms
  delay: number;        // ms
  speed: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right' | 'up' | 'down';
}

// ── Pages ───────────────────────────────────────────────────

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video';
export type TransitionType =
  | 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'cube' | 'spin' | 'zoom' | 'flip' | 'dissolve' | 'wipe'
  | 'push' | 'cover' | 'uncover' | 'morph' | 'iris';

export interface PageBackground {
  type: BackgroundType;
  color?: string;
  gradient?: string;
  imageSrc?: string;
  videoSrc?: string;
}

export interface Page {
  id: string;
  name: string;
  order: number;
  width: number;
  height: number;
  background: PageBackground;
  elements: GleamElement[];
  transition: TransitionType;
  transitionDuration: number;  // ms
  notes?: string;
  autoPlayDuration?: number;   // ms, for autoplay mode
}

// ── Canvas Dimensions Presets ───────────────────────────────

export type CanvasPreset = '16:9' | '4:3' | '9:16' | 'A4' | 'square' | 'custom';

export const CANVAS_PRESETS: Record<CanvasPreset, { width: number; height: number; label: string }> = {
  '16:9':  { width: 1920, height: 1080, label: 'Widescreen (16:9)' },
  '4:3':   { width: 1440, height: 1080, label: 'Standard (4:3)' },
  '9:16':  { width: 1080, height: 1920, label: 'Mobile (9:16)' },
  'A4':    { width: 1123, height: 1587, label: 'A4 Document' },
  'square':{ width: 1080, height: 1080, label: 'Square' },
  'custom':{ width: 1920, height: 1080, label: 'Custom' },
};

// ── Project / Navigation ────────────────────────────────────

export type NavigationMode = 'linear' | 'microsite' | 'branching' | 'autoplay';

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  pages: Page[];
  navigationMode: NavigationMode;
  canvasPreset: CanvasPreset;
  canvasWidth: number;
  canvasHeight: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
  isPublic?: boolean;
}

// ── Quiz Types ──────────────────────────────────────────────

export type QuizQuestionType =
  | 'multipleChoice'
  | 'trueFalse'
  | 'imageChoice'
  | 'openEnded'
  | 'fillBlank'
  | 'sequencing'
  | 'dragMatch'
  | 'rating';

export interface QuizOption {
  id: string;
  text: string;
  imageSrc?: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: QuizOption[];
  correctOrder?: string[];     // for sequencing
  correctPairs?: Record<string, string>; // for drag-match
  explanation?: string;
  points: number;
  timeLimit?: number;          // seconds
  allowRetry: boolean;
}

// ── Widgets ─────────────────────────────────────────────────

export type WidgetType =
  | 'randomizer'
  | 'coinFlip'
  | 'dice'
  | 'imageCompare'
  | 'countdown'
  | 'flipCard'
  | 'swipeCarousel'
  | 'worldMap'
  | 'scoreboard';

// ── Collaboration ───────────────────────────────────────────

export interface Collaborator {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number; pageId: string };
}

export type AccessRole = 'owner' | 'admin' | 'editor' | 'viewer';

// ── Template ────────────────────────────────────────────────

export type TemplateCategory =
  | 'presentation'
  | 'infographic'
  | 'quiz'
  | 'game'
  | 'escape-room'
  | 'course'
  | 'brochure'
  | 'social'
  | 'report'
  | 'other';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: TemplateCategory;
  tags: string[];
  project: Project;
}
