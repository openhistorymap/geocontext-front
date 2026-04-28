import { Injectable, computed, effect, signal } from '@angular/core';

export type GcxTheme = 'light' | 'dark';

const STORAGE_KEY = 'gcx:theme';

/**
 * Tracks the active visual theme (light / dark) and persists the choice to
 * localStorage. The signal value is mirrored onto `<html data-theme="…">`
 * so an opinionated set of CSS variables (and the Material `--mat-sys-*`
 * tokens that alias them) can switch palette in one place.
 *
 * Default is `light` per the editorial design context — we don't follow
 * `prefers-color-scheme` automatically because the editorial surface is
 * the canonical look; dark mode is a reading-room variant the user opts
 * into.
 */
@Injectable({ providedIn: 'root' })
export class GcxThemeService {
  private readonly _theme = signal<GcxTheme>(this.readInitial());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      const next = this._theme();
      if (typeof document !== 'undefined') {
        document.documentElement.dataset['theme'] = next;
      }
      try {
        localStorage?.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode / disabled storage — ignore */
      }
    });
  }

  toggle(): void {
    this._theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  set(theme: GcxTheme): void {
    this._theme.set(theme);
  }

  private readInitial(): GcxTheme {
    try {
      const stored = localStorage?.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      /* ignore */
    }
    return 'light';
  }
}
