import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fastStorage } from '@utils/storage';
import en from './en.json';
import ml from './ml.json';

const savedLanguage = fastStorage.getString('language') || 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ml: { translation: ml },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

export const changeLanguage = async (lang: 'en' | 'ml') => {
  fastStorage.set('language', lang);
  await i18n.changeLanguage(lang);
};

