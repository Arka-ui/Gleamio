import { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { v4 as uuid } from 'uuid';
import type { Interaction, TriggerType, ActionType, VisualEffect } from '../../../types';
import {
  MousePointerClick, Timer, Plus, Trash2, ChevronDown, ChevronRight,
  ExternalLink, Maximize, Volume2, Sparkles, Eye, EyeOff, Move, PaintBucket
} from 'lucide-react';

const TRIGGERS: { value: TriggerType; label: string; icon: typeof MousePointerClick }[] = [
  { value: 'click', label: 'On Click', icon: MousePointerClick },
  { value: 'hover', label: 'On Hover', icon: MousePointerClick },
  { value: 'timer', label: 'Timed', icon: Timer },
];

const ACTIONS: { value: ActionType; label: string; description: string }[] = [
  { value: 'openModal', label: 'Open Modal', description: 'Show a rich content overlay' },
  { value: 'showTooltip', label: 'Show Tooltip', description: 'Show a tooltip on the element' },
  { value: 'goToPage', label: 'Go to Page', description: 'Navigate to another page' },
  { value: 'scrollToAnchor', label: 'Scroll to Element', description: 'Scroll to a target element' },
  { value: 'openUrl', label: 'Open URL', description: 'Open an external link' },
  { value: 'zoomFullscreen', label: 'Zoom Fullscreen', description: 'Zoom element to fullscreen' },
  { value: 'playSound', label: 'Play Sound', description: 'Play an audio file' },
  { value: 'fireEffect', label: 'Visual Effect', description: 'Trigger confetti, fireworks, etc.' },
  { value: 'showHideElement', label: 'Show/Hide Element', description: 'Toggle another element' },
  { value: 'dragDrop', label: 'Drag & Drop', description: 'Enable drag-to-target mechanic' },
  { value: 'paintMode', label: 'Paint Mode', description: 'Enable freehand drawing' },
];

const EFFECTS: VisualEffect[] = ['confetti', 'fireworks', 'snow', 'hearts', 'stars'];

export default function InteractionsPanel() {
  const { selectedElementIds, getActivePage, updateElement, project } = useEditorStore();
  const page = getActivePage();
  const element = page.elements.find((e) => selectedElementIds[0] === e.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!element) {
    return (
      <div className="p-3 text-center py-12">
        <MousePointerClick className="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-3" />
        <p className="text-xs text-surface-500 dark:text-surface-400 font-medium">Select an element</p>
        <p className="text-[10px] text-surface-400 mt-1">Then add interactions to make it interactive</p>
      </div>
    );
  }

  const interactions = element.interactions || [];
  const elementId = element.id;

  function addInteraction() {
    const newInt: Interaction = {
      id: uuid(),
      trigger: 'click',
      action: 'goToPage',
    };
    updateElement(elementId, {
      interactions: [...interactions, newInt],
    });
    setExpandedId(newInt.id);
  }

  function updateInteraction(intId: string, updates: Partial<Interaction>) {
    updateElement(elementId, {
      interactions: interactions.map((i) => (i.id === intId ? { ...i, ...updates } : i)),
    });
  }

  function deleteInteraction(intId: string) {
    updateElement(elementId, {
      interactions: interactions.filter((i) => i.id !== intId),
    });
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          Interactions ({interactions.length})
        </h3>
        <button onClick={addInteraction} className="btn-ghost btn-icon" title="Add Interaction">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {interactions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[10px] text-surface-400">No interactions yet</p>
          <button onClick={addInteraction} className="btn-primary text-xs mt-3 py-1.5">
            <Plus className="w-3 h-3" /> Add Interaction
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {interactions.map((interaction) => {
            const isExpanded = expandedId === interaction.id;
            return (
              <div
                key={interaction.id}
                className="panel-flat overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : interaction.id)}
                  className="w-full flex items-center gap-2 p-2.5 text-left"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-surface-400" /> : <ChevronRight className="w-3.5 h-3.5 text-surface-400" />}
                  <span className="text-xs font-medium flex-1 capitalize">
                    {interaction.trigger} → {ACTIONS.find((a) => a.value === interaction.action)?.label || interaction.action}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteInteraction(interaction.id); }}
                    className="p-0.5 rounded text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>

                {/* Expanded config */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 space-y-2 border-t border-surface-200 dark:border-surface-800 pt-2">
                    {/* Trigger */}
                    <div>
                      <span className="text-[10px] text-surface-400 block mb-1">Trigger</span>
                      <div className="flex gap-1">
                        {TRIGGERS.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => updateInteraction(interaction.id, { trigger: t.value })}
                            className={`flex-1 text-[10px] py-1.5 rounded-md border transition-colors
                              ${interaction.trigger === t.value
                                ? 'border-gleam-400 bg-gleam-50 dark:bg-gleam-900/20 text-gleam-600'
                                : 'border-surface-200 dark:border-surface-700 text-surface-500'
                              }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {interaction.trigger === 'timer' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-500">Delay (ms)</span>
                        <input
                          type="number"
                          value={interaction.timerDelay || 1000}
                          onChange={(e) => updateInteraction(interaction.id, { timerDelay: parseInt(e.target.value) })}
                          className="input text-xs py-1 w-24"
                          min={100}
                          step={100}
                        />
                      </div>
                    )}

                    {/* Action */}
                    <div>
                      <span className="text-[10px] text-surface-400 block mb-1">Action</span>
                      <select
                        value={interaction.action}
                        onChange={(e) => updateInteraction(interaction.id, { action: e.target.value as ActionType })}
                        className="input text-xs py-1"
                      >
                        {ACTIONS.map((a) => (
                          <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Action-specific config */}
                    {interaction.action === 'goToPage' && (
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">Target Page</span>
                        <select
                          value={interaction.targetPageId || ''}
                          onChange={(e) => updateInteraction(interaction.id, { targetPageId: e.target.value })}
                          className="input text-xs py-1"
                        >
                          <option value="">Select page...</option>
                          {project.pages.map((p, i) => (
                            <option key={p.id} value={p.id}>{i + 1}. {p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {interaction.action === 'openUrl' && (
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">URL</span>
                        <input
                          type="url"
                          value={interaction.url || ''}
                          onChange={(e) => updateInteraction(interaction.id, { url: e.target.value })}
                          className="input text-xs py-1"
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    {interaction.action === 'showTooltip' && (
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">Tooltip Text</span>
                        <input
                          type="text"
                          value={interaction.tooltipText || ''}
                          onChange={(e) => updateInteraction(interaction.id, { tooltipText: e.target.value })}
                          className="input text-xs py-1"
                          placeholder="Tooltip text..."
                        />
                      </div>
                    )}

                    {interaction.action === 'playSound' && (
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">Sound URL</span>
                        <input
                          type="url"
                          value={interaction.soundUrl || ''}
                          onChange={(e) => updateInteraction(interaction.id, { soundUrl: e.target.value })}
                          className="input text-xs py-1"
                          placeholder="URL to audio file..."
                        />
                      </div>
                    )}

                    {interaction.action === 'fireEffect' && (
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">Effect</span>
                        <div className="flex flex-wrap gap-1">
                          {EFFECTS.map((fx) => (
                            <button
                              key={fx}
                              onClick={() => updateInteraction(interaction.id, { effectType: fx })}
                              className={`text-[10px] px-2 py-1 rounded-full capitalize
                                ${interaction.effectType === fx
                                  ? 'bg-gleam-100 dark:bg-gleam-900/30 text-gleam-600'
                                  : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                                }`}
                            >
                              {fx}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {interaction.action === 'showHideElement' && (
                      <>
                        <div>
                          <span className="text-[10px] text-surface-400 block mb-1">Target Element</span>
                          <select
                            value={interaction.targetElementId || ''}
                            onChange={(e) => updateInteraction(interaction.id, { targetElementId: e.target.value })}
                            className="input text-xs py-1"
                          >
                            <option value="">Select element...</option>
                            {page.elements.filter((e) => e.id !== element.id).map((e) => (
                              <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-1">
                          {(['show', 'hide', 'toggle'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => updateInteraction(interaction.id, { showOrHide: mode })}
                              className={`flex-1 text-[10px] py-1 rounded capitalize
                                ${interaction.showOrHide === mode
                                  ? 'bg-gleam-100 dark:bg-gleam-900/30 text-gleam-600'
                                  : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
                                }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {interaction.action === 'openModal' && (
                      <div>
                        <span className="text-[10px] text-surface-400 block mb-1">Modal Content (HTML)</span>
                        <textarea
                          value={interaction.modalContent || ''}
                          onChange={(e) => updateInteraction(interaction.id, { modalContent: e.target.value })}
                          className="input text-xs py-1 min-h-[60px] resize-y"
                          placeholder="<h2>Title</h2><p>Content...</p>"
                        />
                      </div>
                    )}
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
