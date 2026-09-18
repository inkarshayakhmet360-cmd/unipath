import React, { useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Animated,
} from "react-native";

import { useRouter } from "expo-router";
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

  error: "#C85B52",
  errorSoft: "#FFF8F7",
};

/* =========================
   OPTIONS
========================= */

const gradeOptions = [
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "Выпускник",
];

const interestOptions = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Business",
  "Economics",
  "Arts",
  "Law",
  "Psychology",
  "Natural Sciences",
  "Social Sciences",
  "Не определился",
];

const countryOptions = [
  "🇺🇸 USA",
  "🇬🇧 UK",
  "🇨🇦 Canada",
  "🇪🇺 Europe",
  "🇰🇷 Korea",
  "🇭🇰 Hong Kong",
  "🇸🇬 Singapore",
  "🇦🇺 Australia",
  "🇯🇵 Japan",
  "🇦🇪 UAE",
];

const budgetOptions = [
  "< $5k",
  "$5–15k",
  "$15–30k",
  "$30k+",
];

const portfolioOptions = [
  "Olympiads",
  "Research",
  "Volunteering",
  "Startup",
  "Sport",
  "School clubs",
  "Projects",
  "Hackathons",
  "Leadership",
  "Work experience",
  "Nothing yet",
];

/* =========================
   SCREEN
========================= */

