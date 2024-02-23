import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkmodeService {
  favIcon: HTMLLinkElement | null = document.querySelector('#appIcon');

  constructor() {}

  initTheme() {
    let systemPreference =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    let userPreference = localStorage.getItem('prefers-color-scheme');
    if (!userPreference) localStorage.setItem('prefers-color-scheme', systemPreference);
    document.documentElement.setAttribute('data-bs-theme', this.isDarkMode() ? 'dark' : 'light');
    this.setFavIcon();
  }

  toggleTheme() {
    localStorage.setItem('prefers-color-scheme', this.isDarkMode() ? 'light' : 'dark');
    document.documentElement.setAttribute('data-bs-theme', this.isDarkMode() ? 'dark' : 'light');
    this.setFavIcon();
  }

  setTheme(theme: string) {
    localStorage.setItem('prefers-color-scheme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    this.setFavIcon();
  }

  isDarkMode() {
    return localStorage.getItem('prefers-color-scheme') == 'dark';
  }

  setFavIcon() {
    if (this.favIcon) this.favIcon.href = this.isDarkMode() ? 'favicon.ico' : 'favicon.dark.ico';
  }
}
