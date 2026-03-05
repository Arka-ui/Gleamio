import { useEditorStore } from '../../store/editorStore';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function BottomBar() {
  const { zoom, zoomIn, zoomOut, zoomFit, getActivePage, project, activePageId } = useEditorStore();
  const page = getActivePage();
  const pageIndex = project.pages.findIndex((p) => p.id === activePageId);

  return (
    <div className="h-8 flex items-center justify-between px-4 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 text-xs text-surface-500 flex-shrink-0 select-none">
      <div className="flex items-center gap-4">
        <span>
          Page {pageIndex + 1} of {project.pages.length}
        </span>
        <span>•</span>
        <span>{page.width} × {page.height}</span>
        <span>•</span>
        <span>{page.elements.length} element{page.elements.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={zoomOut} className="p-0.5 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <input
          type="range"
          min="10"
          max="500"
          value={Math.round(zoom * 100)}
          onChange={(e) => useEditorStore.getState().setZoom(parseInt(e.target.value) / 100)}
          className="w-24 h-1 bg-surface-200 dark:bg-surface-700 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:bg-gleam-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <button onClick={zoomIn} className="p-0.5 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={zoomFit} className="p-0.5 hover:text-surface-700 dark:hover:text-surface-300 transition-colors" title="Fit to Screen">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
