// src/app/home.tsx

import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import UniversitiesPage from "../components/UniversitiesPage";
import MyPathPage from "../components/MyPathPage";
import PreparationPage from "../components/PreparationPage";

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
};

/* =========================
   TYPES
========================= */

type Tab =
  | "profile"
  | "universities"
  | "path"
  | "preparation";

type PortfolioEntry = {
  title: string;
  value: string;
};

type Profile = {
  grade: string;
  gpa: string;

  interests: string;

  countries: string;

  budget: string;

  scholarship: string;

  ielts: string;
  sat: string;

  portfolioItems: PortfolioEntry[];
};

/* =========================
   EMPTY PROFILE
========================= */

const EMPTY_PROFILE: Profile = {
  grade: "Не указано",

  gpa: "Не указано",

  interests: "Не указано",

  countries: "Не указано",

  budget: "Не указано",

  scholarship: "Не указано",

  ielts: "Ещё не сдавал",

  sat: "Ещё не сдавал",

  portfolioItems: [],
};

/* =========================
   HELPERS
========================= */

function formatGrade(
  value: unknown
) {
  if (!value) {
    return "Не указано";
  }

  const grade =
    String(value).trim();

  if (
    grade === "Выпускник" ||
    grade
      .toLowerCase()
      .includes("класс")
  ) {
    return grade;
  }

  return `${grade} класс`;
}

function joinArray(
  value: unknown
) {
  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    return "Не указано";
  }

  return value.join(", ");
}

/* =========================
   QUESTIONNAIRE -> PROFILE
========================= */

function questionnaireToProfile(
  questionnaire: any
): Profile {
  if (!questionnaire) {
    return {
      ...EMPTY_PROFILE,

      portfolioItems: [],
    };
  }

  const selectedPortfolio:
    string[] =
    Array.isArray(
      questionnaire.portfolio
    )
      ? questionnaire.portfolio
      : [];

  const descriptions:
    Record<string, string> =
    questionnaire
      .portfolioDescriptions &&
    typeof questionnaire
      .portfolioDescriptions ===
      "object"
      ? questionnaire
          .portfolioDescriptions
      : {};

  let portfolioItems:
    PortfolioEntry[] = [];

  /*
    Если пользователь
    выбрал Nothing yet
  */

  if (
    selectedPortfolio.includes(
      "Nothing yet"
    )
  ) {
    portfolioItems = [
      {
        title: "Портфолио",

        value:
          "Пока нет достижений — будем строить портфолио с нуля.",
      },
    ];
  } else {
    portfolioItems =
      selectedPortfolio.map(
        (title) => ({
          title,

          value:
            String(
              descriptions[
                title
              ] || ""
            ).trim() ||
            "Выбрано в анкете. Описание пока не добавлено.",
        })
      );
  }

  return {
    grade: formatGrade(
      questionnaire.grade
    ),

    gpa:
      questionnaire.gpa !==
        undefined &&
      questionnaire.gpa !==
        null &&
      String(
        questionnaire.gpa
      ).trim() !== ""
        ? String(
            questionnaire.gpa
          )
        : "Не указано",

    interests: joinArray(
      questionnaire.interests
    ),

    countries: joinArray(
      questionnaire.countries
    ),

    budget:
      questionnaire.budget ||
      "Не указано",

    scholarship:
      questionnaire
        .needsScholarship ===
      true
        ? "Да, нужна financial aid / scholarship"
        : "Нет, не обязательна",

    ielts:
      questionnaire.noExams ||
      questionnaire.ielts ===
        null ||
      questionnaire.ielts ===
        undefined
        ? "Ещё не сдавал"
        : String(
            questionnaire.ielts
          ),

    sat:
      questionnaire.noExams ||
      questionnaire.sat ===
        null ||
      questionnaire.sat ===
        undefined
        ? "Ещё не сдавал"
        : String(
            questionnaire.sat
          ),

    portfolioItems,
  };
}

/* =========================
   STRING -> ARRAY
========================= */

function splitCommaList(
  value: string
) {
  return value
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(
      (item) =>
        item &&
        item !== "Не указано"
    );
}

