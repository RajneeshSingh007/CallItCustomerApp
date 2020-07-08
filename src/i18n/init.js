import i18next from 'i18next';
import { NativeModules, Platform} from 'react-native';

const locale = Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale
    : NativeModules.I18nManager.localeIdentifier;

import english from './english';
import hebrew from './hebrew';

console.log(`lng`, locale)
i18next.init({
  lng: 'he',
  debug: true,
  resources: {
    he: { translation: hebrew },
    en: { translation: english },
  },
  initImmediate:true,
  fallbackLng:'en',
}).then(function (t) {
  // initialized and ready to go!
  console.log(`initialized`, i18next.t('key'));
});
