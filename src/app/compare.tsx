import React, { useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  universities,
  University,
} from "../data/universities";

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

  goodBackground: "#EAF3E1",
  goodText: "#55783D",

  mediumBackground: "#F7F0DA",
  mediumText: "#9A7836",

  lowBackground: "#F7E7E2",
  lowText: "#A45E50",
};

/* =========================
   DEMO CANDIDATE
========================= */

const candidate = {
  ielts: 6.5,
  sat: null as number | null,

  gpa: "4.8 / 5",

  budget: "$5–15k",

  interests: [
    "Computer Science",
    "Engineering",
  ],

  needsScholarship: true,
};

/* =========================
   TYPES
========================= */

type Status =
  | "good"
  | "medium"
  | "low"
  | "neutral";

/* =========================
   HELPERS
========================= */

function fitStatus(
  university: University
): Status {
  if (
    university.fit === "Strong match"
  ) {
    return "good";
  }

  if (
    university.fit === "Competitive"
  ) {
    return "medium";
  }

  return "low";
}

function ieltsStatus(
  university: University
): Status {
  const match =
    university.requirements.ielts.match(
      /[\d.]+/
    );

  if (!match) return "neutral";

  const required =
    Number(match[0]);

  if (
    candidate.ielts >= required
  ) {
    return "good";
  }

  if (
    candidate.ielts >=
    required - 0.5
  ) {
    return "medium";
  }

  return "low";
}

function satStatus(
  university: University
): Status {
  if (university.noSat) {
    return "good";
  }

  if (
    university.requirements.sat
      .toLowerCase()
      .includes("optional")
  ) {
    return "good";
  }

  if (candidate.sat === null) {
    return "medium";
  }

  return "good";
}

function budgetStatus(
  university: University
): Status {
  return university.fitsBudget
    ? "good"
    : "low";
}

function scholarshipStatus(
  university: University
): Status {
  if (
    university.scholarship
  ) {
    return "good";
  }

  return candidate.needsScholarship
    ? "low"
    : "neutral";
}

function interestStatus(
  university: University
): Status {
  const match =
    university.majors.some(
      (major) =>
        candidate.interests.includes(
          major
        )
    );

  return match
    ? "good"
    : "medium";
}

function portfolioStatus(
  university: University
): Status {
  const hasResearchGap =
    university.gaps.some(
      (gap) =>
        gap
          .toLowerCase()
          .includes("research") ||
        gap
          .toLowerCase()
          .includes("олимпиад")
    );

  return hasResearchGap
    ? "medium"
    : "good";
}

/* =========================
   PAGE
========================= */

