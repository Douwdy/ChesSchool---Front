import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importation directe des fichiers de traduction
import enUS from './lang/en-US.json';
import frFR from './lang/fr-FR.json';
import itIT from './lang/it-IT.json';
import zhCN from './lang/zh-CN.json';
import jpJP from './lang/jp-JP.json';
import hiIN from './lang/hi-IN.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enUS },
      fr: { translation: frFR },
      it: { translation: itIT },
      zh: { translation: zhCN },
      jp: { translation: jpJP },
      hi: { translation: hiIN }
    },
    fallbackLng: 'fr',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    },
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;