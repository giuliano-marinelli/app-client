import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: 'src/assets/i18n/',
  langs: [
    'de',
    'en',
    'es',
    'fr',
    'it',
    'pt'
  ],
  keysManager: {}
};

export default config;
