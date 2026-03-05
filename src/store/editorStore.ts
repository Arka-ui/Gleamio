import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Project, Page, GleamElement, NavigationMode, CanvasPreset, CANVAS_PRESETS } from '../types';

/* ── History (Undo / Redo) ─────────────────────────────────── */

interface HistoryEntry {
  pages: Page[];
}

/* ── Editor Store ──────────────────────────────────────────── */

interface EditorState {
  // Project
  project: Project;
  isDirty: boolean;

  // Selection
  selectedElementIds: string[];
  activePageId: string;

  // Canvas viewport
  zoom: number;
  panX: number;
  panY: number;

  // UI toggles
  showGrid: boolean;
  showRulers: boolean;
  snapEnabled: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  leftPanelTab: 'pages' | 'elements' | 'assets' | 'templates';
  rightPanelTab: 'properties' | 'interactions' | 'animations';

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // Actions – Project
  setProject: (p: Project) => void;
  updateProjectMeta: (meta: Partial<Pick<Project, 'name' | 'description' | 'navigationMode' | 'canvasPreset' | 'canvasWidth' | 'canvasHeight'>>) => void;

  // Actions – Pages
  addPage: () => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setActivePage: (pageId: string) => void;
  updatePageBackground: (pageId: string, bg: Partial<Page['background']>) => void;
  updatePageTransition: (pageId: string, transition: Page['transition'], duration?: number) => void;

  // Actions – Elements
  addElement: (el: Partial<GleamElement>) => void;
  updateElement: (id: string, updates: Partial<GleamElement>) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  moveElements: (ids: string[], dx: number, dy: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  lockElement: (id: string, locked: boolean) => void;
  groupElements: (ids: string[]) => void;
  ungroupElements: (groupId: string) => void;

  // Actions – Canvas
  setZoom: (z: number) => void;
  setPan: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;

  // Actions – UI Panels
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: EditorState['leftPanelTab']) => void;
  setRightPanelTab: (tab: EditorState['rightPanelTab']) => void;

  // Actions – History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Helpers
  getActivePage: () => Page;
  getElement: (id: string) => GleamElement | undefined;
}

function createDefaultPage(order: number): Page {
  return {
    id: uuid(),
    name: `Page ${order + 1}`,
    order,
    width: 1920,
    height: 1080,
    background: { type: 'solid', color: '#ffffff' },
    elements: [],
    transition: 'fade',
    transitionDuration: 500,
  };
}

