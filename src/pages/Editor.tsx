import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import EditorToolbar from '../components/editor/EditorToolbar';
import LeftPanel from '../components/editor/LeftPanel';
import RightPanel from '../components/editor/RightPanel';
import Canvas from '../components/editor/Canvas';
import BottomBar from '../components/editor/BottomBar';

export default function Editor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { project, setProject, undo, redo, deleteElements, selectedElementIds, duplicateElements } = useEditorStore();
  const showLeftPanel = useEditorStore((s) => s.showLeftPanel);
  const showRightPanel = useEditorStore((s) => s.showRightPanel);

  // Load project from local storage if needed
  useEffect(() => {
    if (projectId && projectId !== project.id) {
      const raw = localStorage.getItem(`gleamio-project-${projectId}`);
      if (raw) {
        try {
          setProject(JSON.parse(raw));
        } catch {
          // Invalid data, stay on current project
        }
      }
    }
  }, [projectId]);

  // Auto-save to local storage
  useEffect(() => {
    const timer = setInterval(() => {
      if (project.id) {
        localStorage.setItem(`gleamio-project-${project.id}`, JSON.stringify(project));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [project]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
      // Don't delete if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      e.preventDefault();
      deleteElements(selectedElementIds);
    }
    if (ctrl && e.key === 'd') {
      e.preventDefault();
      if (selectedElementIds.length > 0) duplicateElements(selectedElementIds);
    }
  }, [undo, redo, deleteElements, selectedElementIds, duplicateElements]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col bg-surface-100 dark:bg-surface-950 overflow-hidden">
      {/* Top Toolbar */}
      <EditorToolbar />

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {showLeftPanel && (
          <div className="w-72 flex-shrink-0 border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden">
            <LeftPanel />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
        </div>

        {/* Right Panel */}
        {showRightPanel && (
          <div className="w-72 flex-shrink-0 border-l border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 overflow-hidden">
            <RightPanel />
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <BottomBar />
    </div>
  );
}
