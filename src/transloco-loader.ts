import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  _http = inject(HttpClient);

  getTranslation(lang: string) {
    return this._http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}