function createDefaultProject(): Project {
  const firstPage = createDefaultPage(0);
  return {
    id: uuid(),
    name: 'Untitled Project',
    pages: [firstPage],
    navigationMode: 'linear',
    canvasPreset: '16:9',
    canvasWidth: 1920,
    canvasHeight: 1080,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const useEditorStore = create<EditorState>((set, get) => {
  const defaultProject = createDefaultProject();

  return {
    project: defaultProject,
    isDirty: false,
    selectedElementIds: [],
    activePageId: defaultProject.pages[0].id,
    zoom: 0.5,
    panX: 0,
    panY: 0,
    showGrid: false,
    showRulers: true,
    snapEnabled: true,
    showLeftPanel: true,
    showRightPanel: true,
    leftPanelTab: 'pages',
    rightPanelTab: 'properties',
    history: [],
    historyIndex: -1,

    setProject: (p) => set({ project: p, activePageId: p.pages[0]?.id, isDirty: false }),

    updateProjectMeta: (meta) => set((s) => ({
      project: { ...s.project, ...meta, updatedAt: new Date().toISOString() },
      isDirty: true,
    })),

    // ── Pages ──

    addPage: () => {
      const s = get();
      const newPage = createDefaultPage(s.project.pages.length);
      newPage.width = s.project.canvasWidth;
      newPage.height = s.project.canvasHeight;
      s.pushHistory();
      set({
        project: { ...s.project, pages: [...s.project.pages, newPage] },
        activePageId: newPage.id,
        isDirty: true,
      });
    },

    deletePage: (pageId) => {
      const s = get();
      if (s.project.pages.length <= 1) return;
      s.pushHistory();
      const pages = s.project.pages.filter((p) => p.id !== pageId).map((p, i) => ({ ...p, order: i }));
      const newActive = s.activePageId === pageId ? pages[0].id : s.activePageId;
      set({ project: { ...s.project, pages }, activePageId: newActive, isDirty: true });
    },

    duplicatePage: (pageId) => {
      const s = get();
      const page = s.project.pages.find((p) => p.id === pageId);
      if (!page) return;
      s.pushHistory();
      const dup: Page = {
        ...JSON.parse(JSON.stringify(page)),
        id: uuid(),
        name: `${page.name} (copy)`,
        order: s.project.pages.length,
        elements: page.elements.map((el) => ({ ...el, id: uuid() })),
      };
      set({
        project: { ...s.project, pages: [...s.project.pages, dup] },
        activePageId: dup.id,
        isDirty: true,
      });
    },

    reorderPages: (from, to) => {
      const s = get();
      const pages = [...s.project.pages];
      const [moved] = pages.splice(from, 1);
      pages.splice(to, 0, moved);
      set({ project: { ...s.project, pages: pages.map((p, i) => ({ ...p, order: i })) }, isDirty: true });
    },

    setActivePage: (pageId) => set({ activePageId: pageId, selectedElementIds: [] }),

    updatePageBackground: (pageId, bg) => set((s) => ({
      project: {
        ...s.project,
        pages: s.project.pages.map((p) =>
          p.id === pageId ? { ...p, background: { ...p.background, ...bg } } : p
        ),
      },
      isDirty: true,
    })),

    updatePageTransition: (pageId, transition, duration) => set((s) => ({
      project: {
        ...s.project,
        pages: s.project.pages.map((p) =>
          p.id === pageId ? { ...p, transition, ...(duration !== undefined ? { transitionDuration: duration } : {}) } : p
        ),
      },
      isDirty: true,
    })),

    // ── Elements ──

    addElement: (el) => {
      const s = get();
      s.pushHistory();
      const page = s.project.pages.find((p) => p.id === s.activePageId);
      if (!page) return;
      const maxZ = page.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
      const newEl: GleamElement = {
        id: uuid(),
        type: 'text',
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        name: el.type || 'Element',
        ...el,
      };
      set({
        project: {
          ...s.project,
          pages: s.project.pages.map((p) =>
            p.id === s.activePageId ? { ...p, elements: [...p.elements, newEl] } : p
          ),
        },
        selectedElementIds: [newEl.id],
        isDirty: true,
      });
    },

    updateElement: (id, updates) => set((s) => ({
      project: {
        ...s.project,
        pages: s.project.pages.map((p) =>
          p.id === s.activePageId
            ? { ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)) }
            : p
        ),
      },
      isDirty: true,
    })),

    deleteElements: (ids) => {
      const s = get();
      s.pushHistory();
      set({
        project: {
          ...s.project,
          pages: s.project.pages.map((p) =>
            p.id === s.activePageId
              ? { ...p, elements: p.elements.filter((e) => !ids.includes(e.id)) }
              : p
          ),
        },
        selectedElementIds: [],
        isDirty: true,
      });
    },

    duplicateElements: (ids) => {
      const s = get();
      const page = s.project.pages.find((p) => p.id === s.activePageId);
      if (!page) return;
      s.pushHistory();
      const maxZ = page.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
      const newEls = page.elements
        .filter((e) => ids.includes(e.id))
        .map((e, i) => ({
          ...JSON.parse(JSON.stringify(e)),
          id: uuid(),
          x: e.x + 20,
          y: e.y + 20,
          zIndex: maxZ + i + 1,
          name: `${e.name} (copy)`,
        }));
      set({
        project: {
          ...s.project,
          pages: s.project.pages.map((p) =>
            p.id === s.activePageId ? { ...p, elements: [...p.elements, ...newEls] } : p
          ),
        },
        selectedElementIds: newEls.map((e) => e.id),
        isDirty: true,
      });
    },

    setSelectedElements: (ids) => set({ selectedElementIds: ids }),

    moveElements: (ids, dx, dy) => set((s) => ({
      project: {
        ...s.project,
        pages: s.project.pages.map((p) =>
          p.id === s.activePageId
            ? {
                ...p,
                elements: p.elements.map((e) =>
                  ids.includes(e.id) && !e.locked ? { ...e, x: e.x + dx, y: e.y + dy } : e
                ),
              }
            : p
        ),
      },
      isDirty: true,
    })),

    bringForward: (id) => {
      const s = get();
      const page = s.getActivePage();
      const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((e) => e.id === id);
      if (idx < sorted.length - 1) {
        const cur = sorted[idx].zIndex;
        sorted[idx].zIndex = sorted[idx + 1].zIndex;
        sorted[idx + 1].zIndex = cur;
        set((s2) => ({
          project: {
            ...s2.project,
            pages: s2.project.pages.map((p) =>
              p.id === s2.activePageId ? { ...p, elements: sorted } : p
            ),
          },
          isDirty: true,
        }));
      }
    },

    sendBackward: (id) => {
      const s = get();
      const page = s.getActivePage();
      const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((e) => e.id === id);
      if (idx > 0) {
        const cur = sorted[idx].zIndex;
        sorted[idx].zIndex = sorted[idx - 1].zIndex;
        sorted[idx - 1].zIndex = cur;
        set((s2) => ({
          project: {
            ...s2.project,
            pages: s2.project.pages.map((p) =>
              p.id === s2.activePageId ? { ...p, elements: sorted } : p
            ),
          },
          isDirty: true,
        }));
      }
    },

    bringToFront: (id) => set((s) => {
      const page = s.project.pages.find((p) => p.id === s.activePageId);
      if (!page) return s;
      const maxZ = page.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
      return {
        project: {
          ...s.project,
          pages: s.project.pages.map((p) =>
            p.id === s.activePageId
              ? { ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, zIndex: maxZ + 1 } : e)) }
              : p
          ),
        },
        isDirty: true,
      };
    }),

    sendToBack: (id) => set((s) => {
      const page = s.project.pages.find((p) => p.id === s.activePageId);
      if (!page) return s;
      const minZ = page.elements.reduce((min, e) => Math.min(min, e.zIndex), Infinity);
      return {
        project: {
          ...s.project,
          pages: s.project.pages.map((p) =>
            p.id === s.activePageId
              ? { ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, zIndex: minZ - 1 } : e)) }
              : p
          ),
        },
        isDirty: true,
      };
    }),

    lockElement: (id, locked) => set((s) => ({
      project: {
        ...s.project,
        pages: s.project.pages.map((p) =>
          p.id === s.activePageId
            ? { ...p, elements: p.elements.map((e) => (e.id === id ? { ...e, locked } : e)) }
            : p
        ),
      },
    })),

    groupElements: (ids) => {
      if (ids.length < 2) return;
      const groupId = uuid();
      set((s) => ({
        project: {
          ...s.project,
          pages: s.project.pages.map((p) =>
            p.id === s.activePageId
              ? { ...p, elements: p.elements.map((e) => (ids.includes(e.id) ? { ...e, groupId } : e)) }
              : p
          ),
        },
        isDirty: true,
      }));
    },

    ungroupElements: (groupId) => set((s) => ({
      project: {
        ...s.project,
        pages: s.project.pages.map((p) =>
          p.id === s.activePageId
            ? { ...p, elements: p.elements.map((e) => (e.groupId === groupId ? { ...e, groupId: undefined } : e)) }
            : p
        ),
      },
      isDirty: true,
    })),

    // ── Canvas ──

    setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(5, z)) }),
    setPan: (x, y) => set({ panX: x, panY: y }),
    zoomIn: () => set((s) => ({ zoom: Math.min(5, s.zoom + 0.1) })),
    zoomOut: () => set((s) => ({ zoom: Math.max(0.1, s.zoom - 0.1) })),
    zoomFit: () => set({ zoom: 0.5, panX: 0, panY: 0 }),

    toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
    toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
    toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

    // ── Panels ──

    toggleLeftPanel: () => set((s) => ({ showLeftPanel: !s.showLeftPanel })),
    toggleRightPanel: () => set((s) => ({ showRightPanel: !s.showRightPanel })),
    setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
    setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

    // ── History ──

    pushHistory: () => {
      const s = get();
      const entry: HistoryEntry = {
        pages: JSON.parse(JSON.stringify(s.project.pages)),
      };
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(entry);
      if (newHistory.length > 50) newHistory.shift();
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },

    undo: () => {
      const s = get();
      if (s.historyIndex < 0) return;
      const entry = s.history[s.historyIndex];
      set({
        project: { ...s.project, pages: entry.pages },
        historyIndex: s.historyIndex - 1,
      });
    },

    redo: () => {
      const s = get();
      if (s.historyIndex >= s.history.length - 1) return;
      const entry = s.history[s.historyIndex + 1];
      set({
        project: { ...s.project, pages: entry.pages },
        historyIndex: s.historyIndex + 1,
      });
    },

    // ── Helpers ──

    getActivePage: () => {
      const s = get();
      return s.project.pages.find((p) => p.id === s.activePageId) || s.project.pages[0];
    },

    getElement: (id) => {
      const s = get();
      const page = s.project.pages.find((p) => p.id === s.activePageId);
      return page?.elements.find((e) => e.id === id);
    },
  };
});
