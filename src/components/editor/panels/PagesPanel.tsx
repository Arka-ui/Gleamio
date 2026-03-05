import { useEditorStore } from '../../../store/editorStore';
import { Plus, Copy, Trash2, GripVertical, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function PagesPanel() {
  const { project, activePageId, setActivePage, addPage, deletePage, duplicatePage, reorderPages } = useEditorStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      reorderPages(dragIndex, index);
      setDragIndex(index);
    }
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  function getPageBgColor(page: typeof project.pages[0]): string {
    if (page.background.type === 'solid') return page.background.color || '#ffffff';
    if (page.background.type === 'gradient') return '#667eea';
    return '#f5f5f5';
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Pages</h3>
        <button onClick={addPage} className="btn-ghost btn-icon" title="Add Page">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {project.pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => setActivePage(page.id)}
            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-150
              ${activePageId === page.id
                ? 'bg-gleam-50 dark:bg-gleam-900/20 border border-gleam-300 dark:border-gleam-700'
                : 'hover:bg-surface-100 dark:hover:bg-surface-800 border border-transparent'
              }`}
          >
            <GripVertical className="w-3.5 h-3.5 text-surface-300 dark:text-surface-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />

            {/* Page thumbnail */}
            <div
              className="w-16 h-10 rounded border border-surface-200 dark:border-surface-700 flex-shrink-0 relative overflow-hidden"
              style={{ backgroundColor: getPageBgColor(page) }}
            >
              <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-surface-400 bg-white/80 dark:bg-surface-900/80 px-1 rounded">
                {index + 1}
              </span>
              {/* Mini elements preview */}
              {page.elements.slice(0, 3).map((el) => (
                <div
                  key={el.id}
                  className="absolute bg-surface-400/30 dark:bg-surface-500/30 rounded-[1px]"
                  style={{
                    left: `${(el.x / page.width) * 100}%`,
                    top: `${(el.y / page.height) * 100}%`,
                    width: `${Math.max(4, (el.width / page.width) * 100)}%`,
                    height: `${Math.max(4, (el.height / page.height) * 100)}%`,
                  }}
                />
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{page.name}</p>
              <p className="text-[10px] text-surface-400">{page.elements.length} elements</p>
            </div>

            {/* Actions */}
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}
                className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
              {project.pages.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-surface-400 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
