import { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import CanvasElement from './CanvasElement';
import type { GleamElement } from '../../types';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    zoom, panX, panY, setPan, setZoom,
    showGrid, showRulers,
    selectedElementIds, setSelectedElements,
    getActivePage, addElement, moveElements, pushHistory,
  } = useEditorStore();

  const page = getActivePage();
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, px: 0, py: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // ── Wheel zoom ──
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(zoom + delta);
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPan]);

  // ── Middle-click or Space+click pan ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button for panning
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, px: panX, py: panY });
      return;
    }

    // Left click on canvas background = deselect or start selection rect
    if (e.button === 0 && e.target === e.currentTarget) {
      setSelectedElements([]);
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setSelectionRect({ x: e.clientX - rect.left, y: e.clientY - rect.top, w: 0, h: 0 });
      }
    }
  }, [panX, panY, setSelectedElements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan(panStart.px + (e.clientX - panStart.x), panStart.py + (e.clientY - panStart.y));
    }
    if (isDragging && selectionRect) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        setSelectionRect({
          x: Math.min(dragStart.x, cx),
          y: Math.min(dragStart.y, cy),
          w: Math.abs(cx - dragStart.x),
          h: Math.abs(cy - dragStart.y),
        });
      }
    }
  }, [isPanning, isDragging, selectionRect, panStart, dragStart, setPan]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) setIsPanning(false);
    if (isDragging) {
      setIsDragging(false);
      // Find elements within selection rect
      if (selectionRect && selectionRect.w > 5 && selectionRect.h > 5) {
        const canvasEl = containerRef.current;
        if (canvasEl) {
          // Calculate selection in canvas coordinates
          const rect = canvasEl.getBoundingClientRect();
          const selIds = page.elements.filter((el) => {
            const elScreenX = el.x * zoom + panX + rect.width / 2 - (page.width * zoom) / 2;
            const elScreenY = el.y * zoom + panY + rect.height / 2 - (page.height * zoom) / 2;
            const elScreenW = el.width * zoom;
            const elScreenH = el.height * zoom;
            return (
              elScreenX < selectionRect.x + selectionRect.w &&
              elScreenX + elScreenW > selectionRect.x &&
              elScreenY < selectionRect.y + selectionRect.h &&
              elScreenY + elScreenH > selectionRect.y
            );
          }).map((el) => el.id);
          if (selIds.length > 0) setSelectedElements(selIds);
        }
      }
      setSelectionRect(null);
    }
  }, [isPanning, isDragging, selectionRect, zoom, panX, panY, page, setSelectedElements]);

  // Background style
  function getPageBg() {
    switch (page.background.type) {
      case 'solid': return { backgroundColor: page.background.color || '#ffffff' };
      case 'gradient': return { background: page.background.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
      case 'image': return {
        backgroundImage: `url(${page.background.imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
      default: return { backgroundColor: '#ffffff' };
    }
  }

  // Drop handler for drag-and-drop from asset panel
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/gleamio-element');
    if (data) {
      try {
        const partialEl = JSON.parse(data) as Partial<GleamElement>;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const canvasOffsetX = rect.width / 2 - (page.width * zoom) / 2 + panX;
          const canvasOffsetY = rect.height / 2 - (page.height * zoom) / 2 + panY;
          const x = (e.clientX - rect.left - canvasOffsetX) / zoom;
          const y = (e.clientY - rect.top - canvasOffsetY) / zoom;
          addElement({ ...partialEl, x, y });
        }
      } catch {}
    }
  }, [zoom, panX, panY, page, addElement]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Grid background */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${panX}px ${panY}px`,
          }}
        />
      )}

      {/* Rulers */}
      {showRulers && (
        <>
          <div className="absolute top-0 left-0 right-0 h-6 bg-surface-100 dark:bg-surface-850 border-b border-surface-200 dark:border-surface-800 z-10 flex items-end overflow-hidden">
            {Array.from({ length: Math.ceil(2000 / (100 * zoom)) }).map((_, i) => {
              const pos = i * 100 * zoom + panX % (100 * zoom);
              return (
                <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: pos }}>
                  <span className="text-[8px] text-surface-400 font-mono">{Math.round((pos - panX) / zoom)}</span>
                  <div className="w-px h-2 bg-surface-300 dark:bg-surface-600" />
                </div>
              );
            })}
          </div>
          <div className="absolute top-6 left-0 bottom-0 w-6 bg-surface-100 dark:bg-surface-850 border-r border-surface-200 dark:border-surface-800 z-10 overflow-hidden">
            {Array.from({ length: Math.ceil(2000 / (100 * zoom)) }).map((_, i) => {
              const pos = i * 100 * zoom + panY % (100 * zoom);
              return (
                <div key={i} className="absolute left-0 flex items-center gap-0.5" style={{ top: pos }}>
                  <div className="h-px w-2 bg-surface-300 dark:bg-surface-600" />
                  <span className="text-[8px] text-surface-400 font-mono" style={{ writingMode: 'vertical-lr' }}>
                    {Math.round((pos - panY) / zoom)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Canvas page */}
      <div
        className="absolute shadow-soft-lg transition-shadow"
        style={{
          width: page.width * zoom,
          height: page.height * zoom,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px))`,
          ...getPageBg(),
        }}
      >
        {/* Elements */}
        {page.elements
          .filter((el) => el.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <CanvasElement
              key={el.id}
              element={el}
              zoom={zoom}
              isSelected={selectedElementIds.includes(el.id)}
            />
          ))}
      </div>

      {/* Selection rectangle */}
      {selectionRect && selectionRect.w > 2 && (
        <div
          className="absolute border-2 border-gleam-400 bg-gleam-400/10 pointer-events-none z-50 rounded-sm"
          style={{
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.w,
            height: selectionRect.h,
          }}
        />
      )}
    </div>
  );
}
