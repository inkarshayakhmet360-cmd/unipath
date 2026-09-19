import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import { supabase } from "./supabase";

/* =========================
   TYPES
========================= */

export type UniPathAIPage =
  | "profile"
  | "universities"
  | "compare"
  | "opportunities"
  | "path"
  | "preparation";

export type UniPathChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AskUniPathAIParams = {
  message: string;

  currentPage?: UniPathAIPage;

  conversation?: UniPathChatMessage[];

  universityContext?: unknown;

  comparisonContext?: unknown;

  opportunityContext?: unknown;

  roadmapContext?: unknown;

  preparationContext?: unknown;
};

export type UniPathAIResponse = {
  answer: string;

  currentPage?: string;

  profileUsed?: {
    name?: string;

    grade?: string | null;

    gpa?: string | null;

    interests?: string[];

    ielts?: number | null;

    sat?: number | null;

    noExams?: boolean;

    countries?: string[];

    budget?: string | null;

    needsScholarship?: boolean;

    portfolio?: string[];

    portfolioDescriptions?: Record<
      string,
      string
    >;
  };
};

/* =========================
   ASK UNIPATH AI
========================= */

export async function askUniPathAI(
  params: AskUniPathAIParams
): Promise<UniPathAIResponse> {
  const message =
    params.message.trim();

  if (!message) {
    throw new Error(
      "Введите сообщение."
    );
  }

  /* =========================
     CHECK SESSION
  ========================= */

  const {
    data: sessionData,
    error: sessionError,
  } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      "Не удалось проверить авторизацию."
    );
  }

  if (!sessionData.session) {
    throw new Error(
      "Сначала войдите в аккаунт."
    );
  }

  /* =========================
     CALL EDGE FUNCTION
  ========================= */

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "unipath-ai",
      {
        body: {
          message,

          currentPage:
            params.currentPage ||
            "profile",

          conversation:
            params.conversation ||
            [],

          universityContext:
            params.universityContext ??
            null,

          comparisonContext:
            params.comparisonContext ??
            null,

          opportunityContext:
            params.opportunityContext ??
            null,

          roadmapContext:
            params.roadmapContext ??
            null,

          preparationContext:
            params.preparationContext ??
            null,
        },
      }
    );

  /* =========================
     ERRORS
  ========================= */

  if (error) {
    if (
      error instanceof
      FunctionsHttpError
    ) {
      try {
        const errorBody =
          await error.context.json();

        console.error(
          "UNIPATH AI HTTP ERROR:",
          errorBody
        );

        throw new Error(
          errorBody?.error ||
            "AI server returned an error."
        );
      } catch (
        parseError
      ) {
        if (
          parseError instanceof
          Error &&
          parseError.message !==
            "AI server returned an error."
        ) {
          throw parseError;
        }

        throw new Error(
          "AI server returned an error."
        );
      }
    }

    if (
      error instanceof
      FunctionsRelayError
    ) {
      console.error(
        "UNIPATH AI RELAY ERROR:",
        error
      );

      throw new Error(
        "Не удалось связаться с AI-сервером."
      );
    }

    if (
      error instanceof
      FunctionsFetchError
    ) {
      console.error(
        "UNIPATH AI FETCH ERROR:",
        error
      );

      throw new Error(
        "Ошибка сети при обращении к AI."
      );
    }

    console.error(
      "UNIPATH AI ERROR:",
      error
    );

    throw new Error(
      error.message ||
        "Не удалось получить ответ AI."
    );
  }

  /* =========================
     VALIDATE RESPONSE
  ========================= */

  if (
    !data ||
    typeof data.answer !==
      "string" ||
    !data.answer.trim()
  ) {
    console.error(
      "INVALID AI RESPONSE:",
      data
    );

    throw new Error(
      "AI вернул пустой ответ."
    );
  }

  /* =========================
     SUCCESS
  ========================= */

  return {
    answer:
      data.answer.trim(),

    currentPage:
      data.currentPage,

    profileUsed:
      data.profileUsed,
  };
}