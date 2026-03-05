import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { v4 as uuid } from 'uuid';
import type { ElementAnimation, AnimationStage, AnimationEffect } from '../../../types';
import { Plus, Trash2, ChevronDown, ChevronRight, Sparkles, Play } from 'lucide-react';

const STAGES: { value: AnimationStage; label: string; color: string }[] = [
  { value: 'entrance', label: 'Entrance', color: 'text-green-500' },
  { value: 'exit', label: 'Exit', color: 'text-red-500' },
  { value: 'continuous', label: 'Continuous', color: 'text-blue-500' },
  { value: 'hover', label: 'On Hover', color: 'text-purple-500' },
];

const EFFECTS: { value: AnimationEffect; label: string }[] = [
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'fadeOut', label: 'Fade Out' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'zoomIn', label: 'Zoom In' },
  { value: 'zoomOut', label: 'Zoom Out' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'shake', label: 'Shake' },
  { value: 'flip', label: 'Flip' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'blur', label: 'Blur' },
];

export default function AnimationsPanel() {
  const { selectedElementIds, getActivePage, updateElement } = useEditorStore();
  const page = getActivePage();
  const element = page.elements.find((e) => selectedElementIds[0] === e.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!element) {
    return (
      <div className="p-3 text-center py-12">
        <Sparkles className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Select an element</p>
        <p className="text-[10px] text-surface-400 mt-1">Then add animations to bring it to life</p>
      </div>
    );
  }

  const animations = element.animations || [];
  const elementId = element.id;

  function addAnimation() {
    const newAnim: ElementAnimation = {
      id: uuid(),
      stage: 'entrance',
      effect: 'fadeIn',
      duration: 500,
      delay: 0,
      speed: 'normal',
    };
    updateElement(elementId, {
      animations: [...animations, newAnim],
    });
    setExpandedId(newAnim.id);
  }

  function updateAnimation(animId: string, updates: Partial<ElementAnimation>) {
    updateElement(elementId, {
      animations: animations.map((a) => (a.id === animId ? { ...a, ...updates } : a)),
    });
  }

  function deleteAnimation(animId: string) {
    updateElement(elementId, {
      animations: animations.filter((a) => a.id !== animId),
    });
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          Animations ({animations.length})
        </h3>
        <button onClick={addAnimation} className="btn-ghost btn-icon" title="Add Animation">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {animations.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[10px] text-surface-400">No animations yet</p>
          <button onClick={addAnimation} className="btn-primary text-xs mt-3 py-1.5">
            <Plus className="w-3 h-3" /> Add Animation
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {animations.map((anim) => {
            const isExpanded = expandedId === anim.id;
            const stageInfo = STAGES.find((s) => s.value === anim.stage);
            return (
              <div key={anim.id} className="panel-flat overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : anim.id)}
                  className="w-full flex items-center gap-2 p-2.5 text-left"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-surface-400" /> : <ChevronRight className="w-3.5 h-3.5 text-surface-400" />}
                  <span className={`text-[10px] font-semibold uppercase ${stageInfo?.color || ''}`}>
                    {anim.stage}
                  </span>
                  <span className="text-xs text-surface-500 flex-1">
                    {EFFECTS.find((e) => e.value === anim.effect)?.label || anim.effect}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteAnimation(anim.id); }}
                    className="p-0.5 rounded text-surface-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>

                {isExpanded && (
                  <div className="px-2.5 pb-2.5 space-y-2 border-t border-surface-200 dark:border-surface-800 pt-2">
                    {/* Stage */}
                    <div>
                      <span className="text-[10px] text-surface-400 block mb-1">Stage</span>
                      <div className="grid grid-cols-2 gap-1">
                        {STAGES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateAnimation(anim.id, { stage: s.value })}
                            className={`text-[10px] py-1.5 rounded-md border transition-colors
                              ${anim.stage === s.value
                                ? 'border-gleam-400 bg-gleam-50 dark:bg-gleam-900/20 text-gleam-600'
                                : 'border-surface-200 dark:border-surface-700 text-surface-500'
                              }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Effect */}
                    <div>
                      <span className="text-[10px] text-surface-400 block mb-1">Effect</span>
                      <select
                        value={anim.effect}
                        onChange={(e) => updateAnimation(anim.id, { effect: e.target.value as AnimationEffect })}
                        className="input text-xs py-1"
                      >
                        {EFFECTS.map((e) => (
                          <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duration & Delay */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">Duration (ms)</span>
                        <input
                          type="number"
                          value={anim.duration}
                          onChange={(e) => updateAnimation(anim.id, { duration: parseInt(e.target.value) || 0 })}
                          className="input text-xs py-1"
                          min={50}
                          step={50}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">Delay (ms)</span>
                        <input
                          type="number"
                          value={anim.delay}
                          onChange={(e) => updateAnimation(anim.id, { delay: parseInt(e.target.value) || 0 })}
                          className="input text-xs py-1"
                          min={0}
                          step={50}
                        />
                      </div>
                    </div>

                    {/* Speed */}
                    <div>
                      <span className="text-[10px] text-surface-400 block mb-1">Speed</span>
                      <div className="flex gap-1">
                        {(['slow', 'normal', 'fast'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateAnimation(anim.id, { speed: s })}
                            className={`flex-1 text-[10px] py-1 rounded capitalize
                              ${anim.speed === s
                                ? 'bg-gleam-100 dark:bg-gleam-900/30 text-gleam-600'
                                : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
