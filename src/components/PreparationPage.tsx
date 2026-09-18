import React, {
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

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

  yellowBg: "#F7F0DA",
  yellow: "#9A7836",

  redBg: "#F7E7E2",
  red: "#A45E50",
};

type Exam =
  | "IELTS"
  | "SAT";

type Resource = {
  id: string;
  exam: Exam;

  category: string;

  title: string;
  description: string;

  source: string;

  duration: string;

  icon: any;

  priority:
    | "High"
    | "Medium";

  type:
    | "Practice"
    | "Mock"
    | "Guide";
};

const resources: Resource[] = [
  {
    id: "ielts-reading",

    exam: "IELTS",

    category: "READING",

    title:
      "Matching Headings Practice",

    description:
      "Практика одной из типичных слабых тем Reading с разбором стратегии выполнения.",

    source:
      "British Council",

    duration: "25 min",

    icon: "book-outline",

    priority: "High",

    type: "Practice",
  },

  {
    id: "ielts-writing",

    exam: "IELTS",

    category: "WRITING",

    title:
      "Writing Task 2 structure",

    description:
      "Разбор структуры эссе, аргументации и критериев оценки.",

    source:
      "Official IELTS resources",

    duration: "35 min",

    icon: "create-outline",

    priority: "High",

    type: "Guide",
  },

  {
    id: "ielts-mock",

    exam: "IELTS",

    category: "MOCK TEST",

    title:
      "IELTS Full Mock #1",

    description:
      "Полный пробный тест для оценки текущего уровня перед пересдачей.",

    source:
      "Cambridge format",

    duration:
      "2 h 45 min",

    icon: "timer-outline",

    priority: "High",

    type: "Mock",
  },

  {
    id: "sat-diagnostic",

    exam: "SAT",

    category: "DIAGNOSTIC",

    title:
      "SAT Diagnostic Test",

    description:
      "Определи текущий уровень Math и Reading & Writing.",

    source:
      "Bluebook-style demo",

    duration: "2 h",

    icon:
      "document-text-outline",

    priority: "High",

    type: "Mock",
  },

  {
    id: "sat-math",

    exam: "SAT",

    category: "MATH",

    title:
      "Advanced Math practice",

    description:
      "Практика algebra, functions и advanced math.",

    source:
      "Khan Academy",

    duration: "30 min",

    icon:
      "calculator-outline",

    priority: "Medium",

    type: "Practice",
  },

  {
    id: "sat-reading",

    exam: "SAT",

    category:
      "READING & WRITING",

    title:
      "Grammar & transitions",

    description:
      "Быстрая практика грамматики и логических связок.",

    source:
      "Open practice",

    duration: "20 min",

    icon:
      "reader-outline",

    priority: "Medium",

    type: "Practice",
  },
];

