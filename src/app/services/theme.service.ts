import { Injectable } from '@angular/core';

type themeMode = 'light' | 'dark' | 'light dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _themeKey: string = 'app-theme-mode';
  private _favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  get theme(): themeMode {
    return (localStorage.getItem(this._themeKey) as themeMode) || 'light dark';
  }

  get preferredTheme(): themeMode {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  constructor() {}

  init() {
    document.documentElement.style.setProperty('color-scheme', this.theme);
    this.setFavIcon();
  }

  set(theme: themeMode) {
    localStorage.setItem(this._themeKey, theme);
    document.documentElement.style.setProperty('color-scheme', theme);
    this.setFavIcon();
  }

  private setFavIcon() {
    if (this._favIcon)
      this._favIcon.href =
        this.theme !== 'light dark'
          ? this.theme === 'dark'
            ? 'favicon.ico'
            : 'favicon.dark.ico'
          : this.preferredTheme === 'dark'
            ? 'favicon.ico'
            : 'favicon.dark.ico';
  }
}
