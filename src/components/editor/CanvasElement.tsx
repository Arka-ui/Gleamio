import { useRef, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { GleamElement } from '../../types';

interface Props {
  element: GleamElement;
  zoom: number;
  isSelected: boolean;
}

export default function CanvasElement({ element, zoom, isSelected }: Props) {
  const { setSelectedElements, updateElement, moveElements, pushHistory, selectedElementIds } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const dragStart = useRef({ x: 0, y: 0, elX: 0, elY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, elX: 0, elY: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();

    // Select
    if (e.shiftKey) {
      const ids = selectedElementIds.includes(element.id)
        ? selectedElementIds.filter((id) => id !== element.id)
        : [...selectedElementIds, element.id];
      setSelectedElements(ids);
    } else if (!selectedElementIds.includes(element.id)) {
      setSelectedElements([element.id]);
    }

    // Start drag
    pushHistory();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, elX: element.x, elY: element.y };

    const handleDrag = (me: MouseEvent) => {
      const dx = (me.clientX - dragStart.current.x) / zoom;
      const dy = (me.clientY - dragStart.current.y) / zoom;
      updateElement(element.id, {
        x: dragStart.current.elX + dx,
        y: dragStart.current.elY + dy,
      });
    };

    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleUp);
  }, [element, zoom, selectedElementIds, setSelectedElements, updateElement, pushHistory]);

  const handleResize = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked) return;
    pushHistory();
    setIsResizing(true);
    setResizeHandle(handle);
    resizeStart.current = {
      x: e.clientX, y: e.clientY,
      w: element.width, h: element.height,
      elX: element.x, elY: element.y,
    };

    const handleDrag = (me: MouseEvent) => {
      const dx = (me.clientX - resizeStart.current.x) / zoom;
      const dy = (me.clientY - resizeStart.current.y) / zoom;
      let newW = resizeStart.current.w;
      let newH = resizeStart.current.h;
      let newX = resizeStart.current.elX;
      let newY = resizeStart.current.elY;

      if (handle.includes('e')) newW = Math.max(20, resizeStart.current.w + dx);
      if (handle.includes('w')) { newW = Math.max(20, resizeStart.current.w - dx); newX = resizeStart.current.elX + dx; }
      if (handle.includes('s')) newH = Math.max(20, resizeStart.current.h + dy);
      if (handle.includes('n')) { newH = Math.max(20, resizeStart.current.h - dy); newY = resizeStart.current.elY + dy; }

      // Shift = maintain aspect ratio
      if (me.shiftKey) {
        const ratio = resizeStart.current.w / resizeStart.current.h;
        if (handle.includes('e') || handle.includes('w')) {
          newH = newW / ratio;
        } else {
          newW = newH * ratio;
        }
      }

      updateElement(element.id, { width: newW, height: newH, x: newX, y: newY });
    };

    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleUp);
  }, [element, zoom, updateElement, pushHistory]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (element.type === 'text') {
      e.stopPropagation();
      setIsEditing(true);
    }
  }, [element.type]);

  const handleTextBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    updateElement(element.id, { content: e.currentTarget.innerHTML });
  }, [element.id, updateElement]);

  // Render element content
  function renderContent() {
    switch (element.type) {
      case 'text':
        return isEditing ? (
          <div
            contentEditable
            suppressContentEditableWarning
            className="w-full h-full outline-none"
            style={{
              fontSize: element.fontSize || 16,
              fontFamily: element.fontFamily || 'Inter',
              fontWeight: element.fontWeight || 400,
              color: element.color || (document.documentElement.classList.contains('dark') ? '#f5f5f5' : '#171717'),
              textAlign: element.textAlign || 'left',
              lineHeight: element.lineHeight || 1.5,
              letterSpacing: element.letterSpacing || 0,
            }}
            onBlur={handleTextBlur}
            dangerouslySetInnerHTML={{ __html: element.content || 'Text' }}
          />
        ) : (
          <div
            className="w-full h-full pointer-events-none select-none"
            style={{
              fontSize: element.fontSize || 16,
              fontFamily: element.fontFamily || 'Inter',
              fontWeight: element.fontWeight || 400,
              color: element.color || (document.documentElement.classList.contains('dark') ? '#f5f5f5' : '#171717'),
              textAlign: element.textAlign || 'left',
              lineHeight: element.lineHeight || 1.5,
              letterSpacing: element.letterSpacing || 0,
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: element.content || 'Text' }}
          />
        );

      case 'shape':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.fill || '#4c6ef5',
              borderRadius: element.shapeKind === 'circle' ? '50%' : (element.borderRadius || 0),
              border: element.stroke ? `${element.strokeWidth || 2}px solid ${element.stroke}` : undefined,
            }}
          />
        );

      case 'image':
        return element.src ? (
          <img
            src={element.src}
            alt={element.name}
            className="w-full h-full pointer-events-none"
            style={{
              objectFit: element.objectFit || 'cover',
              borderRadius: element.borderRadius || 0,
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-surface-200 dark:bg-surface-700 rounded-lg flex items-center justify-center">
            <span className="text-xs text-surface-400">Image</span>
          </div>
        );

      case 'button':
        return (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center font-medium text-sm text-white pointer-events-none"
            style={{ backgroundColor: element.fill || '#4c6ef5', borderRadius: element.borderRadius || 8 }}
          >
            {element.content || 'Button'}
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full bg-surface-800 rounded-lg flex items-center justify-center">
            <span className="text-xs text-surface-400">Video</span>
          </div>
        );

      case 'iframe':
        return (
          <div className="w-full h-full bg-surface-200 dark:bg-surface-700 rounded-lg flex items-center justify-center border-2 border-dashed border-surface-300 dark:border-surface-600">
            <span className="text-xs text-surface-400">Embed</span>
          </div>
        );

      case 'icon':
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: element.color || '#4c6ef5' }}
          >
            <svg className="w-3/4 h-3/4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-surface-100 dark:bg-surface-800 rounded border border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center">
            <span className="text-xs text-surface-400 capitalize">{element.type}</span>
          </div>
        );
    }
  }

  return (
    <div
      className={`canvas-element ${isSelected ? 'selected' : ''} ${element.locked ? 'cursor-not-allowed' : 'cursor-move'}`}
      style={{
        left: element.x * zoom,
        top: element.y * zoom,
        width: element.width * zoom,
        height: element.height * zoom,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}

      {/* Resize handles */}
      {isSelected && !element.locked && (
        <>
          {/* Corner handles */}
          <div className="resize-handle -top-1.5 -left-1.5 cursor-nw-resize" onMouseDown={(e) => handleResize(e, 'nw')} />
          <div className="resize-handle -top-1.5 -right-1.5 cursor-ne-resize" onMouseDown={(e) => handleResize(e, 'ne')} />
          <div className="resize-handle -bottom-1.5 -left-1.5 cursor-sw-resize" onMouseDown={(e) => handleResize(e, 'sw')} />
          <div className="resize-handle -bottom-1.5 -right-1.5 cursor-se-resize" onMouseDown={(e) => handleResize(e, 'se')} />
          {/* Edge handles */}
          <div className="resize-handle top-1/2 -translate-y-1/2 -left-1.5 cursor-w-resize" onMouseDown={(e) => handleResize(e, 'w')} />
          <div className="resize-handle top-1/2 -translate-y-1/2 -right-1.5 cursor-e-resize" onMouseDown={(e) => handleResize(e, 'e')} />
          <div className="resize-handle left-1/2 -translate-x-1/2 -top-1.5 cursor-n-resize" onMouseDown={(e) => handleResize(e, 'n')} />
          <div className="resize-handle left-1/2 -translate-x-1/2 -bottom-1.5 cursor-s-resize" onMouseDown={(e) => handleResize(e, 's')} />
        </>
      )}
    </div>
  );
}