export default function CompareScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      ids?: string;
    }>();

  const selected =
    useMemo(() => {
      const ids =
        params.ids
          ?.split(",")
          .filter(Boolean) || [];

      const result =
        universities.filter(
          (university) =>
            ids.includes(
              university.id
            )
        );

      /*
        Если страницу открыть
        напрямую, показываем первые
        три для удобства разработки.
      */

      return result.length > 0
        ? result
        : universities.slice(0, 3);
    }, [params.ids]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.page
        }
      >
        {/* HEADER */}

        <View style={styles.topbar}>
          <Pressable
            onPress={() =>
              router.back()
            }
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={19}
              color={COLORS.forest}
            />

            <Text
              style={
                styles.backButtonText
              }
            >
              Universities
            </Text>
          </Pressable>

          <View style={styles.logo}>
            <View
              style={styles.logoMark}
            >
              <Text
                style={
                  styles.logoLetter
                }
              >
                U
              </Text>
            </View>

            <Text
              style={styles.logoText}
            >
              unipath
            </Text>
          </View>
        </View>

        {/* TITLE */}

        <View style={styles.header}>
          <View style={styles.eyebrow}>
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
              COMPARE UNIVERSITIES
            </Text>
          </View>

          <Text style={styles.title}>
            Сравни варианты
          </Text>

          <Text
            style={styles.description}
          >
            Смотри не только на
            требования университета,
            но и на то, насколько они
            соответствуют твоему
            текущему профилю.
          </Text>
        </View>

        {/* LEGEND */}

        <View style={styles.legend}>
          <Legend
            status="good"
            text="Подходит"
          />

          <Legend
            status="medium"
            text="Нужно улучшить"
          />

          <Legend
            status="low"
            text="Есть существенный gap"
          />
        </View>

        {/* AI SUMMARY */}

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles-outline"
              size={21}
              color="#FFFFFF"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={styles.aiLabel}
            >
              AI PROFILE INSIGHT
            </Text>

            <Text
              style={styles.aiTitle}
            >
              Самые важные различия для
              твоего профиля
            </Text>

            <Text
              style={styles.aiText}
            >
              Зелёные параметры уже
              близки к требованиям.
              Жёлтые требуют работы, но
              выглядят достижимыми.
              Красные параметры требуют
              более существенного
              изменения стратегии —
              например бюджета или
              академического профиля.
            </Text>
          </View>
        </View>

        {/* TABLE */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            true
          }
          contentContainerStyle={
            styles.tableScroll
          }
        >
          <View style={styles.table}>
            {/* UNIVERSITY HEADERS */}

            <View style={styles.tableRow}>
              <View
                style={[
                  styles.criteriaCell,
                  styles.headerCriteria,
                ]}
              >
                <Text
                  style={
                    styles.headerCriteriaText
                  }
                >
                  CRITERIA
                </Text>
              </View>

              {selected.map(
                (university) => (
                  <UniversityHeader
                    key={
                      university.id
                    }
                    university={
                      university
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          "/university",
                        params: {
                          id: university.id,
                        },
                      })
                    }
                  />
                )
              )}
            </View>

            {/* OVERALL FIT */}

            <CompareRow
              title="Profile fit"
              icon="person-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university.fit,
                status:
                  fitStatus(
                    university
                  ),
              })}
            />

            <CompareRow
              title="IELTS"
              icon="language-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university
                    .requirements
                    .ielts,
                status:
                  ieltsStatus(
                    university
                  ),
                note: `Ты: ${candidate.ielts}`,
              })}
            />

            <CompareRow
              title="SAT"
              icon="document-text-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university
                    .requirements.sat,
                status:
                  satStatus(
                    university
                  ),
                note:
                  candidate.sat ===
                  null
                    ? "Ты: не сдавал"
                    : `Ты: ${candidate.sat}`,
              })}
            />

            <CompareRow
              title="Academic"
              icon="school-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university
                    .requirements.gpa,
                status: "good",
                note: `Ты: ${candidate.gpa}`,
              })}
            />

            <CompareRow
              title="Budget"
              icon="wallet-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university.tuition,
                status:
                  budgetStatus(
                    university
                  ),
                note: `Твой бюджет: ${candidate.budget}`,
              })}
            />

            <CompareRow
              title="Scholarships"
              icon="cash-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university.scholarship
                    ? "Available"
                    : "Limited",
                status:
                  scholarshipStatus(
                    university
                  ),
                note:
                  "Тебе нужна financial aid",
              })}
            />

            <CompareRow
              title="Major match"
              icon="bulb-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university.majors
                    .slice(0, 2)
                    .join(", "),
                status:
                  interestStatus(
                    university
                  ),
                note:
                  "CS / Engineering",
              })}
            />

            <CompareRow
              title="Portfolio"
              icon="ribbon-outline"
              universities={selected}
              render={(university) => ({
                value:
                  portfolioStatus(
                    university
                  ) === "good"
                    ? "Good foundation"
                    : "Needs strengthening",
                status:
                  portfolioStatus(
                    university
                  ),
                note:
                  "Research, projects, olympiads",
              })}
            />

            <CompareRow
              title="Scholarship strategy"
              icon="navigate-outline"
              universities={selected}
              render={(university) => ({
                value:
                  university
                    .scholarship
                    ? "Worth exploring"
                    : "Limited options",
                status:
                  university
                    .scholarship
                    ? "good"
                    : "medium",
              })}
            />
          </View>
        </ScrollView>

        <Text style={styles.disclaimer}>
          Цветовая оценка показывает
          соответствие демонстрационного
          профиля указанным данным, а не
          вероятность или гарантию
          поступления.
        </Text>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   TABLE COMPONENTS