export default function PreparationPage() {
  const { width } =
    useWindowDimensions();

  const compact =
    width < 900;

  const [exam, setExam] =
    useState<Exam>("IELTS");

  const [completed, setCompleted] =
    useState<string[]>([]);

  const visible =
    useMemo(
      () =>
        resources.filter(
          (item) =>
            item.exam ===
            exam
        ),
      [exam]
    );

  const toggleComplete = (
    id: string
  ) => {
    setCompleted((old) =>
      old.includes(id)
        ? old.filter(
            (item) =>
              item !== id
          )
        : [...old, id]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.page
        }
      >
        {/* HEADER */}

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
              PREPARATION
            </Text>
          </View>

          <Text style={styles.title}>
            Подготовка к экзаменам
          </Text>

          <Text
            style={styles.description}
          >
            Не просто библиотека
            материалов — ресурсы
            подобраны под твой
            текущий уровень, цели и
            выбранные университеты.
          </Text>
        </View>

        {/* EXAM TABS */}

        <View
          style={
            styles.examSwitch
          }
        >
          <ExamTab
            active={
              exam === "IELTS"
            }
            title="IELTS"
            subtitle="6.5 → 7.5"
            onPress={() =>
              setExam("IELTS")
            }
          />

          <ExamTab
            active={
              exam === "SAT"
            }
            title="SAT"
            subtitle="Not taken → 1450"
            onPress={() =>
              setExam("SAT")
            }
          />
        </View>

        {/* OVERVIEW */}

        {exam === "IELTS" ? (
          <IELTSOverview
            compact={compact}
          />
        ) : (
          <SATOverview
            compact={compact}
          />
        )}

        {/* TODAY */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Recommended today
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Лучшие следующие
              действия для твоего
              уровня.
            </Text>
          </View>

          <View
            style={
              styles.personalBadge
            }
          >
            <Ionicons
              name="sparkles-outline"
              size={13}
              color={
                COLORS.forest
              }
            />

            <Text
              style={
                styles.personalBadgeText
              }
            >
              Personalized
            </Text>
          </View>
        </View>

        <View
          style={
            styles.resourceList
          }
        >
          {visible.map(
            (resource) => (
              <ResourceCard
                key={
                  resource.id
                }
                resource={
                  resource
                }
                completed={completed.includes(
                  resource.id
                )}
                onComplete={() =>
                  toggleComplete(
                    resource.id
                  )
                }
              />
            )
          )}
        </View>

        {/* MOCK TESTS */}

        <View
          style={[
            styles.sectionHeader,
            {
              marginTop: 33,
            },
          ]}
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Mock tests
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Проверяй прогресс
              реальными пробными
              тестами.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.mockGrid
          }
        >
          {exam ===
          "IELTS" ? (
            <>
              <MockCard
                title="IELTS Full Mock #1"
                date="Recommended now"
                score="—"
                status="Ready"
              />

              <MockCard
                title="IELTS Full Mock #2"
                date="After 2 weeks"
                score="—"
                status="Locked"
              />

              <MockCard
                title="Last diagnostic"
                date="Previous result"
                score="6.5"
                status="Completed"
              />
            </>
          ) : (
            <>
              <MockCard
                title="SAT Diagnostic"
                date="Recommended now"
                score="—"
                status="Ready"
              />

              <MockCard
                title="SAT Practice #1"
                date="After diagnostic"
                score="—"
                status="Locked"
              />
            </>
          )}
        </View>

        {/* SOURCES */}

        <View
          style={
            styles.sourcesCard
          }
        >
          <View
            style={
              styles.sourcesIcon
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={
                COLORS.emerald
              }
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.sourcesTitle
              }
            >
              Verified and open
              resources
            </Text>

            <Text
              style={
                styles.sourcesText
              }
            >
              В финальной версии
              здесь будут прямые
              ссылки на официальные
              и открытые источники:
              British Council,
              Cambridge,
              College Board, Khan
              Academy и другие.
            </Text>
          </View>
        </View>

        <View
          style={{ height: 70 }}
        />
      </ScrollView>
    </View>
  );
}

/* =========================
   IELTS OVERVIEW
========================= */

function IELTSOverview({
  compact,
}: {
  compact: boolean;
}) {
  return (
    <View
      style={[
        styles.overview,

        compact && {
          flexDirection:
            "column",
        },
      ]}
    >
      <View
        style={
          styles.scoreCard
        }
      >
        <Text
          style={
            styles.scoreLabel
          }
        >
          CURRENT SCORE
        </Text>

        <View
          style={
            styles.scoreRow
          }
        >
          <Text
            style={
              styles.currentScore
            }
          >
            6.5
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color={
              COLORS.accent
            }
          />

          <Text
            style={
              styles.targetScore
            }
          >
            7.5
          </Text>
        </View>

        <Text
          style={
            styles.scoreNote
          }
        >
          Target for stronger
          university options
        </Text>
      </View>

      <View
        style={
          styles.skillsCard
        }
      >
        <Text
          style={
            styles.skillsTitle
          }
        >
          Section breakdown
        </Text>

        <Skill
          name="Listening"
          value="7.0"
          percent={78}
          status="good"
        />

        <Skill
          name="Reading"
          value="6.0"
          percent={60}
          status="weak"
        />

        <Skill
          name="Writing"
          value="6.0"
          percent={58}
          status="weak"
        />

        <Skill
          name="Speaking"
          value="6.5"
          percent={68}
          status="medium"
        />
      </View>
    </View>
  );
}

