import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";

const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const isSSR =
  typeof window === "undefined";

const safeStorage = {
  getItem: async (
    key: string
  ) => {
    if (isSSR) {
      return null;
    }

    return AsyncStorage.getItem(
      key
    );
  },

  setItem: async (
    key: string,
    value: string
  ) => {
    if (isSSR) {
      return;
    }

    await AsyncStorage.setItem(
      key,
      value
    );
  },

  removeItem: async (
    key: string
  ) => {
    if (isSSR) {
      return;
    }

    await AsyncStorage.removeItem(
      key
    );
  },
};

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        storage: safeStorage,

        autoRefreshToken:
          true,

        persistSession:
          true,

        detectSessionInUrl:
          false,
      },
    }
  );