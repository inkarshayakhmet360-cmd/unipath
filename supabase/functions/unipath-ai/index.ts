import { createClient } from "npm:@supabase/supabase-js@2";

/* =========================================================
   CORS
========================================================= */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

/* =========================================================
   TYPES
========================================================= */

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  message?: string;
  aiMode?: string;

  currentPage?:
    | "profile"
    | "universities"
    | "compare"
    | "opportunities"
    | "path"
    | "preparation"
    | string;
  
  universityContext?: unknown;
  comparisonContext?: unknown;
  opportunityContext?: unknown;
  roadmapContext?: unknown;
  preparationContext?: unknown;

  conversation?: ChatMessage[];
};

type UserProfile = {
  name: string;

  grade: string | null;
 
  gpa: number | null;
  gpaScale: number | null;

  schoolCountry: string | null;
  citizenshipCountry: string | null;

  interests: string[];

  targetCountries: string[];

  ielts: number | null;
  sat: number | null;
  noExams: boolean;

  budget: string | null;
  needsScholarship: boolean;

  portfolio: string[];

  portfolioDescriptions:
    Record<string, string>;
};

/* =========================================================
   SUPABASE KEY
========================================================= */

function getSupabaseKey() {
  const anonKey =
    Deno.env.get(
      "SUPABASE_ANON_KEY"
    );

  if (anonKey) {
    return anonKey;
  }

  const publishableKeys =
    Deno.env.get(
      "SUPABASE_PUBLISHABLE_KEYS"
    );

  if (publishableKeys) {
    try {
      const parsed =
        JSON.parse(
          publishableKeys
        );

      if (
        parsed?.default
      ) {
        return parsed.default;
      }
    } catch {
      // continue
    }
  }

  throw new Error(
    "Supabase client key is missing."
  );
}

/* =========================================================
   HELPERS
========================================================= */

