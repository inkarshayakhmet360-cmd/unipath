// src/app/ai-test.tsx

import React, { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { askUniPathAI } from "../lib/ai";

/* =========================
   COLORS
========================= */

const COLORS = {
  background: "#F6F7F1",
  surface: "#FFFFFF",

  forest: "#4F6F3C",
  forestDark: "#3F5A30",

  emerald: "#648B4A",

  sage: "#DDE6D1",
  sageSoft: "#F1F4EB",

  accent: "#B6CC93",

  text: "#30362C",
  muted: "#7A8473",

  border: "#DFE5D7",

  error: "#B84A4A",
};

/* =========================
   TEST PAGE
========================= */

export default function AITestPage() {
  const [
    question,
    setQuestion,
  ] = useState(
    "Проанализируй мой профиль и скажи, что мне нужно улучшить в первую очередь."
  );

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    profileUsed,
    setProfileUsed,
  ] = useState<any>(
    null
  );

  /* =========================
     SEND TEST
  ========================= */

  async function testAI() {
    const cleanQuestion =
      question.trim();

    if (
      !cleanQuestion ||
      loading
    ) {
      return;
    }

    setLoading(true);

    setError("");

    setAnswer("");

    setProfileUsed(
      null
    );

    try {
      const result =
        await askUniPathAI({
          message:
            cleanQuestion,

          currentPage:
            "profile",
        });

      setAnswer(
        result.answer
      );

      setProfileUsed(
        result.profileUsed ??
          null
      );
    } catch (
      err
    ) {
      console.error(
        "AI TEST ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Неизвестная ошибка AI."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <SafeAreaView
      style={
        styles.safe
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.replace(
                "/home"
              )
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
              name="arrow-back"
              size={20}
              color={
                COLORS.text
              }
            />
          </Pressable>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              UNIPATH AI
            </Text>

            <Text
              style={
                styles.title
              }
            >
              AI Brain Test
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Проверяем связь:
              сайт → Supabase →
              Groq → профиль
              пользователя.
            </Text>
          </View>
        </View>

        {/* STATUS */}

        <View
          style={
            styles.statusCard
          }
        >
          <View
            style={
              styles.statusIcon
            }
          >
            <Ionicons
              name="sparkles"
              size={22}
              color={
                COLORS.forest
              }
            />
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.statusTitle
              }
            >
              UniPath AI
              Counselor
            </Text>

            <Text
              style={
                styles.statusText
              }
            >
              Если тест
              сработает, значит
              AI уже умеет
              получать профиль
              текущего аккаунта.
            </Text>
          </View>
        </View>

        {/* QUESTION */}

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.label
            }
          >
            ТЕСТОВЫЙ ВОПРОС
          </Text>

          <TextInput
            value={
              question
            }
            onChangeText={
              setQuestion
            }
            multiline
            placeholder="Напиши вопрос..."
            placeholderTextColor={
              COLORS.muted
            }
            style={
              styles.input
            }
          />

          <Pressable
            onPress={
              testAI
            }
            disabled={
              loading ||
              !question.trim()
            }
            style={({
              pressed,
            }) => [
              styles.button,

              (
                loading ||
                !question.trim()
              ) &&
                styles.buttonDisabled,

              pressed &&
                styles.pressed,
            ]}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  AI думает...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="send"
                  size={17}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Отправить
                  UniPath AI
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* ERROR */}

        {!!error && (
          <View
            style={
              styles.errorCard
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={
                COLORS.error
              }
            />

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.errorTitle
                }
              >
                Ошибка
              </Text>

              <Text
                selectable
                style={
                  styles.errorText
                }
              >
                {
                  error
                }
              </Text>
            </View>
          </View>
        )}

        {/* ANSWER */}

        {!!answer && (
          <View
            style={
              styles.answerCard
            }
          >
            <View
              style={
                styles.answerHeader
              }
            >
              <View
                style={
                  styles.answerIcon
                }
              >
                <Ionicons
                  name="sparkles"
                  size={17}
                  color={
                    COLORS.forest
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.answerTitle
                  }
                >
                  UniPath AI
                </Text>

                <Text
                  style={
                    styles.answerSub
                  }
                >
                  Персональный
                  ответ
                </Text>
              </View>
            </View>

            <Text
              selectable
              style={
                styles.answerText
              }
            >
              {
                answer
              }
            </Text>
          </View>
        )}

        {/* PROFILE DEBUG */}

        {!!profileUsed && (
          <View
            style={
              styles.profileCard
            }
          >
            <Text
              style={
                styles.label
              }
            >
              ПРОФИЛЬ, КОТОРЫЙ
              УВИДЕЛ AI
            </Text>

            <ProfileRow
              label="Name"
              value={
                profileUsed
                  .name
              }
            />

            <ProfileRow
              label="Grade"
              value={
                profileUsed
                  .grade
              }
            />

            <ProfileRow
              label="GPA"
              value={
                profileUsed
                  .gpa
              }
            />

            <ProfileRow
              label="IELTS"
              value={
                profileUsed
                  .ielts
              }
            />

            <ProfileRow
              label="SAT"
              value={
                profileUsed
                  .sat
              }
            />

            <ProfileRow
              label="Interests"
              value={
                Array.isArray(
                  profileUsed
                    .interests
                )
                  ? profileUsed
                      .interests
                      .join(
                        ", "
                      )
                  : null
              }
            />

            <ProfileRow
              label="Countries"
              value={
                Array.isArray(
                  profileUsed
                    .countries
                )
                  ? profileUsed
                      .countries
                      .join(
                        ", "
                      )
                  : null
              }
            />

            <ProfileRow
              label="Budget"
              value={
                profileUsed
                  .budget
              }
            />

            <ProfileRow
              label="Scholarship"
              value={
                profileUsed
                  .needsScholarship
                  ? "Да"
                  : "Нет"
              }
            />

            <ProfileRow
              label="Portfolio"
              value={
                Array.isArray(
                  profileUsed
                    .portfolio
                )
                  ? profileUsed
                      .portfolio
                      .join(
                        ", "
                      )
                  : null
              }
            />
          </View>
        )}

        <View
          style={{
            height: 60,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   PROFILE ROW
========================= */

function ProfileRow({
  label,
  value,
}: {
  label: string;

  value: unknown;
}) {
  const text =
    value === null ||
    value === undefined ||
    String(value).trim() ===
      ""
      ? "—"
      : String(value);

  return (
    <View
      style={
        styles.profileRow
      }
    >
      <Text
        style={
          styles.profileLabel
        }
      >
        {
          label
        }
      </Text>

      <Text
        selectable
        style={
          styles.profileValue
        }
      >
        {
          text
        }
      </Text>
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    page: {
      width: "100%",

      maxWidth: 850,

      alignSelf:
        "center",

      paddingHorizontal:
        24,

      paddingTop: 30,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap: 15,

      marginBottom:
        24,
    },

    backButton: {
      width: 42,

      height: 42,

      borderRadius:
        13,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    eyebrow: {
      color:
        COLORS.emerald,

      fontSize: 9,

      fontWeight:
        "900",

      letterSpacing:
        1.2,

      marginBottom:
        6,
    },

    title: {
      color:
        COLORS.text,

      fontSize: 30,

      fontWeight:
        "900",
    },

    subtitle: {
      color:
        COLORS.muted,

      fontSize: 12,

      lineHeight: 18,

      marginTop: 5,
    },

    statusCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding: 18,

      borderRadius:
        18,

      backgroundColor:
        COLORS.sageSoft,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      marginBottom:
        14,
    },

    statusIcon: {
      width: 45,

      height: 45,

      borderRadius:
        14,

      backgroundColor:
        COLORS.accent,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        13,
    },

    statusTitle: {
      color:
        COLORS.text,

      fontSize: 14,

      fontWeight:
        "900",
    },

    statusText: {
      color:
        COLORS.muted,

      fontSize: 10,

      lineHeight: 15,

      marginTop: 3,
    },

    card: {
      padding: 20,

      borderRadius:
        20,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      marginBottom:
        14,
    },

    label: {
      color:
        COLORS.emerald,

      fontSize: 9,

      fontWeight:
        "900",

      letterSpacing:
        1,

      marginBottom:
        10,
    },

    input: {
      minHeight: 105,

      padding: 14,

      borderRadius:
        14,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.background,

      color:
        COLORS.text,

      fontSize: 13,

      lineHeight: 20,

      textAlignVertical:
        "top",
    },

    button: {
      height: 48,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,

      backgroundColor:
        COLORS.forest,

      borderRadius:
        14,

      marginTop: 13,
    },

    buttonDisabled: {
      opacity: 0.5,
    },

    buttonText: {
      color:
        "#FFFFFF",

      fontSize: 11,

      fontWeight:
        "800",
    },

    errorCard: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap: 10,

      padding: 17,

      borderRadius:
        17,

      borderWidth: 1,

      borderColor:
        "#E4C6C6",

      backgroundColor:
        "#FFF5F5",

      marginBottom:
        14,
    },

    errorTitle: {
      color:
        COLORS.error,

      fontSize: 12,

      fontWeight:
        "900",
    },

    errorText: {
      color:
        COLORS.error,

      fontSize: 10,

      lineHeight: 16,

      marginTop: 4,
    },

    answerCard: {
      padding: 20,

      borderRadius:
        20,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      marginBottom:
        14,
    },

    answerHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        15,
    },

    answerIcon: {
      width: 38,

      height: 38,

      borderRadius:
        12,

      backgroundColor:
        COLORS.accent,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        10,
    },

    answerTitle: {
      color:
        COLORS.text,

      fontSize: 13,

      fontWeight:
        "900",
    },

    answerSub: {
      color:
        COLORS.muted,

      fontSize: 9,

      marginTop: 2,
    },

    answerText: {
      color:
        COLORS.text,

      fontSize: 13,

      lineHeight: 21,
    },

    profileCard: {
      padding: 20,

      borderRadius:
        20,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      marginBottom:
        14,
    },

    profileRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      gap: 20,

      paddingVertical:
        10,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },

    profileLabel: {
      width: 110,

      color:
        COLORS.muted,

      fontSize: 10,

      fontWeight:
        "700",
    },

    profileValue: {
      flex: 1,

      color:
        COLORS.text,

      fontSize: 11,

      lineHeight: 16,

      fontWeight:
        "700",

      textAlign:
        "right",
    },

    pressed: {
      opacity: 0.7,
    },
  });