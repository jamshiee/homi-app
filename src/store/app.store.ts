import { create } from 'zustand';
import { changeLanguage } from '@i18n/index';
import { fastStorage } from '@utils/storage';

interface AppState {
  language: 'en' | 'ml';
  latitude:number;
  longitude:number;
  location?:string;
  setLanguage: (lang: 'en' | 'ml') => Promise<void>;
  setLocation: (latitude: number, longitude: number,location?:string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: (fastStorage.getString('language') as 'en' | 'ml') || 'en',
  latitude: 0,
  longitude: 0,
  location:"",
  setLanguage: async (lang) => {
    await changeLanguage(lang);
    set({ language: lang });
  },
  setLocation: (latitude: number, longitude: number,location?:string) => {
    set({ latitude, longitude,location });
  },
}));

