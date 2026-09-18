import React, { useMemo, useState } from "react";
import RoadmapCalendar from "./RoadmapCalendar";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

/* =========================
   DESIGN SYSTEM
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

  yellowBg: "#F7F0DA",
  yellow: "#9A7836",

  redBg: "#F7E7E2",
  red: "#A45E50",

  blueBg: "#E8EFF1",
  blue: "#617E86",
};

/* =========================
   TYPES
========================= */

type PathTab =
  | "current"
  | "new";

type GoalStatus =
  | "active"
  | "upcoming"
  | "done";

type Goal = {
  id: string;

  title: string;
  description: string;

  category: string;

  icon: any;

  deadline: string;
  dateLabel: string;

  startDate: string;
  endDate: string;

  progress: number;

  status: GoalStatus;

  reason?: string;
};

type Recommendation = {
  id: string;

  title: string;
  category: string;

  icon: any;

  description: string;

  reason: string;

  impact:
    | "High"
    | "Medium"
    | "Important";

  time: string;

  suggestedDeadline: string;

  aiPrompt: string;
};

/* =========================
   DEMO CURRENT ROADMAP
========================= */

const initialGoals: Goal[] = [
  {
    id: "ielts-75",

    title: "Повысить IELTS до 7.5",

    description:
      "Сфокусироваться на Reading и Writing и пройти минимум два full mock test перед пересдачей.",

    category: "EXAM",

    icon: "language-outline",

    deadline: "20 октября 2026",
    dateLabel: "20 OCT",

    progress: 62,

    status: "active",
    startDate: "2026-09-17",
endDate: "2026-10-20",

    reason:
      "Для части выбранных университетов рекомендуется IELTS 7.0–7.5.",
  },

  {
    id: "sat-diagnostic",

    title: "Пройти SAT Diagnostic",

    description:
      "Определить текущий уровень Math и Reading & Writing перед составлением плана подготовки.",

    category: "EXAM",

    icon: "document-text-outline",

    deadline: "25 сентября 2026",
    dateLabel: "25 SEP",

    progress: 15,

    status: "active",
    startDate: "2026-09-18",
endDate: "2026-09-25",
  },

  {
    id: "research-list",

    title: "Выбрать research opportunity",

    description:
      "Найти исследовательскую возможность по Computer Science, Engineering или Robotics.",

    category: "PORTFOLIO",

    icon: "flask-outline",

    deadline: "30 сентября 2026",
    dateLabel: "30 SEP",

    progress: 35,

    status: "active",
    startDate: "2026-09-17",
endDate: "2026-09-30",
  },

  {
    id: "shortlist",

    title: "Обновить university shortlist",

    description:
      "Оставить 6–8 университетов: strong match, competitive и reach.",

    category: "UNIVERSITIES",

    icon: "school-outline",

    deadline: "5 октября 2026",
    dateLabel: "05 OCT",

    progress: 50,

    status: "upcoming",
    startDate: "2026-09-25",
endDate: "2026-10-05",
  },
];

/* =========================
   DEMO RECOMMENDATIONS
========================= */

const initialRecommendations: Recommendation[] = [
  {
    id: "research-project",

    title: "Начать исследовательский проект",

    category: "RESEARCH",

    icon: "flask-outline",

    description:
      "Выбери небольшую проблему в Computer Science, Engineering или Robotics и доведи её до конкретного результата.",

    reason:
      "У тебя сильный технический профиль, но research experience пока можно усилить.",

    impact: "High",

    time: "2–4 месяца",

    suggestedDeadline:
      "Начать до 1 октября",

    aiPrompt:
      "Я помогу подобрать тему исследования исходя из твоих интересов в Computer Science и Engineering.",
  },

  {
    id: "science-competition",

    title: "Подать проект на научный конкурс",

    category: "COMPETITION",

    icon: "trophy-outline",

    description:
      "Используй существующий технический проект или research work для участия в конкурсе.",

    reason:
      "Олимпиады и научные конкурсы могут добавить внешнее подтверждение твоих академических навыков.",

    impact: "High",

    time: "1–3 месяца",

    suggestedDeadline:
      "Найти конкурс на этой неделе",

    aiPrompt:
      "Я могу помочь определить, какие типы научных конкурсов лучше соответствуют твоему текущему проекту.",
  },

  {
    id: "open-source",

    title: "Сделать публичный CS-проект",

    category: "PROJECT",

    icon: "code-slash-outline",

    description:
      "Создай небольшой, но законченный проект: web app, AI-tool или engineering prototype и оформи результат.",

    reason:
      "Для Computer Science важно показать не только оценки, но и способность самостоятельно создавать продукты.",

    impact: "High",

    time: "3–6 недель",

    suggestedDeadline:
      "Начать в октябре",

    aiPrompt:
      "Я могу предложить идеи CS-проектов под твой уровень и интересы, которые реально завершить за несколько недель.",
  },

  {
    id: "volunteering",

    title: "Добавить осмысленное volunteering",

    category: "ACTIVITY",

    icon: "heart-outline",

    description:
      "Выбери деятельность, связанную с образованием, технологиями или локальным сообществом.",

    reason:
      "Это добавит в профиль опыт вне академической среды и покажет инициативность.",

    impact: "Medium",

    time: "1–2 часа в неделю",

    suggestedDeadline:
      "Можно начать в течение месяца",

    aiPrompt:
      "Я помогу придумать volunteering, который будет естественно связан с твоими интересами, а не выглядеть как активность ради CV.",
  },

  {
    id: "sat-plan",

    title: "Создать SAT preparation plan",

    category: "EXAM",

    icon: "calendar-outline",

    description:
      "После diagnostic test разбей подготовку на Math и Reading & Writing и запланируй weekly practice.",

    reason:
      "SAT может усилить заявку в части выбранных университетов.",

    impact: "Important",

    time: "8–12 недель",

    suggestedDeadline:
      "После SAT Diagnostic",

    aiPrompt:
      "После diagnostic test я смогу помочь построить недельный SAT-план с приоритетом слабых тем.",
  },
];

