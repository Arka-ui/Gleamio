import { useEditorStore } from '../../../store/editorStore';
import {
  Type, Square, Circle, Image, Film, Music, Table2,
  BarChart3, Globe, MousePointer2, Star, Triangle,
  ArrowRight, Minus, Hash
} from 'lucide-react';
import type { GleamElement, ElementType, ShapeKind } from '../../../types';

interface ElementTemplate {
  icon: typeof Type;
  label: string;
  type: ElementType;
  defaults: Partial<GleamElement>;
}

const BASIC_ELEMENTS: ElementTemplate[] = [
  {
    icon: Type, label: 'Heading', type: 'text',
    defaults: { width: 400, height: 60, content: '<h2>Heading</h2>', fontSize: 32, fontWeight: 700, name: 'Heading' },
  },
  {
    icon: Type, label: 'Paragraph', type: 'text',
    defaults: { width: 400, height: 100, content: '<p>Type your text here. Click to edit.</p>', fontSize: 16, fontWeight: 400, name: 'Text' },
  },
  {
    icon: MousePointer2, label: 'Button', type: 'button',
    defaults: { width: 160, height: 48, content: 'Click Me', fill: '#4c6ef5', borderRadius: 8, name: 'Button' },
  },
  {
    icon: Image, label: 'Image', type: 'image',
    defaults: { width: 300, height: 200, name: 'Image' },
  },
  {
    icon: Film, label: 'Video', type: 'video',
    defaults: { width: 480, height: 270, name: 'Video' },
  },
  {
    icon: Music, label: 'Audio', type: 'audio',
    defaults: { width: 300, height: 60, name: 'Audio' },
  },
  {
    icon: Globe, label: 'Embed / iFrame', type: 'iframe',
    defaults: { width: 480, height: 360, name: 'Embed' },
  },
  {
    icon: Table2, label: 'Table', type: 'table',
    defaults: { width: 400, height: 200, name: 'Table' },
  },
  {
    icon: BarChart3, label: 'Chart', type: 'chart',
    defaults: { width: 400, height: 300, name: 'Chart' },
  },
];

interface ShapeTemplate {
  icon: typeof Square;
  label: string;
  shapeKind: ShapeKind;
  fill: string;
  defaults: Partial<GleamElement>;
}

const SHAPES: ShapeTemplate[] = [
  { icon: Square, label: 'Rectangle', shapeKind: 'rectangle', fill: '#4c6ef5',
    defaults: { width: 200, height: 150, borderRadius: 8 } },
  { icon: Circle, label: 'Circle', shapeKind: 'circle', fill: '#f06595',
    defaults: { width: 150, height: 150 } },
  { icon: Triangle, label: 'Triangle', shapeKind: 'triangle', fill: '#51cf66',
    defaults: { width: 150, height: 150 } },
  { icon: Star, label: 'Star', shapeKind: 'star', fill: '#fcc419',
    defaults: { width: 150, height: 150 } },
  { icon: ArrowRight, label: 'Arrow', shapeKind: 'arrow', fill: '#ff922b',
    defaults: { width: 200, height: 80 } },
  { icon: Minus, label: 'Line', shapeKind: 'line', fill: 'transparent',
    defaults: { width: 200, height: 4, stroke: '#868e96', strokeWidth: 2 } },
];

export default function ElementsPanel() {
  const addElement = useEditorStore((s) => s.addElement);

  function handleAddElement(template: ElementTemplate) {
    addElement({
      type: template.type,
      ...template.defaults,
    });
  }

  function handleAddShape(shape: ShapeTemplate) {
    addElement({
      type: 'shape',
      shapeKind: shape.shapeKind,
      fill: shape.fill,
      name: shape.label,
      ...shape.defaults,
    });
  }

  function handleDragStart(e: React.DragEvent, data: Partial<GleamElement>) {
    e.dataTransfer.setData('application/gleamio-element', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div className="p-3">
      {/* Basic Elements */}
      <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
        Basic Elements
      </h3>
      <div className="grid grid-cols-3 gap-1.5 mb-5">
        {BASIC_ELEMENTS.map((el) => (
          <button
            key={el.label}
            onClick={() => handleAddElement(el)}
            draggable
            onDragStart={(e) => handleDragStart(e, { type: el.type, ...el.defaults })}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg
              hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group cursor-pointer
              border border-transparent hover:border-surface-200 dark:hover:border-surface-700"
          >
            <el.icon className="w-5 h-5 text-surface-400 group-hover:text-gleam-500 transition-colors" />
            <span className="text-[10px] text-surface-500 dark:text-surface-400 font-medium">{el.label}</span>
          </button>
        ))}
      </div>

      {/* Shapes */}
      <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
        Shapes
      </h3>
      <div className="grid grid-cols-3 gap-1.5 mb-5">
        {SHAPES.map((shape) => (
          <button
            key={shape.label}
            onClick={() => handleAddShape(shape)}
            draggable
            onDragStart={(e) => handleDragStart(e, {
              type: 'shape', shapeKind: shape.shapeKind, fill: shape.fill, name: shape.label, ...shape.defaults,
            })}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg
              hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors group cursor-pointer
              border border-transparent hover:border-surface-200 dark:hover:border-surface-700"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {shape.shapeKind === 'rectangle' && (
                <div className="w-7 h-5 rounded-sm" style={{ backgroundColor: shape.fill }} />
              )}
              {shape.shapeKind === 'circle' && (
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: shape.fill }} />
              )}
              {shape.shapeKind === 'triangle' && (
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent" style={{ borderBottomColor: shape.fill }} />
              )}
              {shape.shapeKind === 'star' && (
                <Star className="w-6 h-6" style={{ fill: shape.fill, color: shape.fill }} />
              )}
              {shape.shapeKind === 'arrow' && (
                <ArrowRight className="w-6 h-6" style={{ color: shape.fill }} />
              )}
              {shape.shapeKind === 'line' && (
                <div className="w-7 h-0.5 bg-surface-400 rounded" />
              )}
            </div>
            <span className="text-[10px] text-surface-500 dark:text-surface-400 font-medium">{shape.label}</span>
          </button>
        ))}
      </div>

      {/* Widgets preview */}
      <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
        Smart Widgets
      </h3>
      <div className="space-y-1.5">
        {['Randomizer', 'Coin Flip', 'Dice', 'Image Compare', 'Countdown', 'Flip Card', 'World Map', 'Scoreboard'].map((w) => (
          <button
            key={w}
            onClick={() => addElement({
              type: 'widget',
              widgetType: w.toLowerCase().replace(/\s+/g, '') as any,
              width: 300,
              height: 200,
              name: w,
            })}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left
              hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors
              border border-transparent hover:border-surface-200 dark:hover:border-surface-700"
          >
            <div className="w-7 h-7 rounded-md bg-gleam-100 dark:bg-gleam-900/40 flex items-center justify-center flex-shrink-0">
              <Hash className="w-3.5 h-3.5 text-gleam-600 dark:text-gleam-400" />
            </div>
            <span className="text-xs font-medium">{w}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
