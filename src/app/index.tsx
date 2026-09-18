// src/app/index.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import { useRouter } from "expo-router";

const COLORS = {
  background: "#F6F7F1",
  surface: "#FFFFFF",

  // основной тёплый тёмно-зелёный
  forest: "#4F6F3C",

  // более глубокий оттенок
  forest2: "#3F5A30",

  // фирменный зелёный
  emerald: "#648B4A",

  // более светлый зелёный
  green: "#7EA45F",

  // мягкие зелёные поверхности
  sage: "#DDE6D1",
  sageSoft: "#F1F4EB",

  // дополнительный акцент
  accent: "#B6CC93",

  // текст
  text: "#30362C",
  muted: "#7A8473",

  // границы
  border: "#DFE5D7",

  warningBackground: "#F7F2E7",
  warning: "#927447",
};

export default function WelcomeScreen() {
  const router = useRouter();

  const { width } = useWindowDimensions();

  const desktop = width >= 850;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>U</Text>
            </View>

            <View>
              <Text style={styles.logoText}>
                unipath
              </Text>

              <Text style={styles.logoSub}>
                admission journey
              </Text>
            </View>
          </View>
        </View>

        {/* HERO */}

        <View
          style={[
            styles.hero,
            desktop && styles.heroDesktop,
          ]}
        >
          {/* VISUAL */}

          <View
            style={[
              styles.visualSide,
              desktop && styles.visualDesktop,
            ]}
          >
            <View style={styles.illustration}>
              <View
                style={[
                  styles.softCircle,
                  styles.circleOne,
                ]}
              />

              <View
                style={[
                  styles.softCircle,
                  styles.circleTwo,
                ]}
              />

              <View style={styles.mainCircle}>
                <Text style={styles.cap}>🎓</Text>
              </View>

              <View
                style={[
                  styles.floatCard,
                  styles.aiCard,
                ]}
              >
                <View style={styles.smallIcon}>
                  <Text style={styles.sparkle}>
                    ✦
                  </Text>
                </View>

                <View>
                  <Text style={styles.cardSmall}>
                    AI ROADMAP
                  </Text>

                  <Text style={styles.cardBig}>
                    Your path
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.floatCard,
                  styles.ieltsCard,
                ]}
              >
                <Text style={styles.testEmoji}>
                  📝
                </Text>

                <View>
                  <Text style={styles.cardSmall}>
                    IELTS
                  </Text>

                  <Text style={styles.cardBig}>
                    6.5 → 7.5
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.floatCard,
                  styles.universityCard,
                ]}
              >
                <Text style={styles.testEmoji}>
                  🏛️
                </Text>

                <View>
                  <Text style={styles.cardSmall}>
                    UNIVERSITIES
                  </Text>

                  <Text style={styles.cardBig}>
                    Best matches
                  </Text>
                </View>
              </View>

              <View style={styles.successBubble}>
                <Text style={styles.successCheck}>
                  ✓
                </Text>
              </View>
            </View>
          </View>

          {/* TEXT */}

          <View
            style={[
              styles.contentSide,
              desktop && styles.contentDesktop,
            ]}
          >
            <View style={styles.badge}>
              <View style={styles.badgeDot} />

              <Text style={styles.badgeText}>
                ПЕРСОНАЛЬНЫЙ МАРШРУТ ПОСТУПЛЕНИЯ
              </Text>
            </View>

            <Text
              style={[
                styles.title,
                desktop && styles.titleDesktop,
              ]}
            >
              Поступление начинается с понятного маршрута.
            </Text>

            <Text style={styles.description}>
              Расскажи о себе — AI подберёт подходящие
              университеты, покажет, что стоит улучшить,
              и построит пошаговый план поступления.
            </Text>

            <View style={styles.buttons}>
              <Pressable
                onPress={() =>
                  router.push("/signup")
                }
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed &&
                    styles.primaryPressed,
                ]}
              >
                <Text style={styles.primaryText}>
                  НАЧАТЬ
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push("/home")
                }
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed &&
                    styles.secondaryPressed,
                ]}
              >
                <Text style={styles.secondaryText}>
                  У МЕНЯ УЖЕ ЕСТЬ АККАУНТ
                </Text>
              </Pressable>
            </View>

            <Text style={styles.caption}>
              Профиль • Университеты • Roadmap • Дедлайны
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    width: "100%",
    maxWidth: 1150,
    alignSelf: "center",

    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
  },

  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.forest,

    marginRight: 10,
  },

  logoIconText: {
    color: "#FFFFFF",

    fontSize: 20,
    fontWeight: "900",
  },

  logoText: {
    color: COLORS.forest,

    fontSize: 22,
    fontWeight: "900",

    letterSpacing: -0.5,
  },

  logoSub: {
    color: COLORS.muted,

    fontSize: 8,

    textTransform: "uppercase",

    letterSpacing: 1,
  },

  hero: {
    flex: 1,

    width: "100%",
    maxWidth: 1150,

    alignSelf: "center",

    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 50,

    alignItems: "center",
    justifyContent: "center",
  },

  heroDesktop: {
    flexDirection: "row",

    paddingTop: 65,
    paddingBottom: 80,
  },

  visualSide: {
    width: "100%",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 44,
  },

  visualDesktop: {
    width: "50%",
    marginBottom: 0,
  },

  illustration: {
    width: 315,
    height: 310,

    position: "relative",

    alignItems: "center",
    justifyContent: "center",
  },

  softCircle: {
    position: "absolute",

    borderRadius: 999,

    backgroundColor: COLORS.sageSoft,
  },

  circleOne: {
    width: 260,
    height: 260,

    left: 20,
    top: 25,
  },

  circleTwo: {
    width: 170,
    height: 170,

    right: 0,
    bottom: 5,

    backgroundColor: COLORS.sage,
  },

  mainCircle: {
    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor: COLORS.forest,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: COLORS.forest,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.13,
    shadowRadius: 18,

    elevation: 5,
  },

  cap: {
    fontSize: 66,
  },

  floatCard: {
    position: "absolute",

    backgroundColor: COLORS.surface,

    minWidth: 135,

    paddingHorizontal: 13,
    paddingVertical: 11,

    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: COLORS.forest,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.07,
    shadowRadius: 12,

    elevation: 3,
  },

  aiCard: {
    left: 0,
    top: 25,
  },

  ieltsCard: {
    right: 0,
    top: 67,
  },

  universityCard: {
    left: 14,
    bottom: 16,
  },

  smallIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    marginRight: 9,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.sage,
  },

  sparkle: {
    color: COLORS.emerald,

    fontSize: 19,
    fontWeight: "900",
  },

  testEmoji: {
    fontSize: 24,

    marginRight: 8,
  },

  cardSmall: {
    color: COLORS.muted,

    fontSize: 8,
    fontWeight: "800",

    letterSpacing: 0.6,
  },

  cardBig: {
    color: COLORS.text,

    fontSize: 12,
    fontWeight: "800",

    marginTop: 2,
  },

  successBubble: {
    position: "absolute",

    width: 48,
    height: 48,

    borderRadius: 24,

    right: 28,
    bottom: 25,

    backgroundColor: COLORS.emerald,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 5,
    borderColor: COLORS.background,
  },

  successCheck: {
    color: "#FFFFFF",

    fontSize: 21,
    fontWeight: "900",
  },

  contentSide: {
    width: "100%",
    maxWidth: 500,

    alignItems: "center",
  },

  contentDesktop: {
    width: "50%",

    alignItems: "flex-start",

    paddingLeft: 40,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: COLORS.sageSoft,

    borderRadius: 999,

    paddingHorizontal: 13,
    paddingVertical: 8,

    marginBottom: 18,

    borderWidth: 1,
    borderColor: COLORS.sage,
  },

  badgeDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: COLORS.emerald,

    marginRight: 8,
  },

  badgeText: {
    color: COLORS.emerald,

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 0.7,
  },

  title: {
    color: COLORS.text,

    fontSize: 34,
    lineHeight: 41,

    fontWeight: "800",

    letterSpacing: -1,

    textAlign: "center",
  },

  titleDesktop: {
    fontSize: 45,
    lineHeight: 52,

    textAlign: "left",
  },

  description: {
    color: COLORS.muted,

    fontSize: 16,
    lineHeight: 24,

    fontWeight: "500",

    textAlign: "center",

    marginTop: 15,

    maxWidth: 490,
  },

  buttons: {
    width: "100%",

    marginTop: 31,

    gap: 13,
  },

  primaryButton: {
    width: "100%",
    height: 57,

    borderRadius: 15,

    backgroundColor: COLORS.forest,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.forest,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.14,
    shadowRadius: 12,

    elevation: 4,
  },

  primaryPressed: {
    transform: [
      {
        scale: 0.99,
      },
    ],

    opacity: 0.9,
  },

  primaryText: {
    color: "#FFFFFF",

    fontSize: 13,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  secondaryButton: {
    width: "100%",
    height: 57,

    borderRadius: 15,

    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: "center",
    justifyContent: "center",
  },

  secondaryPressed: {
    opacity: 0.75,
  },

  secondaryText: {
    color: COLORS.forest,

    fontSize: 12,
    fontWeight: "900",

    letterSpacing: 0.5,
  },

  caption: {
    color: COLORS.muted,

    fontSize: 10,
    fontWeight: "600",

    textAlign: "center",

    marginTop: 24,
  },
});