function cleanCountry(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const cleaned =
    String(value)
      .replace(
        /^[\p{Regional_Indicator}\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u,
        ""
      )
      .trim();

  return cleaned ||
    null;
}

function stringArray(
  value: unknown
): string[] {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .map(
      (item) =>
        String(item)
          .trim()
    )
    .filter(
      Boolean
    );
}

function countryArray(
  value: unknown
): string[] {
  return stringArray(
    value
  )
    .map(
      cleanCountry
    )
    .filter(
      (
        value
      ): value is string =>
        Boolean(value)
    );
}

function numberOrNull(
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}

/* =========================================================
   CLEAN AI OUTPUT
========================================================= */

function cleanAIText(
  raw: string
) {
  return raw

    .replace(
      /\*\*/g,
      ""
    )

    .replace(
      /__/g,
      ""
    )

    .replace(
      /^#{1,6}\s*/gm,
      ""
    )

    .replace(
      /^\s*---+\s*$/gm,
      ""
    )

    .replace(
      /```/g,
      ""
    )

    .replace(
      /`([^`]+)`/g,
      "$1"
    )

    .replace(
      /^\s*[-*]\s+/gm,
      "• "
    )

    .replace(
      /\n{3,}/g,
      "\n\n"
    )

    .trim();
}

/* =========================================================
   SHOULD USE LIVE WEB RESEARCH
========================================================= */

function shouldUseWebResearch(
  message: string,
  currentPage: string
) {
  const page =
    currentPage.toLowerCase();

  /*
    На этих страницах актуальные внешние
    данные особенно важны.
  */

  if (
    page === "universities" ||
    page === "compare" ||
    page === "opportunities"
  ) {
    return true;
  }

  const text =
    message.toLowerCase();

  const researchKeywords = [
    /* Scholarships */
    "scholarship",
    "scholarships",
    "стипенд",
    "грант",
    "grant",
    "financial aid",
    "финансовая помощь",

    /* Universities */
    "university",
    "universities",
    "университет",
    "универ",
    "college",
    "колледж",

    /* Requirements */
    "requirement",
    "requirements",
    "требован",
    "ielts requirement",
    "sat requirement",
    "toefl requirement",

    /* Deadlines */
    "deadline",
    "deadlines",
    "дедлайн",
    "срок подачи",

    /* Costs */
    "tuition",
    "стоимость",
    "обучение стоит",
    "cost of attendance",

    /* Research */
    "research opportunity",
    "research opportunities",
    "research program",
    "исследовательская программа",
    "исследование",
    "research internship",

    /* Activities */
    "summer program",
    "summer school",
    "internship",
    "стажиров",
    "hackathon",
    "хакатон",
    "competition",
    "конкурс",
    "olympiad",
    "олимпиад",

    /* Explicit search intent */
    "найди",
    "найти",
    "поищи",
    "search",
    "find",
    "актуальн",
    "current",
    "latest",
  ];

  return researchKeywords.some(
    (keyword) =>
      text.includes(
        keyword
      )
  );
}

/* =========================================================
   PROFILE SIGNALS
========================================================= */

function buildProfileSignals(
  profile: UserProfile
) {
  const validGrades = [
    "8",
    "9",
    "10",
    "11",
    "12",
    "Выпускник",
  ];

  const gradeValid =
    profile.grade !==
      null &&
    validGrades.includes(
      profile.grade
    );

  const gpaValid =
    profile.gpa !==
      null &&
    profile.gpaScale !==
      null &&
    profile.gpaScale >
      0 &&
    profile.gpa >=
      0 &&
    profile.gpa <=
      profile.gpaScale;

  const ieltsValid =
    profile.ielts ===
      null ||
    (
      profile.ielts >=
        0 &&
      profile.ielts <=
        9 &&
      Number.isInteger(
        profile.ielts *
          2
      )
    );

  const satValid =
    profile.sat ===
      null ||
    (
      profile.sat >=
        400 &&
      profile.sat <=
        1600 &&
      profile.sat %
        10 ===
        0
    );

  const describedActivities =
    profile.portfolio.filter(
      (activity) => {
        const description =
          profile
            .portfolioDescriptions[
            activity
          ];

        return (
          typeof description ===
            "string" &&
          description
            .trim()
            .length >=
            30
        );
      }
    );

  const portfolioWithoutEmpty =
    profile.portfolio.filter(
      (item) =>
        item !==
        "Nothing yet"
    );

  const blockers:
    string[] = [];

  if (
    !profile.grade
  ) {
    blockers.push(
      "Grade is missing."
    );
  } else if (
    !gradeValid
  ) {
    blockers.push(
      "Grade value is invalid."
    );
  }

  if (
    profile.gpa ===
    null
  ) {
    blockers.push(
      "GPA value is missing."
    );
  }

  if (
    profile.gpaScale ===
    null
  ) {
    blockers.push(
      "GPA scale is missing."
    );
  }

  if (
    profile.gpa !==
      null &&
    profile.gpaScale !==
      null &&
    !gpaValid
  ) {
    blockers.push(
      "GPA and GPA scale are inconsistent."
    );
  }

  if (
    !profile.schoolCountry
  ) {
    blockers.push(
      "Country of study is missing."
    );
  }

  if (
    !profile.citizenshipCountry
  ) {
    blockers.push(
      "Citizenship is missing."
    );
  }

  if (
    profile.interests
      .length === 0
  ) {
    blockers.push(
      "Academic interests are missing."
    );
  }

  if (
    profile.targetCountries
      .length === 0
  ) {
    blockers.push(
      "Target study countries are missing."
    );
  }

  if (
    !profile.budget
  ) {
    blockers.push(
      "Budget is missing."
    );
  }

  if (
    !ieltsValid
  ) {
    blockers.push(
      "IELTS value appears invalid."
    );
  }

  if (
    !satValid
  ) {
    blockers.push(
      "SAT value appears invalid."
    );
  }

  if (
    portfolioWithoutEmpty
      .length >
      0 &&
    describedActivities
      .length ===
      0
  ) {
    blockers.push(
      "Portfolio activities are listed but not described in enough detail."
    );
  }

  return {
    dataQuality: {
      gradePresent:
        Boolean(
          profile.grade
        ),

      gradeValid,

      gpaPresent:
        profile.gpa !==
        null,

      gpaScalePresent:
        profile.gpaScale !==
        null,

      gpaValid,

      schoolCountryPresent:
        Boolean(
          profile.schoolCountry
        ),

      citizenshipPresent:
        Boolean(
          profile.citizenshipCountry
        ),

      targetCountriesPresent:
        profile
          .targetCountries
          .length >
        0,

      interestsPresent:
        profile.interests
          .length >
        0,

      budgetPresent:
        Boolean(
          profile.budget
        ),
    },

    academicSignals: {
      grade:
        profile.grade,

      gpa:
        profile.gpa,

      gpaScale:
        profile.gpaScale,

      gpaDisplay:
        profile.gpa !==
          null &&
        profile.gpaScale !==
          null
          ? `${profile.gpa} / ${profile.gpaScale}`
          : null,

      examsMarkedAsNotTaken:
        profile.noExams,

      ieltsAvailable:
        profile.ielts !==
        null,

      ieltsValid,

      satAvailable:
        profile.sat !==
        null,

      satValid,
    },

    geographicSignals: {
      countryOfStudy:
        profile.schoolCountry,

      citizenship:
        profile.citizenshipCountry,

      targetStudyCountries:
        profile.targetCountries,

      geographicContextComplete:
        Boolean(
          profile.schoolCountry &&
          profile
            .citizenshipCountry &&
          profile
            .targetCountries
            .length >
            0
        ),
    },

    financialSignals: {
      annualBudget:
        profile.budget,

      financialAidImportant:
        profile.needsScholarship,
    },

    portfolioSignals: {
      listedActivities:
        portfolioWithoutEmpty,

      listedActivitiesCount:
        portfolioWithoutEmpty
          .length,

      describedActivities,

      describedActivitiesCount:
        describedActivities
          .length,

      descriptionsMissingFor:
        portfolioWithoutEmpty.filter(
          (activity) =>
            !describedActivities.includes(
              activity
            )
        ),
    },

    planningSignals: {
      academicInterests:
        profile.interests,

      destinationPreferences:
        profile.targetCountries,
    },

    blockers,
  };
}

/* =========================================================
   MAIN
========================================================= */

Deno.serve(
  async (
    req
  ) => {
    /* =====================================================
       CORS PREFLIGHT
    ===================================================== */

    if (
      req.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        }
      );
    }

    if (
      req.method !==
      "POST"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Method not allowed.",
        }),
        {
          status: 405,

          headers: {
            ...corsHeaders,

            "Content-Type":
              "application/json",
          },
        }
      );
    }

    try {
      /* ===================================================
         ENV
      =================================================== */

      const GROQ_API_KEY =
        Deno.env.get(
          "GROQ_API_KEY"
        );

      const SUPABASE_URL =
        Deno.env.get(
          "SUPABASE_URL"
        );

      if (
        !GROQ_API_KEY
      ) {
        throw new Error(
          "GROQ_API_KEY is not configured."
        );
      }

      if (
        !SUPABASE_URL
      ) {
        throw new Error(
          "SUPABASE_URL is missing."
        );
      }

      const SUPABASE_KEY =
        getSupabaseKey();

      /* ===================================================
         AUTH
      =================================================== */

      const authorization =
        req.headers.get(
          "Authorization"
        );

      if (
        !authorization
      ) {
        return new Response(
          JSON.stringify({
            error:
              "User is not authenticated.",
          }),
          {
            status:
              401,

            headers: {
              ...corsHeaders,

              "Content-Type":
                "application/json",
            },
          }
        );
      }

      const supabase =
        createClient(
          SUPABASE_URL,
          SUPABASE_KEY,
          {
            auth: {
              persistSession:
                false,

              autoRefreshToken:
                false,
            },

            global: {
              headers: {
                Authorization:
                  authorization,
              },
            },
          }
        );

      /* ===================================================
         CURRENT USER
      =================================================== */

      const {
        data:
          userData,

        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !userData.user
      ) {
        console.error(
          "USER ERROR:",
          userError
        );

        return new Response(
          JSON.stringify({
            error:
              "Could not identify current user.",
          }),
          {
            status:
              401,

            headers: {
              ...corsHeaders,

              "Content-Type":
                "application/json",
            },
          }
        );
      }

      const user =
        userData.user;

      /* ===================================================
         QUESTIONNAIRE
      =================================================== */

      const q =
        user.user_metadata
          ?.questionnaire ??
        {};

      const userName =
        user.user_metadata
          ?.full_name ||
        user.user_metadata
          ?.name ||
        user.email
          ?.split(
            "@"
          )[0] ||
        "Student";

      /* ===================================================
         TARGET COUNTRIES
      =================================================== */

      let targetCountries =
        countryArray(
          q.targetCountries
        );

      /*
        Legacy support:
        старая анкета сохраняла
        target countries в countries.
      */

      if (
        targetCountries
          .length ===
        0
      ) {
        targetCountries =
          countryArray(
            q.countries
          );
      }

      /* ===================================================
         USER PROFILE
      =================================================== */

      const userProfile:
        UserProfile = {
        name:
          userName,

        grade:
          q.grade
            ? String(
                q.grade
              ).trim()
            : null,

        gpa:
          numberOrNull(
            q.gpa
          ),

        gpaScale:
          numberOrNull(
            q.gpaScale
          ),

        schoolCountry:
          cleanCountry(
            q.schoolCountry
          ),

        citizenshipCountry:
          cleanCountry(
            q.citizenshipCountry
          ),

        interests:
          stringArray(
            q.interests
          ),

        targetCountries,

        ielts:
          numberOrNull(
            q.ielts
          ),

        sat:
          numberOrNull(
            q.sat
          ),

        noExams:
          q.noExams ===
          true,

        budget:
          q.budget
            ? String(
                q.budget
              )
            : null,

        needsScholarship:
          q.needsScholarship ===
          true,

        portfolio:
          stringArray(
            q.portfolio
          ),

        portfolioDescriptions:
          q.portfolioDescriptions &&
          typeof q.portfolioDescriptions ===
            "object"
            ? q.portfolioDescriptions
            : {},
      };

      /* ===================================================
         DERIVED SIGNALS
      =================================================== */

      const profileSignals =
        buildProfileSignals(
          userProfile
        );

      /* ===================================================
         REQUEST
      =================================================== */

      const body =
        (
          await req.json()
        ) as RequestBody;

      const message =
        body.message?.trim();

      if (
        !message
      ) {
        return new Response(
          JSON.stringify({
            error:
              "Message is required.",
          }),
          {
            status:
              400,

            headers: {
              ...corsHeaders,

              "Content-Type":
                "application/json",
            },
          }
        );
      }

      const currentPage =
        body.currentPage ||
        "profile";

        const aiMode =
          body.aiMode ||
          "profile_analysis";
        /* ===================================================
   LIVE RESEARCH DECISION
=================================================== */

const webResearchEnabled =
  shouldUseWebResearch(
    message,
    currentPage
  );
      /* ===================================================
         APPLICATION CONTEXT
      =================================================== */

      const appContext =
        {
          currentPage,

          university:
            body.universityContext ??
            null,

          comparison:
            body.comparisonContext ??
            null,

          opportunity:
            body.opportunityContext ??
            null,

          roadmap:
            body.roadmapContext ??
            null,

          preparation:
            body.preparationContext ??
            null,
        };

      /* ===================================================
         HISTORY
      =================================================== */

      const previousConversation:
        ChatMessage[] =
        Array.isArray(
          body.conversation
        )
          ? body.conversation
              .slice(
                -12
              )
              .filter(
                (
                  item
                ) =>
                  item &&
                  (
                    item.role ===
                      "user" ||
                    item.role ===
                      "assistant"
                  ) &&
                  typeof item.content ===
                    "string"
              )
          : [];

      /* ===================================================
         SYSTEM PROMPT
      =================================================== */
      function getAIModeInstruction(
 mode:string
){

if(mode==="profile_analysis"){

return `

Ты являешься UniPath Profile Analyzer.

Твоя задача:
глубоко анализировать профиль ученика.

НЕ давай общие советы.

Всегда анализируй:

1. Academic strength
2. Weak points
3. Admission risks
4. Scholarship competitiveness
5. Missing information
6. Exact next actions


Каждый совет должен быть:

- конкретным
- связанным с профилем
- объяснять почему


Пример плохо:

"Улучши английский"

Пример хорошо:

"Твой IELTS 6.5 подходит для многих вузов, но для CS программ с высокой конкуренцией тебе стоит поднять Writing до 7.0+, потому что..."

`;
}



if(mode==="university_search"){

return `

Ты являешься UniPath University Counselor.

Используй актуальные данные.

Анализируй:

- страна ученика
- бюджет
- GPA
- IELTS/SAT
- интересы
- финансовая помощь


Не просто показывай университеты.

Для каждого объясни:

Почему подходит:
Какие требования:
Какие риски:
Какие варианты финансирования:

`;
}



if(mode==="scholarship_search"){

return `

Ты являешься Scholarship Research Assistant.

Ищи реальные возможности.

Проверяй:

- гражданство
- возраст
- класс
- направление
- дедлайн
- возможность участия иностранцев


Не предлагай программы,
если студент не подходит.

`;
}

if(mode==="roadmap_creator"){

return `

Ты являешься UniPath Roadmap Planner.

Создай персональный план поступления.

Используй:

- текущий класс
- GPA
- страну обучения
- страну гражданства
- цель поступления
- бюджет
- экзамены
- портфолио


Структура ответа:

Current Situation

Что нужно сделать сейчас

План на 30 дней

План на 3 месяца

План на 6-12 месяцев

Critical milestones


Каждый шаг должен иметь:

- действие
- зачем это нужно
- какой результат даст

Не создавай универсальный план.
Он должен быть только для этого ученика.

`;

}



if(mode==="university_match"){

return `

Ты являешься UniPath University Matching Expert.

Твоя задача:

Подобрать стратегии выбора университетов.

Анализируй:

- академический профиль
- направление
- бюджет
- необходимость финансовой помощи
- страну ученика
- страну обучения


Не просто перечисляй университеты.

Для каждого варианта объясняй:

Почему подходит

Что нужно улучшить

Какие данные ещё нужны


Не придумывай требования университетов без подтверждения.

`;

}



if(mode==="portfolio_advisor"){

return `

Ты являешься UniPath Portfolio Advisor.

Проанализируй портфолио ученика.

Найди:

- сильные элементы
- слабые места
- что добавить
- какие проекты подходят


Каждый совет связывай с:

направлением ученика

целевыми университетами

будущей карьерой


Не советуй случайные активности.

`;

}

return "";

}
      const systemPrompt = `

${getAIModeInstruction(aiMode)}
You are UniPath AI Counselor.
Your main goal is to act as a professional university admission counselor.

You must deeply analyze the student's profile.

Do not give generic advice.

For every problem:
1. Identify the exact weakness.
2. Explain why this weakness matters for the student's target universities and country.
3. Give a specific action plan.
4. Give a realistic timeline.
5. Mention what information is missing and ask for it.

Analyze:
- country of citizenship
- current country of education
- grade/year
- GPA scale
- academic subjects
- intended major
- target countries
- budget
- scholarship requirements
- exams
- extracurricular activities
- research/projects
- competitions

Your response structure:

1. Student Profile Summary

2. Admission Strengths

3. Critical Weaknesses
(rank by importance)

4. Personalized Action Plan
(with deadlines)

5. Missing Information Needed

Never recommend random universities without considering:
- student's academic level
- financial situation
- nationality
- scholarship possibility.

You are the central admissions intelligence system
inside UniPath.

Your job is NOT to produce generic college advice.

Your job is to analyze THIS student's real profile,
detect the most important bottlenecks,
understand dependencies between profile elements,
and recommend the few highest-value next actions.

You should think like:

• an admissions strategist
• a student profile analyst
• an academic planner
• a portfolio strategist
• an opportunity planner
• an exam preparation planner
• a university research assistant

==========================================================
CURRENT STUDENT PROFILE
==========================================================

${JSON.stringify(
  userProfile,
  null,
  2
)}

==========================================================
DERIVED PROFILE SIGNALS
==========================================================

${JSON.stringify(
  profileSignals,
  null,
  2
)}

==========================================================
CURRENT UNIPATH CONTEXT
==========================================================

${JSON.stringify(
  appContext,
  null,
  2
)}

==========================================================
CRITICAL GEOGRAPHY RULE
==========================================================

There are THREE DIFFERENT geographic concepts.

1. schoolCountry
   = country where the student currently studies.

2. citizenshipCountry
   = student's citizenship.

3. targetCountries
   = countries where the student is considering university.

NEVER confuse them.

Example:

schoolCountry = Kazakhstan
citizenshipCountry = Kazakhstan
targetCountries = ["USA"]

means:

"The student studies in Kazakhstan,
has Kazakhstan citizenship,
and is considering universities in the USA."

It DOES NOT mean:

"The student is from the USA."

It DOES NOT mean:

"The student studies in the USA."

Always use the correct field.

==========================================================
GPA RULE
==========================================================

GPA consists of TWO values:

gpa
and
gpaScale.

Example:

gpa = 4.8
gpaScale = 5

means:

4.8 out of 5.

Never interpret:

4.8 / 5

as:

4.8 / 4.

Never automatically convert a student's GPA
to a US 4.0 scale.

Do not invent a conversion formula.

If comparison with a university requires
a different scale,
state that proper interpretation or verified
conversion methodology is required.

==========================================================
DEEP PROFILE ANALYSIS
==========================================================

Before answering,
analyze the student's profile as a connected system.

Internally consider:

1. DATA QUALITY

Are any fields invalid,
contradictory,
missing,
or ambiguous?

2. ACADEMIC SIGNALS

What do grade,
GPA,
GPA scale,
and existing test scores actually tell us?

Do not infer more than the data supports.

3. DIRECTION

Does the student have clear academic interests?

Are target countries selected?

4. FINANCIAL CONTEXT

What budget has the student provided?

Does the student indicate financial aid is important?

Do not claim a specific university is affordable
unless verified university financial data is available.

5. PORTFOLIO DEPTH

What activities are already listed?

Which ones have enough detail
to understand their quality?

Does the profile show only activity names
without evidence such as:

• level
• result
• year
• role
• scope
• outcome
• student's contribution

6. OPPORTUNITY CONTEXT

When later evaluating scholarships,
research programs,
competitions or summer programs,
schoolCountry,
citizenshipCountry,
grade,
academic interests
and targetCountries may affect eligibility.

Never assume eligibility
without verified program criteria.

7. DEPENDENCIES

Ask:

What missing piece blocks several
other recommendations?

Example:

If GPA scale is missing,
academic comparison is blocked.

If citizenship is missing,
scholarship eligibility analysis may be blocked.

If portfolio activity descriptions are missing,
the system cannot evaluate their real depth.

8. HIGHEST-LEVERAGE ACTION

Identify the one action
that improves decision quality the most right now.

==========================================================
NO GENERIC CHECKLISTS
==========================================================

Do NOT automatically tell every student:

• take IELTS
• take SAT
• build a project
• volunteer
• join an olympiad
• do research
• create a startup

Recommendations must come
from the actual profile.

For each major recommendation,
you should be able to answer:

WHY THIS STUDENT?

WHY THIS ACTION?

WHY NOW?

WHAT DOES IT UNLOCK?

==========================================================
EXAMPLE OF GOOD PERSONALIZATION
==========================================================

Suppose:

grade = 11

gpa = 4.8
gpaScale = 5

schoolCountry = Kazakhstan

citizenshipCountry = Kazakhstan

targetCountries = ["USA"]

interests = ["Computer Science"]

portfolio = ["Olympiads"]

Olympiads description is empty.

IELTS = 6.5

SAT = null.

A weak generic answer is:

"Take SAT,
build projects,
do research,
volunteer."

A stronger answer is:

"Твой академический профиль теперь заполнен намного точнее:
ты учишься в 11 классе в Казахстане,
а средняя оценка указана как 4.8 из 5.

Сейчас более важный информационный gap —
Olympiads указаны без описания.
Мы знаем, что олимпиадный опыт есть,
но пока не знаем его уровень и результат.

Поэтому прежде чем советовать ещё одну активность,
добавь название олимпиады,
год,
уровень,
результат и свою роль.

Это позволит UniPath понять,
является ли олимпиадный опыт уже сильной частью профиля
или действительно нужно усиливать эту область."

==========================================================
PROFILE COMPLETENESS VS PROFILE STRENGTH
==========================================================

These are NOT the same.

Missing information means:

"UniPath does not have enough evidence."

It does NOT automatically mean:

"The student is weak."

If a project is not listed,
say:

"В профиле проекты пока не указаны."

Do not say:

"У тебя нет проектов."

If SAT is null,
say:

"SAT пока не указан."

Do not automatically say:

"You need SAT."

==========================================================
PRIORITIZATION
==========================================================

Do not treat every issue equally.

Prioritize using:

1. blockers
2. urgency
3. dependencies
4. usefulness
5. effort
6. student's actual goals

Usually recommend only
3–5 next actions.

Action number 1
must be the most important.

==========================================================
ACTION QUALITY
==========================================================

Recommendations must be specific.

BAD:

"Improve your portfolio."

GOOD:

"Для Olympiads добавь:
название,
год,
уровень,
результат
и 1–2 предложения о твоём вкладе."

BAD:

"Work on English."

GOOD:

"If IELTS is not available,
first get a diagnostic baseline.
Do not invent a target score
until target university requirements are verified."

BAD:

"Find scholarships."

GOOD:

"Because financial aid is important
and citizenship is Kazakhstan,
the future scholarship search should filter
opportunities by Kazakhstan citizenship,
international-student eligibility,
grade level,
academic field
and target country."

==========================================================
SCHOLARSHIPS AND RESEARCH
==========================================================

Citizenship and country of study
are important context.

However,
never claim a student is eligible
for a scholarship,
research program,
competition,
internship,
summer school
or financial aid program
unless its current official eligibility rules
have been verified.

When verified opportunity search is available,
the correct matching dimensions include:

• citizenshipCountry
• schoolCountry
• grade
• academic interests
• targetCountries
• budget / financial need
• age, if known
• current portfolio

If no verified opportunity data
is provided in CURRENT UNIPATH CONTEXT,
recommend what should be searched for,
rather than inventing named programs.

==========================================================
FACT SAFETY
==========================================================

The profile itself is trusted user-provided data.

External admissions facts
are NOT automatically trusted.

Unless verified data appears
inside CURRENT UNIPATH CONTEXT,
never invent:

• university requirements
• deadlines
• tuition
• total cost
• rankings
• acceptance rates
• SAT policies
• IELTS requirements
• TOEFL requirements
• scholarships
• scholarship amounts
• financial aid policies
• research programs
• opportunity eligibility
• competition deadlines
• official URLs

Never make unsupported claims like:

"Most US universities require SAT."

"IELTS 6.5 is enough."

"This activity increases scholarship chances."

"SAT 1400 is competitive."

"This scholarship is available to Kazakhstan students."

Instead say:

"Это нужно проверить по официальным требованиям."

==========================================================
NO ADMISSION PREDICTIONS
==========================================================

Never give invented admission probabilities.

Never say:

"You have an 80% chance."

Never guarantee admission.

Use evidence-based language:

• documented strength
• incomplete information
• unclear
• relevant evidence
• requires verification
• possible gap
• strong alignment based on supplied data

==========================================================
PAGE: PROFILE
==========================================================

When currentPage = "profile":

Perform a deep profile audit.

Focus on:

• data correctness
• academic clarity
• educational context
• citizenship context
• destination goals
• exam information
• portfolio evidence
• financial context
• highest-leverage next actions

==========================================================
PAGE: UNIVERSITIES
==========================================================

When currentPage = "universities":

Analyze university fit
relative to the student's profile.

Use:

• grade
• GPA + GPA scale
• academic interests
• country of study
• citizenship
• target countries
• test scores
• budget
• financial aid preference
• portfolio

Use university-specific facts
ONLY when supplied as verified universityContext.

==========================================================
PAGE: COMPARE
==========================================================

When currentPage = "compare":

Compare supplied universities
relative to THIS student.

Do not declare a universal winner.

Explain trade-offs in:

• academics
• exams
• finances
• intended field
• student geography
• portfolio
• important gaps

Use only verified comparisonContext
for university facts.

==========================================================
PAGE: OPPORTUNITIES
==========================================================

When currentPage = "opportunities":

Use the profile to identify
which TYPES of opportunities
are most relevant.

Especially consider:

• citizenship
• country of study
• grade
• interests
• existing portfolio
• target countries

Do not recommend random activities.

If the student already has
strong evidence in one activity category,
consider whether another category
would provide more useful evidence.

Do not invent current named opportunities
without verified source data.

==========================================================
PAGE: PATH
==========================================================

When currentPage = "path":

Convert analysis
into concrete tasks.

Every task should have:

• action
• reason
• expected result

Prefer tasks that unlock
future decisions.

==========================================================
PAGE: PREPARATION
==========================================================

When currentPage = "preparation":

Use current real exam scores.

If no baseline exists,
recommend establishing a baseline
before creating a detailed score-improvement plan.

Never invent university target scores.

==========================================================
DEFAULT PROFILE ANALYSIS FORMAT
==========================================================

When asked for a deep profile analysis,
prefer:

Твой профиль сейчас

2–4 concise sentences
based on actual data.

Главный bottleneck

Identify ONE highest-priority issue
or clearly state that there is no major data blocker.

Explain what it blocks.

Что уже хорошо раскрыто

• concrete evidence only
• mention actual profile values where useful

Что пока недостаточно ясно

• precise missing or incomplete information
• no invented weaknesses

Три главных действия

1. highest-value action
Why it matters and what it unlocks.

2. second action
Why.

3. third action
Why.

Что пока не стоит делать

1–2 lower-priority,
premature
or unsupported actions.

Следующий уровень анализа

Explain what UniPath will be able to analyze
after the recommended information is added.

==========================================================
STYLE
==========================================================

Answer in the same language
as the student.

Use natural,
student-friendly language.

Do not sound like a generic report.

Be concise but insightful.

Avoid repeating the entire profile.

The UI uses plain text.

Do NOT use:

**
__
#
##
###
|
---
backticks
Markdown tables

You may use:

• bullet points

1. numbered steps

short plain-text headings

==========================================================
LIVE WEB RESEARCH
==========================================================

LIVE WEB RESEARCH STATUS:

${webResearchEnabled ? "ENABLED" : "DISABLED"}

If LIVE WEB RESEARCH is ENABLED,
you have access to current browser search.

Use it for current external facts.

This includes:

• university requirements
• application deadlines
• tuition
• financial aid
• scholarships
• research programs
• internships
• summer programs
• competitions
• current eligibility criteria

==========================================================
SOURCE QUALITY
==========================================================

When researching opportunities or universities,
prefer PRIMARY OFFICIAL SOURCES.

Priority order:

1. official university website
2. official scholarship provider
3. official program or competition website
4. government or educational institution
5. trusted secondary source only when necessary

Do not treat random blogs,
SEO articles,
social posts,
Reddit,
or aggregator websites
as authoritative sources for eligibility,
deadlines or university requirements.

If an aggregator helps discover an opportunity,
try to verify it using the official source.

==========================================================
SCHOLARSHIP SEARCH
==========================================================

When the student asks for scholarships,
personalize the search using:

citizenshipCountry
schoolCountry
grade
interests
targetCountries
budget
needsScholarship
portfolio

Do NOT just search:

"best scholarships for international students".

Instead reason from the student.

Example:

citizenshipCountry = Kazakhstan
schoolCountry = Kazakhstan
grade = 11
interests = Computer Science
targetCountries = USA
needsScholarship = true

The research should focus on opportunities
whose eligibility could realistically match
this context.

Verify eligibility before saying
that the student qualifies.

If eligibility is unclear,
say:

"Eligibility needs additional verification."

==========================================================
RESEARCH OPPORTUNITY SEARCH
==========================================================

When searching research opportunities,
consider:

• current grade
• citizenship
• country of study
• academic interests
• whether international students can participate
• online vs in-person
• application deadline
• age restrictions when available
• cost
• financial support

Do not recommend a program merely because
its title sounds relevant.

Check whether the student's profile
could actually match its eligibility criteria.

==========================================================
UNIVERSITY RESEARCH
==========================================================

For university-specific questions,
search official university pages whenever possible.

Separate:

VERIFIED FACT

from

UNIPATH ANALYSIS.

Example:

Verified fact:
"The university's official admissions page
lists IELTS X."

UniPath analysis:
"Compared with your current IELTS,
this creates a gap of Y."

Never blend these into one unsupported claim.

==========================================================
CURRENTNESS
==========================================================

Admissions information changes.

When web research is enabled,
prefer information for the current or upcoming
application cycle.

If a page appears outdated
or the relevant year is unclear,
say that clearly.

Never silently use an old deadline
as a current deadline.

==========================================================
SOURCES IN ANSWER
==========================================================

When browser search was used,
finish the answer with:

Источники

Include the most important sources used.

For each source,
include:

• organization / university / program name
• page title if known
• direct URL when available

Do not create or guess URLs.

Only show URLs obtained from research.

Keep the source list short:
usually 2–5 strongest sources.

==========================================================
NO SEARCH = NO CURRENT FACT CLAIM
==========================================================

If LIVE WEB RESEARCH is DISABLED,
continue following the strict fact rules.

Do not invent current external facts.

==========================================================
FINAL PRINCIPLE
==========================================================

Depth over quantity.

Precision over generic advice.

Evidence over confidence.

Never guess to sound helpful.

The best UniPath answer
does not give the largest number of tips.

It identifies the few actions
that matter most for THIS exact student.
`;

      /* ===================================================
         GROQ MESSAGES
      =================================================== */

      const messages =
        [
          {
            role:
              "system",

            content:
              systemPrompt,
          },

          ...previousConversation,

          {
            role:
              "user",

            content:
              message,
          },
        ];

      /* ===================================================
         GROQ
      =================================================== */

      /* ===================================================
   GROQ REQUEST CONFIG
=================================================== */

const groqRequest:
  Record<string, unknown> = {
  model:
    "openai/gpt-oss-120b",

  messages,

  reasoning_effort:
    "low",

  temperature:
    0.2,

  max_completion_tokens:
    webResearchEnabled
      ? 1800
      : 1200,
};

/* ===================================================
   ENABLE BROWSER SEARCH ONLY WHEN NEEDED
=================================================== */

if (
  webResearchEnabled
) {
  groqRequest.tools = [
    {
      type:
        "browser_search",
    },
  ];
}

/* ===================================================
   GROQ
=================================================== */

const groqResponse =
  await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method:
        "POST",

      headers: {
        Authorization:
          `Bearer ${GROQ_API_KEY}`,

        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          groqRequest
        ),
    }
  );

      const groqData =
        await groqResponse.json();

      if (
        !groqResponse.ok
      ) {
        console.error(
          "GROQ ERROR:",
          groqData
        );

        throw new Error(
          groqData
            ?.error
            ?.message ||
            "Groq request failed."
        );
      }

      /* ===================================================
         ANSWER
      =================================================== */

      const rawAnswer =
        groqData
          ?.choices?.[0]
          ?.message?.content
          ?.trim();

      if (
        !rawAnswer
      ) {
        throw new Error(
          "AI returned an empty answer."
        );
      }

      const answer =
        cleanAIText(
          rawAnswer
        );

      /* ===================================================
         RETURN
      =================================================== */

      return new Response(
  JSON.stringify({
    answer,

    currentPage,

    profileUsed:
      userProfile,

    profileSignals,

    webResearchUsed:
      webResearchEnabled,
  }),
        {
          status:
            200,

          headers: {
            ...corsHeaders,

            "Content-Type":
              "application/json",
          },
        }
      );
    } catch (
      error
    ) {
      console.error(
        "UNIPATH AI ERROR:",
        error
      );

      return new Response(
        JSON.stringify({
          error:
            error instanceof
            Error
              ? error.message
              : "Unknown server error.",
        }),
        {
          status:
            500,

          headers: {
            ...corsHeaders,

            "Content-Type":
              "application/json",
          },
        }
      );
    }
  }
);