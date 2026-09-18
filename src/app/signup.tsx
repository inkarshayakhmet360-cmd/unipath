// src/app/signup.tsx

import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  Ionicons,
  FontAwesome,
} from "@expo/vector-icons";

import { supabase } from "../lib/supabase";

/* =========================
   COLORS
========================= */

const COLORS = {
  background: "#F6F7F1",
  surface: "#FFFFFF",

  forest: "#4F6F3C",
  forest2: "#3F5A30",

  emerald: "#648B4A",
  green: "#7EA45F",

  sage: "#DDE6D1",
  sageSoft: "#F1F4EB",

  accent: "#B6CC93",

  text: "#30362C",
  muted: "#7A8473",

  border: "#DFE5D7",

  errorBackground: "#F7E7E2",
  error: "#A45E50",

  infoBackground: "#EEF4E7",
};

/* =========================
   SCREEN
========================= */

export default function SignupScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      mode?: string;
    }>();

  const { width } =
    useWindowDimensions();

  const desktop = width >= 850;

  /* =========================
     MODE
  ========================= */

  const [mode, setMode] =
    useState<
      "register" | "login"
    >(
      params.mode === "login"
        ? "login"
        : "register"
    );

  /* =========================
     INPUTS
  ========================= */

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    hidePassword,
    setHidePassword,
  ] = useState(true);

  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] =
    useState(false);

  const [errorText, setErrorText] =
    useState("");

  const [infoText, setInfoText] =
    useState("");

  /* =========================
     EMAIL REGISTER / LOGIN
  ========================= */

  async function handleEmailAuth() {
    setErrorText("");
    setInfoText("");

    /* VALIDATION */

    if (
      mode === "register" &&
      !name.trim()
    ) {
      setErrorText(
        "Введите ваше имя."
      );

      return;
    }

    if (!email.trim()) {
      setErrorText(
        "Введите электронную почту."
      );

      return;
    }

    if (!password.trim()) {
      setErrorText(
        "Введите пароль."
      );

      return;
    }

    if (password.length < 8) {
      setErrorText(
        "Пароль должен содержать минимум 8 символов."
      );

      return;
    }

    try {
      setLoading(true);

      /* =====================
         REGISTER
      ===================== */

      if (mode === "register") {
        const {
          data,
          error,
        } =
          await supabase.auth.signUp(
            {
              email:
                email
                  .trim()
                  .toLowerCase(),

              password,

              options: {
                data: {
                  full_name:
                    name.trim(),

                  onboarding_completed:
                    false,
                },
              },
            }
          );

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error(
            "Не удалось создать аккаунт."
          );
        }

        console.log(
          "CREATED USER:",
          data.user
        );

        /*
          Ты уже выключила
          Confirm email,
          поэтому session должна
          появиться сразу.
        */

        if (data.session) {
          router.replace(
            "/questionnaire"
          );

          return;
        }

        setInfoText(
          "Аккаунт создан. Проверьте электронную почту."
        );

        return;
      }

      /* =====================
         LOGIN
      ===================== */

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          }
        );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Не удалось войти."
        );
      }

      console.log(
        "LOGGED USER:",
        data.user
      );

      const onboardingCompleted =
        data.user.user_metadata
          ?.onboarding_completed ===
        true;

      /*
        Если пользователь уже
        проходил анкету → HOME.

        Если нет → questionnaire.
      */

      router.replace(
        onboardingCompleted
          ? "/home"
          : "/questionnaire"
      );
    } catch (error: any) {
      console.error(
        "AUTH ERROR:",
        error
      );

      const message =
        error?.message || "";

      if (
        message.includes(
          "Invalid login credentials"
        )
      ) {
        setErrorText(
          "Неверная почта или пароль."
        );
      } else if (
        message.includes(
          "User already registered"
        )
      ) {
        setErrorText(
          "Аккаунт с этой почтой уже существует. Нажмите «Войти»."
        );
      } else {
        setErrorText(
          message ||
            "Произошла ошибка авторизации."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* =========================
   SOCIAL LOGIN
========================= */

async function handleSocialLogin(
  provider: "google" | "apple"
) {
  setErrorText("");
  setInfoText("");

  try {
    setLoading(true);

    if (
      Platform.OS !== "web" ||
      typeof window === "undefined"
    ) {
      setErrorText(
        "Сейчас социальный вход работает только в web-версии."
      );

      setLoading(false);
      return;
    }

    const redirectTo =
      `${window.location.origin}/auth-callback`;

    console.log(
      "SOCIAL LOGIN:",
      provider,
      redirectTo
    );

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithOAuth({
        provider,

        options: {
          redirectTo,
        },
      });

    console.log(
      "OAUTH RESULT:",
      data
    );

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.location.href =
        data.url;
    }
  } catch (error: any) {
    console.error(
      "SOCIAL LOGIN ERROR:",
      error
    );

    setErrorText(
      error?.message ||
        "Ошибка социального входа."
    );

    setLoading(false);
  }
}
  /* =========================
     FACEBOOK TEMPORARY
  ========================= */

  function handleFacebook() {
    setErrorText("");

    setInfoText(
      "Facebook login пока не подключён."
    );
  }

  /* =========================
     SWITCH REGISTER / LOGIN
  ========================= */

  function switchMode() {
    setMode(
      mode === "register"
        ? "login"
        : "register"
    );

    setErrorText("");
    setInfoText("");

    setPassword("");
  }

  /* =========================
     UI
  ========================= */

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scroll
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              onPress={() =>
                router.back()
              }
              style={({
                pressed,
              }) => [
                styles.backButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={
                  COLORS.forest
                }
              />
            </Pressable>

            <View style={styles.logo}>
              <View
                style={
                  styles.logoIcon
                }
              >
                <Text
                  style={
                    styles.logoLetter
                  }
                >
                  U
                </Text>
              </View>

              <View>
                <Text
                  style={
                    styles.logoText
                  }
                >
                  unipath
                </Text>

                <Text
                  style={
                    styles.logoSub
                  }
                >
                  admission journey
                </Text>
              </View>
            </View>

            <View
              style={
                styles.headerSpace
              }
            />
          </View>

          {/* MAIN */}

          <View
            style={[
              styles.main,

              desktop &&
                styles.mainDesktop,
            ]}
          >
            {/* LEFT SIDE */}

            {desktop && (
              <View
                style={
                  styles.leftSide
                }
              >
                <View
                  style={
                    styles.visual
                  }
                >
                  <View
                    style={[
                      styles.backgroundCircle,
                      styles.circleLarge,
                    ]}
                  />

                  <View
                    style={[
                      styles.backgroundCircle,
                      styles.circleSmall,
                    ]}
                  />

                  <View
                    style={
                      styles.visualMain
                    }
                  >
                    <Text
                      style={
                        styles.visualEmoji
                      }
                    >
                      🎓
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.floatCard,
                      styles.cardOne,
                    ]}
                  >
                    <View
                      style={
                        styles.miniIcon
                      }
                    >
                      <Text
                        style={
                          styles.floatEmoji
                        }
                      >
                        ✦
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={
                          styles.cardLabel
                        }
                      >
                        PERSONAL PATH
                      </Text>

                      <Text
                        style={
                          styles.cardTitle
                        }
                      >
                        Built for you
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.floatCard,
                      styles.cardTwo,
                    ]}
                  >
                    <View
                      style={
                        styles.miniIcon
                      }
                    >
                      <Text
                        style={
                          styles.floatEmoji
                        }
                      >
                        ✓
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={
                          styles.cardLabel
                        }
                      >
                        PROFILE
                      </Text>

                      <Text
                        style={
                          styles.cardTitle
                        }
                      >
                        Saved securely
                      </Text>
                    </View>
                  </View>
                </View>

                <Text
                  style={
                    styles.visualTitle
                  }
                >
                  Один аккаунт — весь
                  путь поступления
                </Text>

                <Text
                  style={
                    styles.visualDescription
                  }
                >
                  Сохраняй университеты,
                  цели, дедлайны и
                  персональный roadmap в
                  одном месте.
                </Text>
              </View>
            )}

            {/* FORM */}

            <View
              style={
                styles.formWrapper
              }
            >
              <View
                style={
                  styles.heading
                }
              >
                <View
                  style={
                    styles.eyebrow
                  }
                >
                  <View
                    style={
                      styles.eyebrowDot
                    }
                  />

                  <Text
                    style={
                      styles.eyebrowText
                    }
                  >
                    {mode ===
                    "register"
                      ? "CREATE YOUR PROFILE"
                      : "WELCOME BACK"}
                  </Text>
                </View>

                <Text
                  style={styles.title}
                >
                  {mode ===
                  "register"
                    ? "Создай аккаунт"
                    : "С возвращением"}
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  {mode ===
                  "register"
                    ? "Сохрани свой персональный маршрут поступления"
                    : "Войди, чтобы продолжить свой маршрут поступления"}
                </Text>
              </View>

              {/* SOCIAL */}

              <View
                style={
                  styles.socialButtons
                }
              >
                {/* GOOGLE */}

                <Pressable
                  onPress={() =>
     handleSocialLogin("google")
}
                  disabled={loading}
                  style={({
                    pressed,
                  }) => [
                    styles.socialButton,

                    pressed &&
                      styles.socialPressed,

                    loading && {
                      opacity: 0.6,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.socialIcon
                    }
                  >
                    <FontAwesome
                      name="google"
                      size={20}
                      color="#4285F4"
                    />
                  </View>

                  <Text
                    style={
                      styles.socialText
                    }
                  >
                    Продолжить с Google
                  </Text>
                </Pressable>

                {/* APPLE */}

                <Pressable
                  onPress={() =>
  handleSocialLogin("apple")
}
                  style={({
                    pressed,
                  }) => [
                    styles.socialButton,

                    pressed &&
                      styles.socialPressed,
                  ]}
                >
                  <View
                    style={
                      styles.socialIcon
                    }
                  >
                    <FontAwesome
                      name="apple"
                      size={23}
                      color="#111111"
                    />
                  </View>

                  <Text
                    style={
                      styles.socialText
                    }
                  >
                    Продолжить с Apple
                  </Text>
                </Pressable>

                {/* FACEBOOK */}

                <Pressable
                  onPress={
                    handleFacebook
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.socialButton,

                    pressed &&
                      styles.socialPressed,
                  ]}
                >
                  <View
                    style={
                      styles.socialIcon
                    }
                  >
                    <FontAwesome
                      name="facebook"
                      size={21}
                      color="#1877F2"
                    />
                  </View>

                  <Text
                    style={
                      styles.socialText
                    }
                  >
                    Продолжить с Facebook
                  </Text>
                </Pressable>
              </View>

              {/* DIVIDER */}

              <View
                style={styles.divider}
              >
                <View
                  style={
                    styles.dividerLine
                  }
                />

                <Text
                  style={
                    styles.dividerText
                  }
                >
                  ИЛИ
                </Text>

                <View
                  style={
                    styles.dividerLine
                  }
                />
              </View>

              {/* NAME */}

              {mode ===
                "register" && (
                <View
                  style={
                    styles.inputGroup
                  }
                >
                  <Text
                    style={
                      styles.inputLabel
                    }
                  >
                    Имя
                  </Text>

                  <View
                    style={
                      styles.inputContainer
                    }
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={
                        COLORS.muted
                      }
                    />

                    <TextInput
                      value={name}
                      onChangeText={
                        setName
                      }
                      placeholder="Как тебя зовут?"
                      placeholderTextColor="#9BA69E"
                      autoCapitalize="words"
                      style={
                        styles.input
                      }
                    />
                  </View>
                </View>
              )}

              {/* EMAIL */}

              <View
                style={
                  styles.inputGroup
                }
              >
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Электронная почта
                </Text>

                <View
                  style={
                    styles.inputContainer
                  }
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={
                      COLORS.muted
                    }
                  />

                  <TextInput
                    value={email}
                    onChangeText={
                      setEmail
                    }
                    placeholder="name@gmail.com"
                    placeholderTextColor="#9BA69E"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={
                      styles.input
                    }
                  />
                </View>
              </View>

              {/* PASSWORD */}

              <View
                style={
                  styles.inputGroup
                }
              >
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Пароль
                </Text>

                <View
                  style={
                    styles.inputContainer
                  }
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      COLORS.muted
                    }
                  />

                  <TextInput
                    value={password}
                    onChangeText={
                      setPassword
                    }
                    placeholder="Минимум 8 символов"
                    placeholderTextColor="#9BA69E"
                    secureTextEntry={
                      hidePassword
                    }
                    autoCapitalize="none"
                    style={
                      styles.input
                    }
                  />

                  <Pressable
                    onPress={() =>
                      setHidePassword(
                        !hidePassword
                      )
                    }
                  >
                    <Ionicons
                      name={
                        hidePassword
                          ? "eye-outline"
                          : "eye-off-outline"
                      }
                      size={21}
                      color={
                        COLORS.muted
                      }
                    />
                  </Pressable>
                </View>
              </View>

              {/* ERROR */}

              {errorText ? (
                <View
                  style={
                    styles.errorBox
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={17}
                    color={COLORS.error}
                  />

                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {errorText}
                  </Text>
                </View>
              ) : null}

              {/* INFO */}

              {infoText ? (
                <View
                  style={
                    styles.infoBox
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={17}
                    color={
                      COLORS.emerald
                    }
                  />

                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    {infoText}
                  </Text>
                </View>
              ) : null}

              {/* CONTINUE */}

              <Pressable
                onPress={
                  handleEmailAuth
                }
                disabled={loading}
                style={({
                  pressed,
                }) => [
                  styles.continueButton,

                  pressed &&
                    styles.continuePressed,

                  loading && {
                    opacity: 0.65,
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles.continueText
                      }
                    >
                      {mode ===
                      "register"
                        ? "СОЗДАТЬ АККАУНТ"
                        : "ВОЙТИ"}
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>

              {/* SWITCH LOGIN / REGISTER */}

              <View
                style={
                  styles.loginRow
                }
              >
                <Text
                  style={
                    styles.loginNormal
                  }
                >
                  {mode ===
                  "register"
                    ? "Уже есть аккаунт?"
                    : "Ещё нет аккаунта?"}
                </Text>

                <Pressable
                  onPress={
                    switchMode
                  }
                >
                  <Text
                    style={
                      styles.loginLink
                    }
                  >
                    {mode ===
                    "register"
                      ? "Войти"
                      : "Создать аккаунт"}
                  </Text>
                </Pressable>
              </View>

              <Text
                style={styles.terms}
              >
                Продолжая, ты принимаешь
                условия использования и
                политику
                конфиденциальности.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  scroll: {
    flexGrow: 1,
    backgroundColor:
      COLORS.background,
  },

  header: {
    width: "100%",
    maxWidth: 1180,

    alignSelf: "center",

    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,

    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  backButton: {
    width: 43,
    height: 43,

    borderRadius: 14,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      COLORS.surface,
  },

  pressed: {
    opacity: 0.65,
  },

  logo: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  logoLetter: {
    color: "#FFFFFF",

    fontSize: 18,
    fontWeight: "900",
  },

  logoText: {
    color:
      COLORS.forest,

    fontSize: 20,
    fontWeight: "900",

    letterSpacing: -0.5,
  },

  logoSub: {
    color:
      COLORS.muted,

    fontSize: 8,

    textTransform:
      "uppercase",

    letterSpacing: 1,
  },

  headerSpace: {
    width: 43,
  },

  main: {
    flex: 1,

    width: "100%",
    maxWidth: 1180,

    alignSelf: "center",

    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 55,

    alignItems: "center",
    justifyContent: "center",
  },

  mainDesktop: {
    flexDirection: "row",
    gap: 80,

    paddingTop: 55,
  },

  leftSide: {
    width: "46%",
    maxWidth: 480,

    alignItems: "center",
  },

  visual: {
    width: 340,
    height: 300,

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  backgroundCircle: {
    position: "absolute",
    borderRadius: 999,
  },

  circleLarge: {
    width: 265,
    height: 265,

    backgroundColor:
      COLORS.sageSoft,
  },

  circleSmall: {
    width: 120,
    height: 120,

    backgroundColor:
      COLORS.sage,

    right: 12,
    top: 32,
  },

  visualMain: {
    width: 145,
    height: 145,

    borderRadius: 73,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",

    shadowColor:
      COLORS.forest,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.12,
    shadowRadius: 16,

    elevation: 5,
  },

  visualEmoji: {
    fontSize: 64,
  },

  floatCard: {
    position: "absolute",

    minWidth: 150,

    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 16,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,

    flexDirection: "row",
    alignItems: "center",

    shadowColor:
      COLORS.forest,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 3,
  },

  cardOne: {
    left: 0,
    top: 25,
  },

  cardTwo: {
    right: 0,
    bottom: 30,
  },

  miniIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  floatEmoji: {
    color:
      COLORS.emerald,

    fontSize: 19,
    fontWeight: "900",
  },

  cardLabel: {
    color:
      COLORS.muted,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.6,
  },

  cardTitle: {
    color:
      COLORS.text,

    fontSize: 12,
    fontWeight: "800",

    marginTop: 2,
  },

  visualTitle: {
    color:
      COLORS.text,

    fontSize: 24,
    fontWeight: "800",

    textAlign: "center",

    marginTop: 14,
  },

  visualDescription: {
    color:
      COLORS.muted,

    maxWidth: 420,

    fontSize: 14,
    lineHeight: 21,

    textAlign: "center",

    marginTop: 10,
  },

  formWrapper: {
    width: "100%",
    maxWidth: 440,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 24,

    padding: 24,
  },

  heading: {
    alignItems: "center",

    marginBottom: 28,
  },

  eyebrow: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor:
      COLORS.sageSoft,

    borderRadius: 999,

    paddingHorizontal: 11,
    paddingVertical: 7,

    marginBottom: 13,
  },

  eyebrowDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor:
      COLORS.emerald,

    marginRight: 7,
  },

  eyebrowText: {
    color:
      COLORS.emerald,

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  title: {
    color:
      COLORS.text,

    fontSize: 31,
    fontWeight: "800",

    letterSpacing: -0.7,

    textAlign: "center",
  },

  subtitle: {
    color:
      COLORS.muted,

    fontSize: 14,
    lineHeight: 21,

    textAlign: "center",

    marginTop: 8,

    maxWidth: 350,
  },

  socialButtons: {
    gap: 11,
  },

  socialButton: {
    width: "100%",
    height: 56,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 15,

    backgroundColor:
      "#FAFCF9",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
  },

  socialPressed: {
    opacity: 0.7,
  },

  socialIcon: {
    width: 31,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  socialText: {
    color:
      COLORS.text,

    fontSize: 14,
    fontWeight: "700",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",

    marginVertical: 23,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor:
      COLORS.border,
  },

  dividerText: {
    color:
      COLORS.muted,

    fontSize: 9,
    fontWeight: "900",

    marginHorizontal: 14,
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    color:
      COLORS.text,

    fontSize: 12,
    fontWeight: "800",

    marginBottom: 8,
    marginLeft: 2,
  },

  inputContainer: {
    width: "100%",
    height: 56,

    paddingHorizontal: 15,

    borderRadius: 15,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      "#FAFCF9",

    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,

    marginLeft: 10,

    color:
      COLORS.text,

    fontSize: 15,
    fontWeight: "600",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 7,

    padding: 11,

    borderRadius: 12,

    backgroundColor:
      COLORS.errorBackground,

    marginBottom: 12,
  },

  errorText: {
    flex: 1,

    color:
      COLORS.error,

    fontSize: 10,
    lineHeight: 15,

    fontWeight: "600",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 7,

    padding: 11,

    borderRadius: 12,

    backgroundColor:
      COLORS.infoBackground,

    marginBottom: 12,
  },

  infoText: {
    flex: 1,

    color:
      COLORS.forest,

    fontSize: 10,
    lineHeight: 15,

    fontWeight: "600",
  },

  continueButton: {
    height: 57,

    borderRadius: 15,

    backgroundColor:
      COLORS.forest,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 9,

    marginTop: 7,

    shadowColor:
      COLORS.forest,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 4,
  },

  continuePressed: {
    opacity: 0.86,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  continueText: {
    color: "#FFFFFF",

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: 0.7,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 25,
  },

  loginNormal: {
    color:
      COLORS.muted,

    fontSize: 13,
    fontWeight: "600",

    marginRight: 5,
  },

  loginLink: {
    color:
      COLORS.emerald,

    fontSize: 13,
    fontWeight: "900",
  },

  terms: {
    color:
      COLORS.muted,

    fontSize: 10,
    lineHeight: 15,

    textAlign: "center",

    marginTop: 18,
    paddingHorizontal: 25,
  },
});