========================= */

function UniversityHeader({
  university,
  onPress,
}: {
  university: University;
  onPress: () => void;
}) {
  const initials =
    university.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("");

  return (
    <Pressable
      onPress={onPress}
      style={styles.universityHeader}
    >
      <View style={styles.logoCircle}>
        <Text
          style={
            styles.logoCircleText
          }
        >
          {initials}
        </Text>
      </View>

      <Text
        style={
          styles.universityName
        }
        numberOfLines={2}
      >
        {university.name}
      </Text>

      <Text
        style={
          styles.universityLocation
        }
      >
        {university.country}
      </Text>

      <View
        style={styles.viewUniversity}
      >
        <Text
          style={
            styles.viewUniversityText
          }
        >
          View profile
        </Text>

        <Ionicons
          name="arrow-forward"
          size={12}
          color={COLORS.emerald}
        />
      </View>
    </Pressable>
  );
}

function CompareRow({
  title,
  icon,
  universities,
  render,
}: {
  title: string;
  icon: any;
  universities: University[];
  render: (
    university: University
  ) => {
    value: string;
    status: Status;
    note?: string;
  };
}) {
  return (
    <View style={styles.tableRow}>
      <View style={styles.criteriaCell}>
        <View
          style={styles.criteriaIcon}
        >
          <Ionicons
            name={icon}
            size={16}
            color={COLORS.emerald}
          />
        </View>

        <Text
          style={
            styles.criteriaText
          }
        >
          {title}
        </Text>
      </View>

      {universities.map(
        (university) => {
          const result =
            render(university);

          return (
            <StatusCell
              key={university.id}
              value={result.value}
              note={result.note}
              status={
                result.status
              }
            />
          );
        }
      )}
    </View>
  );
}

function StatusCell({
  value,
  note,
  status,
}: {
  value: string;
  note?: string;
  status: Status;
}) {
  const background =
    status === "good"
      ? COLORS.goodBackground
      : status === "medium"
      ? COLORS.mediumBackground
      : status === "low"
      ? COLORS.lowBackground
      : COLORS.surface;

  const statusColor =
    status === "good"
      ? COLORS.goodText
      : status === "medium"
      ? COLORS.mediumText
      : status === "low"
      ? COLORS.lowText
      : COLORS.muted;

  const icon =
    status === "good"
      ? "checkmark-circle"
      : status === "medium"
      ? "alert-circle"
      : status === "low"
      ? "close-circle"
      : "ellipse-outline";

  return (
    <View
      style={[
        styles.statusCell,
        {
          backgroundColor:
            background,
        },
      ]}
    >
      <View
        style={
          styles.statusHeader
        }
      >
        <Ionicons
          name={icon}
          size={15}
          color={statusColor}
        />

        <Text
          style={[
            styles.statusLabel,
            {
              color: statusColor,
            },
          ]}
        >
          {status === "good"
            ? "GOOD MATCH"
            : status === "medium"
            ? "IMPROVE"
            : status === "low"
            ? "GAP"
            : "INFO"}
        </Text>
      </View>

      <Text
        style={styles.cellValue}
      >
        {value}
      </Text>

      {note && (
        <Text
          style={styles.cellNote}
        >
          {note}
        </Text>
      )}
    </View>
  );
}