/* =========================
   EXAM STRING -> NUMBER
========================= */

function parseExamValue(
  value: string
) {
  const clean =
    value
      .trim()
      .replace(",", ".");

  if (
    !clean ||
    clean ===
      "Ещё не сдавал"
  ) {
    return null;
  }

  const numberValue =
    Number(clean);

  return Number.isNaN(
    numberValue
  )
    ? null
    : numberValue;
}

/* =========================
   HOME SCREEN
========================= */

export default function HomeScreen() {
  const { width } =
    useWindowDimensions();

  const compactSidebar =
    width < 800;

  /* =========================
     ACCOUNT
  ========================= */

  const [
    accountName,
    setAccountName,
  ] = useState("Student");

  const [
    accountEmail,
    setAccountEmail,
  ] = useState("");

  const [
    accountProvider,
    setAccountProvider,
  ] = useState("Email");

  /* =========================
     TAB
  ========================= */

  const [
    tab,
    setTab,
  ] =
    useState<Tab>(
      "profile"
    );

  /* =========================
     EDIT
  ========================= */

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  /* =========================
     PROFILE
  ========================= */

  const [
    profile,
    setProfile,
  ] =
    useState<Profile>({
      ...EMPTY_PROFILE,

      portfolioItems: [],
    });

  const [
    draft,
    setDraft,
  ] =
    useState<Profile>({
      ...EMPTY_PROFILE,

      portfolioItems: [],
    });

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {
    loadCurrentUser();

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (
            session?.user
          ) {
            applyUser(
              session.user
            );
          }
        }
      );

    return () => {
      authListener
        .subscription
        .unsubscribe();
    };
  }, []);

  /* =========================
     APPLY USER
  ========================= */

  function applyUser(
    user: any
  ) {
    const name =
      user
        .user_metadata
        ?.full_name ||
      user
        .user_metadata
        ?.name ||
      user.email?.split(
        "@"
      )[0] ||
      "Student";

    const provider =
      user
        .app_metadata
        ?.provider ||
      "email";

    setAccountName(
      name
    );

    setAccountEmail(
      user.email || ""
    );

    if (
      provider ===
      "google"
    ) {
      setAccountProvider(
        "Google"
      );
    } else if (
      provider ===
      "apple"
    ) {
      setAccountProvider(
        "Apple"
      );
    } else if (
      provider ===
      "facebook"
    ) {
      setAccountProvider(
        "Facebook"
      );
    } else {
      setAccountProvider(
        "Email"
      );
    }

    /*
      ГЛАВНОЕ:

      Берём ответы,
      которые сохранили
      в questionnaire.tsx
    */

    const questionnaire =
      user
        .user_metadata
        ?.questionnaire;

    const loadedProfile =
      questionnaireToProfile(
        questionnaire
      );

    setProfile(
      loadedProfile
    );

    setDraft(
      loadedProfile
    );
  }

  /* =========================
     LOAD CURRENT USER
  ========================= */

  async function loadCurrentUser() {
    const {
      data,
      error,
    } =
      await supabase.auth.getUser();

    if (error) {
      console.log(
        "USER ERROR:",
        error
      );

      return;
    }

    if (
      data.user
    ) {
      applyUser(
        data.user
      );
    }
  }

  /* =========================
     START EDIT
  ========================= */

  const startEditing =
    () => {
      setDraft({
        ...profile,

        portfolioItems:
          profile
            .portfolioItems
            .map(
              (
                item
              ) => ({
                ...item,
              })
            ),
      });

      setEditing(
        true
      );
    };

  /* =========================
     CANCEL EDIT
  ========================= */

  const cancelEditing =
    () => {
      setDraft({
        ...profile,

        portfolioItems:
          profile
            .portfolioItems
            .map(
              (
                item
              ) => ({
                ...item,
              })
            ),
      });

      setEditing(
        false
      );
    };

  /* =========================
     CHANGE FIELD
  ========================= */

  const changeDraft = (
    field: Exclude<
      keyof Profile,
      "portfolioItems"
    >,

    value: string
  ) => {
    setDraft(
      (old) => ({
        ...old,

        [field]:
          value,
      })
    );
  };

  /* =========================
     CHANGE PORTFOLIO
  ========================= */

  const changePortfolioDraft =
    (
      index: number,
      value: string
    ) => {
      setDraft(
        (old) => ({
          ...old,

          portfolioItems:
            old
              .portfolioItems
              .map(
                (
                  item,
                  itemIndex
                ) =>
                  itemIndex ===
                  index
                    ? {
                        ...item,

                        value,
                      }
                    : item
              ),
        })
      );
    };

  /* =========================
     SAVE PROFILE
  ========================= */

  const saveProfile =
    async () => {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (
          !data.user
        ) {
          return;
        }

        const oldQuestionnaire =
          data.user
            .user_metadata
            ?.questionnaire ||
          {};

        const ieltsValue =
          parseExamValue(
            draft.ielts
          );

        const satValue =
          parseExamValue(
            draft.sat
          );

        const isEmptyPortfolio =
          draft
            .portfolioItems
            .length ===
            1 &&
          draft
            .portfolioItems[0]
            ?.title ===
            "Портфолио";

        const portfolio =
          isEmptyPortfolio
            ? [
                "Nothing yet",
              ]
            : draft
                .portfolioItems
                .map(
                  (
                    item
                  ) =>
                    item.title
                );

        const portfolioDescriptions =
          isEmptyPortfolio
            ? {}
            : Object.fromEntries(
                draft
                  .portfolioItems
                  .map(
                    (
                      item
                    ) => [
                      item.title,

                      item.value,
                    ]
                  )
              );

        const updatedQuestionnaire =
          {
            ...oldQuestionnaire,

            grade:
              draft.grade
                .replace(
                  /\s*класс$/i,
                  ""
                )
                .trim(),

            gpa:
              draft.gpa ===
              "Не указано"
                ? ""
                : draft.gpa,

            interests:
              splitCommaList(
                draft.interests
              ),

            countries:
              splitCommaList(
                draft.countries
              ),

            budget:
              draft.budget ===
              "Не указано"
                ? null
                : draft.budget,

            needsScholarship:
              draft
                .scholarship
                .trim()
                .toLowerCase()
                .startsWith(
                  "да"
                ),

            ielts:
              ieltsValue,

            sat:
              satValue,

            noExams:
              ieltsValue ===
                null &&
              satValue ===
                null,

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
          updateData.user
        ) {
          applyUser(
            updateData.user
          );
        } else {
          setProfile(
            draft
          );
        }

        setEditing(
          false
        );
      } catch (
        error
      ) {
        console.log(
          "PROFILE SAVE ERROR:",
          error
        );
      }
    };

  /* =========================
     RENDER
  ========================= */

  return (
    <SafeAreaView
      style={
        styles.safe
      }
    >
      <View
        style={
          styles.app
        }
      >
        {/* SIDEBAR */}

        <View
          style={[
            styles.sidebar,

            compactSidebar &&
              styles.sidebarCompact,
          ]}
        >
          {/* LOGO */}

          <View
            style={[
              styles.logoArea,

              compactSidebar &&
                styles.logoAreaCompact,
            ]}
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

            {!compactSidebar && (
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
                  admission
                  journey
                </Text>
              </View>
            )}
          </View>

          {/* NAVIGATION */}

          <View
            style={
              styles.nav
            }
          >
            <NavItem
              active={
                tab ===
                "profile"
              }
              compact={
                compactSidebar
              }
              icon="person-outline"
              activeIcon="person"
              label="My Profile"
              onPress={() =>
                setTab(
                  "profile"
                )
              }
            />

            <NavItem
              active={
                tab ===
                "universities"
              }
              compact={
                compactSidebar
              }
              icon="school-outline"
              activeIcon="school"
              label="Universities"
              onPress={() =>
                setTab(
                  "universities"
                )
              }
            />

            <NavItem
              active={
                tab ===
                "path"
              }
              compact={
                compactSidebar
              }
              icon="map-outline"
              activeIcon="map"
              label="My Path"
              onPress={() =>
                setTab(
                  "path"
                )
              }
            />

            <NavItem
              active={
                tab ===
                "preparation"
              }
              compact={
                compactSidebar
              }
              icon="book-outline"
              activeIcon="book"
              label="Preparation"
              onPress={() =>
                setTab(
                  "preparation"
                )
              }
            />
          </View>

          {/* USER */}

          <View
            style={[
              styles.sidebarUser,

              compactSidebar &&
                styles.sidebarUserCompact,
            ]}
          >
            <View
              style={[
                styles.avatar,

                compactSidebar && {
                  marginRight:
                    0,
                },
              ]}
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                {accountName
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            {!compactSidebar && (
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.sidebarUserName
                  }
                  numberOfLines={
                    1
                  }
                >
                  {
                    accountName
                  }
                </Text>

                <Text
                  style={
                    styles.sidebarUserInfo
                  }
                  numberOfLines={
                    1
                  }
                >
                  {
                    accountProvider
                  }{" "}
                  •{" "}
                  {
                    accountEmail
                  }
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* MAIN */}

        <View
          style={
            styles.main
          }
        >
          {tab ===
          "universities" ? (
            <UniversitiesPage />
          ) : tab ===
            "path" ? (
            <MyPathPage />
          ) : tab ===
            "preparation" ? (
            <PreparationPage />
          ) : (
            <ScrollView
              style={{
                flex: 1,
              }}
              contentContainerStyle={
                styles.mainContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              <ProfilePage
                profile={
                  profile
                }
                draft={
                  draft
                }
                editing={
                  editing
                }
                accountName={
                  accountName
                }
                onEdit={
                  startEditing
                }
                onCancel={
                  cancelEditing
                }
                onSave={
                  saveProfile
                }
                onChange={
                  changeDraft
                }
                onPortfolioChange={
                  changePortfolioDraft
                }
              />
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* =========================
   PROFILE PAGE
========================= */

function ProfilePage({
  profile,
  draft,
  editing,
  accountName,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onPortfolioChange,
}: {
  profile: Profile;

  draft: Profile;

  editing: boolean;

  accountName: string;

  onEdit: () => void;

  onCancel: () => void;

  onSave: () => void;

  onChange: (
    field: Exclude<
      keyof Profile,
      "portfolioItems"
    >,

    value: string
  ) => void;

  onPortfolioChange: (
    index: number,
    value: string
  ) => void;
}) {
  const data =
    editing
      ? draft
      : profile;

  /* =========================
     COMPLETENESS
  ========================= */

  const filledValues =
    [
      data.grade,

      data.gpa,

      data.interests,

      data.countries,

      data.budget,

      data.scholarship,

      data.ielts,

      data.sat,
    ];

  const completedCount =
    filledValues.filter(
      (value) =>
        value &&
        value !==
          "Не указано"
    ).length +
    (
      data
        .portfolioItems
        .length > 0
        ? 1
        : 0
    );

  const completeness =
    Math.round(
      (
        completedCount /
        9
      ) * 100
    );

  return (
    <View
      style={
        styles.page
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
            flex: 1,
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
            Здесь показаны
            ответы, которые ты
            указал в анкете.
            Они используются
            для подбора
            университетов и
            персонального
            маршрута.
          </Text>
        </View>

        {!editing ? (
          <Pressable
            onPress={
              onEdit
            }
            style={({
              pressed,
            }) => [
              styles.editButton,

              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={18}
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
              styles.editActions
            }
          >
            <Pressable
              onPress={
                onCancel
              }
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.cancelButtonText
                }
              >
                Отмена
              </Text>
            </Pressable>

            <Pressable
              onPress={
                onSave
              }
              style={({
                pressed,
              }) => [
                styles.saveButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveButtonText
                }
              >
                Сохранить
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* SUMMARY */}

      <View
        style={
          styles.summaryCard
        }
      >
        <View
          style={
            styles.bigAvatar
          }
        >
          <Text
            style={
              styles.bigAvatarText
            }
          >
            {accountName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View
          style={
            styles.summaryInfo
          }
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
              styles.studentGoal
            }
          >
            Future university
            applicant
          </Text>

          <View
            style={
              styles.summaryTags
            }
          >
            <MiniTag
              text={
                data.grade
              }
            />
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
              styles.completenessText
            }
          >
            profile complete
          </Text>
        </View>
      </View>

      {/* SYNC */}

      <View
        style={
          styles.syncNotice
        }
      >
        <View
          style={
            styles.syncIcon
          }
        >
          <Ionicons
            name="sync-outline"
            size={19}
            color={
              COLORS.emerald
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
              styles.syncTitle
            }
          >
            Профиль связан
            с твоей анкетой
          </Text>

          <Text
            style={
              styles.syncText
            }
          >
            Здесь отображаются
            сохранённые ответы
            текущего аккаунта:
            класс, GPA,
            экзамены, страны,
            бюджет и
            портфолио.
          </Text>
        </View>
      </View>

      {/* PERSONAL */}

      <SectionTitle
        icon="person-outline"
        title="Личная информация"
        description="Текущий этап обучения и интересы"
      />

      <View
        style={
          styles.infoGrid
        }
      >
        <ProfileField
          icon="school-outline"
          label="Класс"
          value={
            data.grade
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "grade",
              value
            )
          }
        />

        <ProfileField
          icon="stats-chart-outline"
          label="GPA / средняя оценка"
          value={
            data.gpa
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "gpa",
              value
            )
          }
        />

        <ProfileField
          icon="bulb-outline"
          label="Интересы"
          value={
            data.interests
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "interests",
              value
            )
          }
        />
      </View>

      {/* EXAMS */}

      <SectionTitle
        icon="document-text-outline"
        title="Экзамены"
        description="Результаты, указанные в анкете"
      />

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
          target={
            data.ielts ===
            "Ещё не сдавал"
              ? "Optional / planned"
              : "Current result"
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "ielts",
              value
            )
          }
        />

        <ExamCard
          name="SAT"
          value={
            data.sat
          }
          target={
            data.sat ===
            "Ещё не сдавал"
              ? "Optional / planned"
              : "Current result"
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "sat",
              value
            )
          }
        />
      </View>

      {/* PREFERENCES */}

      <SectionTitle
        icon="options-outline"
        title="Предпочтения"
        description="Ответы из анкеты о выборе университета"
      />

      <View
        style={
          styles.infoGrid
        }
      >
        <ProfileField
          icon="earth-outline"
          label="Страны"
          value={
            data.countries
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "countries",
              value
            )
          }
        />

        <ProfileField
          icon="wallet-outline"
          label="Бюджет"
          value={
            data.budget
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "budget",
              value
            )
          }
        />

        <ProfileField
          icon="cash-outline"
          label="Financial aid"
          value={
            data.scholarship
          }
          editing={
            editing
          }
          onChange={(
            value
          ) =>
            onChange(
              "scholarship",
              value
            )
          }
        />
      </View>

      {/* PORTFOLIO */}

      <SectionTitle
        icon="ribbon-outline"
        title="Портфолио"
        description="Все активности, выбранные в анкете"
      />

      <View
        style={
          styles.portfolioSection
        }
      >
        {data
          .portfolioItems
          .length >
        0 ? (
          data
            .portfolioItems
            .map(
              (
                item,
                index
              ) => (
                <PortfolioItem
                  key={`${item.title}-${index}`}
                  number={String(
                    index +
                      1
                  ).padStart(
                    2,
                    "0"
                  )}
                  title={
                    item.title
                  }
                  value={
                    item.value
                  }
                  editing={
                    editing
                  }
                  onChange={(
                    value
                  ) =>
                    onPortfolioChange(
                      index,
                      value
                    )
                  }
                />
              )
            )
        ) : (
          <PortfolioItem
            number="01"
            title="Portfolio"
            value="Не указано"
            editing={
              false
            }
            onChange={() => {}}
          />
        )}
      </View>

      <View
        style={{
          height: 70,
        }}
      />
    </View>
  );
}

