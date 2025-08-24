import { Injectable, inject } from '@angular/core';

import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  _langKey = 'app-language';
  _transloco: TranslocoService = inject(TranslocoService);

  availableLangs = this._transloco.getAvailableLangs() as string[];

  get lang(): string {
    return (localStorage.getItem(this._langKey) as string) || 'en';
  }

  get preferredLang(): string {
    console.log(navigator.language);
    return navigator.language;
  }

  init() {
    this._transloco.setActiveLang(this.lang);
  }

  set(lang: string) {
    localStorage.setItem(this._langKey, lang);
    this._transloco.setActiveLang(lang);
  }
}