/* =========================
   MAIN
========================= */

export default function MyPathPage() {
  const { width } =
    useWindowDimensions();

  const compact =
    width < 850;

  const [section, setSection] =
    useState<PathTab>(
      "current"
    );

  const [goals, setGoals] =
    useState<Goal[]>(
      initialGoals
    );

  const [
    recommendations,
    setRecommendations,
  ] = useState<
    Recommendation[]
  >(
    initialRecommendations
  );

  const [
    openAI,
    setOpenAI,
  ] =
    useState<string | null>(
      null
    );

  const [
    aiQuestion,
    setAIQuestion,
  ] = useState("");

  /* =========================
     STATS
  ========================= */

  const completed =
    goals.filter(
      (goal) =>
        goal.status === "done"
    ).length;

  const averageProgress =
    useMemo(() => {
      if (
        goals.length === 0
      ) {
        return 0;
      }

      const total =
        goals.reduce(
          (sum, goal) =>
            sum +
            goal.progress,
          0
        );

      return Math.round(
        total /
          goals.length
      );
    }, [goals]);

  /* =========================
     ACTIONS
  ========================= */

  const markDone = (
    id: string
  ) => {
    setGoals((old) =>
      old.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              status: "done",
              progress: 100,
            }
          : goal
      )
    );
  };

  const addToRoadmap = (
    recommendation: Recommendation
  ) => {
    const goal: Goal = {
      id:
        recommendation.id,

      title:
        recommendation.title,

      description:
        recommendation.description,

      category:
        recommendation.category,

      icon:
        recommendation.icon,

      deadline:
        recommendation.suggestedDeadline,

      dateLabel: "NEW",

      progress: 0,

      status: "upcoming",

      reason:
        recommendation.reason,
        startDate: "2026-09-17",
endDate: "2026-10-17",
    };

    setGoals((old) => [
      ...old,
      goal,
    ]);

    setRecommendations(
      (old) =>
        old.filter(
          (item) =>
            item.id !==
            recommendation.id
        )
    );

    setOpenAI(null);
  };

  const dismissRecommendation = (
    id: string
  ) => {
    setRecommendations(
      (old) =>
        old.filter(
          (item) =>
            item.id !== id
        )
    );

    if (openAI === id) {
      setOpenAI(null);
    }
  };

  return (
    <View style={styles.screen}>
      {/* =====================
          INNER SIDEBAR
      ====================== */}

      <View
        style={[
          styles.innerSidebar,

          compact &&
            styles.innerSidebarCompact,
        ]}
      >
        <View
          style={[
            styles.innerSidebarTop,

            compact && {
              flexDirection:
                "row",
            },
          ]}
        >
          <PathNav
            active={
              section ===
              "current"
            }
            icon="navigate"
            label="Current"
            count={
              goals.length
            }
            compact={compact}
            onPress={() =>
              setSection(
                "current"
              )
            }
          />

          <PathNav
            active={
              section === "new"
            }
            icon="sparkles"
            label="New"
            count={
              recommendations.length
            }
            compact={compact}
            onPress={() =>
              setSection("new")
            }
          />
        </View>

        {!compact && (
          <View
            style={
              styles.sidebarTip
            }
          >
            <View
              style={
                styles.sidebarTipIcon
              }
            >
              <Ionicons
                name="bulb-outline"
                size={17}
                color={
                  COLORS.emerald
                }
              />
            </View>

            <Text
              style={
                styles.sidebarTipTitle
              }
            >
              Your roadmap
            </Text>

            <Text
              style={
                styles.sidebarTipText
              }
            >
              Добавляй только те
              цели, которые
              действительно хочешь
              выполнить.
            </Text>
          </View>
        )}
      </View>

      {/* =====================
          CONTENT
      ====================== */}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.contentInner
        }
      >
        {section ===
        "current" ? (
          <CurrentView
            goals={goals}
            completed={
              completed
            }
            averageProgress={
              averageProgress
            }
            onDone={
              markDone
            }
            onExplore={() =>
              setSection("new")
            }
          />
        ) : (
          <NewView
            recommendations={
              recommendations
            }
            openAI={openAI}
            aiQuestion={
              aiQuestion
            }
            setAIQuestion={
              setAIQuestion
            }
            onToggleAI={(
              id
            ) => {
              setOpenAI(
                openAI === id
                  ? null
                  : id
              );

              setAIQuestion(
                ""
              );
            }}
            onAdd={
              addToRoadmap
            }
            onDismiss={
              dismissRecommendation
            }
          />
        )}

        <View
          style={{
            height: 70,
          }}
        />
      </ScrollView>
    </View>
  );
}

