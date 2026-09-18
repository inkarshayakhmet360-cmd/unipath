import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useRouter } from "expo-router";

import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  const [message, setMessage] =
    useState("Входим в UniPath...");

  useEffect(() => {
    let finished = false;

    async function routeUser() {
      if (finished) return;

      const {
        data,
        error,
      } =
        await supabase.auth.getUser();

      if (error) {
        console.log(error);
        return;
      }

      if (!data.user) {
        return;
      }

      finished = true;

      const onboardingCompleted =
        data.user.user_metadata
          ?.onboarding_completed === true;

      router.replace(
        onboardingCompleted
          ? "/home"
          : "/questionnaire"
      );
    }

    routeUser();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            routeUser();
          }
        }
      );

    const timeout =
      setTimeout(() => {
        if (!finished) {
          setMessage(
            "Не удалось завершить вход. Попробуйте ещё раз."
          );
        }
      }, 10000);

    return () => {
      clearTimeout(timeout);

      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.page}>
      <ActivityIndicator
        size="large"
        color="#4F6F3C"
      />

      <Text style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F6F7F1",
  },

  text: {
    marginTop: 15,

    color: "#30362C",

    fontSize: 14,
    fontWeight: "700",
  },
});