import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { GleamElement } from '../../../types';
import {
  Lock, Unlock, Eye, EyeOff, Copy, Trash2, ChevronsUp, ChevronsDown,
  ChevronUp, ChevronDown, RotateCcw, Palette
} from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h4 className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-surface-500">{label}</span>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="input w-20 text-xs text-right py-1 px-2"
      />
    </div>
  );
}

export default function PropertiesPanel() {
  const {
    selectedElementIds, getActivePage, updateElement,
    lockElement, deleteElements, duplicateElements,
    bringToFront, sendToBack, bringForward, sendBackward,
    updatePageBackground, activePageId
  } = useEditorStore();

  const page = getActivePage();
  const selectedElements = page.elements.filter((e) => selectedElementIds.includes(e.id));
  const element = selectedElements.length === 1 ? selectedElements[0] : null;

  // Page properties when nothing is selected
  if (!element) {
    return (
      <div className="p-3">
        <Section title="Page Background">
          <div className="space-y-2">
            <div className="flex gap-2">
              {['solid', 'gradient'].map((type) => (
                <button
                  key={type}
                  onClick={() => updatePageBackground(activePageId, { type: type as any })}
                  className={`flex-1 text-xs py-1.5 rounded-md border transition-colors capitalize
                    ${page.background.type === type
                      ? 'border-gleam-400 bg-gleam-50 dark:bg-gleam-900/20 text-gleam-600'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {page.background.type === 'solid' && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={page.background.color || '#ffffff'}
                  onChange={(e) => updatePageBackground(activePageId, { color: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={page.background.color || '#ffffff'}
                  onChange={(e) => updatePageBackground(activePageId, { color: e.target.value })}
                  className="input text-xs py-1 flex-1"
                />
              </div>
            )}
          </div>
        </Section>

        <Section title="Page Info">
          <div className="space-y-1 text-xs text-surface-500">
            <p>Dimensions: {page.width} × {page.height}</p>
            <p>Elements: {page.elements.length}</p>
            <p>Transition: {page.transition}</p>
          </div>
        </Section>

        {selectedElements.length > 1 && (
          <Section title="Multi-Selection">
            <p className="text-xs text-surface-500">{selectedElements.length} elements selected</p>
            <div className="flex gap-1 mt-2">
              <button onClick={() => duplicateElements(selectedElementIds)} className="btn-secondary text-xs flex-1 py-1.5">
                <Copy className="w-3 h-3" /> Duplicate
              </button>
              <button onClick={() => deleteElements(selectedElementIds)} className="btn-danger text-xs flex-1 py-1.5">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </Section>
        )}
      </div>
    );
  }

  const update = (updates: Partial<GleamElement>) => updateElement(element.id, updates);

  return (
    <div className="p-3 space-y-1">
      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium capitalize">{element.type}: {element.name}</span>
        <div className="flex gap-0.5">
          <button
            onClick={() => lockElement(element.id, !element.locked)}
            className="btn-ghost btn-icon p-1"
            title={element.locked ? 'Unlock' : 'Lock'}
          >
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => update({ visible: !element.visible })}
            className="btn-ghost btn-icon p-1"
            title={element.visible ? 'Hide' : 'Show'}
          >
            {element.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => duplicateElements([element.id])} className="btn-ghost btn-icon p-1" title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => deleteElements([element.id])} className="btn-ghost btn-icon p-1 text-red-500" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Position & Size */}
      <Section title="Position & Size">
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="X" value={element.x} onChange={(v) => update({ x: v })} />
          <NumberInput label="Y" value={element.y} onChange={(v) => update({ y: v })} />
          <NumberInput label="W" value={element.width} onChange={(v) => update({ width: v })} min={1} />
          <NumberInput label="H" value={element.height} onChange={(v) => update({ height: v })} min={1} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <NumberInput label="Rotation" value={element.rotation} onChange={(v) => update({ rotation: v })} />
          <NumberInput label="Opacity" value={element.opacity} onChange={(v) => update({ opacity: v })} min={0} max={1} step={0.05} />
        </div>
      </Section>

      {/* Z-Index / Ordering */}
      <Section title="Layer Order">
        <div className="flex gap-1">
          <button onClick={() => sendToBack(element.id)} className="btn-secondary text-xs flex-1 py-1.5" title="Send to Back">
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => sendBackward(element.id)} className="btn-secondary text-xs flex-1 py-1.5" title="Send Backward">
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => bringForward(element.id)} className="btn-secondary text-xs flex-1 py-1.5" title="Bring Forward">
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => bringToFront(element.id)} className="btn-secondary text-xs flex-1 py-1.5" title="Bring to Front">
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </Section>

      {/* Type-specific properties */}
      {element.type === 'text' && (
        <Section title="Text Style">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-12">Font</span>
              <select
                value={element.fontFamily || 'Inter'}
                onChange={(e) => update({ fontFamily: e.target.value })}
                className="input text-xs py-1 flex-1"
              >
                {['Inter', 'Plus Jakarta Sans', 'Georgia', 'Arial', 'Times New Roman', 'Courier New', 'Comic Sans MS'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput label="Size" value={element.fontSize || 16} onChange={(v) => update({ fontSize: v })} min={8} max={200} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Weight</span>
                <select
                  value={element.fontWeight || 400}
                  onChange={(e) => update({ fontWeight: parseInt(e.target.value) })}
                  className="input w-20 text-xs py-1"
                >
                  {[300, 400, 500, 600, 700, 800].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-12">Color</span>
              <input
                type="color"
                value={element.color || '#171717'}
                onChange={(e) => update({ color: e.target.value })}
                className="w-7 h-7 rounded border border-surface-200 dark:border-surface-700 cursor-pointer"
              />
              <input
                type="text"
                value={element.color || '#171717'}
                onChange={(e) => update({ color: e.target.value })}
                className="input text-xs py-1 flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-12">Align</span>
              <div className="flex gap-1 flex-1">
                {(['left', 'center', 'right', 'justify'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => update({ textAlign: a })}
                    className={`flex-1 text-[10px] py-1 rounded capitalize
                      ${element.textAlign === a
                        ? 'bg-gleam-100 dark:bg-gleam-900/30 text-gleam-600'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                      }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <NumberInput label="Line Height" value={element.lineHeight || 1.5} onChange={(v) => update({ lineHeight: v })} min={0.5} max={4} step={0.1} />
          </div>
        </Section>
      )}

      {(element.type === 'shape' || element.type === 'button') && (
        <Section title="Fill & Stroke">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-12">Fill</span>
              <input
                type="color"
                value={element.fill || '#4c6ef5'}
                onChange={(e) => update({ fill: e.target.value })}
                className="w-7 h-7 rounded border border-surface-200 dark:border-surface-700 cursor-pointer"
              />
              <input
                type="text"
                value={element.fill || '#4c6ef5'}
                onChange={(e) => update({ fill: e.target.value })}
                className="input text-xs py-1 flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-12">Stroke</span>
              <input
                type="color"
                value={element.stroke || '#000000'}
                onChange={(e) => update({ stroke: e.target.value })}
                className="w-7 h-7 rounded border border-surface-200 dark:border-surface-700 cursor-pointer"
              />
              <input
                type="text"
                value={element.stroke || ''}
                onChange={(e) => update({ stroke: e.target.value })}
                className="input text-xs py-1 flex-1"
                placeholder="none"
              />
            </div>
            <NumberInput label="Corner Radius" value={element.borderRadius || 0} onChange={(v) => update({ borderRadius: v })} min={0} max={200} />
          </div>
        </Section>
      )}

      {element.type === 'image' && (
        <Section title="Image">
          <div className="space-y-2">
            <div>
              <span className="text-xs text-surface-500 block mb-1">Source URL</span>
              <input
                type="text"
                value={element.src || ''}
                onChange={(e) => update({ src: e.target.value })}
                className="input text-xs py-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 w-12">Fit</span>
              <select
                value={element.objectFit || 'cover'}
                onChange={(e) => update({ objectFit: e.target.value as any })}
                className="input text-xs py-1 flex-1"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
              </select>
            </div>
            <NumberInput label="Corner Radius" value={element.borderRadius || 0} onChange={(v) => update({ borderRadius: v })} min={0} max={200} />
          </div>
        </Section>
      )}
    </div>
  );
}
