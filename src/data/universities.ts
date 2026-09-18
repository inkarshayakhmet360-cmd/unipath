export type University = {
  id: string;
  name: string;

  country: string;
  city: string;

  image: string;

  shortDescription: string;
  description: string;

  majors: string[];

  fit: "Strong match" | "Competitive" | "Reach";

  forYou: boolean;
  fitsBudget: boolean;
  englishTaught: boolean;
  scholarship: boolean;
  noSat: boolean;

  tuition: string;

  requirements: {
    ielts: string;
    sat: string;
    gpa: string;
    english: string;
  };

  strengths: string[];
  gaps: string[];

  nextSteps: string[];
};

export const universities: University[] = [
  {
    id: "aalto",

    name: "Aalto University",

    country: "Finland",
    city: "Espoo",

    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=1200",

    shortDescription:
      "Современный университет с сильными направлениями в технологиях, инженерии и бизнесе.",

    description:
      "Aalto University объединяет технологии, бизнес и дизайн. Для абитуриентов с интересом к Computer Science и Engineering университет может быть особенно интересен благодаря проектному подходу и международной среде.",

    majors: [
      "Computer Science",
      "Engineering",
      "Technology",
    ],

    fit: "Strong match",

    forYou: true,
    fitsBudget: true,
    englishTaught: true,
    scholarship: true,
    noSat: false,

    tuition: "≈ €12–15k / year",

    requirements: {
      ielts: "6.5",
      sat: "1350+",
      gpa: "Strong academic record",
      english: "English proficiency required",
    },

    strengths: [
      "Сильная математика и физика",
      "Интерес к Computer Science",
      "Технические проекты",
    ],

    gaps: [
      "SAT ещё не сдан",
      "Стоит усилить extracurricular profile",
    ],

    nextSteps: [
      "Пройти SAT diagnostic test",
      "Подготовить список технических проектов",
      "Изучить scholarship requirements",
    ],
  },

  {
    id: "toronto",

    name: "University of Toronto",

    country: "Canada",
    city: "Toronto",

    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200",

    shortDescription:
      "Крупный исследовательский университет с сильными программами в Computer Science и Engineering.",

    description:
      "University of Toronto предлагает широкий выбор академических программ и сильную исследовательскую среду. Для поступления особенно важны академические результаты и сильная подготовка по профильным предметам.",

    majors: [
      "Computer Science",
      "Engineering",
      "Sciences",
    ],

    fit: "Competitive",

    forYou: true,
    fitsBudget: false,
    englishTaught: true,
    scholarship: true,
    noSat: true,

    tuition: "Higher than current budget",

    requirements: {
      ielts: "6.5–7.0",
      sat: "Optional",
      gpa: "High academic performance",
      english: "English proficiency required",
    },

    strengths: [
      "Сильный академический профиль",
      "Хорошая математика",
      "Подходящие академические интересы",
    ],

    gaps: [
      "Бюджет значительно ниже стоимости обучения",
      "Стоит повысить IELTS",
      "Нужен сильный scholarship strategy",
    ],

    nextSteps: [
      "Повысить IELTS до 7.0+",
      "Изучить scholarships и financial aid",
      "Усилить исследовательское портфолио",
    ],
  },

  {
    id: "kaist",

    name: "KAIST",

    country: "South Korea",
    city: "Daejeon",

    image:
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200",

    shortDescription:
      "Технологический университет для сильных абитуриентов в STEM, инженерии и исследованиях.",

    description:
      "KAIST ориентирован на технологии, естественные науки и инженерные направления. Сильные STEM-достижения, проекты и исследовательский опыт могут заметно усилить заявку.",

    majors: [
      "Computer Science",
      "Engineering",
      "Physics",
    ],

    fit: "Competitive",

    forYou: true,
    fitsBudget: true,
    englishTaught: true,
    scholarship: true,
    noSat: true,

    tuition: "Scholarship opportunities",

    requirements: {
      ielts: "6.5+",
      sat: "Optional / recommended",
      gpa: "Strong STEM record",
      english: "English proficiency",
    },

    strengths: [
      "Сильная физика",
      "Инженерный интерес",
      "Наличие технических проектов",
    ],

    gaps: [
      "Стоит усилить олимпиады или research",
      "SAT может усилить заявку",
    ],

    nextSteps: [
      "Добавить исследовательскую активность",
      "Рассмотреть SAT",
      "Подготовить список STEM-достижений",
    ],
  },

  {
    id: "manchester",

    name: "University of Manchester",

    country: "United Kingdom",
    city: "Manchester",

    image:
      "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=1200",

    shortDescription:
      "Британский университет с большим выбором инженерных, научных и технологических программ.",

    description:
      "University of Manchester предлагает множество программ в области Engineering, Computer Science и Natural Sciences. Большое значение имеют академические результаты и английский язык.",

    majors: [
      "Engineering",
      "Computer Science",
      "Natural Sciences",
    ],

    fit: "Competitive",

    forYou: false,
    fitsBudget: false,
    englishTaught: true,
    scholarship: true,
    noSat: true,

    tuition: "Above current budget",

    requirements: {
      ielts: "6.5+",
      sat: "Depends on qualification",
      gpa: "Strong grades required",
      english: "English proficiency required",
    },

    strengths: [
      "Подходящие академические интересы",
      "Сильные профильные предметы",
    ],

    gaps: [
      "Стоимость выше текущего бюджета",
      "Нужно изучить requirements конкретной программы",
    ],

    nextSteps: [
      "Выбрать конкретную программу",
      "Проверить academic requirements",
      "Изучить scholarship options",
    ],
  },
];