import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Project, Page } from '../types';
import { Sparkles, ChevronLeft, ChevronRight, X, Maximize, Minimize } from 'lucide-react';

export default function Viewer() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (projectId) {
      const raw = localStorage.getItem(`gleamio-project-${projectId}`);
      if (raw) {
        try {
          setProject(JSON.parse(raw));
        } catch {
          // invalid
        }
      }
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gleam-400 mx-auto mb-4" />
          <p className="text-surface-400 text-lg">Project not found</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4 text-sm">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const page = project.pages[currentPageIndex];
  const hasPrev = currentPageIndex > 0;
  const hasNext = currentPageIndex < project.pages.length - 1;

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function getPageBg(page: Page): string {
    switch (page.background.type) {
      case 'solid': return page.background.color || '#ffffff';
      case 'gradient': return page.background.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default: return '#ffffff';
    }
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-surface-900/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-surface-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm text-surface-300 font-medium">{project.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-500">
            {currentPageIndex + 1} / {project.pages.length}
          </span>
          <button onClick={toggleFullscreen} className="text-surface-400 hover:text-white transition-colors">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas view */}
      <div className="flex-1 flex items-center justify-center relative">
        <div
          className="relative overflow-hidden shadow-2xl"
          style={{
            width: `min(90vw, ${page.width}px)`,
            aspectRatio: `${page.width} / ${page.height}`,
            background: getPageBg(page),
          }}
        >
          {/* Render elements */}
          {page.elements
            .filter((e) => e.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => (
              <div
                key={el.id}
                className="absolute"
                style={{
                  left: `${(el.x / page.width) * 100}%`,
                  top: `${(el.y / page.height) * 100}%`,
                  width: `${(el.width / page.width) * 100}%`,
                  height: `${(el.height / page.height) * 100}%`,
                  transform: `rotate(${el.rotation}deg)`,
                  opacity: el.opacity,
                }}
              >
                {el.type === 'text' && (
                  <div
                    style={{
                      fontSize: el.fontSize ? `${(el.fontSize / page.width) * 100}vw` : undefined,
                      fontFamily: el.fontFamily,
                      fontWeight: el.fontWeight,
                      color: el.color,
                      textAlign: el.textAlign,
                      lineHeight: el.lineHeight,
                      width: '100%',
                      height: '100%',
                    }}
                    dangerouslySetInnerHTML={{ __html: el.content || '' }}
                  />
                )}
                {el.type === 'shape' && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: el.fill || '#4c6ef5',
                      borderRadius: el.shapeKind === 'circle' ? '50%' : (el.borderRadius || 0),
                      border: el.stroke ? `${el.strokeWidth || 2}px solid ${el.stroke}` : undefined,
                    }}
                  />
                )}
                {el.type === 'image' && el.src && (
                  <img
                    src={el.src}
                    alt={el.name}
                    className="w-full h-full"
                    style={{ objectFit: el.objectFit || 'cover', borderRadius: el.borderRadius }}
                  />
                )}
                {el.type === 'button' && (
                  <button
                    className="w-full h-full rounded-lg font-medium text-sm text-white flex items-center justify-center"
                    style={{ backgroundColor: el.fill || '#4c6ef5' }}
                  >
                    {el.content || 'Button'}
                  </button>
                )}
              </div>
            ))}
        </div>

        {/* Navigation arrows */}
        {hasPrev && (
          <button
            onClick={() => setCurrentPageIndex((i) => i - 1)}
            className="absolute left-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={() => setCurrentPageIndex((i) => i + 1)}
            className="absolute right-4 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
