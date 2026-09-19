// src/components/ProfilePageV2.tsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

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
  errorSoft: "#FFF3F3",

  success: "#5E8150",
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

const studentCountryOptions = [
  "Kazakhstan",
  "Uzbekistan",
  "Kyrgyzstan",
  "Tajikistan",
  "Turkmenistan",

  "Azerbaijan",
  "Georgia",
  "Armenia",

  "Ukraine",
  "Moldova",

  "India",
  "China",
  "South Korea",
  "Japan",

  "Türkiye",
  "UAE",

  "USA",
  "Canada",
  "UK",

  "Germany",
  "France",
  "Italy",
  "Spain",

  "Other",
];

const targetCountryOptions = [
  "USA",
  "UK",
  "Canada",
  "Germany",
  "France",
  "Italy",
  "Netherlands",
  "Switzerland",

  "South Korea",
  "Hong Kong",
  "Singapore",
  "Australia",
  "Japan",
  "UAE",

  "Türkiye",
  "Не определился",
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

const budgetOptions = [
  "< $5k",
  "$5–15k",
  "$15–30k",
  "$30k+",
];

const gpaScaleOptions = [
  "4",
  "5",
  "10",
  "20",
  "100",
];

/* =========================================================
   TYPES
========================================================= */

type PortfolioEntry = {
  title: string;
  description: string;
};

type ProfileData = {
  grade: string;

  gpa: string;
  gpaScale: string;

  schoolCountry: string;
  citizenshipCountry: string;

  interests: string[];

  targetCountries: string[];

  budget: string;

  needsScholarship: boolean;

  ielts: string;
  sat: string;
  noExams: boolean;

  portfolio: PortfolioEntry[];
};

type Props = {
  accountName: string;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeNumber(
  value: string
) {
  return value
    .trim()
    .replace(",", ".");
}

function removeEmojiCountry(
  value: unknown
) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(
      /^[\p{Regional_Indicator}\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u,
      ""
    )
    .trim();
}

function parseCountryArray(
  value: unknown
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(removeEmojiCountry)
    .filter(Boolean);
}

function isValidGPA(
  value: string,
  scale: string
) {
  const score =
    Number(
      normalizeNumber(
        value
      )
    );

  const maximum =
    Number(
      normalizeNumber(
        scale
      )
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
}

function isValidIELTS(
  value: string
) {
  if (
    !value.trim()
  ) {
    return true;
  }

  const score =
    Number(
      normalizeNumber(
        value
      )
    );

  if (
    !Number.isFinite(
      score
    )
  ) {
    return false;
  }

  return (
    score >= 0 &&
    score <= 9 &&
    Number.isInteger(
      score * 2
    )
  );
}

function isValidSAT(
  value: string
) {
  if (
    !value.trim()
  ) {
    return true;
  }

  if (
    !/^\d+$/.test(
      value.trim()
    )
  ) {
    return false;
  }

  const score =
    Number(
      value.trim()
    );

  return (
    score >= 400 &&
    score <= 1600 &&
    score % 10 === 0
  );
}

function cloneProfile(
  profile: ProfileData
): ProfileData {
  return {
    ...profile,

    interests: [
      ...profile.interests,
    ],

    targetCountries: [
      ...profile.targetCountries,
    ],

    portfolio:
      profile.portfolio.map(
        (item) => ({
          ...item,
        })
      ),
  };
}

const EMPTY_PROFILE:
  ProfileData = {
  grade: "",

  gpa: "",
  gpaScale: "",

  schoolCountry: "",
  citizenshipCountry: "",

  interests: [],

  targetCountries: [],

  budget: "",

  needsScholarship: false,

  ielts: "",
  sat: "",
  noExams: true,

  portfolio: [],
};

/* =========================================================
   MAIN
========================================================= */

export default function ProfilePageV2({
  accountName,
}: Props) {
  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    profile,
    setProfile,
  ] =
    useState<ProfileData>(
      cloneProfile(
        EMPTY_PROFILE
      )
    );

  const [
    draft,
    setDraft,
  ] =
    useState<ProfileData>(
      cloneProfile(
        EMPTY_PROFILE
      )
    );

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    setError("");

    try {
      const {
        data,
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError
      ) {
        throw userError;
      }

      if (
        !data.user
      ) {
        throw new Error(
          "Пользователь не найден."
        );
      }

      const q =
        data.user
          .user_metadata
          ?.questionnaire ||
        {};

      const rawPortfolio:
        string[] =
        Array.isArray(
          q.portfolio
        )
          ? q.portfolio
          : [];

      const descriptions =
        q.portfolioDescriptions &&
        typeof q.portfolioDescriptions ===
          "object"
          ? q.portfolioDescriptions
          : {};

      const portfolio =
        rawPortfolio
          .filter(
            (item) =>
              item !==
              "Nothing yet"
          )
          .map(
            (title) => ({
              title,

              description:
                String(
                  descriptions[
                    title
                  ] || ""
                ),
            })
          );

      let targetCountries =
        parseCountryArray(
          q.targetCountries
        );

      /*
        Backwards compatibility:
        старая анкета хранила страны
        поступления в countries.
      */

      if (
        targetCountries.length ===
        0
      ) {
        targetCountries =
          parseCountryArray(
            q.countries
          );
      }

      const loaded:
        ProfileData = {
        grade:
          q.grade
            ? String(
                q.grade
              )
            : "",

        gpa:
          q.gpa !==
            null &&
          q.gpa !==
            undefined
            ? String(
                q.gpa
              )
            : "",

        gpaScale:
          q.gpaScale !==
            null &&
          q.gpaScale !==
            undefined
            ? String(
                q.gpaScale
              )
            : "",

        schoolCountry:
          removeEmojiCountry(
            q.schoolCountry
          ),

        citizenshipCountry:
          removeEmojiCountry(
            q.citizenshipCountry
          ),

        interests:
          Array.isArray(
            q.interests
          )
            ? q.interests
            : [],

        targetCountries,

        budget:
          q.budget
            ? String(
                q.budget
              )
            : "",

        needsScholarship:
          q.needsScholarship ===
          true,

        ielts:
          q.ielts !==
            null &&
          q.ielts !==
            undefined
            ? String(
                q.ielts
              )
            : "",

        sat:
          q.sat !==
            null &&
          q.sat !==
            undefined
            ? String(
                q.sat
              )
            : "",

        noExams:
          q.noExams ===
          true,

        portfolio,
      };

      setProfile(
        loaded
      );

      setDraft(
        cloneProfile(
          loaded
        )
      );
    } catch (
      err
    ) {
      setError(
        err instanceof
          Error
          ? err.message
          : "Не удалось загрузить профиль."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function startEditing() {
    setDraft(
      cloneProfile(
        profile
      )
    );

    setError("");
    setSuccess("");

    setEditing(
      true
    );
  }

  function cancelEditing() {
    setDraft(
      cloneProfile(
        profile
      )
    );

    setError("");

    setEditing(
      false
    );
  }

  /* =======================================================
     TOGGLE ARRAY
  ======================================================= */

  function toggleArrayValue(
    field:
      | "interests"
      | "targetCountries",
    value: string
  ) {
    setDraft(
      (old) => {
        const current =
          old[field];

        if (
          value ===
          "Не определился"
        ) {
          return {
            ...old,

            [field]:
              current.includes(
                value
              )
                ? []
                : [
                    value,
                  ],
          };
        }

        const withoutUnknown =
          current.filter(
            (item) =>
              item !==
              "Не определился"
          );

        return {
          ...old,

          [field]:
            withoutUnknown.includes(
              value
            )
              ? withoutUnknown.filter(
                  (
                    item
                  ) =>
                    item !==
                    value
                )
              : [
                  ...withoutUnknown,
                  value,
                ],
        };
      }
    );
  }

  /* =======================================================
     VALIDATE
  ======================================================= */

  function validateProfile() {
    if (
      !gradeOptions.includes(
        draft.grade
      )
    ) {
      return "Выбери корректный класс.";
    }

    if (
      !draft.schoolCountry
    ) {
      return "Укажи страну, где ты сейчас учишься.";
    }

    if (
      !draft.citizenshipCountry
    ) {
      return "Укажи гражданство.";
    }

    if (
      draft.interests.length ===
      0
    ) {
      return "Выбери хотя бы одно направление интересов.";
    }

    if (
      !draft.gpa.trim() ||
      !draft.gpaScale.trim()
    ) {
      return "Укажи GPA и максимальную шкалу.";
    }

    if (
      !isValidGPA(
        draft.gpa,
        draft.gpaScale
      )
    ) {
      return "GPA введён некорректно. Например: 4.8 / 5 или 92 / 100.";
    }

    if (
      !draft.noExams &&
      !draft.ielts.trim() &&
      !draft.sat.trim()
    ) {
      return "Если экзамены ещё не сдавались, включи «Ещё не сдавал».";
    }

    if (
      !isValidIELTS(
        draft.ielts
      )
    ) {
      return "IELTS должен быть от 0 до 9 с шагом 0.5.";
    }

    if (
      !isValidSAT(
        draft.sat
      )
    ) {
      return "SAT должен быть от 400 до 1600 с шагом 10.";
    }

    if (
      draft.targetCountries
        .length === 0
    ) {
      return "Выбери хотя бы одну страну поступления.";
    }

    if (
      !draft.budget
    ) {
      return "Выбери бюджет.";
    }

    return "";
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveProfile() {
    if (
      saving
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const validation =
      validateProfile();

    if (
      validation
    ) {
      setError(
        validation
      );

      return;
    }

    setSaving(
      true
    );

    try {
      const {
        data,
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError
      ) {
        throw userError;
      }

      if (
        !data.user
      ) {
        throw new Error(
          "Пользователь не найден."
        );
      }

      const oldQ =
        data.user
          .user_metadata
          ?.questionnaire ||
        {};

      const portfolio =
        draft.portfolio.length >
        0
          ? draft.portfolio.map(
              (
                item
              ) =>
                item.title
            )
          : [
              "Nothing yet",
            ];

      const portfolioDescriptions =
        Object.fromEntries(
          draft.portfolio.map(
            (
              item
            ) => [
              item.title,

              item.description,
            ]
          )
        );

      const updatedQuestionnaire =
        {
          ...oldQ,

          grade:
            draft.grade,

          gpa:
            Number(
              normalizeNumber(
                draft.gpa
              )
            ),

          gpaScale:
            Number(
              normalizeNumber(
                draft.gpaScale
              )
            ),

          schoolCountry:
            draft.schoolCountry,

          citizenshipCountry:
            draft.citizenshipCountry,

          interests:
            draft.interests,

          targetCountries:
            draft.targetCountries,

          /*
            Старое поле пока тоже
            оставляем, чтобы ничего
            не сломалось в других
            частях сайта.
          */

          countries:
            draft.targetCountries,

          budget:
            draft.budget,

          needsScholarship:
            draft.needsScholarship,

          noExams:
            draft.noExams,

          ielts:
            draft.noExams ||
            !draft.ielts.trim()
              ? null
              : Number(
                  normalizeNumber(
                    draft.ielts
                  )
                ),

          sat:
            draft.noExams ||
            !draft.sat.trim()
              ? null
              : Number(
                  draft.sat
                ),

          portfolio,

          portfolioDescriptions,
        };

      const {
        data:
          updateData,
        error:
          updateError,
      } =
        await supabase.auth.updateUser(
          {
            data: {
              onboarding_completed:
                true,

              questionnaire:
                updatedQuestionnaire,
            },
          }
        );

      if (
        updateError
      ) {
        throw updateError;
      }

      if (
        !updateData.user
      ) {
        throw new Error(
          "Supabase не вернул обновлённый профиль."
        );
      }

      const saved =
        cloneProfile(
          draft
        );

      setProfile(
        saved
      );

      setDraft(
        saved
      );

      setEditing(
        false
      );

      setSuccess(
        "Профиль сохранён. UniPath AI будет использовать новые данные."
      );
    } catch (
      err
    ) {
      console.error(
        "PROFILE SAVE ERROR:",
        err
      );

      setError(
        err instanceof
          Error
          ? err.message
          : "Не удалось сохранить профиль."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  /* =======================================================
     COMPLETENESS
  ======================================================= */

  const completeness =
    useMemo(
      () => {
        const checks =
          [
            !!profile.grade,

            !!profile.schoolCountry,

            !!profile
              .citizenshipCountry,

            profile.interests
              .length > 0,

            !!profile.gpa &&
              !!profile.gpaScale,

            profile.noExams ||
              !!profile.ielts ||
              !!profile.sat,

            profile
              .targetCountries
              .length > 0,

            !!profile.budget,

            profile.portfolio
              .length > 0,
          ];

        return Math.round(
          (
            checks.filter(
              Boolean
            ).length /
            checks.length
          ) *
            100
        );
      },
      [
        profile,
      ]
    );

  const data =
    editing
      ? draft
      : profile;

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.loadingText
          }
        >
          Загружаем профиль...
        </Text>
      </View>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <ScrollView
      style={{
        flex:
          1,
      }}
      contentContainerStyle={
        styles.page
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}

      <View
        style={
          styles.pageHeader
        }
      >
        <View
          style={{
            flex:
              1,
          }}
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
              MY PROFILE
            </Text>
          </View>

          <Text
            style={
              styles.pageTitle
            }
          >
            Твой профиль
          </Text>

          <Text
            style={
              styles.pageDescription
            }
          >
            Здесь хранятся данные, которые UniPath AI использует для персонального анализа, университетов, opportunities и roadmap.
          </Text>
        </View>

        {!editing ? (
          <Pressable
            onPress={
              startEditing
            }
            style={({
              pressed,
            }) => [
              styles.editButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={
                18
              }
              color="#FFFFFF"
            />

            <Text
              style={
                styles.editButtonText
              }
            >
              Изменить профиль
            </Text>
          </Pressable>
        ) : (
          <View
            style={
              styles.actions
            }
          >
            <Pressable
              onPress={
                cancelEditing
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Отмена
              </Text>
            </Pressable>

            <Pressable
              disabled={
                saving
              }
              onPress={
                saveProfile
              }
              style={({
                pressed,
              }) => [
                styles.saveButton,

                saving && {
                  opacity:
                    0.5,
                },

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={
                  18
                }
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveText
                }
              >
                {saving
                  ? "Сохраняем..."
                  : "Сохранить"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* SUMMARY */}

      <View
        style={
          styles.summary
        }
      >
        <View
          style={
            styles.avatar
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {accountName
              .charAt(
                0
              )
              .toUpperCase()}
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
              styles.studentName
            }
          >
            {
              accountName
            }
          </Text>

          <Text
            style={
              styles.studentSubtitle
            }
          >
            International applicant profile
          </Text>

          <View
            style={
              styles.tags
            }
          >
            {!!data.grade && (
              <MiniTag
                text={
                  data.grade ===
                  "Выпускник"
                    ? data.grade
                    : `${data.grade} класс`
                }
              />
            )}

            {!!data.schoolCountry && (
              <MiniTag
                text={
                  data.schoolCountry
                }
              />
            )}

            {data.interests
              .slice(
                0,
                2
              )
              .map(
                (
                  item
                ) => (
                  <MiniTag
                    key={
                      item
                    }
                    text={
                      item
                    }
                  />
                )
              )}
          </View>
        </View>

        <View
          style={
            styles.completeness
          }
        >
          <Text
            style={
              styles.completenessNumber
            }
          >
            {
              completeness
            }
            %
          </Text>

          <Text
            style={
              styles.completenessLabel
            }
          >
            PROFILE COMPLETE
          </Text>
        </View>
      </View>

      {!!error && (
        <Notice
          error
          text={
            error
          }
        />
      )}

      {!!success && (
        <Notice
          text={
            success
          }
        />
      )}

      {/* BACKGROUND */}

      <SectionTitle
        icon="person-outline"
        title="Образовательный контекст"
        description="Класс, страна обучения и гражданство"
      />

      <View
        style={
          styles.grid
        }
      >
        <SelectCard
          icon="school-outline"
          label="Класс"
          value={
            data.grade
          }
          editing={
            editing
          }
          options={
            gradeOptions
          }
          onSelect={(
            value
          ) =>
            setDraft(
              (
                old
              ) => ({
                ...old,

                grade:
                  value,
              })
            )
          }
        />

        <SelectCard
          icon="location-outline"
          label="Где учишься"
          value={
            data.schoolCountry
          }
          editing={
            editing
          }
          options={
            studentCountryOptions
          }
          onSelect={(
            value
          ) =>
            setDraft(
              (
                old
              ) => ({
                ...old,

                schoolCountry:
                  value,
              })
            )
          }
        />

        <SelectCard
          icon="flag-outline"
          label="Гражданство"
          value={
            data.citizenshipCountry
          }
          editing={
            editing
          }
          options={
            studentCountryOptions
          }
          onSelect={(
            value
          ) =>
            setDraft(
              (
                old
              ) => ({
                ...old,

                citizenshipCountry:
                  value,
              })
            )
          }
        />
      </View>

      {/* ACADEMICS */}

      <SectionTitle
        icon="stats-chart-outline"
        title="Академические данные"
        description="GPA хранится вместе с исходной шкалой"
      />

      <View
        style={
          styles.academicCard
        }
      >
        <View
          style={
            styles.academicIcon
          }
        >
          <Ionicons
            name="stats-chart-outline"
            size={
              20
            }
            color={
              COLORS.emerald
            }
          />
        </View>

        <View
          style={{
            flex:
              1,
          }}
        >
          <Text
            style={
              styles.fieldLabel
            }
          >
            GPA / СРЕДНЯЯ ОЦЕНКА
          </Text>

          {editing ? (
            <>
              <View
                style={
                  styles.gpaRow
                }
              >
                <TextInput
                  value={
                    draft.gpa
                  }
                  onChangeText={(
                    value
                  ) =>
                    setDraft(
                      (
                        old
                      ) => ({
                        ...old,

                        gpa:
                          value.replace(
                            /[^0-9.,]/g,
                            ""
                          ),
                      })
                    )
                  }
                  keyboardType="decimal-pad"
                  placeholder="4.8"
                  placeholderTextColor={
                    COLORS.muted
                  }
                  style={
                    styles.gpaInput
                  }
                />

                <Text
                  style={
                    styles.gpaSlash
                  }
                >
                  /
                </Text>

                <TextInput
                  value={
                    draft.gpaScale
                  }
                  onChangeText={(
                    value
                  ) =>
                    setDraft(
                      (
                        old
                      ) => ({
                        ...old,

                        gpaScale:
                          value.replace(
                            /[^0-9.,]/g,
                            ""
                          ),
                      })
                    )
                  }
                  keyboardType="decimal-pad"
                  placeholder="5"
                  placeholderTextColor={
                    COLORS.muted
                  }
                  style={
                    styles.gpaInput
                  }
                />
              </View>

              <View
                style={
                  styles.quickOptions
                }
              >
                {gpaScaleOptions.map(
                  (
                    scale
                  ) => (
                    <SmallChoice
                      key={
                        scale
                      }
                      label={
                        `из ${scale}`
                      }
                      selected={
                        draft.gpaScale ===
                        scale
                      }
                      onPress={() =>
                        setDraft(
                          (
                            old
                          ) => ({
                            ...old,

                            gpaScale:
                              scale,
                          })
                        )
                      }
                    />
                  )
                )}
              </View>

              {!!draft.gpa &&
                !!draft.gpaScale &&
                !isValidGPA(
                  draft.gpa,
                  draft.gpaScale
                ) && (
                  <Text
                    style={
                      styles.inlineError
                    }
                  >
                    GPA не может быть выше максимальной шкалы.
                  </Text>
                )}
            </>
          ) : (
            <Text
              style={
                styles.bigValue
              }
            >
              {data.gpa &&
              data.gpaScale
                ? `${data.gpa} / ${data.gpaScale}`
                : "Не указано"}
            </Text>
          )}

          <Text
            style={
              styles.fieldHelp
            }
          >
            UniPath хранит исходную шкалу и не предполагает автоматически, что значение относится к американской системе.
          </Text>
        </View>
      </View>

      {/* INTERESTS */}

      <SectionTitle
        icon="bulb-outline"
        title="Академические интересы"
        description="Направления, которые будут влиять на рекомендации"
      />

      <View
        style={
          styles.fullCard
        }
      >
        {editing ? (
          <View
            style={
              styles.choiceWrap
            }
          >
            {interestOptions.map(
              (
                item
              ) => (
                <SmallChoice
                  key={
                    item
                  }
                  label={
                    item
                  }
                  selected={
                    draft.interests.includes(
                      item
                    )
                  }
                  onPress={() =>
                    toggleArrayValue(
                      "interests",
                      item
                    )
                  }
                />
              )
            )}
          </View>
        ) : (
          <View
            style={
              styles.choiceWrap
            }
          >
            {data.interests
              .length >
            0 ? (
              data.interests.map(
                (
                  item
                ) => (
                  <MiniTag
                    key={
                      item
                    }
                    text={
                      item
                    }
                  />
                )
              )
            ) : (
              <Text
                style={
                  styles.emptyText
                }
              >
                Не указано
              </Text>
            )}
          </View>
        )}
      </View>

      {/* EXAMS */}

      <SectionTitle
        icon="document-text-outline"
        title="Экзамены"
        description="UniPath использует только реальные введённые результаты"
      />

      {editing && (
        <View
          style={
            styles.noExamsRow
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
                styles.noExamsTitle
              }
            >
              Ещё не сдавал
            </Text>

            <Text
              style={
                styles.noExamsSub
              }
            >
              Включи, если IELTS и SAT результатов пока нет
            </Text>
          </View>

          <Switch
            value={
              draft.noExams
            }
            onValueChange={(
              value
            ) =>
              setDraft(
                (
                  old
                ) => ({
                  ...old,

                  noExams:
                    value,

                  ielts:
                    value
                      ? ""
                      : old.ielts,

                  sat:
                    value
                      ? ""
                      : old.sat,
                })
              )
            }
          />
        </View>
      )}

      <View
        style={
          styles.examGrid
        }
      >
        <ExamCard
          name="IELTS"
          value={
            data.ielts
          }
          noResult={
            data.noExams ||
            !data.ielts
          }
          editing={
            editing &&
            !draft.noExams
          }
          onChange={(
            value
          ) =>
            setDraft(
              (
                old
              ) => ({
                ...old,

                ielts:
                  value.replace(
                    /[^0-9.,]/g,
                    ""
                  ),
              })
            )
          }
          valid={
            isValidIELTS(
              draft.ielts
            )
          }
          hint="0–9, шаг 0.5"
        />

        <ExamCard
          name="SAT"
          value={
            data.sat
          }
          noResult={
            data.noExams ||
            !data.sat
          }
          editing={
            editing &&
            !draft.noExams
          }
          onChange={(
            value
          ) =>
            setDraft(
              (
                old
              ) => ({
                ...old,

                sat:
                  value.replace(
                    /\D/g,
                    ""
                  ),
              })
            )
          }
          valid={
            isValidSAT(
              draft.sat
            )
          }
          hint="400–1600, шаг 10"
        />
      </View>

      {/* DESTINATIONS */}

      <SectionTitle
        icon="earth-outline"
        title="Страны поступления"
        description="Отдельно от страны, где ты живёшь или учишься"
      />

      <View
        style={
          styles.fullCard
        }
      >
        {editing ? (
          <View
            style={
              styles.choiceWrap
            }
          >
            {targetCountryOptions.map(
              (
                item
              ) => (
                <SmallChoice
                  key={
                    item
                  }
                  label={
                    item
                  }
                  selected={
                    draft.targetCountries.includes(
                      item
                    )
                  }
                  onPress={() =>
                    toggleArrayValue(
                      "targetCountries",
                      item
                    )
                  }
                />
              )
            )}
          </View>
        ) : (
          <View
            style={
              styles.choiceWrap
            }
          >
            {data
              .targetCountries
              .length >
            0 ? (
              data.targetCountries.map(
                (
                  item
                ) => (
                  <MiniTag
                    key={
                      item
                    }
                    text={
                      item
                    }
                  />
                )
              )
            ) : (
              <Text
                style={
                  styles.emptyText
                }
              >
                Не указано
              </Text>
            )}
          </View>
        )}
      </View>

      {/* FINANCE */}

      <SectionTitle
        icon="wallet-outline"
        title="Финансы"
        description="Бюджет и необходимость scholarship / financial aid"
      />

      <View
        style={
          styles.grid
        }
      >
        <SelectCard
          icon="wallet-outline"
          label="Годовой бюджет"
          value={
            data.budget
          }
          editing={
            editing
          }
          options={
            budgetOptions
          }
          onSelect={(
            value
          ) =>
            setDraft(
              (
                old
              ) => ({
                ...old,

                budget:
                  value,
              })
            )
          }
        />

        <View
          style={
            styles.fieldCard
          }
        >
          <View
            style={
              styles.fieldIcon
            }
          >
            <Ionicons
              name="cash-outline"
              size={
                19
              }
              color={
                COLORS.emerald
              }
            />
          </View>

          <Text
            style={
              styles.fieldLabel
            }
          >
            SCHOLARSHIP / FINANCIAL AID
          </Text>

          {editing ? (
            <View
              style={
                styles.switchLine
              }
            >
              <Text
                style={
                  styles.switchValue
                }
              >
                {draft.needsScholarship
                  ? "Да, нужна"
                  : "Нет, не обязательна"}
              </Text>

              <Switch
                value={
                  draft.needsScholarship
                }
                onValueChange={(
                  value
                ) =>
                  setDraft(
                    (
                      old
                    ) => ({
                      ...old,

                      needsScholarship:
                        value,
                    })
                  )
                }
              />
            </View>
          ) : (
            <Text
              style={
                styles.fieldValue
              }
            >
              {data.needsScholarship
                ? "Да, нужна"
                : "Нет, не обязательна"}
            </Text>
          )}
        </View>
      </View>

      {/* PORTFOLIO */}

      <SectionTitle
        icon="ribbon-outline"
        title="Портфолио"
        description="AI анализирует не только тип активности, но и конкретный результат"
      />

      <View
        style={
          styles.portfolioBox
        }
      >
        {data.portfolio
          .length ===
        0 ? (
          <View
            style={
              styles.emptyPortfolio
            }
          >
            <Text
              style={
                styles.emptyPortfolioTitle
              }
            >
              В профиле активности пока не указаны
            </Text>

            <Text
              style={
                styles.emptyPortfolioText
              }
            >
              UniPath не будет автоматически считать, что у тебя вообще нет достижений — только что информации пока недостаточно.
            </Text>
          </View>
        ) : (
          data.portfolio.map(
            (
              item,
              index
            ) => (
              <View
                key={`${item.title}-${index}`}
                style={
                  styles.portfolioItem
                }
              >
                <View
                  style={
                    styles.portfolioNumber
                  }
                >
                  <Text
                    style={
                      styles.portfolioNumberText
                    }
                  >
                    {String(
                      index +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}
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
                      styles.portfolioTitle
                    }
                  >
                    {
                      item.title
                    }
                  </Text>

                  {editing ? (
                    <TextInput
                      value={
                        item.description
                      }
                      onChangeText={(
                        value
                      ) =>
                        setDraft(
                          (
                            old
                          ) => ({
                            ...old,

                            portfolio:
                              old.portfolio.map(
                                (
                                  portfolioItem,
                                  itemIndex
                                ) =>
                                  itemIndex ===
                                  index
                                    ? {
                                        ...portfolioItem,

                                        description:
                                          value,
                                      }
                                    : portfolioItem
                              ),
                          })
                        )
                      }
                      multiline
                      placeholder="Название, год, уровень, результат и твой вклад..."
                      placeholderTextColor={
                        COLORS.muted
                      }
                      style={
                        styles.portfolioInput
                      }
                    />
                  ) : (
                    <Text
                      style={
                        styles.portfolioDescription
                      }
                    >
                      {item.description.trim()
                        ? item.description
                        : "Описание пока не добавлено."}
                    </Text>
                  )}
                </View>
              </View>
            )
          )
        )}
      </View>

      <View
        style={{
          height:
            80,
        }}
      />
    </ScrollView>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View
      style={
        styles.sectionHeader
      }
    >
      <View
        style={
          styles.sectionIcon
        }
      >
        <Ionicons
          name={
            icon
          }
          size={
            18
          }
          color={
            COLORS.emerald
          }
        />
      </View>

      <View>
        <Text
          style={
            styles.sectionTitle
          }
        >
          {
            title
          }
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          {
            description
          }
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   SELECT CARD
========================================================= */

function SelectCard({
  icon,
  label,
  value,
  editing,
  options,
  onSelect,
}: {
  icon: any;
  label: string;
  value: string;
  editing: boolean;
  options: string[];
  onSelect: (
    value: string
  ) => void;
}) {
  return (
    <View
      style={
        styles.fieldCard
      }
    >
      <View
        style={
          styles.fieldIcon
        }
      >
        <Ionicons
          name={
            icon
          }
          size={
            19
          }
          color={
            COLORS.emerald
          }
        />
      </View>

      <Text
        style={
          styles.fieldLabel
        }
      >
        {
          label
        }
      </Text>

      {editing ? (
        <View
          style={
            styles.selectOptions
          }
        >
          {options.map(
            (
              item
            ) => (
              <SmallChoice
                key={
                  item
                }
                label={
                  item
                }
                selected={
                  value ===
                  item
                }
                onPress={() =>
                  onSelect(
                    item
                  )
                }
              />
            )
          )}
        </View>
      ) : (
        <Text
          style={
            styles.fieldValue
          }
        >
          {value ||
            "Не указано"}
        </Text>
      )}
    </View>
  );
}

/* =========================================================
   EXAM CARD
========================================================= */

function ExamCard({
  name,
  value,
  noResult,
  editing,
  onChange,
  valid,
  hint,
}: {
  name: string;
  value: string;
  noResult: boolean;
  editing: boolean;
  onChange: (
    value: string
  ) => void;
  valid: boolean;
  hint: string;
}) {
  return (
    <View
      style={
        styles.examCard
      }
    >
      <View
        style={
          styles.examTop
        }
      >
        <Text
          style={
            styles.examName
          }
        >
          {
            name
          }
        </Text>

        <View
          style={
            styles.examDot
          }
        />
      </View>

      {editing ? (
        <>
          <TextInput
            value={
              value
            }
            onChangeText={
              onChange
            }
            placeholder={
              name ===
              "IELTS"
                ? "6.5"
                : "1320"
            }
            placeholderTextColor="#C6D2BE"
            keyboardType={
              name ===
              "IELTS"
                ? "decimal-pad"
                : "number-pad"
            }
            style={[
              styles.examInput,

              !valid &&
                styles.examInputInvalid,
            ]}
          />

          {!valid && (
            <Text
              style={
                styles.examErrorText
              }
            >
              Некорректное значение
            </Text>
          )}
        </>
      ) : (
        <Text
          style={
            styles.examValue
          }
        >
          {noResult
            ? "—"
            : value}
        </Text>
      )}

      <Text
        style={
          styles.examHint
        }
      >
        {editing
          ? hint
          : noResult
          ? "Пока не указан"
          : "Current result"}
      </Text>
    </View>
  );
}

/* =========================================================
   SMALL CHOICE
========================================================= */

function SmallChoice({
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
   MINI TAG
========================================================= */

function MiniTag({
  text,
}: {
  text: string;
}) {
  return (
    <View
      style={
        styles.tag
      }
    >
      <Text
        style={
          styles.tagText
        }
      >
        {
          text
        }
      </Text>
    </View>
  );
}

/* =========================================================
   NOTICE
========================================================= */

function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <View
      style={[
        styles.notice,

        error &&
          styles.noticeError,
      ]}
    >
      <Ionicons
        name={
          error
            ? "alert-circle-outline"
            : "checkmark-circle-outline"
        }
        size={
          18
        }
        color={
          error
            ? COLORS.error
            : COLORS.success
        }
      />

      <Text
        style={[
          styles.noticeText,

          error && {
            color:
              COLORS.error,
          },
        ]}
      >
        {
          text
        }
      </Text>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    center: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        40,
    },

    loadingText: {
      color:
        COLORS.muted,

      fontSize:
        13,
    },

    page: {
      width:
        "100%",

      maxWidth:
        1200,

      alignSelf:
        "center",

      paddingHorizontal:
        32,

      paddingTop:
        38,
    },

    pageHeader: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "flex-start",

      gap:
        20,

      marginBottom:
        27,
    },

    eyebrow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        9,
    },

    eyebrowDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        COLORS.emerald,

      marginRight:
        8,
    },

    eyebrowText: {
      color:
        COLORS.emerald,

      fontSize:
        9,

      fontWeight:
        "900",

      letterSpacing:
        1.2,
    },

    pageTitle: {
      color:
        COLORS.text,

      fontSize:
        34,

      fontWeight:
        "800",
    },

    pageDescription: {
      maxWidth:
        640,

      color:
        COLORS.muted,

      fontSize:
        12,

      lineHeight:
        19,

      marginTop:
        7,
    },

    editButton: {
      height:
        46,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        8,

      paddingHorizontal:
        17,

      backgroundColor:
        COLORS.forest,

      borderRadius:
        14,
    },

    editButtonText: {
      color:
        "#FFFFFF",

      fontSize:
        11,

      fontWeight:
        "800",
    },

    actions: {
      flexDirection:
        "row",

      gap:
        8,
    },

    cancelButton: {
      height:
        46,

      justifyContent:
        "center",

      paddingHorizontal:
        16,

      backgroundColor:
        COLORS.surface,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        14,
    },

    cancelText: {
      color:
        COLORS.text,

      fontSize:
        11,

      fontWeight:
        "800",
    },

    saveButton: {
      height:
        46,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,

      paddingHorizontal:
        16,

      borderRadius:
        14,

      backgroundColor:
        COLORS.forest,
    },

    saveText: {
      color:
        "#FFFFFF",

      fontSize:
        11,

      fontWeight:
        "800",
    },

    /* SUMMARY */

    summary: {
      minHeight:
        145,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        24,

      backgroundColor:
        COLORS.surface,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        23,

      marginBottom:
        15,
    },

    avatar: {
      width:
        74,

      height:
        74,

      borderRadius:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        COLORS.forest,

      marginRight:
        19,
    },

    avatarText: {
      color:
        "#FFFFFF",

      fontSize:
        28,

      fontWeight:
        "900",
    },

    studentName: {
      color:
        COLORS.text,

      fontSize:
        22,

      fontWeight:
        "800",
    },

    studentSubtitle: {
      color:
        COLORS.muted,

      fontSize:
        11,

      marginTop:
        3,
    },

    tags: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        6,

      marginTop:
        12,
    },

    completeness: {
      alignItems:
        "flex-end",
    },

    completenessNumber: {
      color:
        COLORS.emerald,

      fontSize:
        26,

      fontWeight:
        "800",
    },

    completenessLabel: {
      color:
        COLORS.muted,

      fontSize:
        8,

      letterSpacing:
        0.7,

      marginTop:
        2,
    },

    /* NOTICES */

    notice: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,

      padding:
        14,

      borderRadius:
        14,

      backgroundColor:
        COLORS.sageSoft,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      marginBottom:
        15,
    },

    noticeError: {
      backgroundColor:
        COLORS.errorSoft,

      borderColor:
        "#E9CACA",
    },

    noticeText: {
      flex:
        1,

      color:
        COLORS.success,

      fontSize:
        10,

      fontWeight:
        "700",
    },

    /* SECTION */

    sectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        20,

      marginBottom:
        13,
    },

    sectionIcon: {
      width:
        38,

      height:
        38,

      borderRadius:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        COLORS.sage,

      marginRight:
        11,
    },

    sectionTitle: {
      color:
        COLORS.text,

      fontSize:
        16,

      fontWeight:
        "800",
    },

    sectionDescription: {
      color:
        COLORS.muted,

      fontSize:
        9,

      marginTop:
        2,
    },

    /* GRID */

    grid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        12,
    },

    fieldCard: {
      flexGrow:
        1,

      flexBasis:
        280,

      minHeight:
        145,

      padding:
        18,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        18,

      backgroundColor:
        COLORS.surface,
    },

    fieldIcon: {
      width:
        36,

      height:
        36,

      borderRadius:
        11,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        COLORS.sageSoft,

      marginBottom:
        14,
    },

    fieldLabel: {
      color:
        COLORS.muted,

      fontSize:
        9,

      fontWeight:
        "800",

      letterSpacing:
        0.7,
    },

    fieldValue: {
      color:
        COLORS.text,

      fontSize:
        14,

      lineHeight:
        20,

      fontWeight:
        "700",

      marginTop:
        7,
    },

    fieldHelp: {
      color:
        COLORS.muted,

      fontSize:
        9,

      lineHeight:
        14,

      marginTop:
        10,
    },

    selectOptions: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        6,

      marginTop:
        11,
    },

    /* GPA */

    academicCard: {
      flexDirection:
        "row",

      gap:
        13,

      padding:
        20,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        19,

      backgroundColor:
        COLORS.surface,
    },

    academicIcon: {
      width:
        42,

      height:
        42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        13,

      backgroundColor:
        COLORS.sageSoft,
    },

    gpaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        10,

      marginTop:
        9,

      maxWidth:
        360,
    },

    gpaInput: {
      flex:
        1,

      height:
        49,

      minWidth:
        100,

      paddingHorizontal:
        13,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        12,

      backgroundColor:
        COLORS.background,

      color:
        COLORS.text,

      fontSize:
        19,

      fontWeight:
        "800",
    },

    gpaSlash: {
      color:
        COLORS.muted,

      fontSize:
        23,

      fontWeight:
        "800",
    },

    quickOptions: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        6,

      marginTop:
        10,
    },

    inlineError: {
      color:
        COLORS.error,

      fontSize:
        9,

      fontWeight:
        "700",

      marginTop:
        8,
    },

    bigValue: {
      color:
        COLORS.text,

      fontSize:
        27,

      fontWeight:
        "800",

      marginTop:
        7,
    },

    /* FULL CARD */

    fullCard: {
      padding:
        18,

      backgroundColor:
        COLORS.surface,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        18,
    },

    choiceWrap: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        7,
    },

    choice: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        11,

      paddingVertical:
        8,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        11,

      backgroundColor:
        "#FAFCF9",
    },

    choiceSelected: {
      borderColor:
        "#AFC5A5",

      backgroundColor:
        COLORS.sageSoft,
    },

    choiceDot: {
      width:
        6,

      height:
        6,

      borderRadius:
        3,

      backgroundColor:
        COLORS.emerald,

      marginRight:
        6,
    },

    choiceText: {
      color:
        COLORS.text,

      fontSize:
        10,

      fontWeight:
        "600",
    },

    choiceTextSelected: {
      color:
        COLORS.forest,

      fontWeight:
        "800",
    },

    tag: {
      paddingHorizontal:
        9,

      paddingVertical:
        5,

      borderRadius:
        999,

      backgroundColor:
        COLORS.sageSoft,
    },

    tagText: {
      color:
        COLORS.forest,

      fontSize:
        9,

      fontWeight:
        "700",
    },

    emptyText: {
      color:
        COLORS.muted,

      fontSize:
        12,
    },

    /* EXAMS */

    noExamsRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        15,

      borderRadius:
        15,

      backgroundColor:
        COLORS.sageSoft,

      marginBottom:
        12,
    },

    noExamsTitle: {
      color:
        COLORS.text,

      fontSize:
        12,

      fontWeight:
        "800",
    },

    noExamsSub: {
      color:
        COLORS.muted,

      fontSize:
        9,

      marginTop:
        3,
    },

    examGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        12,
    },

    examCard: {
      flexGrow:
        1,

      flexBasis:
        280,

      minHeight:
        145,

      padding:
        19,

      borderRadius:
        18,

      backgroundColor:
        COLORS.forest,

      borderWidth:
        1,

      borderColor:
        COLORS.forest2,
    },

    examTop: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    examName: {
      color:
        "#E2EBDD",

      fontSize:
        9,

      fontWeight:
        "900",

      letterSpacing:
        1,
    },

    examDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        COLORS.accent,
    },

    examValue: {
      color:
        "#FFFFFF",

      fontSize:
        29,

      fontWeight:
        "800",

      marginTop:
        16,
    },

    examInput: {
      color:
        "#FFFFFF",

      fontSize:
        24,

      fontWeight:
        "800",

      marginTop:
        12,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#78965D",

      paddingBottom:
        5,
    },

    examInputInvalid: {
      borderBottomColor:
        "#FFB9B9",
    },

    examErrorText: {
      color:
        "#FFD5D5",

      fontSize:
        8,

      marginTop:
        5,
    },

    examHint: {
      color:
        "#D4DFC9",

      fontSize:
        9,

      marginTop:
        8,
    },

    /* FINANCE */

    switchLine: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginTop:
        9,
    },

    switchValue: {
      color:
        COLORS.text,

      fontSize:
        13,

      fontWeight:
        "700",
    },

    /* PORTFOLIO */

    portfolioBox: {
      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      borderRadius:
        20,

      backgroundColor:
        COLORS.surface,
    },

    portfolioItem: {
      flexDirection:
        "row",

      padding:
        19,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },

    portfolioNumber: {
      width:
        38,

      height:
        38,

      borderRadius:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        COLORS.sage,

      marginRight:
        14,
    },

    portfolioNumberText: {
      color:
        COLORS.forest,

      fontSize:
        10,

      fontWeight:
        "900",
    },

    portfolioTitle: {
      color:
        COLORS.emerald,

      fontSize:
        10,

      fontWeight:
        "900",

      textTransform:
        "uppercase",

      letterSpacing:
        0.7,
    },

    portfolioDescription: {
      color:
        COLORS.text,

      fontSize:
        12,

      lineHeight:
        19,

      marginTop:
        5,
    },

    portfolioInput: {
      minHeight:
        80,

      marginTop:
        7,

      padding:
        10,

      borderRadius:
        11,

      backgroundColor:
        COLORS.background,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      color:
        COLORS.text,

      fontSize:
        11,

      lineHeight:
        18,
    },

    emptyPortfolio: {
      padding:
        20,
    },

    emptyPortfolioTitle: {
      color:
        COLORS.text,

      fontSize:
        13,

      fontWeight:
        "800",
    },

    emptyPortfolioText: {
      color:
        COLORS.muted,

      fontSize:
        10,

      lineHeight:
        16,

      marginTop:
        5,
    },

    pressed: {
      opacity:
        0.7,
    },
  });