export default function QuestionnaireScreen() {
  const router = useRouter();

  const scrollRef =
    useRef<ScrollView>(null);

  const [maxStep, setMaxStep] =
    useState(1);

  const [grade, setGrade] =
    useState<string | null>(null);

  const [interests, setInterests] =
    useState<string[]>([]);

  const [gpa, setGpa] =
    useState("");

  const [ielts, setIelts] =
    useState("");

  const [sat, setSat] =
    useState("");

  const [noExams, setNoExams] =
    useState(false);

  const [countries, setCountries] =
    useState<string[]>([]);

  const [budget, setBudget] =
    useState<string | null>(null);

  const [
    needsScholarship,
    setNeedsScholarship,
  ] = useState(false);

  const [portfolio, setPortfolio] =
    useState<string[]>([]);

  const [
    portfolioDescriptions,
    setPortfolioDescriptions,
  ] = useState<
    Record<string, string>
  >({});

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  const totalSteps = 8;

  /* =========================
     VALIDATION
  ========================= */

  const normalizeNumber = (
    value: string
  ) => {
    return value
      .trim()
      .replace(",", ".");
  };

  /* GPA: 0 - 5 */

  const isValidGPAValue = (
    value: string
  ) => {
    const normalized =
      normalizeNumber(value);

    if (!normalized) {
      return false;
    }

    if (
      !/^\d+(\.\d+)?$/.test(
        normalized
      )
    ) {
      return false;
    }

    const score =
      Number(normalized);

    return (
      !Number.isNaN(score) &&
      score >= 0 &&
      score <= 5
    );
  };

  /* IELTS: 0 - 9, шаг 0.5 */

  const isValidIELTSValue = (
    value: string
  ) => {
    const normalized =
      normalizeNumber(value);

    if (!normalized) {
      return false;
    }

    if (
      !/^\d+(\.\d+)?$/.test(
        normalized
      )
    ) {
      return false;
    }

    const score =
      Number(normalized);

    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 9
    ) {
      return false;
    }

    return Number.isInteger(
      score * 2
    );
  };

  /* SAT: 400 - 1600, шаг 10 */

  const isValidSATValue = (
    value: string
  ) => {
    const normalized =
      value.trim();

    if (
      !/^\d+$/.test(
        normalized
      )
    ) {
      return false;
    }

    const score =
      Number(normalized);

    return (
      score >= 400 &&
      score <= 1600 &&
      score % 10 === 0
    );
  };

  /* =========================
     CURRENT VALIDITY
  ========================= */

  const gpaInvalid =
    gpa.trim() !== "" &&
    !isValidGPAValue(gpa);

  const gpaReady =
    isValidGPAValue(gpa);

  const ieltsInvalid =
    !noExams &&
    ielts.trim() !== "" &&
    !isValidIELTSValue(ielts);

  const satInvalid =
    !noExams &&
    sat.trim() !== "" &&
    !isValidSATValue(sat);

  const hasAtLeastOneExam =
    ielts.trim() !== "" ||
    sat.trim() !== "";

  const examsReady =
    noExams ||
    (
      hasAtLeastOneExam &&

      (
        ielts.trim() === "" ||
        isValidIELTSValue(
          ielts
        )
      ) &&

      (
        sat.trim() === "" ||
        isValidSATValue(
          sat
        )
      )
    );

  /* =========================
     AUTO OPEN NEXT BLOCK
  ========================= */

  const revealStep = (
    step: number
  ) => {
    if (step <= maxStep) {
      return;
    }

    setMaxStep(step);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 250);
  };

  /* =========================
     MULTI SELECT
  ========================= */

  const toggleMulti = (
    item: string,
    selected: string[],
    setter: (
      items: string[]
    ) => void
  ) => {
    if (
      selected.includes(item)
    ) {
      setter(
        selected.filter(
          (value) =>
            value !== item
        )
      );
    } else {
      setter([
        ...selected,
        item,
      ]);
    }
  };

  /* =========================
     PORTFOLIO
  ========================= */

  const togglePortfolio = (
    item: string
  ) => {
    if (
      item === "Nothing yet"
    ) {
      if (
        portfolio.includes(
          "Nothing yet"
        )
      ) {
        setPortfolio([]);
      } else {
        setPortfolio([
          "Nothing yet",
        ]);

        setPortfolioDescriptions(
          {}
        );
      }

      revealStep(8);
      return;
    }

    let updated =
      portfolio.filter(
        (value) =>
          value !==
          "Nothing yet"
      );

    if (
      updated.includes(item)
    ) {
      updated =
        updated.filter(
          (value) =>
            value !== item
        );

      setPortfolioDescriptions(
        (old) => {
          const copy = {
            ...old,
          };

          delete copy[item];

          return copy;
        }
      );
    } else {
      updated = [
        ...updated,
        item,
      ];
    }

    setPortfolio(updated);

    if (
      updated.length > 0
    ) {
      revealStep(8);
    }
  };

  /* =========================
     SAVE QUESTIONNAIRE
  ========================= */

  const finishQuestionnaire =
    async () => {
      setSaveError("");

      if (!grade) {
        setSaveError(
          "Выбери класс."
        );
        return;
      }

      if (
        interests.length === 0
      ) {
        setSaveError(
          "Выбери хотя бы одно направление."
        );
        return;
      }

      if (!gpaReady) {
        return;
      }

      if (!examsReady) {
        return;
      }

      if (
        countries.length === 0
      ) {
        setSaveError(
          "Выбери хотя бы одну страну."
        );
        return;
      }

      if (!budget) {
        setSaveError(
          "Выбери бюджет."
        );
        return;
      }

      if (
        portfolio.length === 0
      ) {
        setSaveError(
          "Выбери вариант портфолио."
        );
        return;
      }

      try {
        setSaving(true);

        const questionnaireData = {
          grade,

          interests,

          gpa:
            normalizeNumber(
              gpa
            ),

          noExams,

          ielts:
            noExams ||
            !ielts.trim()
              ? null
              : Number(
                  normalizeNumber(
                    ielts
                  )
                ),

          sat:
            noExams ||
            !sat.trim()
              ? null
              : Number(
                  sat.trim()
                ),

          countries,

          budget,

          needsScholarship,

          portfolio,

          portfolioDescriptions,
        };

        console.log(
          "QUESTIONNAIRE DATA:",
          questionnaireData
        );

        const {
          data,
          error,
        } =
          await supabase.auth.updateUser(
            {
              data: {
                onboarding_completed:
                  true,

                questionnaire:
                  questionnaireData,
              },
            }
          );

        if (error) {
          throw error;
        }

        console.log(
          "QUESTIONNAIRE SAVED:",
          data.user
        );

        router.replace(
          "/home"
        );
      } catch (
        error: any
      ) {
        console.error(
          "QUESTIONNAIRE SAVE ERROR:",
          error
        );

        setSaveError(
          error?.message ||
            "Не удалось сохранить анкету."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================
     PROGRESS
  ========================= */

  const progress =
    Math.min(
      (
        maxStep /
        totalSteps
      ) * 100,
      100
    );

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}

        <View
          style={styles.header}
        >
          <Pressable
            onPress={() =>
              router.replace(
                "/"
              )
            }
            style={({
              pressed,
            }) => [
              styles.backHome,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.backArrow
              }
            >
              ←
            </Text>

            <Text
              style={
                styles.backHomeText
              }
            >
              Главная
            </Text>
          </Pressable>

          <View
            style={styles.logo}
          >
            <View
              style={
                styles.logoMark
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
                  styles.logoName
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
              styles.stepCounter
            }
          >
            <Text
              style={
                styles.stepCounterText
              }
            >
              {Math.min(
                maxStep,
                totalSteps
              )}
              /{totalSteps}
            </Text>
          </View>
        </View>

        {/* INTRO */}

        <View
          style={styles.intro}
        >
          <Text
            style={
              styles.smallTitle
            }
          >
            СОЗДАЁМ ТВОЙ ПРОФИЛЬ
          </Text>

          <Text
            style={
              styles.mainTitle
            }
          >
            Расскажи немного о себе
          </Text>

          <Text
            style={
              styles.mainDescription
            }
          >
            Каждый ответ помогает
            лучше понять твои цели и
            построить персональный
            маршрут поступления.
          </Text>

          <View
            style={
              styles.progressTrack
            }
          >
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    `${progress}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* STEP 1 */}

        <QuestionCard
          number="01"
          category="EDUCATION"
          title="В каком ты классе?"
          description="Выбери текущий класс или статус обучения."
        >
          <View
            style={
              styles.options
            }
          >
            {gradeOptions.map(
              (item) => (
                <Choice
                  key={item}
                  label={item}
                  selected={
                    grade === item
                  }
                  onPress={() => {
                    setGrade(item);
                    revealStep(
                      2
                    );
                  }}
                />
              )
            )}
          </View>
        </QuestionCard>

        {/* STEP 2 */}

        {maxStep >= 2 && (
          <QuestionCard
            number="02"
            category="INTERESTS"
            title="Что тебе интересно?"
            description="Можно выбрать несколько направлений."
          >
            <View
              style={
                styles.options
              }
            >
              {interestOptions.map(
                (item) => (
                  <Choice
                    key={item}
                    label={item}
                    selected={interests.includes(
                      item
                    )}
                    onPress={() => {
                      toggleMulti(
                        item,
                        interests,
                        setInterests
                      );

                      revealStep(
                        3
                      );
                    }}
                  />
                )
              )}
            </View>
          </QuestionCard>
        )}

        {/* STEP 3 */}

        {maxStep >= 3 && (
          <QuestionCard
            number="03"
            category="ACADEMICS"
            title="Какая у тебя успеваемость?"
            description="Укажи среднюю оценку по шкале от 0 до 5."
          >
            <View
              style={[
                styles.inputBlock,

                gpaInvalid &&
                  styles.invalidField,
              ]}
            >
              <Text
                style={
                  styles.inputLabel
                }
              >
                GPA / средняя
                оценка
              </Text>

              <TextInput
                value={gpa}
                onChangeText={(
                  value
                ) => {
                  setGpa(value);

                  if (
                    isValidGPAValue(
                      value
                    )
                  ) {
                    revealStep(
                      4
                    );
                  }
                }}
                placeholder="Например: 4.8"
                placeholderTextColor="#9CA79F"
                keyboardType="decimal-pad"
                style={
                  styles.input
                }
              />

              <Text
                style={
                  styles.inputHelp
                }
              >
                Введи число от 0 до
                5. Например: 4.8
              </Text>
            </View>
          </QuestionCard>
        )}

        {/* STEP 4 */}

        {maxStep >= 4 &&
          gpaReady && (
            <QuestionCard
              number="04"
              category="EXAMS"
              title="Какие экзамены ты уже сдавал?"
              description="Если ещё не сдавал IELTS или SAT — это нормально."
            >
              <View
                style={
                  styles.switchBlock
                }
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.switchTitle
                    }
                  >
                    Ещё не сдавал
                  </Text>

                  <Text
                    style={
                      styles.switchSubtitle
                    }
                  >
                    У меня пока нет
                    результатов
                    экзаменов
                  </Text>
                </View>

                <Switch
                  value={
                    noExams
                  }
                  onValueChange={(
                    value
                  ) => {
                    setNoExams(
                      value
                    );

                    if (
                      value
                    ) {
                      setIelts(
                        ""
                      );

                      setSat("");

                      revealStep(
                        5
                      );
                    }
                  }}
                  trackColor={{
                    false:
                      "#CCD4CE",

                    true:
                      "#9BC0A7",
                  }}
                  thumbColor={
                    noExams
                      ? COLORS.forest
                      : "#FFFFFF"
                  }
                />
              </View>

              {!noExams && (
                <View
                  style={
                    styles.examRow
                  }
                >
                  {/* IELTS */}

                  <View
                    style={[
                      styles.examBlock,

                      ieltsInvalid &&
                        styles.invalidField,
                    ]}
                  >
                    <Text
                      style={
                        styles.examLabel
                      }
                    >
                      IELTS
                    </Text>

                    <TextInput
                      value={
                        ielts
                      }
                      onChangeText={(
                        value
                      ) => {
                        setIelts(
                          value
                        );

                        const nextIELTSValid =
                          value.trim() ===
                            "" ||
                          isValidIELTSValue(
                            value
                          );

                        const currentSATValid =
                          sat.trim() ===
                            "" ||
                          isValidSATValue(
                            sat
                          );

                        const hasExam =
                          value.trim() !==
                            "" ||
                          sat.trim() !==
                            "";

                        if (
                          hasExam &&
                          nextIELTSValid &&
                          currentSATValid
                        ) {
                          revealStep(
                            5
                          );
                        }
                      }}
                      placeholder="6.5"
                      placeholderTextColor="#9CA79F"
                      keyboardType="decimal-pad"
                      style={
                        styles.examInput
                      }
                    />
                  </View>

                  {/* SAT */}

                  <View
                    style={[
                      styles.examBlock,

                      satInvalid &&
                        styles.invalidField,
                    ]}
                  >
                    <Text
                      style={
                        styles.examLabel
                      }
                    >
                      SAT
                    </Text>

                    <TextInput
                      value={sat}
                      onChangeText={(
                        value
                      ) => {
                        setSat(
                          value
                        );

                        const nextSATValid =
                          value.trim() ===
                            "" ||
                          isValidSATValue(
                            value
                          );

                        const currentIELTSValid =
                          ielts.trim() ===
                            "" ||
                          isValidIELTSValue(
                            ielts
                          );

                        const hasExam =
                          value.trim() !==
                            "" ||
                          ielts.trim() !==
                            "";

                        if (
                          hasExam &&
                          nextSATValid &&
                          currentIELTSValid
                        ) {
                          revealStep(
                            5
                          );
                        }
                      }}
                      placeholder="1320"
                      placeholderTextColor="#9CA79F"
                      keyboardType="number-pad"
                      style={
                        styles.examInput
                      }
                    />
                  </View>
                </View>
              )}
            </QuestionCard>
          )}

        {/* STEP 5 */}

        {maxStep >= 5 &&
          gpaReady &&
          examsReady && (
            <QuestionCard
              number="05"
              category="DESTINATIONS"
              title="Где ты рассматриваешь обучение?"
              description="Можно выбрать несколько стран."
            >
              <View
                style={
                  styles.options
                }
              >
                {countryOptions.map(
                  (item) => (
                    <Choice
                      key={
                        item
                      }
                      label={
                        item
                      }
                      selected={countries.includes(
                        item
                      )}
                      onPress={() => {
                        toggleMulti(
                          item,
                          countries,
                          setCountries
                        );

                        revealStep(
                          6
                        );
                      }}
                    />
                  )
                )}
              </View>
            </QuestionCard>
          )}

        {/* STEP 6 */}

        {maxStep >= 6 &&
          gpaReady &&
          examsReady && (
            <QuestionCard
              number="06"
              category="FINANCES"
              title="Какой бюджет ты рассматриваешь?"
              description="Примерный годовой бюджет на обучение."
            >
              <View
                style={
                  styles.options
                }
              >
                {budgetOptions.map(
                  (item) => (
                    <Choice
                      key={
                        item
                      }
                      label={
                        item
                      }
                      selected={
                        budget ===
                        item
                      }
                      onPress={() => {
                        setBudget(
                          item
                        );

                        revealStep(
                          7
                        );
                      }}
                    />
                  )
                )}
              </View>

              <View
                style={
                  styles.scholarshipBlock
                }
              >
                <View
                  style={
                    styles.moneyIcon
                  }
                >
                  <Text
                    style={
                      styles.moneyIconText
                    }
                  >
                    $
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.switchTitle
                    }
                  >
                    Нужна
                    scholarship /
                    financial aid
                  </Text>

                  <Text
                    style={
                      styles.switchSubtitle
                    }
                  >
                    Будем учитывать
                    это при подборе
                    вузов
                  </Text>
                </View>

                <Switch
                  value={
                    needsScholarship
                  }
                  onValueChange={
                    setNeedsScholarship
                  }
                  trackColor={{
                    false:
                      "#CCD4CE",

                    true:
                      "#9BC0A7",
                  }}
                  thumbColor={
                    needsScholarship
                      ? COLORS.forest
                      : "#FFFFFF"
                  }
                />
              </View>
            </QuestionCard>
          )}

        {/* STEP 7 */}

        {maxStep >= 7 &&
          gpaReady &&
          examsReady && (
            <QuestionCard
              number="07"
              category="PORTFOLIO"
              title="Что уже есть в твоём портфолио?"
              description="Выбери всё, чем ты уже занимался."
            >
              <View
                style={
                  styles.options
                }
              >
                {portfolioOptions.map(
                  (item) => (
                    <Choice
                      key={
                        item
                      }
                      label={
                        item
                      }
                      selected={portfolio.includes(
                        item
                      )}
                      onPress={() =>
                        togglePortfolio(
                          item
                        )
                      }
                    />
                  )
                )}
              </View>
            </QuestionCard>
          )}

        {/* STEP 8 */}

        {maxStep >= 8 &&
          gpaReady &&
          examsReady && (
            <QuestionCard
              number="08"
              category="YOUR EXPERIENCE"
              title={
                portfolio.includes(
                  "Nothing yet"
                )
                  ? "Начнём строить портфолио с нуля"
                  : "Расскажи подробнее о достижениях"
              }
              description={
                portfolio.includes(
                  "Nothing yet"
                )
                  ? "Это нормально. Позже сервис предложит подходящие активности."
                  : "Каждое выбранное достижение можно описать отдельно."
              }
            >
              {portfolio.includes(
                "Nothing yet"
              ) ? (
                <View
                  style={
                    styles.emptyPortfolio
                  }
                >
                  <View
                    style={
                      styles.emptyIcon
                    }
                  >
                    <Text
                      style={
                        styles.emptyIconText
                      }
                    >
                      +
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.emptyTitle
                      }
                    >
                      Пока нет
                      портфолио
                    </Text>

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      Мы позже
                      предложим
                      олимпиады,
                      исследования,
                      проекты,
                      волонтёрство и
                      другие
                      возможности.
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  style={
                    styles.achievementList
                  }
                >
                  {portfolio.map(
                    (
                      item,
                      index
                    ) => (
                      <View
                        key={
                          item
                        }
                        style={
                          styles.achievementCard
                        }
                      >
                        <View
                          style={
                            styles.achievementTop
                          }
                        >
                          <View
                            style={
                              styles.achievementNumber
                            }
                          >
                            <Text
                              style={
                                styles.achievementNumberText
                              }
                            >
                              {index +
                                1}
                            </Text>
                          </View>

                          <View>
                            <Text
                              style={
                                styles.achievementTitle
                              }
                            >
                              {
                                item
                              }
                            </Text>

                            <Text
                              style={
                                styles.achievementSubtitle
                              }
                            >
                              Опиши
                              свой опыт
                            </Text>
                          </View>
                        </View>

                        <TextInput
                          value={
                            portfolioDescriptions[
                              item
                            ] ||
                            ""
                          }
                          onChangeText={(
                            value
                          ) => {
                            setPortfolioDescriptions(
                              (
                                old
                              ) => ({
                                ...old,

                                [item]:
                                  value,
                              })
                            );
                          }}
                          multiline
                          textAlignVertical="top"
                          placeholder={
                            item ===
                            "Olympiads"
                              ? "Например: занял 2 место на городской олимпиаде..."
                              : item ===
                                "Research"
                              ? "Например: провёл исследование по робототехнике..."
                              : item ===
                                "Volunteering"
                              ? "Например: участвовал в экологическом волонтёрском проекте..."
                              : item ===
                                "Projects"
                              ? "Например: создал приложение или инженерный проект..."
                              : item ===
                                "Startup"
                              ? "Например: создал школьный стартап..."
                              : "Кратко расскажи, что именно ты делал..."
                          }
                          placeholderTextColor="#9DA69F"
                          maxLength={
                            500
                          }
                          style={
                            styles.achievementInput
                          }
                        />

                        <Text
                          style={
                            styles.counter
                          }
                        >
                          {
                            (
                              portfolioDescriptions[
                                item
                              ] ||
                              ""
                            )
                              .length
                          }
                          /500
                        </Text>
                      </View>
                    )
                  )}
                </View>
              )}

              <View
                style={
                  styles.finishBlock
                }
              >
                <Text
                  style={
                    styles.finishSmall
                  }
                >
                  ПРОФИЛЬ ГОТОВ
                </Text>

                <Text
                  style={
                    styles.finishTitle
                  }
                >
                  Теперь можно
                  перейти к твоему
                  маршруту
                </Text>

                <Text
                  style={
                    styles.finishDescription
                  }
                >
                  Данные анкеты
                  сохранятся в твоём
                  аккаунте и будут
                  использоваться в
                  профиле и подборе
                  университетов.
                </Text>

                {saveError ? (
                  <Text
                    style={
                      styles.saveError
                    }
                  >
                    {saveError}
                  </Text>
                ) : null}

                <Pressable
                  onPress={
                    finishQuestionnaire
                  }
                  disabled={
                    saving
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.finishButton,

                    pressed &&
                      styles.finishPressed,

                    saving &&
                      styles.finishButtonDisabled,
                  ]}
                >
                  <Text
                    style={
                      styles.finishButtonText
                    }
                  >
                    {saving
                      ? "СОХРАНЯЕМ..."
                      : "ПЕРЕЙТИ К ПРОФИЛЮ →"}
                  </Text>
                </Pressable>
              </View>
            </QuestionCard>
          )}

        <View
          style={{
            height: 70,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   COMPONENTS
========================= */

function QuestionCard({
  number,
  category,
  title,
  description,
  children,
}: {
  number: string;
  category: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const fade =
    useRef(
      new Animated.Value(0)
    ).current;

  React.useEffect(() => {
    Animated.timing(
      fade,
      {
        toValue: 1,
        duration: 350,
        useNativeDriver:
          true,
      }
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.questionCard,

        {
          opacity: fade,
        },
      ]}
    >
      <View
        style={
          styles.questionTop
        }
      >
        <Text
          style={
            styles.questionNumber
          }
        >
          {number}
        </Text>

        <Text
          style={
            styles.questionCategory
          }
        >
          {category}
        </Text>
      </View>

      <Text
        style={
          styles.questionTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.questionDescription
        }
      >
        {description}
      </Text>

      <View
        style={
          styles.questionContent
        }
      >
        {children}
      </View>
    </Animated.View>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.choice,

        selected &&
          styles.choiceSelected,

        pressed &&
          styles.pressed,
      ]}
    >
      {selected && (
        <View
          style={
            styles.choiceDot
          }
        />
      )}

      <Text
        style={[
          styles.choiceText,

          selected &&
            styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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

    content: {
      width: "100%",
      maxWidth: 900,
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingTop: 18,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 40,
    },

    backHome: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
    },

    backArrow: {
      color: COLORS.forest,
      fontSize: 17,
      marginRight: 6,
    },

    backHomeText: {
      color: COLORS.forest,
      fontSize: 11,
      fontWeight: "800",
    },

    logo: {
      flexDirection: "row",
      alignItems: "center",
    },

    logoMark: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        COLORS.forest,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    logoLetter: {
      color: "#FFFFFF",
      fontSize: 19,
      fontWeight: "900",
    },

    logoName: {
      color: COLORS.forest,
      fontSize: 19,
      fontWeight: "900",
    },

    logoSub: {
      color: COLORS.muted,
      fontSize: 8,
      textTransform:
        "uppercase",
      letterSpacing: 1,
    },

    stepCounter: {
      backgroundColor:
        COLORS.sage,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },

    stepCounterText: {
      color: COLORS.forest,
      fontWeight: "800",
      fontSize: 11,
    },

    intro: {
      marginBottom: 27,
    },

    smallTitle: {
      color: COLORS.emerald,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 1.2,
    },

    mainTitle: {
      color: COLORS.text,
      fontSize: 36,
      lineHeight: 43,
      fontWeight: "800",
      marginTop: 10,
    },

    mainDescription: {
      color: COLORS.muted,
      fontSize: 14,
      lineHeight: 22,
      maxWidth: 600,
      marginTop: 10,
    },

    progressTrack: {
      height: 5,
      backgroundColor:
        COLORS.sage,
      borderRadius: 999,
      marginTop: 22,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      backgroundColor:
        COLORS.emerald,
    },

    questionCard: {
      backgroundColor:
        COLORS.surface,
      borderRadius: 23,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding: 23,
      marginBottom: 17,
    },

    questionTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    questionNumber: {
      color: COLORS.emerald,
      fontSize: 11,
      fontWeight: "900",
      marginRight: 9,
    },

    questionCategory: {
      color: COLORS.muted,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1.1,
    },

    questionTitle: {
      color: COLORS.text,
      fontSize: 22,
      fontWeight: "800",
    },

    questionDescription: {
      color: COLORS.muted,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 6,
    },

    questionContent: {
      marginTop: 19,
    },

    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
    },

    choice: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingVertical: 11,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      backgroundColor:
        "#FAFCF9",
    },

    choiceSelected: {
      backgroundColor:
        COLORS.sageSoft,
      borderColor:
        "#ABC2AE",
    },

    choiceDot: {
      width: 7,
      height: 7,
      borderRadius: 5,
      backgroundColor:
        COLORS.emerald,
      marginRight: 8,
    },

    choiceText: {
      color: COLORS.text,
      fontSize: 13,
      fontWeight: "600",
    },

    choiceTextSelected: {
      color: COLORS.forest,
      fontWeight: "800",
    },

    inputBlock: {
      backgroundColor:
        "#FAFCF9",
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      padding: 15,
    },

    inputLabel: {
      color: COLORS.forest,
      fontSize: 11,
      fontWeight: "800",
    },

    input: {
      fontSize: 17,
      color: COLORS.text,
      paddingVertical: 8,
    },

    inputHelp: {
      color: COLORS.muted,
      fontSize: 10,
    },

    switchBlock: {
      backgroundColor:
        COLORS.sageSoft,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },

    switchTitle: {
      color: COLORS.text,
      fontSize: 13,
      fontWeight: "800",
    },

    switchSubtitle: {
      color: COLORS.muted,
      fontSize: 10,
      marginTop: 3,
    },

    examRow: {
      flexDirection: "row",
      gap: 10,
    },

    examBlock: {
      flex: 1,
      backgroundColor:
        "#FAFCF9",
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      padding: 14,
    },

    examLabel: {
      color: COLORS.emerald,
      fontSize: 10,
      fontWeight: "900",
    },

    examInput: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 5,
    },

    invalidField: {
      borderColor:
        COLORS.error,
      borderWidth: 2,
      backgroundColor:
        COLORS.errorSoft,
    },

    scholarshipBlock: {
      marginTop: 15,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        COLORS.sageSoft,
      padding: 16,
      borderRadius: 17,
    },

    moneyIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        COLORS.forest,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    moneyIconText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "900",
    },

    achievementList: {
      gap: 13,
    },

    achievementCard: {
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 17,
      backgroundColor:
        "#FAFCF9",
      padding: 16,
    },

    achievementTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    achievementNumber: {
      width: 31,
      height: 31,
      borderRadius: 10,
      backgroundColor:
        COLORS.sage,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    achievementNumberText: {
      color: COLORS.forest,
      fontSize: 11,
      fontWeight: "900",
    },

    achievementTitle: {
      color: COLORS.text,
      fontSize: 14,
      fontWeight: "800",
    },

    achievementSubtitle: {
      color: COLORS.muted,
      fontSize: 10,
    },

    achievementInput: {
      minHeight: 100,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 13,
      backgroundColor:
        COLORS.surface,
      padding: 13,
      color: COLORS.text,
      fontSize: 13,
      lineHeight: 20,
    },

    counter: {
      color: COLORS.muted,
      fontSize: 9,
      textAlign: "right",
      marginTop: 6,
    },

    emptyPortfolio: {
      flexDirection: "row",
      alignItems: "center",
      padding: 17,
      backgroundColor:
        COLORS.sageSoft,
      borderRadius: 17,
    },

    emptyIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        COLORS.forest,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    emptyIconText: {
      color: "#FFFFFF",
      fontSize: 22,
    },

    emptyTitle: {
      color: COLORS.text,
      fontWeight: "800",
    },

    emptyText: {
      color: COLORS.muted,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 4,
    },

    finishBlock: {
      marginTop: 22,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
    },

    finishSmall: {
      color: COLORS.emerald,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },

    finishTitle: {
      color: COLORS.text,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 10,
    },

    finishDescription: {
      color: COLORS.muted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },

    saveError: {
      color: COLORS.error,
      fontSize: 11,
      fontWeight: "700",
      lineHeight: 17,
      marginTop: 12,
    },

    finishButton: {
      height: 54,
      borderRadius: 15,
      backgroundColor:
        COLORS.forest,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 18,
    },

    finishButtonDisabled: {
      opacity: 0.6,
    },

    finishPressed: {
      opacity: 0.8,
    },

    finishButtonText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    pressed: {
      opacity: 0.7,
    },
  });