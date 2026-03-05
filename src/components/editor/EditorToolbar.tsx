import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';
import {
  Sparkles, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Moon, Sun, Eye, Save, Download, Share2, Settings,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  Play, Grid3X3, Ruler, Magnet, MoreHorizontal
} from 'lucide-react';
import { useState } from 'react';

export default function EditorToolbar() {
  const navigate = useNavigate();
  const { resolved, setTheme } = useThemeStore();
  const {
    project, undo, redo, zoom, zoomIn, zoomOut, zoomFit,
    showGrid, showRulers, snapEnabled, toggleGrid, toggleRulers, toggleSnap,
    showLeftPanel, showRightPanel, toggleLeftPanel, toggleRightPanel,
    history, historyIndex,
  } = useEditorStore();

  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  function handleSave() {
    localStorage.setItem(`gleamio-project-${project.id}`, JSON.stringify(project));
    // Update project list
    try {
      const raw = localStorage.getItem('gleamio-projects');
      const list = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((p: any) => p.id === project.id);
      if (idx >= 0) {
        list[idx].name = project.name;
        list[idx].updatedAt = new Date().toISOString();
      }
      localStorage.setItem('gleamio-projects', JSON.stringify(list));
    } catch {}
  }

  function handleExportJSON() {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'gleamio-project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <header className="h-12 flex items-center justify-between px-3 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex-shrink-0 select-none">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-2"
        >
          <Sparkles className="w-5 h-5 text-gleam-500" />
          <span className="text-sm font-display font-bold tracking-tight hidden sm:inline">Gleamio</span>
        </button>

        <div className="h-5 w-px bg-surface-200 dark:bg-surface-700 mx-1" />

        {/* Project name */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white
              px-2 py-1 rounded-md hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors max-w-[200px] truncate"
          >
            {project.name}
          </button>
        </div>

        <div className="h-5 w-px bg-surface-200 dark:bg-surface-700 mx-1" />

        {/* Undo/Redo */}
        <button onClick={undo} disabled={!canUndo} className="btn-ghost btn-icon" title="Undo (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={!canRedo} className="btn-ghost btn-icon" title="Redo (Ctrl+Y)">
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center section – Canvas controls */}
      <div className="flex items-center gap-1">
        <button onClick={toggleGrid} className={`btn-ghost btn-icon ${showGrid ? 'text-gleam-500 bg-gleam-50 dark:bg-gleam-900/30' : ''}`} title="Toggle Grid">
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button onClick={toggleRulers} className={`btn-ghost btn-icon ${showRulers ? 'text-gleam-500 bg-gleam-50 dark:bg-gleam-900/30' : ''}`} title="Toggle Rulers">
          <Ruler className="w-4 h-4" />
        </button>
        <button onClick={toggleSnap} className={`btn-ghost btn-icon ${snapEnabled ? 'text-gleam-500 bg-gleam-50 dark:bg-gleam-900/30' : ''}`} title="Toggle Snap">
          <Magnet className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-surface-200 dark:bg-surface-700 mx-1" />

        {/* Zoom */}
        <button onClick={zoomOut} className="btn-ghost btn-icon" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-surface-500 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} className="btn-ghost btn-icon" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={zoomFit} className="btn-ghost btn-icon" title="Fit to Screen">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <button onClick={toggleLeftPanel} className="btn-ghost btn-icon" title="Toggle Left Panel">
          {showLeftPanel ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>
        <button onClick={toggleRightPanel} className="btn-ghost btn-icon" title="Toggle Right Panel">
          {showRightPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>

        <div className="h-5 w-px bg-surface-200 dark:bg-surface-700 mx-1" />

        <button
          onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
          className="btn-ghost btn-icon"
          title="Toggle Theme"
        >
          {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button onClick={handleSave} className="btn-ghost btn-icon" title="Save (Ctrl+S)">
          <Save className="w-4 h-4" />
        </button>
        <button onClick={handleExportJSON} className="btn-ghost btn-icon" title="Export JSON">
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            handleSave();
            window.open(`/view/${project.id}`, '_blank');
          }}
          className="btn-primary text-xs px-3 py-1.5 ml-1"
        >
          <Play className="w-3.5 h-3.5" />
          Preview
        </button>
      </div>
    </header>
  );
}