function Legend({
  status,
  text,
}: {
  status: Status;
  text: string;
}) {
  const color =
    status === "good"
      ? COLORS.goodText
      : status === "medium"
      ? COLORS.mediumText
      : COLORS.lowText;

  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text
        style={styles.legendText}
      >
        {text}
      </Text>
    </View>
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

  page: {
    width: "100%",
    maxWidth: 1250,

    alignSelf: "center",

    paddingHorizontal: 25,
    paddingTop: 20,
  },

  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    marginBottom: 35,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 12,
    paddingVertical: 9,

    backgroundColor:
      COLORS.surface,

    borderRadius: 12,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  backButtonText: {
    color: COLORS.forest,

    fontSize: 10,
    fontWeight: "800",
  },

  logo: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoMark: {
    width: 35,
    height: 35,

    borderRadius: 11,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  logoLetter: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  logoText: {
    color: COLORS.forest,

    fontSize: 17,
    fontWeight: "900",
  },

  header: {
    marginBottom: 18,
  },

  eyebrow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 9,
  },

  eyebrowDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor:
      COLORS.emerald,

    marginRight: 8,
  },

  eyebrowText: {
    color: COLORS.emerald,

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1.2,
  },

  title: {
    color: COLORS.text,

    fontSize: 35,
    fontWeight: "800",

    letterSpacing: -1,
  },

  description: {
    color: COLORS.muted,

    fontSize: 13,
    lineHeight: 20,

    maxWidth: 650,

    marginTop: 7,
  },

  legend: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 14,

    marginBottom: 20,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",

    gap: 6,
  },

  legendDot: {
    width: 7,
    height: 7,

    borderRadius: 4,
  },

  legendText: {
    color: COLORS.muted,

    fontSize: 9,
    fontWeight: "700",
  },

  aiCard: {
    flexDirection: "row",

    padding: 18,

    backgroundColor:
      COLORS.forest,

    borderRadius: 20,

    marginBottom: 22,
  },

  aiIcon: {
    width: 45,
    height: 45,

    borderRadius: 14,

    backgroundColor:
      COLORS.forest2,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,
  },

  aiLabel: {
    color: COLORS.accent,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1,
  },

  aiTitle: {
    color: "#FFFFFF",

    fontSize: 16,
    fontWeight: "800",

    marginTop: 4,
  },

  aiText: {
    color: "#DFE7D7",

    fontSize: 10,
    lineHeight: 16,

    marginTop: 5,

    maxWidth: 850,
  },

  tableScroll: {
    paddingBottom: 8,
  },

  table: {
    overflow: "hidden",

    borderWidth: 1,
    borderColor:
      COLORS.border,

    borderRadius: 20,

    backgroundColor:
      COLORS.surface,
  },

  tableRow: {
    flexDirection: "row",

    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  criteriaCell: {
    width: 170,
    minHeight: 115,

    padding: 15,

    justifyContent: "center",

    backgroundColor:
      "#FAFBF7",

    borderRightWidth: 1,
    borderRightColor:
      COLORS.border,
  },

  headerCriteria: {
    minHeight: 160,
  },

  headerCriteriaText: {
    color: COLORS.muted,

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1,
  },

  criteriaIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 9,
  },

  criteriaText: {
    color: COLORS.text,

    fontSize: 11,
    fontWeight: "800",
  },

  universityHeader: {
    width: 235,
    minHeight: 160,

    padding: 15,

    borderRightWidth: 1,
    borderRightColor:
      COLORS.border,

    justifyContent: "center",
  },

  logoCircle: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 10,
  },

  logoCircleText: {
    color: COLORS.forest,

    fontSize: 12,
    fontWeight: "900",
  },

  universityName: {
    color: COLORS.text,

    fontSize: 13,
    lineHeight: 17,

    fontWeight: "800",
  },

  universityLocation: {
    color: COLORS.muted,

    fontSize: 9,

    marginTop: 4,
  },

  viewUniversity: {
    flexDirection: "row",
    alignItems: "center",

    gap: 4,

    marginTop: 10,
  },

  viewUniversityText: {
    color: COLORS.emerald,

    fontSize: 8,
    fontWeight: "900",
  },

  statusCell: {
    width: 235,
    minHeight: 115,

    padding: 15,

    justifyContent: "center",

    borderRightWidth: 1,
    borderRightColor:
      COLORS.border,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    marginBottom: 8,
  },

  statusLabel: {
    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.7,
  },

  cellValue: {
    color: COLORS.text,

    fontSize: 12,
    lineHeight: 17,

    fontWeight: "800",
  },

  cellNote: {
    color: COLORS.muted,

    fontSize: 8,
    lineHeight: 12,

    marginTop: 5,
  },

  disclaimer: {
    color: COLORS.muted,

    fontSize: 8,
    lineHeight: 13,

    marginTop: 12,

    fontStyle: "italic",
  },
});