/* =========================
   CURRENT VIEW
========================= */

function CurrentView({
  goals,
  completed,
  averageProgress,
  onDone,
  onExplore,
}: {
  goals: Goal[];

  completed: number;

  averageProgress: number;

  onDone: (
    id: string
  ) => void;

  onExplore: () => void;
}) {
  const nextGoal =
    goals.find(
      (goal) =>
        goal.status !==
        "done"
    );

  return (
    <>
      {/* HEADER */}

      <View
        style={
          styles.pageHeader
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
            MY PATH
          </Text>
        </View>

        <Text
          style={styles.title}
        >
          Твой roadmap
        </Text>

        <Text
          style={
            styles.description
          }
        >
          Все выбранные цели,
          экзамены, активности и
          дедлайны в одном месте.
        </Text>
      </View>

      {/* SUMMARY */}

      <View
        style={
          styles.summaryGrid
        }
      >
        <SummaryCard
          icon="flag-outline"
          value={`${goals.length}`}
          label="Active goals"
        />

        <SummaryCard
          icon="checkmark-circle-outline"
          value={`${completed}`}
          label="Completed"
        />

        <SummaryCard
          icon="analytics-outline"
          value={`${averageProgress}%`}
          label="Overall progress"
        />
      </View>

      {/* NEXT ACTION */}

      {nextGoal && (
        <View
          style={
            styles.nextAction
          }
        >
          <View
            style={
              styles.nextActionIcon
            }
          >
            <Ionicons
              name="flash-outline"
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View
            style={{ flex: 1 }}
          >
            <Text
              style={
                styles.nextActionLabel
              }
            >
              NEXT ACTION
            </Text>

            <Text
              style={
                styles.nextActionTitle
              }
            >
              {
                nextGoal.title
              }
            </Text>

            <Text
              style={
                styles.nextActionText
              }
            >
              Deadline:{" "}
              {
                nextGoal.deadline
              }
            </Text>
          </View>

          <View
            style={
              styles.nextActionProgress
            }
          >
            <Text
              style={
                styles.nextActionProgressNumber
              }
            >
              {
                nextGoal.progress
              }
              %
            </Text>

            <Text
              style={
                styles.nextActionProgressLabel
              }
            >
              progress
            </Text>
          </View>
        </View>
      )}

      {/* TITLE */}

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
            Current goals
          </Text>

          <Text
            style={
              styles.sectionText
            }
          >
            Цели, которые уже
            добавлены в твой
            маршрут.
          </Text>
        </View>

        <Pressable
          onPress={onExplore}
          style={
            styles.exploreButton
          }
        >
          <Ionicons
            name="sparkles-outline"
            size={15}
            color={
              COLORS.forest
            }
          />

          <Text
            style={
              styles.exploreButtonText
            }
          >
            Explore new
          </Text>
        </Pressable>
      </View>

      {/* GOALS */}

      <View
        style={
          styles.goalList
        }
      >
        {goals.map(
          (goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDone={() =>
                onDone(
                  goal.id
                )
              }
            />
          )
        )}
      </View>
      <View
  style={{
    marginTop: 34,
  }}
>
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
        Calendar
      </Text>

      <Text
        style={
          styles.sectionText
        }
      >
        Сроки подготовки,
        активности и дедлайны.
      </Text>
    </View>

    <View
      style={
        styles.calendarBadge
      }
    >
      <Ionicons
        name="calendar-outline"
        size={14}
        color={
          COLORS.forest
        }
      />

      <Text
        style={
          styles.calendarBadgeText
        }
      >
        Month
      </Text>
    </View>
  </View>

  <RoadmapCalendar
    goals={goals}
  />
</View>
    </>
  );
}

/* =========================
   NEW VIEW
========================= */

function NewView({
  recommendations,
  openAI,
  aiQuestion,
  setAIQuestion,
  onToggleAI,
  onAdd,
  onDismiss,
}: {
  recommendations: Recommendation[];

  openAI:
    | string
    | null;

  aiQuestion: string;

  setAIQuestion: (
    value: string
  ) => void;

  onToggleAI: (
    id: string
  ) => void;

  onAdd: (
    recommendation: Recommendation
  ) => void;

  onDismiss: (
    id: string
  ) => void;
}) {
  return (
    <>
      {/* HEADER */}

      <View
        style={
          styles.pageHeader
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
            RECOMMENDED FOR YOU
          </Text>
        </View>

        <Text
          style={styles.title}
        >
          Следующие возможности
        </Text>

        <Text
          style={
            styles.description
          }
        >
          Рекомендации сформированы
          на основе твоих целей,
          текущего профиля и
          университетов, которые ты
          рассматриваешь.
        </Text>
      </View>

      {/* AI INFO */}

      <View
        style={
          styles.recommendationIntro
        }
      >
        <View
          style={
            styles.recommendationIntroIcon
          }
        >
          <Ionicons
            name="sparkles-outline"
            size={20}
            color="#FFFFFF"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={
              styles.recommendationIntroLabel
            }
          >
            AI RECOMMENDATIONS
          </Text>

          <Text
            style={
              styles.recommendationIntroTitle
            }
          >
            Выбирай только то,
            что подходит именно тебе
          </Text>

          <Text
            style={
              styles.recommendationIntroText
            }
          >
            Можно обсудить любую
            возможность с AI,
            добавить её в roadmap
            или убрать из
            рекомендаций.
          </Text>
        </View>
      </View>

      {/* LIST */}

      {recommendations.length >
      0 ? (
        <View
          style={
            styles.recommendationList
          }
        >
          {recommendations.map(
            (
              recommendation
            ) => (
              <Recommendation
                key={
                  recommendation.id
                }
                recommendation={
                  recommendation
                }
                aiOpen={
                  openAI ===
                  recommendation.id
                }
                aiQuestion={
                  aiQuestion
                }
                setAIQuestion={
                  setAIQuestion
                }
                onToggleAI={() =>
                  onToggleAI(
                    recommendation.id
                  )
                }
                onAdd={() =>
                  onAdd(
                    recommendation
                  )
                }
                onDismiss={() =>
                  onDismiss(
                    recommendation.id
                  )
                }
              />
            )
          )}
        </View>
      ) : (
        <View
          style={styles.empty}
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <Ionicons
              name="checkmark"
              size={27}
              color={
                COLORS.emerald
              }
            />
          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            Всё разобрано
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Сейчас новых
            рекомендаций нет.
          </Text>
        </View>
      )}
    </>
  );
}

/* =========================
   GOAL CARD
========================= */

function GoalCard({
  goal,
  onDone,
}: {
  goal: Goal;

  onDone: () => void;
}) {
  const done =
    goal.status === "done";

  return (
    <View
      style={[
        styles.goalCard,

        done &&
          styles.goalCardDone,
      ]}
    >
      {/* DATE */}

      <View
        style={
          styles.dateColumn
        }
      >
        <View
          style={[
            styles.dateBadge,

            done && {
              backgroundColor:
                COLORS.sage,
            },
          ]}
        >
          {done ? (
            <Ionicons
              name="checkmark"
              size={20}
              color={
                COLORS.forest
              }
            />
          ) : (
            <Text
              style={
                styles.dateText
              }
            >
              {
                goal.dateLabel
              }
            </Text>
          )}
        </View>

        <View
          style={
            styles.timelineLine
          }
        />
      </View>

      {/* BODY */}

      <View
        style={
          styles.goalBody
        }
      >
        <View
          style={
            styles.goalTop
          }
        >
          <View
            style={{ flex: 1 }}
          >
            <View
              style={
                styles.categoryRow
              }
            >
              <View
                style={
                  styles.goalIcon
                }
              >
                <Ionicons
                  name={
                    goal.icon
                  }
                  size={15}
                  color={
                    COLORS.emerald
                  }
                />
              </View>

              <Text
                style={
                  styles.categoryText
                }
              >
                {
                  goal.category
                }
              </Text>
            </View>

            <Text
              style={[
                styles.goalTitle,

                done && {
                  opacity:
                    0.55,
                },
              ]}
            >
              {goal.title}
            </Text>
          </View>

          <StatusBadge
            status={
              goal.status
            }
          />
        </View>

        <Text
          style={
            styles.goalDescription
          }
        >
          {goal.description}
        </Text>

        {goal.reason && (
          <View
            style={
              styles.whyBox
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={
                COLORS.emerald
              }
            />

            <Text
              style={
                styles.whyText
              }
            >
              {goal.reason}
            </Text>
          </View>
        )}

        {/* PROGRESS */}

        <View
          style={
            styles.progressHeader
          }
        >
          <Text
            style={
              styles.progressLabel
            }
          >
            Progress
          </Text>

          <Text
            style={
              styles.progressNumber
            }
          >
            {goal.progress}%
          </Text>
        </View>

        <View
          style={
            styles.progressTrack
          }
        >
          <View
            style={[
              styles.progressFill,

              {
                width: `${goal.progress}%`,
              },
            ]}
          />
        </View>

        <View
          style={
            styles.goalFooter
          }
        >
          <View
            style={
              styles.deadlineRow
            }
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={
                COLORS.muted
              }
            />

            <Text
              style={
                styles.deadlineText
              }
            >
              {goal.deadline}
            </Text>
          </View>

          {!done && (
            <Pressable
              onPress={
                onDone
              }
              style={
                styles.doneButton
              }
            >
              <Ionicons
                name="checkmark"
                size={14}
                color={
                  COLORS.forest
                }
              />

              <Text
                style={
                  styles.doneButtonText
                }
              >
                Mark done
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

/* =========================
   RECOMMENDATION CARD
========================= */

function Recommendation({
  recommendation,
  aiOpen,
  aiQuestion,
  setAIQuestion,
  onToggleAI,
  onAdd,
  onDismiss,
}: {
  recommendation: Recommendation;

  aiOpen: boolean;

  aiQuestion: string;

  setAIQuestion: (
    value: string
  ) => void;

  onToggleAI: () => void;

  onAdd: () => void;

  onDismiss: () => void;
}) {
  return (
    <View
      style={
        styles.recommendationCard
      }
    >
      {/* TOP */}

      <View
        style={
          styles.recommendationTop
        }
      >
        <View
          style={
            styles.recommendationIcon
          }
        >
          <Ionicons
            name={
              recommendation.icon
            }
            size={21}
            color={
              COLORS.emerald
            }
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={
              styles.recommendationCategory
            }
          >
            {
              recommendation.category
            }
          </Text>

          <Text
            style={
              styles.recommendationTitle
            }
          >
            {
              recommendation.title
            }
          </Text>
        </View>

        <ImpactBadge
          impact={
            recommendation.impact
          }
        />
      </View>

      <Text
        style={
          styles.recommendationDescription
        }
      >
        {
          recommendation.description
        }
      </Text>

      {/* WHY */}

      <View
        style={
          styles.personalReason
        }
      >
        <View
          style={
            styles.personalReasonIcon
          }
        >
          <Ionicons
            name="person-outline"
            size={15}
            color={
              COLORS.emerald
            }
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={
              styles.personalReasonLabel
            }
          >
            WHY FOR YOU
          </Text>

          <Text
            style={
              styles.personalReasonText
            }
          >
            {
              recommendation.reason
            }
          </Text>
        </View>
      </View>

      {/* META */}

      <View
        style={
          styles.metaRow
        }
      >
        <Meta
          icon="time-outline"
          text={
            recommendation.time
          }
        />

        <Meta
          icon="calendar-outline"
          text={
            recommendation.suggestedDeadline
          }
        />
      </View>

      {/* AI */}

      {aiOpen && (
        <View
          style={
            styles.aiBox
          }
        >
          <View
            style={
              styles.aiBoxHeader
            }
          >
            <View
              style={
                styles.aiSmallIcon
              }
            >
              <Ionicons
                name="sparkles"
                size={15}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text
                style={
                  styles.aiBoxTitle
                }
              >
                Ask UniPath AI
              </Text>

              <Text
                style={
                  styles.aiBoxSubtitle
                }
              >
                Demo interaction
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.aiAnswer
            }
          >
            {
              recommendation.aiPrompt
            }
          </Text>

          <View
            style={
              styles.aiInputRow
            }
          >
            <TextInput
              value={
                aiQuestion
              }
              onChangeText={
                setAIQuestion
              }
              placeholder="Задай вопрос об этой возможности..."
              placeholderTextColor="#9AA194"
              style={
                styles.aiInput
              }
            />

            <Pressable
              style={
                styles.aiSend
              }
            >
              <Ionicons
                name="arrow-up"
                size={16}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* ACTIONS */}

      <View
        style={
          styles.actionRow
        }
      >
        <Pressable
          onPress={
            onToggleAI
          }
          style={[
            styles.secondaryAction,

            aiOpen && {
              backgroundColor:
                COLORS.sage,
            },
          ]}
        >
          <Ionicons
            name="sparkles-outline"
            size={15}
            color={
              COLORS.forest
            }
          />

          <Text
            style={
              styles.secondaryActionText
            }
          >
            Ask AI
          </Text>
        </Pressable>

        <Pressable
          onPress={onAdd}
          style={
            styles.primaryAction
          }
        >
          <Ionicons
            name="add"
            size={16}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.primaryActionText
            }
          >
            Add to roadmap
          </Text>
        </Pressable>

        <Pressable
          onPress={
            onDismiss
          }
          style={
            styles.ignoreAction
          }
        >
          <Ionicons
            name="close"
            size={15}
            color={
              COLORS.muted
            }
          />

          <Text
            style={
              styles.ignoreActionText
            }
          >
            Not interested
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* =========================
   COMPONENTS
========================= */

function PathNav({
  active,
  icon,
  label,
  count,
  compact,
  onPress,
}: {
  active: boolean;

  icon: any;

  label: string;

  count: number;

  compact: boolean;

  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pathNav,

        active &&
          styles.pathNavActive,

        compact && {
          flex: 1,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          active
            ? COLORS.forest
            : COLORS.muted
        }
      />

      <Text
        style={[
          styles.pathNavText,

          active &&
            styles.pathNavTextActive,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.pathCount,

          active &&
            styles.pathCountActive,
        ]}
      >
        <Text
          style={[
            styles.pathCountText,

            active &&
              styles.pathCountTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: any;

  value: string;

  label: string;
}) {
  return (
    <View
      style={
        styles.summaryCard
      }
    >
      <View
        style={
          styles.summaryIcon
        }
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            COLORS.emerald
          }
        />
      </View>

      <View>
        <Text
          style={
            styles.summaryValue
          }
        >
          {value}
        </Text>

        <Text
          style={
            styles.summaryLabel
          }
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function StatusBadge({
  status,
}: {
  status: GoalStatus;
}) {
  const background =
    status === "done"
      ? COLORS.sage
      : status === "active"
      ? COLORS.yellowBg
      : COLORS.blueBg;

  const color =
    status === "done"
      ? COLORS.forest
      : status === "active"
      ? COLORS.yellow
      : COLORS.blue;

  return (
    <View
      style={[
        styles.statusBadge,

        {
          backgroundColor:
            background,
        },
      ]}
    >
      <View
        style={[
          styles.statusDot,

          {
            backgroundColor:
              color,
          },
        ]}
      />

      <Text
        style={[
          styles.statusText,

          {
            color,
          },
        ]}
      >
        {status === "done"
          ? "DONE"
          : status ===
            "active"
          ? "ACTIVE"
          : "UPCOMING"}
      </Text>
    </View>
  );
}

function ImpactBadge({
  impact,
}: {
  impact:
    | "High"
    | "Medium"
    | "Important";
}) {
  const high =
    impact === "High";

  return (
    <View
      style={[
        styles.impactBadge,

        {
          backgroundColor:
            high
              ? COLORS.sage
              : COLORS.yellowBg,
        },
      ]}
    >
      <Text
        style={[
          styles.impactText,

          {
            color: high
              ? COLORS.forest
              : COLORS.yellow,
          },
        ]}
      >
        {impact} impact
      </Text>
    </View>
  );
}

function Meta({
  icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <View
      style={
        styles.meta
      }
    >
      <Ionicons
        name={icon}
        size={13}
        color={
          COLORS.muted
        }
      />

      <Text
        style={
          styles.metaText
        }
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
    calendarBadge: {
  flexDirection: "row",
  alignItems: "center",

  gap: 5,

  paddingHorizontal: 10,
  paddingVertical: 7,

  borderRadius: 10,

  backgroundColor:
    COLORS.sage,
},

calendarBadgeText: {
  color:
    COLORS.forest,

  fontSize: 8,
  fontWeight: "800",
},
  screen: {
    flex: 1,

    flexDirection: "row",

    backgroundColor:
      COLORS.background,
  },

  /* INNER SIDEBAR */

  innerSidebar: {
    width: 185,

    paddingHorizontal: 13,
    paddingVertical: 30,

    borderRightWidth: 1,
    borderRightColor:
      COLORS.border,

    backgroundColor:
      "#F8F9F4",

    justifyContent:
      "space-between",
  },

  innerSidebarCompact: {
    width: 150,

    paddingVertical: 15,
  },

  innerSidebarTop: {
    gap: 7,
  },

  pathNav: {
    minHeight: 48,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,

    borderRadius: 13,

    gap: 9,
  },

  pathNavActive: {
    backgroundColor:
      COLORS.sage,
  },

  pathNavText: {
    flex: 1,

    color:
      COLORS.muted,

    fontSize: 11,
    fontWeight: "700",
  },

  pathNavTextActive: {
    color:
      COLORS.forest,

    fontWeight: "900",
  },

  pathCount: {
    minWidth: 23,
    height: 23,

    paddingHorizontal: 5,

    borderRadius: 8,

    backgroundColor:
      COLORS.surface,

    alignItems: "center",
    justifyContent: "center",
  },

  pathCountActive: {
    backgroundColor:
      COLORS.forest,
  },

  pathCountText: {
    color:
      COLORS.muted,

    fontSize: 8,
    fontWeight: "900",
  },

  pathCountTextActive: {
    color: "#FFFFFF",
  },

  sidebarTip: {
    padding: 13,

    borderRadius: 15,

    backgroundColor:
      COLORS.sageSoft,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  sidebarTipIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 10,
  },

  sidebarTipTitle: {
    color:
      COLORS.text,

    fontSize: 10,
    fontWeight: "800",
  },

  sidebarTipText: {
    color:
      COLORS.muted,

    fontSize: 8,
    lineHeight: 13,

    marginTop: 4,
  },

  /* CONTENT */

  content: {
    flex: 1,
  },

  contentInner: {
    width: "100%",
    maxWidth: 1020,

    alignSelf: "center",

    paddingHorizontal: 30,
    paddingTop: 38,
  },

  /* HEADER */

  pageHeader: {
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
    lineHeight: 41,

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

  /* SUMMARY */

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 10,

    marginBottom: 15,
  },

  summaryCard: {
    flex: 1,
    minWidth: 180,

    flexDirection: "row",
    alignItems: "center",

    gap: 11,

    padding: 15,

    borderRadius: 16,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  summaryIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  summaryValue: {
    color:
      COLORS.text,

    fontSize: 18,
    fontWeight: "900",
  },

  summaryLabel: {
    color:
      COLORS.muted,

    fontSize: 8,

    marginTop: 2,
  },

  /* NEXT ACTION */

  nextAction: {
    flexDirection: "row",
    alignItems: "center",

    padding: 18,

    borderRadius: 19,

    backgroundColor:
      COLORS.forest,

    marginBottom: 30,

    gap: 13,
  },

  nextActionIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    backgroundColor:
      COLORS.forest2,

    alignItems: "center",
    justifyContent: "center",
  },

  nextActionLabel: {
    color:
      COLORS.accent,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 1,
  },

  nextActionTitle: {
    color: "#FFFFFF",

    fontSize: 14,
    fontWeight: "800",

    marginTop: 4,
  },

  nextActionText: {
    color: "#DCE7D5",

    fontSize: 9,

    marginTop: 3,
  },

  nextActionProgress: {
    alignItems: "flex-end",
  },

  nextActionProgressNumber: {
    color: "#FFFFFF",

    fontSize: 20,
    fontWeight: "900",
  },

  nextActionProgressLabel: {
    color: "#CFDEC7",

    fontSize: 7,

    marginTop: 2,
  },

  /* SECTION */

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

  sectionText: {
    color:
      COLORS.muted,

    fontSize: 9,

    marginTop: 3,
  },

  exploreButton: {
    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 11,
    paddingVertical: 9,

    borderRadius: 11,

    backgroundColor:
      COLORS.sage,
  },

  exploreButtonText: {
    color:
      COLORS.forest,

    fontSize: 9,
    fontWeight: "800",
  },

  /* GOALS */

  goalList: {
    gap: 11,
  },

  goalCard: {
    flexDirection: "row",

    backgroundColor:
      COLORS.surface,

    borderRadius: 19,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    padding: 17,
  },

  goalCardDone: {
    backgroundColor:
      "#FAFBF8",
  },

  dateColumn: {
    width: 67,

    alignItems: "center",

    marginRight: 8,
  },

  dateBadge: {
    width: 53,
    height: 53,

    borderRadius: 16,

    backgroundColor:
      COLORS.sageSoft,

    alignItems: "center",
    justifyContent: "center",
  },

  dateText: {
    color:
      COLORS.forest,

    fontSize: 9,
    fontWeight: "900",

    textAlign: "center",
  },

  timelineLine: {
    flex: 1,

    width: 1,

    minHeight: 45,

    backgroundColor:
      COLORS.border,

    marginTop: 8,
  },

  goalBody: {
    flex: 1,
  },

  goalTop: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 12,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 7,
  },

  goalIcon: {
    width: 27,
    height: 27,

    borderRadius: 9,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 7,
  },

  categoryText: {
    color:
      COLORS.emerald,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  goalTitle: {
    color:
      COLORS.text,

    fontSize: 15,
    fontWeight: "800",
  },

  goalDescription: {
    color:
      COLORS.muted,

    fontSize: 10,
    lineHeight: 16,

    marginTop: 7,

    maxWidth: 680,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 999,
  },

  statusDot: {
    width: 5,
    height: 5,

    borderRadius: 3,
  },

  statusText: {
    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.6,
  },

  whyBox: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 7,

    padding: 10,

    borderRadius: 11,

    backgroundColor:
      COLORS.sageSoft,

    marginTop: 11,
  },

  whyText: {
    flex: 1,

    color:
      COLORS.muted,

    fontSize: 8,
    lineHeight: 13,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",

    marginTop: 14,
    marginBottom: 6,
  },

  progressLabel: {
    color:
      COLORS.muted,

    fontSize: 8,
    fontWeight: "700",
  },

  progressNumber: {
    color:
      COLORS.forest,

    fontSize: 8,
    fontWeight: "900",
  },

  progressTrack: {
    height: 5,

    borderRadius: 999,

    backgroundColor:
      COLORS.sage,

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    borderRadius: 999,

    backgroundColor:
      COLORS.emerald,
  },

  goalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    marginTop: 13,
  },

  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  deadlineText: {
    color:
      COLORS.muted,

    fontSize: 8,
  },

  doneButton: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    paddingHorizontal: 9,
    paddingVertical: 7,

    borderRadius: 9,

    backgroundColor:
      COLORS.sage,
  },

  doneButtonText: {
    color:
      COLORS.forest,

    fontSize: 8,
    fontWeight: "800",
  },

  /* NEW INTRO */

  recommendationIntro: {
    flexDirection: "row",

    gap: 13,

    padding: 18,

    borderRadius: 19,

    backgroundColor:
      COLORS.forest,

    marginBottom: 18,
  },

  recommendationIntroIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor:
      COLORS.forest2,

    alignItems: "center",
    justifyContent: "center",
  },

  recommendationIntroLabel: {
    color:
      COLORS.accent,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.9,
  },

  recommendationIntroTitle: {
    color: "#FFFFFF",

    fontSize: 13,
    fontWeight: "800",

    marginTop: 3,
  },

  recommendationIntroText: {
    color: "#DCE7D5",

    fontSize: 9,
    lineHeight: 14,

    marginTop: 5,
  },

  /* RECOMMENDATIONS */

  recommendationList: {
    gap: 12,
  },

  recommendationCard: {
    padding: 18,

    borderRadius: 19,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  recommendationTop: {
    flexDirection: "row",
    alignItems: "center",

    gap: 11,
  },

  recommendationIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  recommendationCategory: {
    color:
      COLORS.emerald,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.9,
  },

  recommendationTitle: {
    color:
      COLORS.text,

    fontSize: 14,
    fontWeight: "800",

    marginTop: 3,
  },

  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 999,
  },

  impactText: {
    fontSize: 7,
    fontWeight: "900",
  },

  recommendationDescription: {
    color:
      COLORS.muted,

    fontSize: 10,
    lineHeight: 16,

    marginTop: 13,
  },

  personalReason: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 9,

    padding: 11,

    borderRadius: 13,

    backgroundColor:
      COLORS.sageSoft,

    marginTop: 12,
  },

  personalReasonIcon: {
    width: 29,
    height: 29,

    borderRadius: 9,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  personalReasonLabel: {
    color:
      COLORS.emerald,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.7,
  },

  personalReasonText: {
    color:
      COLORS.muted,

    fontSize: 8,
    lineHeight: 13,

    marginTop: 3,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 14,

    marginTop: 12,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  metaText: {
    color:
      COLORS.muted,

    fontSize: 8,
  },

  /* AI */

  aiBox: {
    padding: 13,

    borderRadius: 14,

    backgroundColor:
      "#F8FAF5",

    borderWidth: 1,
    borderColor:
      COLORS.sage,

    marginTop: 13,
  },

  aiBoxHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 10,
  },

  aiSmallIcon: {
    width: 30,
    height: 30,

    borderRadius: 9,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  aiBoxTitle: {
    color:
      COLORS.text,

    fontSize: 10,
    fontWeight: "800",
  },

  aiBoxSubtitle: {
    color:
      COLORS.muted,

    fontSize: 7,

    marginTop: 1,
  },

  aiAnswer: {
    color:
      COLORS.muted,

    fontSize: 9,
    lineHeight: 14,
  },

  aiInputRow: {
    flexDirection: "row",

    gap: 7,

    marginTop: 11,
  },

  aiInput: {
    flex: 1,

    minHeight: 40,

    paddingHorizontal: 11,

    borderRadius: 11,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    color:
      COLORS.text,

    fontSize: 9,
  },

  aiSend: {
    width: 40,
    height: 40,

    borderRadius: 11,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ACTIONS */

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 7,

    marginTop: 15,
  },

  secondaryAction: {
    height: 39,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 11,

    borderRadius: 11,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,
  },

  secondaryActionText: {
    color:
      COLORS.forest,

    fontSize: 8,
    fontWeight: "800",
  },

  primaryAction: {
    height: 39,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 12,

    borderRadius: 11,

    backgroundColor:
      COLORS.forest,
  },

  primaryActionText: {
    color: "#FFFFFF",

    fontSize: 8,
    fontWeight: "900",
  },

  ignoreAction: {
    height: 39,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    paddingHorizontal: 9,
  },

  ignoreActionText: {
    color:
      COLORS.muted,

    fontSize: 8,
    fontWeight: "700",
  },

  /* EMPTY */

  empty: {
    minHeight: 350,

    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 62,
    height: 62,

    borderRadius: 20,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color:
      COLORS.text,

    fontSize: 16,
    fontWeight: "800",

    marginTop: 14,
  },

  emptyText: {
    color:
      COLORS.muted,

    fontSize: 9,

    marginTop: 5,
  },
});