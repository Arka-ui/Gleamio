import { useEditorStore } from '../../store/editorStore';
import PropertiesPanel from './panels/PropertiesPanel';
import InteractionsPanel from './panels/InteractionsPanel';
import AnimationsPanel from './panels/AnimationsPanel';
import { Settings2, MousePointerClick, Sparkles } from 'lucide-react';

const TABS = [
  { key: 'properties' as const, icon: Settings2, label: 'Properties' },
  { key: 'interactions' as const, icon: MousePointerClick, label: 'Interact' },
  { key: 'animations' as const, icon: Sparkles, label: 'Animate' },
];

export default function RightPanel() {
  const { rightPanelTab, setRightPanelTab } = useEditorStore();

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-surface-200 dark:border-surface-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRightPanelTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors
              ${rightPanelTab === tab.key
                ? 'text-gleam-600 dark:text-gleam-400 border-b-2 border-gleam-500'
                : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {rightPanelTab === 'properties' && <PropertiesPanel />}
        {rightPanelTab === 'interactions' && <InteractionsPanel />}
        {rightPanelTab === 'animations' && <AnimationsPanel />}
      </div>
    </div>
  );
}
