import { Injectable, inject } from '@angular/core';

import { TranslocoService, getBrowserLang } from '@jsverse/transloco';

import moment from 'moment';
import 'moment/min/locales';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  _langKey = 'app-language';
  _transloco: TranslocoService = inject(TranslocoService);

  availableLangs = this._transloco.getAvailableLangs() as string[];

  get lang(): string {
    return (localStorage.getItem(this._langKey) as string) || this.preferredLang;
  }

  get preferredLang(): string {
    return getBrowserLang() || 'en';
  }

  init() {
    this._transloco.setActiveLang(this.lang);
    console.log(`Language initialized to: ${this.lang}`);
    moment.locale(this.lang);
  }

  set(lang: string) {
    localStorage.setItem(this._langKey, lang);
    this._transloco.setActiveLang(lang);
    console.log(`Language changed to: ${lang}`);
    moment.locale(lang);
  }
}
