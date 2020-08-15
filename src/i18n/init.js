import i18next from 'i18next';
import hebrew from './hebrew';
import arabic from './arabic';
import DeviceInfo from 'react-native-device-info';

i18next
  .init({
    lng: DeviceInfo.getDeviceLocale(),
    debug: true,
    resources: {
      he: {translation: hebrew},
      ar: {translation: arabic},
    },
    initImmediate: true,
    fallbackLng: 'he',
  })
  .then(function(t) {
    // initialized and ready to go!
    console.log(`initialized`, i18next.t('key'));
  });

export default i18next;
