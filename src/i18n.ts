import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import ta from './locales/ta/translation.json';
import te from './locales/te/translation.json';
import bn from './locales/bn/translation.json';
import pa from './locales/pa/translation.json';
import mr from './locales/mr/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: en
            },
            hi: {
                translation: hi
            },
            ta: {
                translation: ta
            },
            te: {
                translation: te
            },
            bn: {
                translation: bn
            },
            pa: {
                translation: pa
            },
            mr: {
                translation: mr
            }
        }
    });

export default i18n;
