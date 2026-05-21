import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detect if we are in Expo Go or Web
const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';
const useFallback = isExpoGo || isWeb;

// Try to initialize MMKV, but handle cases where it's not supported (Expo Go)
let mmkv: any = null;
if (!useFallback) {
  try {
    const { MMKV } = require('react-native-mmkv');
    mmkv = new MMKV();
  } catch (e) {
    console.warn('MMKV could not be initialized, falling back to AsyncStorage', e);
  }
}

/**
 * Secure Storage (for auth tokens, etc.)
 * Uses SecureStore on Native Dev Clients, AsyncStorage on Web/Expo Go
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (useFallback) {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (useFallback) {
      await AsyncStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string): Promise<void> {
    if (useFallback) {
      await AsyncStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * Fast Storage (for settings, theme, etc.)
 * Uses MMKV on Native Dev Clients, AsyncStorage on Web/Expo Go
 */
export const fastStorage = {
  getString(key: string): string | null {
    if (useFallback || !mmkv) {
      // Note: AsyncStorage is async, but MMKV is sync. 
      // This is a trade-off for Expo Go compatibility.
      // We return null here if we haven't prefetched it.
      // For a better implementation, one would need to use a sync-to-async wrapper.
      return null; 
    }
    return mmkv.getString(key);
  },

  set(key: string, value: string | boolean | number): void {
    if (useFallback || !mmkv) {
      void AsyncStorage.setItem(key, String(value));
      return;
    }
    mmkv.set(key, value);
  },

  delete(key: string): void {
    if (useFallback || !mmkv) {
      void AsyncStorage.removeItem(key);
      return;
    }
    mmkv.delete(key);
  },
};

/**
 * Cross-platform asynchronous storage (for drafts, cache, search history, etc.)
 * Uses high-performance MMKV where supported, falls back to AsyncStorage
 */
export const localStorage = {
  async getItem(key: string): Promise<string | null> {
    if (useFallback || !mmkv) {
      return await AsyncStorage.getItem(key);
    }
    return mmkv.getString(key) || null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (useFallback || !mmkv) {
      await AsyncStorage.setItem(key, value);
      return;
    }
    mmkv.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (useFallback || !mmkv) {
      await AsyncStorage.removeItem(key);
      return;
    }
    mmkv.delete(key);
  },
};
