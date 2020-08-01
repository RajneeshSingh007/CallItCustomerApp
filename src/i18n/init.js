import i18next from 'i18next';
import english from './english';
import hebrew from './hebrew';
import arabic from './arabic';

i18next
  .init({
    lng: 'he',
    debug: true,
    resources: {
      he: {translation: hebrew},
      ar: {translation: arabic},
      en: {translation: english},
    },
    initImmediate: true,
    fallbackLng: 'he',
  })
  .then(function(t) {
    // initialized and ready to go!
    console.log(`initialized`, i18next.t('key'));
  });

export default i18next;
