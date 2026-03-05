import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useEditorStore } from '../store/editorStore';
import { v4 as uuid } from 'uuid';
import type { Project, CanvasPreset, CANVAS_PRESETS } from '../types';
import {
  Sparkles, Plus, Search, LayoutGrid, List, Moon, Sun,
  Folder, Clock, Star, Trash2, MoreHorizontal, Copy,
  Image, FileText, Gamepad2, GraduationCap, Map, BarChart3
} from 'lucide-react';

interface ProjectCard {
  id: string;
  name: string;
  updatedAt: string;
  thumbnail?: string;
  category?: string;
}

const DEMO_PROJECTS: ProjectCard[] = [
  { id: 'demo-1', name: 'Interactive Presentation', updatedAt: '2026-03-04', category: 'Presentation' },
  { id: 'demo-2', name: 'Science Quiz', updatedAt: '2026-03-03', category: 'Quiz' },
  { id: 'demo-3', name: 'World Geography Game', updatedAt: '2026-03-01', category: 'Game' },
  { id: 'demo-4', name: 'Company Infographic', updatedAt: '2026-02-28', category: 'Infographic' },
];

const TEMPLATE_CARDS = [
  { icon: FileText, label: 'Blank Presentation', preset: '16:9' as CanvasPreset },
  { icon: Image, label: 'Infographic', preset: '9:16' as CanvasPreset },
  { icon: GraduationCap, label: 'Quiz / Assessment', preset: '16:9' as CanvasPreset },
  { icon: Gamepad2, label: 'Interactive Game', preset: '16:9' as CanvasPreset },
  { icon: Map, label: 'Escape Room', preset: '16:9' as CanvasPreset },
  { icon: BarChart3, label: 'Data Report', preset: 'A4' as CanvasPreset },
];

function getLocalProjects(): ProjectCard[] {
  try {
    const raw = localStorage.getItem('gleamio-projects');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProjectList(projects: ProjectCard[]) {
  localStorage.setItem('gleamio-projects', JSON.stringify(projects));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { resolved, setTheme } = useThemeStore();
  const setProject = useEditorStore((s) => s.setProject);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
  const savedProjects = getLocalProjects();
  const projects = isDemo ? DEMO_PROJECTS : savedProjects;
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function createNewProject(preset: CanvasPreset = '16:9') {
    const presets: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1920, height: 1080 },
      '4:3': { width: 1440, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      'A4': { width: 1123, height: 1587 },
      'square': { width: 1080, height: 1080 },
      'custom': { width: 1920, height: 1080 },
    };
    const dim = presets[preset] || presets['16:9'];
    const id = uuid();
    const project: Project = {
      id,
      name: 'Untitled Project',
      pages: [{
        id: uuid(),
        name: 'Page 1',
        order: 0,
        width: dim.width,
        height: dim.height,
        background: { type: 'solid', color: resolved === 'dark' ? '#1f1f1f' : '#ffffff' },
        elements: [],
        transition: 'fade',
        transitionDuration: 500,
      }],
      navigationMode: 'linear',
      canvasPreset: preset,
      canvasWidth: dim.width,
      canvasHeight: dim.height,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Save to local storage
    const list = getLocalProjects();
    list.unshift({ id, name: project.name, updatedAt: project.updatedAt, category: 'Presentation' });
    saveLocalProjectList(list);
    localStorage.setItem(`gleamio-project-${id}`, JSON.stringify(project));
    setProject(project);
    navigate(`/editor/${id}`);
  }

  function openProject(id: string) {
    const raw = localStorage.getItem(`gleamio-project-${id}`);
    if (raw) {
      setProject(JSON.parse(raw));
    }
    navigate(`/editor/${id}`);
  }

  function deleteProject(id: string) {
    const list = getLocalProjects().filter((p) => p.id !== id);
    saveLocalProjectList(list);
    localStorage.removeItem(`gleamio-project-${id}`);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors">
      {/* ── Topbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-surface-950/80 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Sparkles className="w-6 h-6 text-gleam-500" />
            <span className="text-lg font-display font-bold tracking-tight">Gleamio</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="btn-ghost btn-icon"
            >
              {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => createNewProject()} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Create from template ─────────────────── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Create New</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TEMPLATE_CARDS.map((t) => (
              <button
                key={t.label}
                onClick={() => createNewProject(t.preset)}
                className="panel-flat p-4 text-center hover:border-gleam-400 dark:hover:border-gleam-600
                  hover:shadow-sm transition-all duration-200 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-gleam-100 dark:bg-gleam-900/40 flex items-center
                  justify-center mx-auto mb-3 group-hover:bg-gleam-200 dark:group-hover:bg-gleam-800/40 transition-colors">
                  <t.icon className="w-5 h-5 text-gleam-600 dark:text-gleam-400" />
                </div>
                <p className="text-xs font-medium text-surface-600 dark:text-surface-300">{t.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Search & View Toggle ─────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">My Projects</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 w-56"
              />
            </div>
            <div className="flex rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid'
                  ? 'bg-gleam-100 dark:bg-gleam-900/40 text-gleam-600'
                  : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list'
                  ? 'bg-gleam-100 dark:bg-gleam-900/40 text-gleam-600'
                  : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Project Grid ─────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Folder className="w-16 h-16 text-surface-300 dark:text-surface-700 mx-auto mb-4" />
            <p className="text-surface-500 dark:text-surface-400 text-lg font-medium">No projects yet</p>
            <p className="text-surface-400 dark:text-surface-600 text-sm mt-1">
              Create your first project to get started
            </p>
            <button onClick={() => createNewProject()} className="btn-primary mt-6 text-sm">
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="panel overflow-hidden group hover:shadow-soft-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => openProject(p.id)}
              >
                <div className="aspect-video bg-surface-100 dark:bg-surface-800 flex items-center justify-center relative">
                  <Sparkles className="w-10 h-10 text-surface-300 dark:text-surface-600" />
                  {p.category && (
                    <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full
                      bg-gleam-100 dark:bg-gleam-900/50 text-gleam-700 dark:text-gleam-300">
                      {p.category}
                    </span>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-surface-800/90 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="panel flex items-center gap-4 p-3 hover:shadow-soft transition-shadow cursor-pointer"
                onClick={() => openProject(p.id)}
              >
                <div className="w-16 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-surface-300 dark:text-surface-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-surface-400">{p.category}</p>
                </div>
                <p className="text-xs text-surface-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(p.updatedAt).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                  className="btn-ghost btn-icon text-surface-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
