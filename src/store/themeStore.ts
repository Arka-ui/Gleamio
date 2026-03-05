import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

function resolveTheme(t: Theme): 'light' | 'dark' {
  if (t === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return t;
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const saved = (localStorage.getItem('gleamio-theme') as Theme) || 'dark';
const initialResolved = resolveTheme(saved);
applyTheme(initialResolved);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: saved,
  resolved: initialResolved,
  setTheme: (t) => {
    const r = resolveTheme(t);
    localStorage.setItem('gleamio-theme', t);
    applyTheme(r);
    set({ theme: t, resolved: r });
  },
}));

// Listen for OS theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      const r = resolveTheme('system');
      applyTheme(r);
      useThemeStore.setState({ resolved: r });
    }
  });
}
