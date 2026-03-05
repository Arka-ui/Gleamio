import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import {
  Sparkles, Play, Palette, Puzzle, Zap, Users, BarChart3,
  ArrowRight, Moon, Sun, Github, MousePointerClick
} from 'lucide-react';

const FEATURES = [
  {
    icon: Palette,
    title: 'Drag & Drop Canvas',
    desc: 'Place text, images, shapes, videos, charts, and more on an infinite canvas with pixel-perfect control.',
  },
  {
    icon: MousePointerClick,
    title: 'Rich Interactions',
    desc: 'Attach click, hover, or timer triggers to any element — open modals, navigate pages, play sounds, fire confetti, and more.',
  },
  {
    icon: Puzzle,
    title: 'Quiz Engine',
    desc: 'Multiple choice, true/false, sequencing, drag-to-match, fill-in-the-blank — with scoring, feedback, and retries.',
  },
  {
    icon: Zap,
    title: 'Smart Widgets',
    desc: 'Randomizer, dice, coin flip, flip cards, countdown, image compare slider, interactive world map, and more.',
  },
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    desc: 'Edit simultaneously with your team — live cursors, instant sync, role-based access, and shared workspaces.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Export',
    desc: 'Track views, completion rates, and quiz scores. Export as PDF, MP4, or SCORM package for any LMS.',
  },
];

const TEMPLATE_CATEGORIES = [
  'Presentations', 'Infographics', 'Quizzes', 'Games',
  'Escape Rooms', 'Courses', 'Brochures', 'Social Media',
];

export default function Landing() {
  const navigate = useNavigate();
  const { resolved, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 transition-colors">
      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-surface-950/80 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-gleam-500" />
            <span className="text-xl font-display font-bold tracking-tight">Gleamio</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="btn-ghost btn-icon"
              aria-label="Toggle theme"
            >
              {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a
              href="https://github.com/user/gleamio"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-icon"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">
              Dashboard
            </button>
            <button onClick={() => navigate('/editor')} className="btn-primary text-sm">
              Start Creating
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gleam-50/50 to-transparent dark:from-gleam-950/20 dark:to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gleam-100 dark:bg-gleam-900/40 text-gleam-700 dark:text-gleam-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Free & Open Source — No subscription required
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.1] text-balance">
            Create <span className="text-gleam-600 dark:text-gleam-400">interactive</span> content
            <br />that <span className="text-gleam-600 dark:text-gleam-400">engages</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto text-balance leading-relaxed">
            Presentations, quizzes, games, infographics, escape rooms — build anything interactive
            with a powerful drag-and-drop editor. No limits. No paywall.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/editor')}
              className="btn-primary text-base px-8 py-3 shadow-glow hover:shadow-glow-lg"
            >
              Open Editor <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary text-base px-8 py-3"
            >
              <Play className="w-4 h-4" />
              See Features
            </button>
          </div>
        </div>

        {/* Editor mockup preview */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 shadow-soft-lg bg-surface-100 dark:bg-surface-900">
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-50 dark:bg-surface-850 border-b border-surface-200 dark:border-surface-800">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-surface-400">Gleamio Editor</span>
            </div>
            <div className="aspect-video bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
              <div className="text-center p-8">
                <Sparkles className="w-16 h-16 text-gleam-400 mx-auto mb-4 opacity-50" />
                <p className="text-surface-400 dark:text-surface-500 text-lg font-medium">
                  Canvas Editor Preview
                </p>
                <p className="text-surface-400 dark:text-surface-600 text-sm mt-1">
                  Click "Open Editor" to start building
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section id="features" className="py-24 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Everything you need to create
          </h2>
          <p className="text-center text-surface-500 dark:text-surface-400 mb-16 text-lg">
            A complete toolkit for interactive content — all free, all open source
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="panel p-6 hover:shadow-soft-lg transition-shadow duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gleam-100 dark:bg-gleam-900/40 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-gleam-600 dark:text-gleam-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Template Categories ────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Templates for every use case
          </h2>
          <p className="text-center text-surface-500 dark:text-surface-400 mb-12 text-lg">
            Start from a professionally designed template and make it yours
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="px-5 py-2.5 rounded-full text-sm font-medium
                  bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300
                  hover:bg-gleam-100 hover:text-gleam-700 dark:hover:bg-gleam-900/40 dark:hover:text-gleam-300
                  transition-colors duration-200"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-gleam-600 to-gleam-800 dark:from-gleam-700 dark:to-gleam-950">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to create something amazing?
          </h2>
          <p className="text-gleam-200 text-lg mb-8">
            No account needed to start. Just open the editor and go.
          </p>
          <button
            onClick={() => navigate('/editor')}
            className="btn bg-white text-gleam-700 hover:bg-gleam-50 font-semibold text-base px-8 py-3"
          >
            Start Creating Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="py-10 border-t border-surface-200 dark:border-surface-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <Sparkles className="w-4 h-4 text-gleam-500" />
            <span>Gleamio — Free & Open Source</span>
          </div>
          <p className="text-xs text-surface-400">
            Licensed under CC BY-NC 4.0 — Non-commercial use only
          </p>
        </div>
      </footer>
    </div>
  );
}
