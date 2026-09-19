import React, {
  useRef,
  useState,
} from "react";

import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { supabase } from "../lib/supabase";

/* =========================================================
   COLORS
========================================================= */

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

  error: "#B84A4A",
  errorSoft: "#FFF4F4",
};

/* =========================================================
   OPTIONS
========================================================= */

const gradeOptions = [
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

const studentCountryOptions = [
  "🇰🇿 Kazakhstan",
  "🇺🇿 Uzbekistan",
  "🇰🇬 Kyrgyzstan",
  "🇹🇯 Tajikistan",
  "🇹🇲 Turkmenistan",

  "🇦🇿 Azerbaijan",
  "🇬🇪 Georgia",
  "🇦🇲 Armenia",

  "🇺🇦 Ukraine",
  "🇲🇩 Moldova",

  "🇮🇳 India",
  "🇨🇳 China",
  "🇰🇷 South Korea",
  "🇯🇵 Japan",

  "🇹🇷 Türkiye",
  "🇦🇪 UAE",

  "🇺🇸 USA",
  "🇨🇦 Canada",
  "🇬🇧 UK",

  "🇩🇪 Germany",
  "🇫🇷 France",
  "🇮🇹 Italy",
  "🇪🇸 Spain",

  "Другая страна",
];

const targetCountryOptions = [
  "🇺🇸 USA",
  "🇬🇧 UK",
  "🇨🇦 Canada",
  "🇩🇪 Germany",
  "🇫🇷 France",
  "🇮🇹 Italy",
  "🇳🇱 Netherlands",
  "🇨🇭 Switzerland",

  "🇰🇷 South Korea",
  "🇭🇰 Hong Kong",
  "🇸🇬 Singapore",
  "🇦🇺 Australia",
  "🇯🇵 Japan",
  "🇦🇪 UAE",

  "🇹🇷 Türkiye",

  "Не определился",
];

const gpaScaleOptions = [
  "4",
  "5",
  "10",
  "20",
  "100",
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

/* =========================================================
   HELPERS
========================================================= */

const normalizeNumber = (
  value: string
) => {
  return value
    .trim()
    .replace(",", ".");
};

const cleanCountry = (
  value: string
) => {
  return value
    .replace(
      /^[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u,
      ""
    )
    .trim();
};

/* =========================================================
   SCREEN
========================================================= */

export default function QuestionnaireScreen() {
  const router =
    useRouter();

  const scrollRef =
    useRef<ScrollView>(
      null
    );

  /* =======================================================
     PROGRESS
  ======================================================= */

  const [
    maxStep,
    setMaxStep,
  ] =
    useState(1);

  const totalSteps =
    9;

  /* =======================================================
     EDUCATION
  ======================================================= */

  const [
    grade,
    setGrade,
  ] =
    useState<
      string | null
    >(null);

  const [
    schoolCountry,
    setSchoolCountry,
  ] =
    useState<
      string | null
    >(null);

  const [
    citizenshipCountry,
    setCitizenshipCountry,
  ] =
    useState<
      string | null
    >(null);

  /* =======================================================
     INTERESTS
  ======================================================= */

  const [
    interests,
    setInterests,
  ] =
    useState<
      string[]
    >([]);

  /* =======================================================
     GPA
  ======================================================= */

  const [
    gpa,
    setGpa,
  ] =
    useState("");

  const [
    gpaScale,
    setGpaScale,
  ] =
    useState("");

  const [
    gpaError,
    setGpaError,
  ] =
    useState("");

  /* =======================================================
     EXAMS
  ======================================================= */

  const [
    ielts,
    setIelts,
  ] =
    useState("");

  const [
    sat,
    setSat,
  ] =
    useState("");

  const [
    noExams,
    setNoExams,
  ] =
    useState(false);

  const [
    ieltsError,
    setIeltsError,
  ] =
    useState("");

  const [
    satError,
    setSatError,
  ] =
    useState("");

  /* =======================================================
     TARGET COUNTRIES
  ======================================================= */

  const [
    targetCountries,
    setTargetCountries,
  ] =
    useState<
      string[]
    >([]);

  /* =======================================================
     FINANCE
  ======================================================= */

  const [
    budget,
    setBudget,
  ] =
    useState<
      string | null
    >(null);

  const [
    needsScholarship,
    setNeedsScholarship,
  ] =
    useState(false);

  /* =======================================================
     PORTFOLIO
  ======================================================= */

  const [
    portfolio,
    setPortfolio,
  ] =
    useState<
      string[]
    >([]);

  const [
    portfolioDescriptions,
    setPortfolioDescriptions,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});

  /* =======================================================
     SAVE
  ======================================================= */

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    saveError,
    setSaveError,
  ] =
    useState("");

  /* =======================================================
     REVEAL NEXT STEP
  ======================================================= */

  const revealStep = (
    step: number
  ) => {
    if (
      step <= maxStep
    ) {
      return;
    }

    setMaxStep(
      step
    );

    setTimeout(
      () => {
        scrollRef.current?.scrollToEnd(
          {
            animated:
              true,
          }
        );
      },
      220
    );
  };

  /* =======================================================
     MULTI SELECT
  ======================================================= */

  const toggleMulti = (
    item: string,
    selected: string[],
    setter: (
      items: string[]
    ) => void
  ) => {
    if (
      item ===
      "Не определился"
    ) {
      setter(
        selected.includes(
          item
        )
          ? []
          : [item]
      );

      return;
    }

    const withoutUnknown =
      selected.filter(
        (value) =>
          value !==
          "Не определился"
      );

    if (
      withoutUnknown.includes(
        item
      )
    ) {
      setter(
        withoutUnknown.filter(
          (value) =>
            value !== item
        )
      );
    } else {
      setter([
        ...withoutUnknown,
        item,
      ]);
    }
  };

  /* =======================================================
     GPA VALIDATION
  ======================================================= */

  const isValidGPA = (
    value: string,
    scale: string
  ) => {
    const normalizedValue =
      normalizeNumber(
        value
      );

    const normalizedScale =
      normalizeNumber(
        scale
      );

    if (
      !normalizedValue ||
      !normalizedScale
    ) {
      return false;
    }

    const score =
      Number(
        normalizedValue
      );

    const maximum =
      Number(
        normalizedScale
      );

    if (
      !Number.isFinite(
        score
      ) ||
      !Number.isFinite(
        maximum
      )
    ) {
      return false;
    }

    if (
      maximum <= 0 ||
      maximum > 100
    ) {
      return false;
    }

    if (
      score < 0 ||
      score > maximum
    ) {
      return false;
    }

    return true;
  };

  const validateGPA =
    () => {
      if (
        !gpa.trim() ||
        !gpaScale.trim()
      ) {
        setGpaError(
          "Укажи и среднюю оценку, и максимальную шкалу."
        );

        return false;
      }

      if (
        !isValidGPA(
          gpa,
          gpaScale
        )
      ) {
        setGpaError(
          "Проверь GPA: средняя оценка не может быть выше максимальной шкалы. Например: 4.8 / 5."
        );

        return false;
      }

      setGpaError("");

      return true;
    };

  const tryRevealAfterGPA = (
    nextGpa: string,
    nextScale: string
  ) => {
    if (
      isValidGPA(
        nextGpa,
        nextScale
      )
    ) {
      setGpaError("");

      revealStep(5);
    }
  };

  /* =======================================================
     IELTS VALIDATION
  ======================================================= */

  const isValidIELTSValue = (
    value: string
  ) => {
    const normalized =
      normalizeNumber(
        value
      );

    if (
      !normalized
    ) {
      return false;
    }

    const score =
      Number(
        normalized
      );

    if (
      !Number.isFinite(
        score
      )
    ) {
      return false;
    }

    if (
      score < 0 ||
      score > 9
    ) {
      return false;
    }

    return Number.isInteger(
      score * 2
    );
  };

  const validateIELTS = (
    value: string
  ) => {
    if (
      isValidIELTSValue(
        value
      )
    ) {
      setIeltsError("");

      return true;
    }

    setIeltsError(
      "IELTS должен быть от 0 до 9 с шагом 0.5. Например: 6.5, 7, 7.5."
    );

    return false;
  };

  /* =======================================================
     SAT VALIDATION
  ======================================================= */

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
      Number(
        normalized
      );

    if (
      score < 400 ||
      score > 1600
    ) {
      return false;
    }

    return (
      score % 10 ===
      0
    );
  };

  const validateSAT = (
    value: string
  ) => {
    if (
      isValidSATValue(
        value
      )
    ) {
      setSatError("");

      return true;
    }

    setSatError(
      "SAT должен быть от 400 до 1600 с шагом 10. Например: 1200, 1310, 1450."
    );

    return false;
  };

  /* =======================================================
     EXAMS READY
  ======================================================= */

  const hasAtLeastOneExam =
    ielts.trim() !==
      "" ||
    sat.trim() !==
      "";

  const examsReady =
    noExams ||
    (
      hasAtLeastOneExam &&
      (
        ielts.trim() ===
          "" ||
        isValidIELTSValue(
          ielts
        )
      ) &&
      (
        sat.trim() ===
          "" ||
        isValidSATValue(
          sat
        )
      )
    );

  const validateAndRevealExams =
    () => {
      if (
        noExams
      ) {
        setIeltsError("");
        setSatError("");

        revealStep(6);

        return;
      }

      if (
        !hasAtLeastOneExam
      ) {
        return;
      }

      let valid =
        true;

      if (
        ielts.trim()
      ) {
        if (
          !validateIELTS(
            ielts
          )
        ) {
          valid =
            false;
        }
      } else {
        setIeltsError("");
      }

      if (
        sat.trim()
      ) {
        if (
          !validateSAT(
            sat
          )
        ) {
          valid =
            false;
        }
      } else {
        setSatError("");
      }

      if (
        valid
      ) {
        revealStep(6);
      }
    };

  /* =======================================================
     PORTFOLIO
  ======================================================= */

  const togglePortfolio = (
    item: string
  ) => {
    if (
      item ===
      "Nothing yet"
    ) {
      if (
        portfolio.includes(
          "Nothing yet"
        )
      ) {
        setPortfolio(
          []
        );
      } else {
        setPortfolio(
          [
            "Nothing yet",
          ]
        );

        setPortfolioDescriptions(
          {}
        );
      }

      revealStep(9);

      return;
    }

    let updated =
      portfolio.filter(
        (value) =>
          value !==
          "Nothing yet"
      );

    if (
      updated.includes(
        item
      )
    ) {
      updated =
        updated.filter(
          (value) =>
            value !==
            item
        );

      setPortfolioDescriptions(
        (old) => {
          const copy = {
            ...old,
          };

          delete copy[
            item
          ];

          return copy;
        }
      );
    } else {
      updated = [
        ...updated,
        item,
      ];
    }

    setPortfolio(
      updated
    );

    if (
      updated.length >
      0
    ) {
      revealStep(9);
    }
  };

  /* =======================================================
     FINAL VALIDATION + SAVE
  ======================================================= */

  const saveQuestionnaire =
    async () => {
      if (
        saving
      ) {
        return;
      }

      setSaveError("");

      if (
        !grade
      ) {
        setSaveError(
          "Выбери класс."
        );

        return;
      }

      if (
        !schoolCountry
      ) {
        setSaveError(
          "Укажи страну, где ты сейчас учишься."
        );

        return;
      }

      if (
        !citizenshipCountry
      ) {
        setSaveError(
          "Укажи гражданство."
        );

        return;
      }

      if (
        interests.length ===
        0
      ) {
        setSaveError(
          "Выбери хотя бы одно направление интересов."
        );

        return;
      }

      if (
        !validateGPA()
      ) {
        setSaveError(
          "Проверь GPA."
        );

        return;
      }

      if (
        !examsReady
      ) {
        setSaveError(
          "Проверь результаты экзаменов или выбери «Ещё не сдавал»."
        );

        return;
      }

      if (
        targetCountries.length ===
        0
      ) {
        setSaveError(
          "Выбери хотя бы одну страну поступления."
        );

        return;
      }

      if (
        !budget
      ) {
        setSaveError(
          "Выбери примерный годовой бюджет."
        );

        return;
      }

      if (
        portfolio.length ===
        0
      ) {
        setSaveError(
          "Укажи, что уже есть в портфолио, или выбери «Nothing yet»."
        );

        return;
      }

      setSaving(true);

      try {
        const normalizedGpa =
          Number(
            normalizeNumber(
              gpa
            )
          );

        const normalizedScale =
          Number(
            normalizeNumber(
              gpaScale
            )
          );

        const normalizedIELTS =
          noExams ||
          !ielts.trim()
            ? null
            : Number(
                normalizeNumber(
                  ielts
                )
              );

        const normalizedSAT =
          noExams ||
          !sat.trim()
            ? null
            : Number(
                sat.trim()
              );

        const cleanedSchoolCountry =
          cleanCountry(
            schoolCountry
          );

        const cleanedCitizenship =
          cleanCountry(
            citizenshipCountry
          );

        const cleanedTargets =
          targetCountries.map(
            cleanCountry
          );

        const questionnaireData =
          {
            grade,

            interests,

            /* =================
               GPA
            ================= */

            gpa:
              normalizedGpa,

            gpaScale:
              normalizedScale,

            /* =================
               LOCATION
            ================= */

            schoolCountry:
              cleanedSchoolCountry,

            citizenshipCountry:
              cleanedCitizenship,

            targetCountries:
              cleanedTargets,

            /*
              Временно сохраняем countries,
              потому что текущий home.tsx
              и AI ещё читают старое поле.
            */

            countries:
              targetCountries,

            /* =================
               EXAMS
            ================= */

            noExams,

            ielts:
              normalizedIELTS,

            sat:
              normalizedSAT,

            /* =================
               FINANCE
            ================= */

            budget,

            needsScholarship,

            /* =================
               PORTFOLIO
            ================= */

            portfolio,

            portfolioDescriptions,
          };

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

        if (
          error
        ) {
          throw error;
        }

        if (
          !data.user
        ) {
          throw new Error(
            "Профиль не был сохранён."
          );
        }

        router.replace(
          "/home"
        );
      } catch (
        error
      ) {
        console.error(
          "QUESTIONNAIRE SAVE ERROR:",
          error
        );

        setSaveError(
          error instanceof
            Error
            ? error.message
            : "Не удалось сохранить профиль."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progress =
    Math.min(
      (
        maxStep /
        totalSteps
      ) *
        100,
      100
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView
      style={
        styles.safe
      }
    >
      <ScrollView
        ref={
          scrollRef
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={
            styles.header
          }
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
            style={
              styles.logo
            }
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
              /
              {
                totalSteps
              }
            </Text>
          </View>
        </View>

        {/* =================================================
            INTRO
        ================================================= */}

        <View
          style={
            styles.intro
          }
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
            Чем точнее данные, тем точнее UniPath сможет анализировать твой профиль, университеты, scholarships и возможности.
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

        {/* =================================================
            01 GRADE
        ================================================= */}

        <QuestionCard
          number="01"
          category="EDUCATION"
          title="В каком ты классе?"
          description="Выбери текущий класс. Это позволит UniPath правильно понимать твой admissions timeline."
        >
          <View
            style={
              styles.options
            }
          >
            {gradeOptions.map(
              (item) => (
                <Choice
                  key={
                    item
                  }
                  label={
                    item
                  }
                  selected={
                    grade ===
                    item
                  }
                  onPress={() => {
                    setGrade(
                      item
                    );

                    revealStep(
                      2
                    );
                  }}
                />
              )
            )}
          </View>
        </QuestionCard>

        {/* =================================================
            02 STUDENT CONTEXT
        ================================================= */}

        {maxStep >=
          2 && (
          <QuestionCard
            number="02"
            category="BACKGROUND"
            title="Откуда ты подаёшься?"
            description="Не путай это со странами поступления. Эти данные нужны для eligibility scholarships, research programs и других возможностей."
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              ГДЕ ТЫ СЕЙЧАС УЧИШЬСЯ?
            </Text>

            <View
              style={
                styles.options
              }
            >
              {studentCountryOptions.map(
                (
                  item
                ) => (
                  <Choice
                    key={
                      `school-${item}`
                    }
                    label={
                      item
                    }
                    selected={
                      schoolCountry ===
                      item
                    }
                    onPress={() => {
                      setSchoolCountry(
                        item
                      );

                      if (
                        citizenshipCountry
                      ) {
                        revealStep(
                          3
                        );
                      }
                    }}
                  />
                )
              )}
            </View>

            <View
              style={
                styles.countryDivider
              }
            />

            <Text
              style={
                styles.sectionLabel
              }
            >
              ТВОЁ ГРАЖДАНСТВО
            </Text>

            {!!schoolCountry && (
              <Pressable
                onPress={() => {
                  setCitizenshipCountry(
                    schoolCountry
                  );

                  revealStep(
                    3
                  );
                }}
                style={({
                  pressed,
                }) => [
                  styles.sameCountryButton,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.sameCountryText
                  }
                >
                  То же, что страна обучения
                </Text>
              </Pressable>
            )}

            <View
              style={
                styles.options
              }
            >
              {studentCountryOptions.map(
                (
                  item
                ) => (
                  <Choice
                    key={
                      `citizenship-${item}`
                    }
                    label={
                      item
                    }
                    selected={
                      citizenshipCountry ===
                      item
                    }
                    onPress={() => {
                      setCitizenshipCountry(
                        item
                      );

                      if (
                        schoolCountry
                      ) {
                        revealStep(
                          3
                        );
                      }
                    }}
                  />
                )
              )}
            </View>

            <View
              style={
                styles.infoBox
              }
            >
              <Text
                style={
                  styles.infoTitle
                }
              >
                Почему UniPath спрашивает это?
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                Позже система сможет проверять, доступна ли конкретная scholarship, research opportunity или программа именно для ученика с твоим гражданством и образовательным контекстом.
              </Text>
            </View>
          </QuestionCard>
        )}

        {/* =================================================
            03 INTERESTS
        ================================================= */}

        {maxStep >=
          3 && (
          <QuestionCard
            number="03"
            category="INTERESTS"
            title="Что тебе интересно?"
            description="Можно выбрать несколько академических направлений."
          >
            <View
              style={
                styles.options
              }
            >
              {interestOptions.map(
                (
                  item
                ) => (
                  <Choice
                    key={
                      item
                    }
                    label={
                      item
                    }
                    selected={
                      interests.includes(
                        item
                      )
                    }
                    onPress={() => {
                      toggleMulti(
                        item,
                        interests,
                        setInterests
                      );

                      revealStep(
                        4
                      );
                    }}
                  />
                )
              )}
            </View>
          </QuestionCard>
        )}

        {/* =================================================
            04 GPA
        ================================================= */}

        {maxStep >=
          4 && (
          <QuestionCard
            number="04"
            category="ACADEMICS"
            title="Какая у тебя средняя оценка?"
            description="Укажи свой результат и максимальную шкалу отдельно."
          >
            <View
              style={
                styles.gpaContainer
              }
            >
              <View
                style={
                  styles.gpaField
                }
              >
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Средняя оценка
                </Text>

                <TextInput
                  value={
                    gpa
                  }
                  onChangeText={(
                    value
                  ) => {
                    const cleaned =
                      value.replace(
                        /[^0-9.,]/g,
                        ""
                      );

                    setGpa(
                      cleaned
                    );

                    setGpaError(
                      ""
                    );

                    tryRevealAfterGPA(
                      cleaned,
                      gpaScale
                    );
                  }}
                  onBlur={
                    validateGPA
                  }
                  placeholder="4.8"
                  placeholderTextColor="#9CA79F"
                  keyboardType="decimal-pad"
                  style={[
                    styles.gpaInput,

                    !!gpaError &&
                      styles.inputError,
                  ]}
                />
              </View>

              <Text
                style={
                  styles.gpaSlash
                }
              >
                /
              </Text>

              <View
                style={
                  styles.gpaField
                }
              >
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Максимальная шкала
                </Text>

                <TextInput
                  value={
                    gpaScale
                  }
                  onChangeText={(
                    value
                  ) => {
                    const cleaned =
                      value.replace(
                        /[^0-9.,]/g,
                        ""
                      );

                    setGpaScale(
                      cleaned
                    );

                    setGpaError(
                      ""
                    );

                    tryRevealAfterGPA(
                      gpa,
                      cleaned
                    );
                  }}
                  onBlur={
                    validateGPA
                  }
                  placeholder="5"
                  placeholderTextColor="#9CA79F"
                  keyboardType="decimal-pad"
                  style={[
                    styles.gpaInput,

                    !!gpaError &&
                      styles.inputError,
                  ]}
                />
              </View>
            </View>

            <Text
              style={
                styles.quickScaleLabel
              }
            >
              Быстро выбрать шкалу
            </Text>

            <View
              style={
                styles.options
              }
            >
              {gpaScaleOptions.map(
                (
                  item
                ) => (
                  <Choice
                    key={
                      item
                    }
                    label={
                      `из ${item}`
                    }
                    selected={
                      gpaScale ===
                      item
                    }
                    onPress={() => {
                      setGpaScale(
                        item
                      );

                      setGpaError(
                        ""
                      );

                      tryRevealAfterGPA(
                        gpa,
                        item
                      );
                    }}
                  />
                )
              )}
            </View>

            {!!gpaError && (
              <Text
                style={
                  styles.errorText
                }
              >
                {
                  gpaError
                }
              </Text>
            )}

            <View
              style={
                styles.gpaExample
              }
            >
              <Text
                style={
                  styles.gpaExampleText
                }
              >
                Например: 4.8 / 5, 3.7 / 4, 92 / 100. UniPath не будет автоматически считать 5 американским GPA — система будет знать исходную шкалу.
              </Text>
            </View>
          </QuestionCard>
        )}

        {/* =================================================
            05 EXAMS
        ================================================= */}

        {maxStep >=
          5 &&
          isValidGPA(
            gpa,
            gpaScale
          ) && (
          <QuestionCard
            number="05"
            category="EXAMS"
            title="Какие экзамены ты уже сдавал?"
            description="Указывай только реальные результаты. Если результатов пока нет — это нормально."
          >
            <View
              style={
                styles.switchBlock
              }
            >
              <View
                style={{
                  flex:
                    1,
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
                  У меня пока нет IELTS или SAT результатов
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

                    setSat(
                      ""
                    );

                    setIeltsError(
                      ""
                    );

                    setSatError(
                      ""
                    );

                    revealStep(
                      6
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
                <View
                  style={
                    styles.examBlock
                  }
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
                      const cleaned =
                        value.replace(
                          /[^0-9.,]/g,
                          ""
                        );

                      setIelts(
                        cleaned
                      );

                      setIeltsError(
                        ""
                      );
                    }}
                    onBlur={
                      validateAndRevealExams
                    }
                    placeholder="6.5"
                    placeholderTextColor="#9CA79F"
                    keyboardType="decimal-pad"
                    style={[
                      styles.examInput,

                      !!ieltsError &&
                        styles.examInputError,
                    ]}
                  />

                  {!!ieltsError && (
                    <Text
                      style={
                        styles.examError
                      }
                    >
                      {
                        ieltsError
                      }
                    </Text>
                  )}
                </View>

                <View
                  style={
                    styles.examBlock
                  }
                >
                  <Text
                    style={
                      styles.examLabel
                    }
                  >
                    SAT
                  </Text>

                  <TextInput
                    value={
                      sat
                    }
                    onChangeText={(
                      value
                    ) => {
                      const cleaned =
                        value.replace(
                          /\D/g,
                          ""
                        );

                      setSat(
                        cleaned
                      );

                      setSatError(
                        ""
                      );
                    }}
                    onBlur={
                      validateAndRevealExams
                    }
                    placeholder="1320"
                    placeholderTextColor="#9CA79F"
                    keyboardType="number-pad"
                    style={[
                      styles.examInput,

                      !!satError &&
                        styles.examInputError,
                    ]}
                  />

                  {!!satError && (
                    <Text
                      style={
                        styles.examError
                      }
                    >
                      {
                        satError
                      }
                    </Text>
                  )}
                </View>
              </View>
            )}

            {!noExams &&
              hasAtLeastOneExam &&
              examsReady && (
                <Pressable
                  onPress={() =>
                    revealStep(
                      6
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.continueButton,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.continueButtonText
                    }
                  >
                    ПРОДОЛЖИТЬ →
                  </Text>
                </Pressable>
              )}
          </QuestionCard>
        )}

        {/* =================================================
            06 TARGET COUNTRIES
        ================================================= */}

        {maxStep >=
          6 &&
          examsReady && (
          <QuestionCard
            number="06"
            category="DESTINATIONS"
            title="Куда ты хочешь поступать?"
            description="Это страны поступления, а не твоя текущая страна. Можно выбрать несколько."
          >
            <View
              style={
                styles.options
              }
            >
              {targetCountryOptions.map(
                (
                  item
                ) => (
                  <Choice
                    key={
                      item
                    }
                    label={
                      item
                    }
                    selected={
                      targetCountries.includes(
                        item
                      )
                    }
                    onPress={() => {
                      toggleMulti(
                        item,
                        targetCountries,
                        setTargetCountries
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
                styles.countryExplanation
              }
            >
              <Text
                style={
                  styles.countryExplanationText
                }
              >
                Например: если ты учишься в Казахстане, а выбрал USA здесь, UniPath понимает это как «ученик из Казахстана рассматривает США», а не как «ученик из США».
              </Text>
            </View>
          </QuestionCard>
        )}

        {/* =================================================
            07 FINANCES
        ================================================= */}

        {maxStep >=
          7 &&
          examsReady && (
          <QuestionCard
            number="07"
            category="FINANCES"
            title="Какой бюджет ты рассматриваешь?"
            description="Укажи примерный годовой бюджет, который семья готова рассматривать."
          >
            <View
              style={
                styles.options
              }
            >
              {budgetOptions.map(
                (
                  item
                ) => (
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
                        8
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
                  flex:
                    1,
                }}
              >
                <Text
                  style={
                    styles.switchTitle
                  }
                >
                  Нужна scholarship / financial aid
                </Text>

                <Text
                  style={
                    styles.switchSubtitle
                  }
                >
                  UniPath будет учитывать это при подборе возможностей
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

        {/* =================================================
            08 PORTFOLIO
        ================================================= */}

        {maxStep >=
          8 &&
          examsReady && (
          <QuestionCard
            number="08"
            category="PORTFOLIO"
            title="Что уже есть в твоём профиле?"
            description="Выбери только то, чем ты действительно занимался."
          >
            <View
              style={
                styles.options
              }
            >
              {portfolioOptions.map(
                (
                  item
                ) => (
                  <Choice
                    key={
                      item
                    }
                    label={
                      item
                    }
                    selected={
                      portfolio.includes(
                        item
                      )
                    }
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

        {/* =================================================
            09 EXPERIENCE DETAILS
        ================================================= */}

        {maxStep >=
          9 &&
          examsReady && (
          <QuestionCard
            number="09"
            category="YOUR EXPERIENCE"
            title={
              portfolio.includes(
                "Nothing yet"
              )
                ? "Начнём строить профиль с нуля"
                : "Расскажи подробнее о достижениях"
            }
            description={
              portfolio.includes(
                "Nothing yet"
              )
                ? "Это нормально. UniPath сможет показать, какие типы активностей стоит рассмотреть дальше."
                : "Чем конкретнее описание, тем глубже AI сможет анализировать твой профиль."
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
                    flex:
                      1,
                  }}
                >
                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    Пока ничего не указано
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    UniPath не будет считать это доказательством того, что у тебя вообще нет активностей. Он просто отметит, что информация пока отсутствует.
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
                            {
                              index +
                              1
                            }
                          </Text>
                        </View>

                        <View
                          style={{
                            flex:
                              1,
                          }}
                        >
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
                            Добавь конкретику: что, когда, уровень, результат и твой вклад
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
                            ? "Например: Республиканская олимпиада по информатике, 2026, национальный этап, 2 место. Решал задачи по алгоритмам и структурам данных."
                            : item ===
                              "Research"
                            ? "Например: исследовал..., моя роль..., получил результат..."
                            : item ===
                              "Projects"
                            ? "Например: создал веб-приложение..., использовал..., моя роль..., ссылка..."
                            : item ===
                              "Hackathons"
                            ? "Например: участвовал в..., команда..., мой вклад..., результат..."
                            : "Название, год, уровень, твоя роль и конкретный результат..."
                        }
                        placeholderTextColor="#9DA69F"
                        maxLength={
                          700
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
                          ).length
                        }
                        /700
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
                Теперь UniPath знает о тебе намного больше
              </Text>

              <Text
                style={
                  styles.finishDescription
                }
              >
                Эти данные будут использоваться AI для анализа профиля, подбора университетов, scholarships, research opportunities и персонального roadmap.
              </Text>

              {!!saveError && (
                <View
                  style={
                    styles.saveError
                  }
                >
                  <Text
                    style={
                      styles.saveErrorText
                    }
                  >
                    {
                      saveError
                    }
                  </Text>
                </View>
              )}

              <Pressable
                disabled={
                  saving
                }
                onPress={
                  saveQuestionnaire
                }
                style={({
                  pressed,
                }) => [
                  styles.finishButton,

                  saving && {
                    opacity:
                      0.55,
                  },

                  pressed &&
                    styles.finishPressed,
                ]}
              >
                <Text
                  style={
                    styles.finishButtonText
                  }
                >
                  {saving
                    ? "СОХРАНЯЕМ..."
                    : "СОХРАНИТЬ ПРОФИЛЬ →"}
                </Text>
              </Pressable>
            </View>
          </QuestionCard>
        )}

        <View
          style={{
            height:
              70,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   QUESTION CARD
========================================================= */

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

  children:
    React.ReactNode;
}) {
  const fade =
    useRef(
      new Animated.Value(
        0
      )
    ).current;

  React.useEffect(
    () => {
      Animated.timing(
        fade,
        {
          toValue:
            1,

          duration:
            350,

          useNativeDriver:
            true,
        }
      ).start();
    },
    []
  );

  return (
    <Animated.View
      style={[
        styles.questionCard,

        {
          opacity:
            fade,
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
          {
            number
          }
        </Text>

        <Text
          style={
            styles.questionCategory
          }
        >
          {
            category
          }
        </Text>
      </View>

      <Text
        style={
          styles.questionTitle
        }
      >
        {
          title
        }
      </Text>

      <Text
        style={
          styles.questionDescription
        }
      >
        {
          description
        }
      </Text>

      <View
        style={
          styles.questionContent
        }
      >
        {
          children
        }
      </View>
    </Animated.View>
  );
}

/* =========================================================
   CHOICE
========================================================= */

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;

  selected: boolean;

  onPress:
    () => void;
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
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
        {
          label
        }
      </Text>
    </Pressable>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    content: {
      width:
        "100%",

      maxWidth:
        900,

      alignSelf:
        "center",

      paddingHorizontal:
        20,

      paddingTop:
        18,
    },

    /* =====================================================
       HEADER
    ===================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        40,
    },

    backHome: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        13,

      paddingVertical:
        10,

      borderRadius:
        13,

      backgroundColor:
        COLORS.surface,

      borderWidth:
        1,

      borderColor:
        COLORS.border,
    },

    backArrow: {
      color:
        COLORS.forest,

      fontSize:
        17,

      marginRight:
        6,
    },

    backHomeText: {
      color:
        COLORS.forest,

      fontSize:
        11,

      fontWeight:
        "800",
    },

    logo: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    logoMark: {
      width:
        40,

      height:
        40,

      borderRadius:
        13,

      backgroundColor:
        COLORS.forest,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        10,
    },

    logoLetter: {
      color:
        "#FFFFFF",

      fontSize:
        19,

      fontWeight:
        "900",
    },

    logoName: {
      color:
        COLORS.forest,

      fontSize:
        19,

      fontWeight:
        "900",
    },

    logoSub: {
      color:
        COLORS.muted,

      fontSize:
        8,

      textTransform:
        "uppercase",

      letterSpacing:
        1,
    },

    stepCounter: {
      backgroundColor:
        COLORS.sage,

      borderRadius:
        999,

      paddingHorizontal:
        14,

      paddingVertical:
        9,
    },

    stepCounterText: {
      color:
        COLORS.forest,

      fontWeight:
        "800",

      fontSize:
        11,
    },

    /* =====================================================
       INTRO
    ===================================================== */

    intro: {
      marginBottom:
        27,
    },

    smallTitle: {
      color:
        COLORS.emerald,

      fontSize:
        10,

      fontWeight:
        "900",

      letterSpacing:
        1.2,
    },

    mainTitle: {
      color:
        COLORS.text,

      fontSize:
        36,

      lineHeight:
        43,

      fontWeight:
        "800",

      marginTop:
        10,
    },

    mainDescription: {
      color:
        COLORS.muted,

      fontSize:
        14,

      lineHeight:
        22,

      maxWidth:
        650,

      marginTop:
        10,
    },

    progressTrack: {
      height:
        5,

      backgroundColor:
        COLORS.sage,

      borderRadius:
        999,

      marginTop:
        22,

      overflow:
        "hidden",
    },

    progressFill: {
      height:
        "100%",

      backgroundColor:
        COLORS.emerald,
    },

    /* =====================================================
       QUESTION CARD
    ===================================================== */

    questionCard: {
      backgroundColor:
        COLORS.surface,

      borderRadius:
        23,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      padding:
        23,

      marginBottom:
        17,
    },

    questionTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        12,
    },

    questionNumber: {
      color:
        COLORS.emerald,

      fontSize:
        11,

      fontWeight:
        "900",

      marginRight:
        9,
    },

    questionCategory: {
      color:
        COLORS.muted,

      fontSize:
        9,

      fontWeight:
        "800",

      letterSpacing:
        1.1,
    },

    questionTitle: {
      color:
        COLORS.text,

      fontSize:
        22,

      fontWeight:
        "800",
    },

    questionDescription: {
      color:
        COLORS.muted,

      fontSize:
        13,

      lineHeight:
        20,

      marginTop:
        6,
    },

    questionContent: {
      marginTop:
        19,
    },

    /* =====================================================
       OPTIONS
    ===================================================== */

    options: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        9,
    },

    choice: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        15,

      paddingVertical:
        11,

      borderRadius:
        13,

      borderWidth:
        1,

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
      width:
        7,

      height:
        7,

      borderRadius:
        5,

      backgroundColor:
        COLORS.emerald,

      marginRight:
        8,
    },

    choiceText: {
      color:
        COLORS.text,

      fontSize:
        13,

      fontWeight:
        "600",
    },

    choiceTextSelected: {
      color:
        COLORS.forest,

      fontWeight:
        "800",
    },

    /* =====================================================
       COUNTRY
    ===================================================== */

    sectionLabel: {
      color:
        COLORS.forest,

      fontSize:
        10,

      fontWeight:
        "900",

      letterSpacing:
        0.9,

      marginBottom:
        11,
    },

    countryDivider: {
      height:
        1,

      backgroundColor:
        COLORS.border,

      marginVertical:
        20,
    },

    sameCountryButton: {
      alignSelf:
        "flex-start",

      marginBottom:
        12,

      paddingHorizontal:
        12,

      paddingVertical:
        9,

      borderRadius:
        11,

      backgroundColor:
        COLORS.sage,
    },

    sameCountryText: {
      color:
        COLORS.forest,

      fontSize:
        10,

      fontWeight:
        "800",
    },

    infoBox: {
      marginTop:
        17,

      padding:
        15,

      borderRadius:
        15,

      backgroundColor:
        COLORS.sageSoft,

      borderWidth:
        1,

      borderColor:
        COLORS.border,
    },

    infoTitle: {
      color:
        COLORS.forest,

      fontSize:
        11,

      fontWeight:
        "900",
    },

    infoText: {
      color:
        COLORS.muted,

      fontSize:
        10,

      lineHeight:
        16,

      marginTop:
        5,
    },

    countryExplanation: {
      marginTop:
        16,

      padding:
        14,

      borderRadius:
        14,

      backgroundColor:
        COLORS.sageSoft,
    },

    countryExplanationText: {
      color:
        COLORS.muted,

      fontSize:
        10,

      lineHeight:
        16,
    },

    /* =====================================================
       GPA
    ===================================================== */

    gpaContainer: {
      flexDirection:
        "row",

      alignItems:
        "flex-end",

      gap:
        12,
    },

    gpaField: {
      flex:
        1,
    },

    inputLabel: {
      color:
        COLORS.forest,

      fontSize:
        11,

      fontWeight:
        "800",

      marginBottom:
        7,
    },

    gpaInput: {
      height:
        57,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        14,

      backgroundColor:
        "#FAFCF9",

      paddingHorizontal:
        15,

      color:
        COLORS.text,

      fontSize:
        21,

      fontWeight:
        "800",
    },

    gpaSlash: {
      color:
        COLORS.muted,

      fontSize:
        30,

      fontWeight:
        "700",

      paddingBottom:
        10,
    },

    inputError: {
      borderColor:
        COLORS.error,

      backgroundColor:
        COLORS.errorSoft,
    },

    quickScaleLabel: {
      color:
        COLORS.muted,

      fontSize:
        9,

      fontWeight:
        "700",

      marginTop:
        16,

      marginBottom:
        9,

      textTransform:
        "uppercase",

      letterSpacing:
        0.7,
    },

    errorText: {
      color:
        COLORS.error,

      fontSize:
        10,

      lineHeight:
        15,

      marginTop:
        10,

      fontWeight:
        "700",
    },

    gpaExample: {
      marginTop:
        15,

      padding:
        13,

      borderRadius:
        13,

      backgroundColor:
        COLORS.sageSoft,
    },

    gpaExampleText: {
      color:
        COLORS.muted,

      fontSize:
        10,

      lineHeight:
        16,
    },

    /* =====================================================
       EXAMS
    ===================================================== */

    switchBlock: {
      backgroundColor:
        COLORS.sageSoft,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        16,

      padding:
        16,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        14,
    },

    switchTitle: {
      color:
        COLORS.text,

      fontSize:
        13,

      fontWeight:
        "800",
    },

    switchSubtitle: {
      color:
        COLORS.muted,

      fontSize:
        10,

      marginTop:
        3,
    },

    examRow: {
      flexDirection:
        "row",

      gap:
        10,
    },

    examBlock: {
      flex:
        1,

      backgroundColor:
        "#FAFCF9",

      borderRadius:
        15,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      padding:
        14,
    },

    examLabel: {
      color:
        COLORS.emerald,

      fontSize:
        10,

      fontWeight:
        "900",
    },

    examInput: {
      color:
        COLORS.text,

      fontSize:
        20,

      fontWeight:
        "800",

      marginTop:
        5,

      borderBottomWidth:
        1,

      borderBottomColor:
        "transparent",
    },

    examInputError: {
      borderBottomColor:
        COLORS.error,
    },

    examError: {
      color:
        COLORS.error,

      fontSize:
        9,

      lineHeight:
        13,

      marginTop:
        6,
    },

    continueButton: {
      alignSelf:
        "flex-start",

      marginTop:
        14,

      backgroundColor:
        COLORS.forest,

      borderRadius:
        12,

      paddingHorizontal:
        16,

      paddingVertical:
        11,
    },

    continueButtonText: {
      color:
        "#FFFFFF",

      fontSize:
        10,

      fontWeight:
        "900",
    },

    /* =====================================================
       FINANCES
    ===================================================== */

    scholarshipBlock: {
      marginTop:
        15,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        COLORS.sageSoft,

      padding:
        16,

      borderRadius:
        17,
    },

    moneyIcon: {
      width:
        38,

      height:
        38,

      borderRadius:
        12,

      backgroundColor:
        COLORS.forest,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,
    },

    moneyIconText: {
      color:
        "#FFFFFF",

      fontSize:
        17,

      fontWeight:
        "900",
    },

    /* =====================================================
       PORTFOLIO
    ===================================================== */

    achievementList: {
      gap:
        13,
    },

    achievementCard: {
      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        17,

      backgroundColor:
        "#FAFCF9",

      padding:
        16,
    },

    achievementTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        12,
    },

    achievementNumber: {
      width:
        31,

      height:
        31,

      borderRadius:
        10,

      backgroundColor:
        COLORS.sage,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        10,
    },

    achievementNumberText: {
      color:
        COLORS.forest,

      fontSize:
        11,

      fontWeight:
        "900",
    },

    achievementTitle: {
      color:
        COLORS.text,

      fontSize:
        14,

      fontWeight:
        "800",
    },

    achievementSubtitle: {
      color:
        COLORS.muted,

      fontSize:
        10,

      marginTop:
        2,
    },

    achievementInput: {
      minHeight:
        110,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        13,

      backgroundColor:
        COLORS.surface,

      padding:
        13,

      color:
        COLORS.text,

      fontSize:
        13,

      lineHeight:
        20,
    },

    counter: {
      color:
        COLORS.muted,

      fontSize:
        9,

      textAlign:
        "right",

      marginTop:
        6,
    },

    emptyPortfolio: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        17,

      backgroundColor:
        COLORS.sageSoft,

      borderRadius:
        17,
    },

    emptyIcon: {
      width:
        43,

      height:
        43,

      borderRadius:
        13,

      backgroundColor:
        COLORS.forest,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        13,
    },

    emptyIconText: {
      color:
        "#FFFFFF",

      fontSize:
        22,
    },

    emptyTitle: {
      color:
        COLORS.text,

      fontWeight:
        "800",
    },

    emptyText: {
      color:
        COLORS.muted,

      fontSize:
        10,

      lineHeight:
        16,

      marginTop:
        4,
    },

    /* =====================================================
       FINISH
    ===================================================== */

    finishBlock: {
      marginTop:
        22,

      paddingTop:
        20,

      borderTopWidth:
        1,

      borderTopColor:
        COLORS.border,
    },

    finishSmall: {
      color:
        COLORS.emerald,

      fontSize:
        9,

      fontWeight:
        "900",

      letterSpacing:
        1,
    },

    finishTitle: {
      color:
        COLORS.text,

      fontSize:
        18,

      fontWeight:
        "800",

      marginTop:
        10,
    },

    finishDescription: {
      color:
        COLORS.muted,

      fontSize:
        11,

      lineHeight:
        17,

      marginTop:
        5,
    },

    saveError: {
      marginTop:
        14,

      padding:
        12,

      borderRadius:
        12,

      backgroundColor:
        COLORS.errorSoft,

      borderWidth:
        1,

      borderColor:
        "#E7CACA",
    },

    saveErrorText: {
      color:
        COLORS.error,

      fontSize:
        10,

      lineHeight:
        15,

      fontWeight:
        "700",
    },

    finishButton: {
      height:
        54,

      borderRadius:
        15,

      backgroundColor:
        COLORS.forest,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        18,
    },

    finishPressed: {
      opacity:
        0.8,
    },

    finishButtonText: {
      color:
        "#FFFFFF",

      fontSize:
        11,

      fontWeight:
        "900",

      letterSpacing:
        0.8,
    },

    pressed: {
      opacity:
        0.7,
    },
  });