/* =========================
   NAV ITEM
========================= */

function NavItem({
  active,
  compact,
  icon,
  activeIcon,
  label,
  onPress,
}: {
  active: boolean;

  compact: boolean;

  icon: any;

  activeIcon: any;

  label: string;

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
        styles.navItem,

        compact &&
          styles.navItemCompact,

        active &&
          styles.navItemActive,

        pressed &&
          styles.buttonPressed,
      ]}
    >
      <Ionicons
        name={
          active
            ? activeIcon
            : icon
        }
        size={21}
        color={
          active
            ? COLORS.forest
            : "#C3CEBA"
        }
      />

      {!compact && (
        <Text
          style={[
            styles.navLabel,

            active &&
              styles.navLabelActive,
          ]}
        >
          {
            label
          }
        </Text>
      )}

      {active &&
        !compact && (
          <View
            style={
              styles.activeIndicator
            }
          />
        )}
    </Pressable>
  );
}

/* =========================
   SECTION TITLE
========================= */

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
          size={18}
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

/* =========================
   PROFILE FIELD
========================= */

function ProfileField({
  icon,
  label,
  value,
  editing,
  onChange,
}: {
  icon: any;

  label: string;

  value: string;

  editing: boolean;

  onChange: (
    value: string
  ) => void;
}) {
  return (
    <View
      style={
        styles.profileField
      }
    >
      <View
        style={
          styles.profileFieldIcon
        }
      >
        <Ionicons
          name={
            icon
          }
          size={19}
          color={
            COLORS.emerald
          }
        />
      </View>

      <Text
        style={
          styles.profileFieldLabel
        }
      >
        {
          label
        }
      </Text>

      {editing ? (
        <TextInput
          value={
            value
          }
          onChangeText={
            onChange
          }
          multiline
          style={
            styles.profileFieldInput
          }
        />
      ) : (
        <Text
          style={
            styles.profileFieldValue
          }
        >
          {
            value
          }
        </Text>
      )}
    </View>
  );
}

