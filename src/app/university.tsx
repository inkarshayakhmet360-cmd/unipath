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
  Image,
  SafeAreaView,
  useWindowDimensions,
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



type Status =
  | "good"
  | "medium"
  | "low";

/* =========================
   PAGE
========================= */

export default function UniversityScreen() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const mobile = width < 850;

  const params =
useLocalSearchParams<{
  id?: string;
  profile?: string;
}>();

const profile = useMemo(() => {

  try {

    const data = params.profile
      ? JSON.parse(
          params.profile as string
        )
      : {};

    console.log(
      "PROFILE FROM PARAMS:",
      params.profile
    );

    console.log(
      "PROFILE OBJECT:",
      data
    );

    return data;

  } catch(error) {

    console.log(
      "PROFILE PARSE ERROR:",
      error
    );

    return {};

  }

}, [params.profile]);

  const university =
    universities.find(
      (item) =>
        item.id === params.id
    );

  if (!university) {
    return (
      <SafeAreaView
        style={styles.safe}
      >
        <View
          style={styles.notFound}
        >
          <Text
            style={
              styles.notFoundTitle
            }
          >
            University not found
          </Text>

         <Pressable
  onPress={() => {

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }

  }}
  style={styles.backButton}
>

  <Ionicons
    name="arrow-back"
    size={19}
    color={COLORS.forest}
  />

  <Text
    style={styles.backButtonText}
  >
    Назад
  </Text>

</Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const initials =
    university.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("");

  const criteria =
  buildCriteria(
    university,
    profile
  );

  const recommendations =
    buildRecommendations(
  university,
  profile
);

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
        {/* TOPBAR */}

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

          <View style={styles.brand}>
            <View
              style={styles.brandMark}
            >
              <Text
                style={
                  styles.brandLetter
                }
              >
                U
              </Text>
            </View>

            <Text
              style={styles.brandName}
            >
              unipath
            </Text>
          </View>
        </View>

        {/* HERO IMAGE */}

        <Image
          source={{
            uri: university.image,
          }}
          style={styles.heroImage}
        />

        {/* UNIVERSITY HEADER */}

        <View
          style={[
            styles.universityHeader,

            mobile && {
              flexDirection:
                "column",
            },
          ]}
        >
          <View
            style={styles.identity}
          >
            {/* Пока это UI-logo.
                Позже можно заменить
                официальным логотипом. */}

            <View
              style={styles.uniLogo}
            >
              <Text
                style={
                  styles.uniLogoText
                }
              >
                {initials}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={
                  styles.locationRow
                }
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={
                    COLORS.muted
                  }
                />

                <Text
                  style={
                    styles.location
                  }
                >
                  {university.city},{" "}
                  {university.country}
                </Text>
              </View>

              <Text
                style={styles.title}
              >
                {university.name}
              </Text>

              <View
                style={
                  styles.majorList
                }
              >
                {university.majors.map(
                  (major) => (
                    <View
                      key={major}
                      style={
                        styles.major
                      }
                    >
                      <Text
                        style={
                          styles.majorText
                        }
                      >
                        {major}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>

          <FitCard
            fit={university.fit}
          />
        </View>

        {/* SHORT DESCRIPTION */}

        <SectionHeader
          icon="school-outline"
          title="Об университете"
          subtitle="Краткая информация"
        />

        <View
          style={styles.descriptionCard}
        >
          <Text
            style={
              styles.descriptionText
            }
          >
            {university.description}
          </Text>

          <View
            style={styles.quickFacts}
          >
            <QuickFact
              icon="location-outline"
              label="Location"
              value={`${university.city}, ${university.country}`}
            />

            <QuickFact
              icon="wallet-outline"
              label="Tuition"
              value={
                university.tuition
              }
            />

            <QuickFact
              icon="language-outline"
              label="Language"
              value="English"
            />

            <QuickFact
              icon="cash-outline"
              label="Scholarship"
              value={
                university.scholarship
                  ? "Available"
                  : "Limited"
              }
            />
          </View>
        </View>

        {/* ADMISSION CRITERIA */}

        <SectionHeader
          icon="document-text-outline"
          title="Admission criteria"
          subtitle="Требования и твой текущий профиль"
        />

        <View
          style={
            styles.criteriaList
          }
        >
          {criteria.map(
            (criterion) => (
              <CriteriaRow
                key={criterion.name}
                {...criterion}
              />
            )
          )}
        </View>

        <Text
          style={styles.demoNotice}
        >
          Сейчас используются
          демонстрационные требования.
          Позже рядом с каждым
          фактическим требованием будет
          источник.
        </Text>

        {/* PERSONAL ANALYSIS */}

        <SectionHeader
          icon="sparkles-outline"
          title="Персональный анализ"
          subtitle="Как твой профиль выглядит относительно этого университета"
        />

        <View
          style={[
            styles.analysisGrid,

            mobile && {
              flexDirection:
                "column",
            },
          ]}
        >
          <View
            style={
              styles.analysisCard
            }
          >
            <View
              style={
                styles.analysisCardTop
              }
            >
              <View
                style={[
                  styles.analysisIcon,
                  styles.goodIcon,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={19}
                  color={
                    COLORS.goodText
                  }
                />
              </View>

              <Text
                style={
                  styles.analysisTitle
                }
              >
                Уже сильная сторона
              </Text>
            </View>

            {generateStrengths(
 university,
 profile
).map(
(item)=>(
<AnalysisItem
 key={item}
 text={item}
 status="good"
/>
)
)}
          </View>

          <View
            style={
              styles.analysisCard
            }
          >
            <View
              style={
                styles.analysisCardTop
              }
            >
              <View
                style={[
                  styles.analysisIcon,
                  styles.mediumIcon,
                ]}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={19}
                  color={
                    COLORS.mediumText
                  }
                />
              </View>

              <Text
                style={
                  styles.analysisTitle
                }
              >
                Что нужно усилить
              </Text>
            </View>

            {generateGaps(
 university,
 profile
).map(
(item)=>(
<AnalysisItem
key={item}
text={item}
status="medium"
/>
)
)}
          </View>
        </View>

        {/* RECOMMENDATIONS */}

        <SectionHeader
          icon="navigate-outline"
          title="Как усилить заявку"
          subtitle="Персональные рекомендации для этого университета"
        />

        <View
          style={styles.recommendations}
        >
          {recommendations.map(
            (
              recommendation,
              index
            ) => (
              <RecommendationCard
                key={
                  recommendation.title
                }
                number={index + 1}
                {...recommendation}
              />
            )
          )}
        </View>

        {/* NEXT ACTION */}

        <View style={styles.nextAction}>
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

          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.nextActionLabel
              }
            >
              RECOMMENDED NEXT STEP
            </Text>

            <Text
              style={
                styles.nextActionTitle
              }
            >
              {
                university
                  .nextSteps[0]
              }
            </Text>

            <Text
              style={
                styles.nextActionText
              }
            >
              Этот шаг может быть
              добавлен в My Path позже,
              когда мы подключим общую
              логику приложения.
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />
        </View>

        <View
          style={{ height: 70 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   DATA BUILDERS
========================= */

function buildCriteria(
  university: University,
  profile:any
) {
  const ieltsMatch =
    university.requirements.ielts.match(
      /[\d.]+/
    );

  const requiredIelts =
    ieltsMatch
      ? Number(ieltsMatch[0])
      : 0;

  const ieltsStatus: Status =
    Number(profile?.ielts ?? 0) >= requiredIelts
      ? "good"
      :profile.ielts >=
        requiredIelts - 0.5
      ? "medium"
      : "low";

  const requiredSat =
Number(
 university.requirements.sat.match(/\d+/)?.[0]
 ||0
);


const satStatus:Status =
profile.sat >= requiredSat
?
"good"
:
profile.sat >= requiredSat - 100
?
"medium"
:
"low";

  const budgetStatus: Status =
    university.fitsBudget
      ? "good"
      : "low";

  return [
    {
      name: "IELTS",
      required:
        university.requirements
          .ielts,
      candidate: `${profile.ielts}`,
      status: ieltsStatus,
    },

    {
      name: "SAT",
      required:
        university.requirements.sat,
      candidate:
        profile.sat === null
          ? "Not taken"
          : `${profile.sat}`,
      status: satStatus,
    },

   {
  name: "Academic record",

  required:
    university.requirements.gpa,

  candidate:
    profile.gpa
      ? `${profile.gpa}`
      : "Not provided",

  status:
    getGpaStatus(
      university,
      profile
    ),
},

    {
      name: "Budget",
      required:
        university.tuition,
      candidate:
        profile.budget,
      status: budgetStatus,
    },
  ];
}

function getGpaStatus(
  university: University,
  profile:any
): Status {

  const required =
    Number(
      university.requirements.gpa.match(/\d+\.?\d*/)?.[0]
      ||0
    );


  if(profile.gpa >= required){
    return "good";
  }


  if(profile.gpa >= required - 0.3){
    return "medium";
  }


  return "low";
}

function buildRecommendations(
  university: University,
  profile:any
) {
  const recommendations = [
    {
      icon:
        "flask-outline" as any,

      category: "RESEARCH",

      title:
        "Добавить research experience",

      text:
        "Найди исследовательский проект по Computer Science, Engineering или смежному STEM-направлению. Лучше, если будет конкретный результат: статья, prototype, poster или конкурс.",

      impact: "High impact",
    },

    {
      icon:
        "trophy-outline" as any,

      category: "COMPETITIONS",

      title:
        "Усилить профиль олимпиадами",

      text:
        "Участие в профильных олимпиадах и научных конкурсах поможет подтвердить академический интерес и сильные предметные навыки.",

      impact: "Medium–high",
    },
  ];

  if (
    !university.noSat
  ) {
    recommendations.push({
      icon:
        "document-text-outline" as any,

      category: "EXAMS",

      title:
        "Подготовиться к SAT",

      text:
        "Начни с diagnostic test, определи слабые темы и добавь подготовку в персональный roadmap.",

      impact: "Important",
    });
  }

  if (
    university.requirements.ielts
      .includes("7")
  ) {
    recommendations.push({
      icon:
        "language-outline" as any,

      category: "ENGLISH",

      title:
        "Повысить IELTS",

      text:
        "Текущий результат близок к требованиям, поэтому имеет смысл сфокусироваться на слабейших секциях и пересдать экзамен.",

      impact: "Important",
    });
  }

  if (
    !university.fitsBudget
  ) {
    recommendations.push({
      icon:
        "cash-outline" as any,

      category: "FINANCE",

      title:
        "Построить scholarship strategy",

      text:
        "Изучи merit-based scholarships, financial aid и внешние гранты до формирования финального списка университетов.",

      impact: "Critical",
    });
  }

  return recommendations;
}
function generateStrengths(
 university:any,
 profile:any
){

const result=[];


if(
Number(profile?.ielts)>=
Number(
university.requirements.ielts.match(/[\d.]+/)?.[0] || 0
)
){
result.push(
`IELTS соответствует требованиям университета`
);
}


if(profile?.gpa){
result.push(
`Академический профиль: GPA ${profile.gpa}`
);
}


if(profile?.major){
result.push(
`Направление совпадает с ${profile.major}`
);
}


if(result.length===0){
result.push(
"Профиль требует дополнительного анализа"
);
}


return result;

}



function generateGaps(
 university:any,
 profile:any
){

const result=[];


const required =
Number(
university.requirements.ielts.match(/[\d.]+/)?.[0] || 0
);


if(
Number(profile?.ielts ?? 0)
<
required
){

result.push(
`IELTS нужно повысить с ${profile?.ielts ?? 0} до ${required}`
);

}


if(
!profile?.sat &&
!university.noSat
){

result.push(
"SAT отсутствует, рекомендуется подготовка"
);

}


if(
profile?.budget <
university.tuition
){

result.push(
"Необходимо изучить варианты scholarship"
);

}


if(result.length===0){

result.push(
"Критических пробелов не найдено"
);

}


return result;

}

/* =========================
   COMPONENTS
========================= */

function FitCard({
  fit,
}: {
  fit: University["fit"];
}) {
  const status =
    fit === "Strong match"
      ? "good"
      : fit === "Competitive"
      ? "medium"
      : "low";

  const background =
    status === "good"
      ? COLORS.goodBackground
      : status === "medium"
      ? COLORS.mediumBackground
      : COLORS.lowBackground;

  const color =
    status === "good"
      ? COLORS.goodText
      : status === "medium"
      ? COLORS.mediumText
      : COLORS.lowText;

  return (
    <View
      style={[
        styles.fitCard,
        {
          backgroundColor:
            background,
        },
      ]}
    >
      <Text
        style={styles.fitLabel}
      >
        YOUR PROFILE FIT
      </Text>

      <View
        style={
          styles.fitValueRow
        }
      >
        <View
          style={[
            styles.fitDot,
            {
              backgroundColor:
                color,
            },
          ]}
        />

        <Text
          style={[
            styles.fitValue,
            {
              color,
            },
          ]}
        >
          {fit}
        </Text>
      </View>

      <Text
        style={styles.fitText}
      >
        Оценка основана на текущем
        профиле и demo requirements.
      </Text>

      <Text
        style={
          styles.fitDisclaimer
        }
      >
        Не является вероятностью или
        гарантией поступления.
      </Text>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
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
          name={icon}
          size={18}
          color={COLORS.emerald}
        />
      </View>

      <View>
        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.quickFact}
    >
      <Ionicons
        name={icon}
        size={17}
        color={COLORS.emerald}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={
            styles.quickFactLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.quickFactValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function CriteriaRow({
  name,
  required,
  candidate,
  status,
}: {
  name: string;
  required: string;
  candidate: string;
  status: Status;
}) {
  const background =
    status === "good"
      ? COLORS.goodBackground
      : status === "medium"
      ? COLORS.mediumBackground
      : COLORS.lowBackground;

  const color =
    status === "good"
      ? COLORS.goodText
      : status === "medium"
      ? COLORS.mediumText
      : COLORS.lowText;

  return (
    <View
      style={styles.criteriaRow}
    >
      <View
        style={
          styles.criteriaNameArea
        }
      >
        <Text
          style={
            styles.criteriaName
          }
        >
          {name}
        </Text>
      </View>

      <View
        style={
          styles.criteriaColumn
        }
      >
        <Text
          style={
            styles.criteriaLabel
          }
        >
          UNIVERSITY
        </Text>

        <Text
          style={
            styles.criteriaValue
          }
        >
          {required}
        </Text>
      </View>

      <View
        style={
          styles.criteriaColumn
        }
      >
        <Text
          style={
            styles.criteriaLabel
          }
        >
          YOU
        </Text>

        <Text
          style={
            styles.criteriaValue
          }
        >
          {candidate}
        </Text>
      </View>

      <View
        style={[
          styles.criteriaStatus,
          {
            backgroundColor:
              background,
          },
        ]}
      >
        <Ionicons
          name={
            status === "good"
              ? "checkmark-circle"
              : status ===
                "medium"
              ? "alert-circle"
              : "close-circle"
          }
          size={16}
          color={color}
        />

        <Text
          style={[
            styles.criteriaStatusText,
            {
              color,
            },
          ]}
        >
          {status === "good"
            ? "MATCH"
            : status === "medium"
            ? "IMPROVE"
            : "GAP"}
        </Text>
      </View>
    </View>
  );
}

function AnalysisItem({
  text,
  status,
}: {
  text: string;
  status: Status;
}) {
  const color =
    status === "good"
      ? COLORS.goodText
      : COLORS.mediumText;

  return (
    <View
      style={styles.analysisItem}
    >
      <View
        style={[
          styles.analysisBullet,
          {
            backgroundColor:
              color,
          },
        ]}
      />

      <Text
        style={styles.analysisText}
      >
        {text}
      </Text>
    </View>
  );
}

function RecommendationCard({
  number,
  icon,
  category,
  title,
  text,
  impact,
}: {
  number: number;
  icon: any;
  category: string;
  title: string;
  text: string;
  impact: string;
}) {
  return (
    <View
      style={
        styles.recommendationCard
      }
    >
      <View
        style={
          styles.recommendationTop
        }
      >
        <View
          style={
            styles.recommendationNumber
          }
        >
          <Text
            style={
              styles.recommendationNumberText
            }
          >
            {number}
          </Text>
        </View>

        <View
          style={
            styles.recommendationIcon
          }
        >
          <Ionicons
            name={icon}
            size={18}
            color={COLORS.emerald}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={
              styles.recommendationCategory
            }
          >
            {category}
          </Text>

          <Text
            style={
              styles.recommendationTitle
            }
          >
            {title}
          </Text>
        </View>

        <View
          style={
            styles.impactBadge
          }
        >
          <Text
            style={
              styles.impactText
            }
          >
            {impact}
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.recommendationText
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
  safe: {
    flex: 1,

    backgroundColor:
      COLORS.background,
  },

  page: {
    width: "100%",
    maxWidth: 1100,

    alignSelf: "center",

    paddingHorizontal: 25,
    paddingTop: 20,
  },

  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    marginBottom: 22,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 12,
    paddingVertical: 9,

    borderRadius: 12,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  backButtonText: {
    color: COLORS.forest,

    fontSize: 10,
    fontWeight: "800",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandMark: {
    width: 35,
    height: 35,

    borderRadius: 11,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  brandLetter: {
    color: "#FFFFFF",

    fontWeight: "900",
  },

  brandName: {
    color: COLORS.forest,

    fontSize: 17,
    fontWeight: "900",
  },

  heroImage: {
    width: "100%",
    height: 280,

    borderRadius: 24,

    backgroundColor:
      COLORS.sage,
  },

  universityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent:
      "space-between",

    gap: 25,

    marginTop: 22,
    marginBottom: 38,
  },

  identity: {
    flexDirection: "row",

    flex: 1,

    gap: 15,
  },

  uniLogo: {
    width: 72,
    height: 72,

    borderRadius: 20,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",
  },

  uniLogoText: {
    color: "#FFFFFF",

    fontSize: 20,
    fontWeight: "900",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 4,
  },

  location: {
    color: COLORS.muted,

    fontSize: 10,
  },

  title: {
    color: COLORS.text,

    fontSize: 32,
    fontWeight: "800",

    letterSpacing: -0.8,

    marginTop: 5,
  },

  majorList: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 6,

    marginTop: 11,
  },

  major: {
    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 8,

    backgroundColor:
      COLORS.sageSoft,
  },

  majorText: {
    color: COLORS.forest,

    fontSize: 8,
    fontWeight: "700",
  },

  fitCard: {
    width: 240,

    padding: 17,

    borderRadius: 18,
  },

  fitLabel: {
    color: COLORS.muted,

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  fitValueRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 9,
  },

  fitDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    marginRight: 7,
  },

  fitValue: {
    fontSize: 17,
    fontWeight: "900",
  },

  fitText: {
    color: COLORS.muted,

    fontSize: 9,
    lineHeight: 14,

    marginTop: 8,
  },

  fitDisclaimer: {
    color: COLORS.muted,

    fontSize: 7,

    marginTop: 6,

    fontStyle: "italic",
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 14,
    marginBottom: 13,
  },

  sectionIcon: {
    width: 39,
    height: 39,

    borderRadius: 12,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  sectionTitle: {
    color: COLORS.text,

    fontSize: 16,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.muted,

    fontSize: 9,

    marginTop: 2,
  },

  /* DESCRIPTION */

  descriptionCard: {
    padding: 20,

    backgroundColor:
      COLORS.surface,

    borderRadius: 19,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    marginBottom: 30,
  },

  descriptionText: {
    color: COLORS.muted,

    fontSize: 12,
    lineHeight: 20,
  },

  quickFacts: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 9,

    marginTop: 20,
  },

  quickFact: {
    flexGrow: 1,
    flexBasis: 190,

    flexDirection: "row",
    alignItems: "center",

    gap: 9,

    padding: 12,

    borderRadius: 14,

    backgroundColor:
      COLORS.sageSoft,
  },

  quickFactLabel: {
    color: COLORS.muted,

    fontSize: 7,
    fontWeight: "900",

    textTransform:
      "uppercase",
  },

  quickFactValue: {
    color: COLORS.text,

    fontSize: 10,
    fontWeight: "800",

    marginTop: 2,
  },

  /* CRITERIA */

  criteriaList: {
    overflow: "hidden",

    borderRadius: 19,

    borderWidth: 1,
    borderColor:
      COLORS.border,

    backgroundColor:
      COLORS.surface,
  },

  criteriaRow: {
    minHeight: 82,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  criteriaNameArea: {
    width: 150,
  },

  criteriaName: {
    color: COLORS.text,

    fontSize: 11,
    fontWeight: "800",
  },

  criteriaColumn: {
    flex: 1,

    paddingHorizontal: 12,
  },

  criteriaLabel: {
    color: COLORS.muted,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.6,
  },

  criteriaValue: {
    color: COLORS.text,

    fontSize: 10,
    lineHeight: 14,

    fontWeight: "700",

    marginTop: 4,
  },

  criteriaStatus: {
    width: 90,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,

    paddingVertical: 9,

    borderRadius: 11,
  },

  criteriaStatusText: {
    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.5,
  },

  demoNotice: {
    color: COLORS.muted,

    fontSize: 8,

    marginTop: 9,
    marginBottom: 30,

    fontStyle: "italic",
  },

  /* ANALYSIS */

  analysisGrid: {
    flexDirection: "row",

    gap: 12,

    marginBottom: 30,
  },

  analysisCard: {
    flex: 1,

    padding: 18,

    borderRadius: 18,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  analysisCardTop: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 13,
  },

  analysisIcon: {
    width: 36,
    height: 36,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  goodIcon: {
    backgroundColor:
      COLORS.goodBackground,
  },

  mediumIcon: {
    backgroundColor:
      COLORS.mediumBackground,
  },

  analysisTitle: {
    color: COLORS.text,

    fontSize: 12,
    fontWeight: "800",
  },

  analysisItem: {
    flexDirection: "row",

    marginTop: 9,
  },

  analysisBullet: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginTop: 5,
    marginRight: 8,
  },

  analysisText: {
    flex: 1,

    color: COLORS.muted,

    fontSize: 10,
    lineHeight: 16,
  },

  /* RECOMMENDATIONS */

  recommendations: {
    gap: 11,

    marginBottom: 30,
  },

  recommendationCard: {
    padding: 18,

    borderRadius: 18,

    backgroundColor:
      COLORS.surface,

    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  recommendationTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  recommendationNumber: {
    width: 30,
    height: 30,

    borderRadius: 9,

    backgroundColor:
      COLORS.forest,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  recommendationNumberText: {
    color: "#FFFFFF",

    fontSize: 9,
    fontWeight: "900",
  },

  recommendationIcon: {
    width: 35,
    height: 35,

    borderRadius: 11,

    backgroundColor:
      COLORS.sage,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  recommendationCategory: {
    color: COLORS.emerald,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  recommendationTitle: {
    color: COLORS.text,

    fontSize: 12,
    fontWeight: "800",

    marginTop: 2,
  },

  impactBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 999,

    backgroundColor:
      COLORS.sageSoft,
  },

  impactText: {
    color: COLORS.forest,

    fontSize: 7,
    fontWeight: "800",
  },

  recommendationText: {
    color: COLORS.muted,

    fontSize: 10,
    lineHeight: 16,

    marginTop: 12,

    paddingLeft: 84,
  },

  /* NEXT */

  nextAction: {
    flexDirection: "row",
    alignItems: "center",

    gap: 13,

    padding: 19,

    borderRadius: 20,

    backgroundColor:
      COLORS.forest,
  },

  nextActionIcon: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor:
      COLORS.forest2,

    alignItems: "center",
    justifyContent: "center",
  },

  nextActionLabel: {
    color: COLORS.accent,

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  nextActionTitle: {
    color: "#FFFFFF",

    fontSize: 13,
    fontWeight: "800",

    marginTop: 3,
  },

  nextActionText: {
    color: "#DDE7D5",

    fontSize: 8,
    lineHeight: 13,

    marginTop: 4,
  },

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  notFoundTitle: {
    color: COLORS.text,

    fontSize: 20,
    fontWeight: "800",
  },

  backLink: {
    color: COLORS.emerald,

    marginTop: 15,

    fontWeight: "800",
  },
});