/* =========================
   SAT OVERVIEW
========================= */

function SATOverview({
  compact,
}: {
  compact: boolean;
}) {
  return (
    <View
      style={[
        styles.overview,

        compact && {
          flexDirection:
            "column",
        },
      ]}
    >
      <View
        style={
          styles.scoreCard
        }
      >
        <Text
          style={
            styles.scoreLabel
          }
        >
          CURRENT SCORE
        </Text>

        <Text
          style={
            styles.notTaken
          }
        >
          Not taken
        </Text>

        <Text
          style={
            styles.scoreNote
          }
        >
          First step: diagnostic
          test
        </Text>
      </View>

      <View
        style={
          styles.skillsCard
        }
      >
        <Text
          style={
            styles.skillsTitle
          }
        >
          Target
        </Text>

        <View
          style={
            styles.satTarget
          }
        >
          <Text
            style={
              styles.satTargetNumber
            }
          >
            1450+
          </Text>

          <Text
            style={
              styles.satTargetText
            }
          >
            suggested target for
            selected universities
          </Text>
        </View>

        <View
          style={
            styles.diagnosticNotice
          }
        >
          <Ionicons
            name="analytics-outline"
            size={17}
            color={
              COLORS.emerald
            }
          />

          <Text
            style={
              styles.diagnosticText
            }
          >
            После diagnostic test
            здесь появится разбивка
            Math и Reading &
            Writing.
          </Text>
        </View>
      </View>
    </View>
  );
}

/* =========================
   COMPONENTS
========================= */

