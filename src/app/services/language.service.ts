import { Injectable, inject } from '@angular/core';

import { TranslocoService, getBrowserLang } from '@jsverse/transloco';

import moment from 'moment';
import 'moment/min/locales';
import { ReplaySubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  _langKey = 'app-language';
  _transloco: TranslocoService = inject(TranslocoService);

  initialized: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  availableLangs = this._transloco.getAvailableLangs() as string[];

  get lang(): string {
    return (localStorage.getItem(this._langKey) as string) || this.preferredLang;
  }

  get preferredLang(): string {
    return getBrowserLang() || 'en';
  }

  init() {
    this._transloco.setActiveLang(this.lang);
    moment.locale(this.lang);
    firstValueFrom(this._transloco.load(this.lang)).then(() => {
      this.initialized.next(true);
    });
  }

  set(lang: string) {
    localStorage.setItem(this._langKey, lang);
    this._transloco.setActiveLang(lang);
    moment.locale(lang);
  }
}