/* =========================
   EXAM CARD
========================= */

function ExamCard({
  name,
  value,
  target,
  editing,
  onChange,
}: {
  name: string;

  value: string;

  target: string;

  editing: boolean;

  onChange: (
    value: string
  ) => void;
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
        <TextInput
          value={
            value
          }
          onChangeText={
            onChange
          }
          style={
            styles.examEditInput
          }
        />
      ) : (
        <Text
          style={
            styles.examValue
          }
        >
          {
            value
          }
        </Text>
      )}

      <Text
        style={
          styles.examTarget
        }
      >
        {
          target
        }
      </Text>
    </View>
  );
}

/* =========================
   PORTFOLIO ITEM
========================= */

function PortfolioItem({
  number,
  title,
  value,
  editing,
  onChange,
}: {
  number: string;

  title: string;

  value: string;

  editing: boolean;

  onChange: (
    value: string
  ) => void;
}) {
  return (
    <View
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
          {
            number
          }
        </Text>
      </View>

      <View
        style={
          styles.portfolioContent
        }
      >
        <Text
          style={
            styles.portfolioTitle
          }
        >
          {
            title
          }
        </Text>

        {editing ? (
          <TextInput
            value={
              value
            }
            onChangeText={
              onChange
            }
            multiline
            style={
              styles.portfolioInput
            }
          />
        ) : (
          <Text
            style={
              styles.portfolioText
            }
          >
            {
              value
            }
          </Text>
        )}
      </View>
    </View>
  );
}

