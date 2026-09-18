import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
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
};

export type CalendarGoal = {
  id: string;
  title: string;
  category: string;

  startDate: string;
  endDate: string;

  status: string;
};

const WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const TODAY = new Date(
  2026,
  8,
  17,
  12
);

export default function RoadmapCalendar({
  goals,
}: {
  goals: CalendarGoal[];
}) {
  const { width } =
    useWindowDimensions();

  const compact = width < 950;

  const [month, setMonth] =
    useState(8);

  const [year, setYear] =
    useState(2026);

  const days = useMemo(
    () =>
      buildCalendar(
        year,
        month
      ),
    [year, month]
  );

  const weeks = [
    days.slice(0, 7),
    days.slice(7, 14),
    days.slice(14, 21),
    days.slice(21, 28),
    days.slice(28, 35),
    days.slice(35, 42),
  ];

  const previousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToday = () => {
    setYear(2026);
    setMonth(8);
  };

  return (
    <View style={styles.calendar}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text
            style={styles.month}
          >
            {MONTHS[month]}{" "}
            {year}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Дедлайны и периоды
            работы по твоему
            roadmap
          </Text>
        </View>

        <View
          style={
            styles.controls
          }
        >
          <Pressable
            onPress={
              previousMonth
            }
            style={
              styles.iconButton
            }
          >
            <Ionicons
              name="chevron-back"
              size={17}
              color={
                COLORS.text
              }
            />
          </Pressable>

          <Pressable
            onPress={goToday}
            style={
              styles.todayButton
            }
          >
            <Text
              style={
                styles.todayText
              }
            >
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={nextMonth}
            style={
              styles.iconButton
            }
          >
            <Ionicons
              name="chevron-forward"
              size={17}
              color={
                COLORS.text
              }
            />
          </Pressable>
        </View>
      </View>

      {/* DAYS */}

      <View
        style={
          styles.weekHeader
        }
      >
        {WEEKDAYS.map(
          (day) => (
            <View
              key={day}
              style={
                styles.weekHeaderCell
              }
            >
              <Text
                style={
                  styles.weekHeaderText
                }
              >
                {day}
              </Text>
            </View>
          )
        )}
      </View>

      {/* MONTH GRID */}

      <View style={styles.grid}>
        {weeks.map(
          (week, weekIndex) => (
            <CalendarWeek
              key={weekIndex}
              week={week}
              currentMonth={
                month
              }
              goals={goals}
              compact={compact}
            />
          )
        )}
      </View>

      {/* LEGEND */}

      <View style={styles.legend}>
        <Legend
          color="#7EA45F"
          text="Exam"
        />

        <Legend
          color="#B59B5B"
          text="Portfolio"
        />

        <Legend
          color="#78939B"
          text="Universities"
        />

        <Legend
          color="#A17769"
          text="Activity"
        />
      </View>
    </View>
  );
}

function CalendarWeek({
  week,
  currentMonth,
  goals,
  compact,
}: {
  week: Date[];
  currentMonth: number;

  goals: CalendarGoal[];

  compact: boolean;
}) {
  const weekStart = week[0];
  const weekEnd = week[6];

  return (
    <View
      style={[
        styles.week,
        compact &&
          styles.weekCompact,
      ]}
    >
      {/* DAY CELLS */}

      {week.map((date) => {
        const outside =
          date.getMonth() !==
          currentMonth;

        const today =
          sameDate(
            date,
            TODAY
          );

        return (
          <View
            key={
              date.toISOString()
            }
            style={
              styles.dayCell
            }
          >
            <View
              style={[
                styles.dayNumberWrap,

                today &&
                  styles.todayCircle,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,

                  outside &&
                    styles.dayOutside,

                  today &&
                    styles.todayNumber,
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
          </View>
        );
      })}

      {/* EVENTS */}

      {goals.map(
        (goal, index) => {
          const start =
            parseISO(
              goal.startDate
            );

          const end =
            parseISO(
              goal.endDate
            );

          if (
            end < weekStart ||
            start > weekEnd
          ) {
            return null;
          }

          const segmentStart =
            start > weekStart
              ? start
              : weekStart;

          const segmentEnd =
            end < weekEnd
              ? end
              : weekEnd;

          const startColumn =
            daysBetween(
              weekStart,
              segmentStart
            );

          const span =
            daysBetween(
              segmentStart,
              segmentEnd
            ) + 1;

          const left =
            `${(startColumn / 7) * 100}%`;

          const barWidth =
            `${(span / 7) * 100}%`;

          const startsHere =
            sameDate(
              start,
              segmentStart
            );

          const endsHere =
            sameDate(
              end,
              segmentEnd
            );

          const lane =
            index % 4;

          const color =
            categoryColor(
              goal.category
            );

          return (
            <View
              key={`${goal.id}-${weekStart.toISOString()}`}
              style={[
                styles.eventBar,

                {
                  left,
                  width:
                    barWidth,

                  top:
                    42 +
                    lane * 21,

                  backgroundColor:
                    color,

                  borderTopLeftRadius:
                    startsHere
                      ? 6
                      : 2,

                  borderBottomLeftRadius:
                    startsHere
                      ? 6
                      : 2,

                  borderTopRightRadius:
                    endsHere
                      ? 6
                      : 2,

                  borderBottomRightRadius:
                    endsHere
                      ? 6
                      : 2,

                  opacity:
                    goal.status ===
                    "done"
                      ? 0.45
                      : 1,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={
                  styles.eventText
                }
              >
                {goal.title}
              </Text>
            </View>
          );
        }
      )}
    </View>
  );
}

function Legend({
  color,
  text,
}: {
  color: string;
  text: string;
}) {
  return (
    <View
      style={
        styles.legendItem
      }
    >
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor:
              color,
          },
        ]}
      />

      <Text
        style={
          styles.legendText
        }
      >
        {text}
      </Text>
    </View>
  );
}

/* =========================
   HELPERS
========================= */

function buildCalendar(
  year: number,
  month: number
) {
  const first =
    new Date(
      year,
      month,
      1,
      12
    );

  const mondayIndex =
    (first.getDay() + 6) %
    7;

  const start =
    new Date(
      year,
      month,
      1 - mondayIndex,
      12
    );

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date =
        new Date(start);

      date.setDate(
        start.getDate() +
          index
      );

      return date;
    }
  );
}