function ExamTab({
  active,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.examTab,

        active &&
          styles.examTabActive,
      ]}
    >
      <View
        style={[
          styles.examTabIcon,

          active && {
            backgroundColor:
              COLORS.forest,
          },
        ]}
      >
        <Ionicons
          name="document-text-outline"
          size={17}
          color={
            active
              ? "#FFFFFF"
              : COLORS.emerald
          }
        />
      </View>

      <View>
        <Text
          style={[
            styles.examTabTitle,

            active &&
              styles.examTabTitleActive,
          ]}
        >
          {title}
        </Text>

        <Text
          style={
            styles.examTabSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

function Skill({
  name,
  value,
  percent,
  status,
}: {
  name: string;
  value: string;
  percent: number;

  status:
    | "good"
    | "medium"
    | "weak";
}) {
  const color =
    status === "good"
      ? COLORS.green
      : status === "medium"
      ? "#B59B5B"
      : "#A17769";

  return (
    <View
      style={
        styles.skill
      }
    >
      <View
        style={
          styles.skillHeader
        }
      >
        <Text
          style={
            styles.skillName
          }
        >
          {name}
        </Text>

        <Text
          style={[
            styles.skillValue,
            { color },
          ]}
        >
          {value}
        </Text>
      </View>

      <View
        style={
          styles.skillTrack
        }
      >
        <View
          style={[
            styles.skillFill,
            {
              width: `${percent}%`,
              backgroundColor:
                color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function ResourceCard({
  resource,
  completed,
  onComplete,
}: {
  resource: Resource;
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <View
      style={[
        styles.resourceCard,

        completed && {
          opacity: 0.62,
        },
      ]}
    >
      <View
        style={
          styles.resourceIcon
        }
      >
        <Ionicons
          name={resource.icon}
          size={20}
          color={
            COLORS.emerald
          }
        />
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={
            styles.resourceTop
          }
        >
          <Text
            style={
              styles.resourceCategory
            }
          >
            {
              resource.category
            }
          </Text>

          <View
            style={
              styles.priorityBadge
            }
          >
            <Text
              style={
                styles.priorityText
              }
            >
              {
                resource.priority
              }
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.resourceTitle
          }
        >
          {resource.title}
        </Text>

        <Text
          style={
            styles.resourceDescription
          }
        >
          {
            resource.description
          }
        </Text>

        <View
          style={styles.resourceMeta}
        >
          <View
            style={styles.meta}
          >
            <Ionicons
              name="time-outline"
              size={12}
              color={
                COLORS.muted
              }
            />

            <Text
              style={
                styles.metaText
              }
            >
              {
                resource.duration
              }
            </Text>
          </View>

          <View
            style={styles.meta}
          >
            <Ionicons
              name="link-outline"
              size={12}
              color={
                COLORS.muted
              }
            />

            <Text
              style={
                styles.metaText
              }
            >
              {resource.source}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onComplete}
        style={[
          styles.completeButton,

          completed &&
            styles.completedButton,
        ]}
      >
        <Ionicons
          name={
            completed
              ? "checkmark"
              : "arrow-forward"
          }
          size={15}
          color={
            completed
              ? COLORS.forest
              : "#FFFFFF"
          }
        />
      </Pressable>
    </View>
  );
}

function MockCard({
  title,
  date,
  score,
  status,
}: {
  title: string;
  date: string;
  score: string;
  status: string;
}) {
  const ready =
    status === "Ready";

  return (
    <View
      style={
        styles.mockCard
      }
    >
      <View
        style={
          styles.mockTop
        }
      >
        <View
          style={
            styles.mockIcon
          }
        >
          <Ionicons
            name="timer-outline"
            size={18}
            color={
              COLORS.emerald
            }
          />
        </View>

        <Text
          style={[
            styles.mockStatus,

            {
              color: ready
                ? COLORS.green
                : COLORS.muted,
            },
          ]}
        >
          {status}
        </Text>
      </View>

      <Text
        style={
          styles.mockTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.mockDate
        }
      >
        {date}
      </Text>

      <View
        style={
          styles.mockBottom
        }
      >
        <Text
          style={
            styles.mockScoreLabel
          }
        >
          SCORE
        </Text>

        <Text
          style={
            styles.mockScore
          }
        >
          {score}
        </Text>
      </View>
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  page: {
    width: "100%",
    maxWidth: 1100,

    alignSelf: "center",

    paddingHorizontal: 30,
    paddingTop: 38,
  },

  header: {
    marginBottom: 24,
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
    color:
      COLORS.emerald,

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1.2,
  },

  title: {
    color:
      COLORS.text,

    fontSize: 34,
    fontWeight: "800",

    letterSpacing: -1,
  },

  description: {
    color:
      COLORS.muted,

    fontSize: 12,
    lineHeight: 19,

    maxWidth: 650,

    marginTop: 7,
  },

  examSwitch: {
    flexDirection: "row",

    gap: 8,

    padding: 5,

    borderRadius: 17,

    backgroundColor:
      COLORS.sageSoft,

    marginBottom: 17,
  },

  examTab: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    padding: 11,

    borderRadius: 13,
  },

  examTabActive: {
    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  examTabIcon: {
    width: 35,
    height: 35,

    borderRadius: 11,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  examTabTitle: {
    color:
      COLORS.muted,

    fontSize: 11,
    fontWeight: "800",
  },

  examTabTitleActive: {
    color:
      COLORS.text,
  },

  examTabSubtitle: {
    color:
      COLORS.muted,

    fontSize: 8,

    marginTop: 2,
  },

  overview: {
    flexDirection: "row",

    gap: 11,

    marginBottom: 30,
  },

  scoreCard: {
    width: 280,

    padding: 21,

    borderRadius: 19,

    backgroundColor:
      COLORS.forest,
  },

  scoreLabel: {
    color:
      COLORS.accent,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 11,

    marginTop: 15,
  },

  currentScore: {
    color: "#FFFFFF",

    fontSize: 34,
    fontWeight: "900",
  },

  targetScore: {
    color:
      COLORS.accent,

    fontSize: 34,
    fontWeight: "900",
  },

  notTaken: {
    color: "#FFFFFF",

    fontSize: 27,
    fontWeight: "800",

    marginTop: 15,
  },

  scoreNote: {
    color: "#DDE7D5",

    fontSize: 8,
    lineHeight: 13,

    marginTop: 9,
  },

  skillsCard: {
    flex: 1,

    padding: 19,

    borderRadius: 19,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  skillsTitle: {
    color:
      COLORS.text,

    fontSize: 12,
    fontWeight: "800",

    marginBottom: 13,
  },

  skill: {
    marginTop: 10,
  },

  skillHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",

    marginBottom: 5,
  },

  skillName: {
    color:
      COLORS.muted,

    fontSize: 9,
    fontWeight: "700",
  },

  skillValue: {
    fontSize: 9,
    fontWeight: "900",
  },

  skillTrack: {
    height: 5,

    borderRadius: 999,

    backgroundColor:
      COLORS.sage,

    overflow: "hidden",
  },

  skillFill: {
    height: "100%",

    borderRadius: 999,
  },

  satTarget: {
    marginTop: 11,
  },

  satTargetNumber: {
    color:
      COLORS.forest,

    fontSize: 29,
    fontWeight: "900",
  },

  satTargetText: {
    color:
      COLORS.muted,

    fontSize: 8,

    marginTop: 2,
  },

  diagnosticNotice: {
    flexDirection: "row",

    gap: 8,

    padding: 10,

    borderRadius: 11,

    backgroundColor:
      COLORS.sageSoft,

    marginTop: 14,
  },

  diagnosticText: {
    flex: 1,

    color:
      COLORS.muted,

    fontSize: 8,
    lineHeight: 13,
  },

  sectionHeader: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent:
      "space-between",

    marginBottom: 13,
  },

  sectionTitle: {
    color:
      COLORS.text,

    fontSize: 16,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color:
      COLORS.muted,

    fontSize: 9,

    marginTop: 3,
  },

  personalBadge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 9,

    backgroundColor:
      COLORS.sage,
  },

  personalBadgeText: {
    color:
      COLORS.forest,

    fontSize: 7,
    fontWeight: "800",
  },

  resourceList: {
    gap: 10,
  },

  resourceCard: {
    flexDirection: "row",
    alignItems: "center",

    gap: 13,

    padding: 16,

    borderRadius: 18,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  resourceIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  resourceTop: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  resourceCategory: {
    color:
      COLORS.emerald,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 6,

    backgroundColor:
      COLORS.sageSoft,
  },

  priorityText: {
    color:
      COLORS.forest,

    fontSize: 6,
    fontWeight: "800",
  },

  resourceTitle: {
    color:
      COLORS.text,

    fontSize: 12,
    fontWeight: "800",

    marginTop: 4,
  },

  resourceDescription: {
    color:
      COLORS.muted,

    fontSize: 9,
    lineHeight: 14,

    marginTop: 4,
  },

  resourceMeta: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 12,

    marginTop: 8,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",

    gap: 4,
  },

  metaText: {
    color:
      COLORS.muted,

    fontSize: 7,
  },

  completeButton: {
    width: 37,
    height: 37,

    borderRadius: 11,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",
  },

  completedButton: {
    backgroundColor:
      COLORS.sage,
  },

  mockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 10,
  },

  mockCard: {
    flexGrow: 1,
    flexBasis: 220,

    minHeight: 165,

    padding: 16,

    borderRadius: 17,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  mockTop: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  mockIcon: {
    width: 35,
    height: 35,

    borderRadius: 11,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  mockStatus: {
    fontSize: 7,
    fontWeight: "900",

    textTransform:
      "uppercase",
  },

  mockTitle: {
    color:
      COLORS.text,

    fontSize: 12,
    fontWeight: "800",

    marginTop: 14,
  },

  mockDate: {
    color:
      COLORS.muted,

    fontSize: 8,

    marginTop: 4,
  },

  mockBottom: {
    marginTop: "auto",

    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  mockScoreLabel: {
    color:
      COLORS.muted,

    fontSize: 6,
    fontWeight: "900",
  },

  mockScore: {
    color:
      COLORS.forest,

    fontSize: 19,
    fontWeight: "900",

    marginTop: 2,
  },

  sourcesCard: {
    flexDirection: "row",

    gap: 11,

    padding: 16,

    marginTop: 30,

    borderRadius: 17,

    backgroundColor:
      COLORS.sageSoft,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  sourcesIcon: {
    width: 39,
    height: 39,

    borderRadius: 12,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  sourcesTitle: {
    color:
      COLORS.text,

    fontSize: 10,
    fontWeight: "800",
  },

  sourcesText: {
    color:
      COLORS.muted,

    fontSize: 8,
    lineHeight: 13,

    marginTop: 4,
  },
});