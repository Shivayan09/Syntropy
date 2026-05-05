import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const AUTH_TOKEN_KEY = "syntropy.auth.token";

const webStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

export const authStorage = {
  async getToken() {
    if (Platform.OS === "web") {
      return webStorage.getItem(AUTH_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },
  async setToken(token: string) {
    if (Platform.OS === "web") {
      webStorage.setItem(AUTH_TOKEN_KEY, token);
      return;
    }
    return SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },
  async clearToken() {
    if (Platform.OS === "web") {
      webStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }
    return SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },
};