function parseISO(
  value: string
) {
  const [year, month, day] =
    value
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day,
    12
  );
}

function sameDate(
  a: Date,
  b: Date
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}

function daysBetween(
  a: Date,
  b: Date
) {
  return Math.round(
    (b.getTime() -
      a.getTime()) /
      86400000
  );
}

function categoryColor(
  category: string
) {
  const value =
    category.toLowerCase();

  if (
    value.includes("exam")
  ) {
    return "#7EA45F";
  }

  if (
    value.includes(
      "portfolio"
    ) ||
    value.includes(
      "research"
    ) ||
    value.includes(
      "competition"
    )
  ) {
    return "#B59B5B";
  }

  if (
    value.includes(
      "universit"
    )
  ) {
    return "#78939B";
  }

  return "#A17769";
}

/* =========================
   STYLES
========================= */

const styles =
  StyleSheet.create({
    calendar: {
      overflow: "hidden",

      marginTop: 15,

      borderRadius: 20,

      borderWidth: 1,
      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.surface,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",
      justifyContent:
        "space-between",

      paddingHorizontal: 18,
      paddingVertical: 17,

      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    month: {
      color:
        COLORS.text,

      fontSize: 22,
      fontWeight: "800",

      letterSpacing: -0.5,
    },

    subtitle: {
      color:
        COLORS.muted,

      fontSize: 8,

      marginTop: 3,
    },

    controls: {
      flexDirection: "row",
      alignItems: "center",

      gap: 6,
    },

    iconButton: {
      width: 32,
      height: 32,

      borderRadius: 16,

      backgroundColor:
        COLORS.sageSoft,

      alignItems: "center",
      justifyContent: "center",
    },

    todayButton: {
      height: 32,

      paddingHorizontal: 13,

      borderRadius: 16,

      backgroundColor:
        COLORS.sageSoft,

      alignItems: "center",
      justifyContent: "center",
    },

    todayText: {
      color:
        COLORS.text,

      fontSize: 9,
      fontWeight: "800",
    },

    weekHeader: {
      flexDirection: "row",

      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    weekHeaderCell: {
      flex: 1,

      paddingVertical: 9,

      alignItems: "center",
    },

    weekHeaderText: {
      color:
        COLORS.muted,

      fontSize: 9,
      fontWeight: "700",
    },

    grid: {
      overflow: "hidden",
    },

    week: {
      height: 120,

      flexDirection: "row",

      position: "relative",

      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    weekCompact: {
      height: 116,
    },

    dayCell: {
      flex: 1,

      paddingTop: 8,
      paddingRight: 8,

      alignItems: "flex-end",

      borderRightWidth: 1,
      borderRightColor:
        COLORS.border,
    },

    dayNumberWrap: {
      width: 26,
      height: 26,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",
    },

    dayNumber: {
      color:
        COLORS.text,

      fontSize: 10,
      fontWeight: "600",
    },

    dayOutside: {
      color: "#BBC1B8",
    },

    todayCircle: {
      backgroundColor:
        COLORS.forest,
    },

    todayNumber: {
      color: "#FFFFFF",

      fontWeight: "900",
    },

    eventBar: {
      position: "absolute",

      height: 17,

      paddingHorizontal: 5,

      justifyContent:
        "center",

      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.7)",
    },

    eventText: {
      color: "#FFFFFF",

      fontSize: 7,
      fontWeight: "800",
    },

    legend: {
      flexDirection: "row",
      flexWrap: "wrap",

      gap: 13,

      paddingHorizontal: 17,
      paddingVertical: 13,

      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",

      gap: 5,
    },

    legendDot: {
      width: 7,
      height: 7,

      borderRadius: 3.5,
    },

    legendText: {
      color:
        COLORS.muted,

      fontSize: 8,
    },
  });