/* =========================
   MINI TAG
========================= */

function MiniTag({
  text,
}: {
  text: string;
}) {
  return (
    <View
      style={
        styles.miniTag
      }
    >
      <Text
        style={
          styles.miniTagText
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

    app: {
      flex: 1,

      flexDirection:
        "row",
    },

    /* SIDEBAR */

    sidebar: {
      width: 235,

      backgroundColor:
        COLORS.forest,

      paddingHorizontal:
        15,

      paddingTop: 22,

      paddingBottom:
        18,

      borderRightWidth:
        1,

      borderRightColor:
        "#496637",
    },

    sidebarCompact: {
      width: 76,

      paddingHorizontal:
        9,
    },

    logoArea: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        7,

      marginBottom:
        44,
    },

    logoAreaCompact: {
      justifyContent:
        "center",

      paddingHorizontal:
        0,
    },

    logoMark: {
      width: 39,

      height: 39,

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

    logoLetter: {
      color:
        COLORS.forest,

      fontSize:
        19,

      fontWeight:
        "900",
    },

    logoName: {
      color:
        "#FFFFFF",

      fontSize:
        19,

      fontWeight:
        "900",
    },

    logoSub: {
      color:
        "#DDE7D3",

      fontSize:
        7,

      textTransform:
        "uppercase",

      letterSpacing:
        1,
    },

    nav: {
      gap: 7,
    },

    navItem: {
      minHeight:
        49,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        13,

      borderRadius:
        14,

      position:
        "relative",
    },

    navItemCompact: {
      paddingHorizontal:
        0,

      justifyContent:
        "center",
    },

    navItemActive: {
      backgroundColor:
        COLORS.sage,
    },

    navLabel: {
      color:
        "#E1E8DB",

      fontSize:
        13,

      fontWeight:
        "600",

      marginLeft:
        12,
    },

    navLabelActive: {
      color:
        COLORS.forest,

      fontWeight:
        "800",
    },

    activeIndicator: {
      position:
        "absolute",

      right: 11,

      width: 5,

      height: 5,

      borderRadius:
        3,

      backgroundColor:
        COLORS.emerald,
    },

    sidebarUser: {
      marginTop:
        "auto",

      paddingTop:
        18,

      borderTopWidth:
        1,

      borderTopColor:
        "#607F4A",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        7,
    },

    sidebarUserCompact: {
      justifyContent:
        "center",

      paddingHorizontal:
        0,
    },

    avatar: {
      width: 39,

      height: 39,

      borderRadius:
        13,

      backgroundColor:
        COLORS.forest2,

      borderWidth:
        1,

      borderColor:
        "#6F8F56",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        10,
    },

    avatarText: {
      color:
        "#FFFFFF",

      fontSize:
        15,

      fontWeight:
        "900",
    },

    sidebarUserName: {
      color:
        "#FFFFFF",

      fontSize:
        12,

      fontWeight:
        "800",
    },

    sidebarUserInfo: {
      color:
        "#D4E0CB",

      fontSize:
        8,

      marginTop:
        2,
    },

    /* MAIN */

    main: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },

    mainContent: {
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

    page: {
      width:
        "100%",
    },

    pageHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap: 25,

      marginBottom:
        28,
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
      width: 7,

      height: 7,

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

      lineHeight:
        41,

      fontWeight:
        "800",

      letterSpacing:
        -1,
    },

    pageDescription: {
      color:
        COLORS.muted,

      fontSize:
        13,

      lineHeight:
        20,

      maxWidth:
        570,

      marginTop:
        7,
    },

    editButton: {
      height: 46,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,

      paddingHorizontal:
        17,

      borderRadius:
        14,

      backgroundColor:
        COLORS.forest,
    },

    editButtonText: {
      color:
        "#FFFFFF",

      fontSize:
        11,

      fontWeight:
        "800",
    },

    editActions: {
      flexDirection:
        "row",

      gap: 8,
    },

    cancelButton: {
      height: 46,

      paddingHorizontal:
        16,

      borderRadius:
        14,

      backgroundColor:
        COLORS.surface,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    cancelButtonText: {
      color:
        COLORS.text,

      fontSize:
        11,

      fontWeight:
        "800",
    },

    saveButton: {
      height: 46,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 6,

      paddingHorizontal:
        16,

      borderRadius:
        14,

      backgroundColor:
        COLORS.forest,
    },

    saveButtonText: {
      color:
        "#FFFFFF",

      fontSize:
        11,

      fontWeight:
        "800",
    },

    buttonPressed: {
      opacity:
        0.72,
    },

    /* SUMMARY */

    summaryCard: {
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

      borderRadius:
        23,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      marginBottom:
        15,
    },

    bigAvatar: {
      width: 74,

      height: 74,

      borderRadius:
        22,

      backgroundColor:
        COLORS.forest,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        19,
    },

    bigAvatarText: {
      color:
        "#FFFFFF",

      fontSize:
        28,

      fontWeight:
        "900",
    },

    summaryInfo: {
      flex: 1,
    },

    studentName: {
      color:
        COLORS.text,

      fontSize:
        22,

      fontWeight:
        "800",
    },

    studentGoal: {
      color:
        COLORS.muted,

      fontSize:
        11,

      marginTop:
        3,
    },

    summaryTags: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: 6,

      marginTop:
        12,
    },

    miniTag: {
      paddingHorizontal:
        9,

      paddingVertical:
        5,

      borderRadius:
        999,

      backgroundColor:
        COLORS.sageSoft,
    },

    miniTagText: {
      color:
        COLORS.forest,

      fontSize:
        9,

      fontWeight:
        "700",
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

    completenessText: {
      color:
        COLORS.muted,

      fontSize:
        8,

      textTransform:
        "uppercase",

      letterSpacing:
        0.7,

      marginTop:
        2,
    },

    /* SYNC */

    syncNotice: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      padding:
        17,

      borderRadius:
        17,

      backgroundColor:
        COLORS.sageSoft,

      borderWidth:
        1,

      borderColor:
        "#D4E0D5",

      marginBottom:
        34,
    },

    syncIcon: {
      width: 37,

      height: 37,

      borderRadius:
        12,

      backgroundColor:
        COLORS.sage,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,
    },

    syncTitle: {
      color:
        COLORS.text,

      fontSize:
        12,

      fontWeight:
        "800",
    },

    syncText: {
      color:
        COLORS.muted,

      fontSize:
        10,

      lineHeight:
        16,

      marginTop:
        4,

      maxWidth:
        650,
    },

    /* SECTION */

    sectionHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        15,

      marginBottom:
        13,
    },

    sectionIcon: {
      width: 38,

      height: 38,

      borderRadius:
        12,

      backgroundColor:
        COLORS.sage,

      alignItems:
        "center",

      justifyContent:
        "center",

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

    infoGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: 12,

      marginBottom:
        22,
    },

    profileField: {
      flexGrow:
        1,

      flexBasis:
        260,

      minHeight:
        145,

      padding:
        18,

      borderRadius:
        18,

      backgroundColor:
        COLORS.surface,

      borderWidth:
        1,

      borderColor:
        COLORS.border,
    },

    profileFieldIcon: {
      width: 36,

      height: 36,

      borderRadius:
        11,

      backgroundColor:
        COLORS.sageSoft,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        14,
    },

    profileFieldLabel: {
      color:
        COLORS.muted,

      fontSize:
        9,

      fontWeight:
        "800",

      textTransform:
        "uppercase",

      letterSpacing:
        0.8,
    },

    profileFieldValue: {
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

    profileFieldInput: {
      minHeight:
        48,

      color:
        COLORS.text,

      fontSize:
        13,

      lineHeight:
        19,

      fontWeight:
        "600",

      marginTop:
        7,

      paddingHorizontal:
        10,

      paddingVertical:
        8,

      borderRadius:
        10,

      backgroundColor:
        COLORS.background,

      borderWidth:
        1,

      borderColor:
        COLORS.border,
    },

    /* EXAMS */

    examGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: 12,

      marginBottom:
        22,
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

      alignItems:
        "center",

      justifyContent:
        "space-between",
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
      width: 7,

      height: 7,

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

    examEditInput: {
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

    examTarget: {
      color:
        "#D4DFC9",

      fontSize:
        9,

      marginTop:
        8,
    },

    /* PORTFOLIO */

    portfolioSection: {
      backgroundColor:
        COLORS.surface,

      borderRadius:
        20,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      overflow:
        "hidden",
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
      width: 38,

      height: 38,

      borderRadius:
        12,

      backgroundColor:
        COLORS.sage,

      alignItems:
        "center",

      justifyContent:
        "center",

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

    portfolioContent: {
      flex: 1,
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

    portfolioText: {
      color:
        COLORS.text,

      fontSize:
        13,

      lineHeight:
        20,

      fontWeight:
        "600",

      marginTop:
        5,
    },

    portfolioInput: {
      minHeight:
        65,

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
        12,

      lineHeight:
        18,
    },
  });