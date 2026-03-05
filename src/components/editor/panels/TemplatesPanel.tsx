import { useEditorStore } from '../../../store/editorStore';
import { LayoutTemplate, ArrowRight } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { CanvasPreset } from '../../../types';

interface TemplateEntry {
  name: string;
  category: string;
  description: string;
  preset: CanvasPreset;
  bgColor: string;
}

const TEMPLATES: TemplateEntry[] = [
  { name: 'Clean Presentation', category: 'Presentation', description: 'Minimalist slides with modern typography', preset: '16:9', bgColor: '#ffffff' },
  { name: 'Dark Presentation', category: 'Presentation', description: 'Elegant dark theme for impactful talks', preset: '16:9', bgColor: '#1a1a2e' },
  { name: 'Interactive Quiz', category: 'Quiz', description: 'Multiple choice quiz with scoring', preset: '16:9', bgColor: '#f0f4ff' },
  { name: 'Classroom Game', category: 'Game', description: 'Fun interactive game for students', preset: '16:9', bgColor: '#fff3e0' },
  { name: 'Escape Room', category: 'Escape Room', description: 'Puzzle-based escape room adventure', preset: '16:9', bgColor: '#1a1a2e' },
  { name: 'Vertical Infographic', category: 'Infographic', description: 'Scrollable data visualization', preset: '9:16', bgColor: '#f5f5f5' },
  { name: 'Course Module', category: 'Course', description: 'Structured learning content', preset: '16:9', bgColor: '#f0fdf4' },
  { name: 'Digital Brochure', category: 'Brochure', description: 'Tri-fold style digital brochure', preset: 'A4', bgColor: '#fffbeb' },
];

export default function TemplatesPanel() {
  const { setProject } = useEditorStore();

  function applyTemplate(template: TemplateEntry) {
    const presets: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1920, height: 1080 },
      '4:3': { width: 1440, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      'A4': { width: 1123, height: 1587 },
      'square': { width: 1080, height: 1080 },
    };
    const dim = presets[template.preset] || presets['16:9'];

    // For now, create a new project with the template styling
    const project = {
      id: uuid(),
      name: template.name,
      pages: [{
        id: uuid(),
        name: 'Page 1',
        order: 0,
        width: dim.width,
        height: dim.height,
        background: { type: 'solid' as const, color: template.bgColor },
        elements: [],
        transition: 'fade' as const,
        transitionDuration: 500,
      }],
      navigationMode: 'linear' as const,
      canvasPreset: template.preset,
      canvasWidth: dim.width,
      canvasHeight: dim.height,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProject(project);
  }

  return (
    <div className="p-3">
      <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
        Templates
      </h3>

      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            onClick={() => applyTemplate(t)}
            className="w-full panel-flat p-3 text-left hover:border-gleam-400 dark:hover:border-gleam-600
              hover:shadow-sm transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-8 rounded border border-surface-200 dark:border-surface-700 flex-shrink-0"
                style={{ backgroundColor: t.bgColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{t.name}</p>
                <p className="text-[10px] text-surface-400 mt-0.5">{t.description}</p>
                <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full
                  bg-surface-100 dark:bg-surface-800 text-surface-500">
                  {t.category}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-gleam-500 transition-colors flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
