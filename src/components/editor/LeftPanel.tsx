import { useEditorStore } from '../../store/editorStore';
import PagesPanel from './panels/PagesPanel';
import ElementsPanel from './panels/ElementsPanel';
import AssetsPanel from './panels/AssetsPanel';
import TemplatesPanel from './panels/TemplatesPanel';
import { Layers, FileStack, Image, LayoutTemplate } from 'lucide-react';

const TABS = [
  { key: 'pages' as const, icon: FileStack, label: 'Pages' },
  { key: 'elements' as const, icon: Layers, label: 'Elements' },
  { key: 'assets' as const, icon: Image, label: 'Assets' },
  { key: 'templates' as const, icon: LayoutTemplate, label: 'Templates' },
];

export default function LeftPanel() {
  const { leftPanelTab, setLeftPanelTab } = useEditorStore();

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-surface-200 dark:border-surface-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLeftPanelTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors
              ${leftPanelTab === tab.key
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
        {leftPanelTab === 'pages' && <PagesPanel />}
        {leftPanelTab === 'elements' && <ElementsPanel />}
        {leftPanelTab === 'assets' && <AssetsPanel />}
        {leftPanelTab === 'templates' && <TemplatesPanel />}
      </div>
    </div>
  );
}
