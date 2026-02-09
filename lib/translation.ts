import crypto from "crypto";
import { getOpenAIClient } from "@/lib/openai";

type PosterFeatureBlock = {
  title: string;
  lines: string[];
};

type PosterTimelineItem = {
  time: string;
  text: string;
};

export type TranslationPayload = {
  title: string;
  description: string;
  posterTemplateData: {
    posterA: {
      heroTagline: string;
      featureBlocks: PosterFeatureBlock[];
      priceLabel: string;
    };
    posterB: {
      programTitle: string;
      timeline: PosterTimelineItem[];
      priceLabel: string;
      registerNote: string;
    };
  };
};

export function hashRuSource(payload: TranslationPayload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function translateRuToKzEn(ru: TranslationPayload) {
  const client = getOpenAIClient();

  const prompt = `Переведи JSON из русского языка на казахский и английский.

Требования:
1) Сохрани структуру JSON без изменений.
2) Не меняй time-форматы в timeline.time.
3) priceLabel переводи только символы, числа оставляй как есть.
4) Тон: туристический, естественный, без канцелярита.
5) Верни строго JSON вида {"kz":...,"en":...}.

SOURCE_JSON:\n${JSON.stringify(ru)}`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "Ты профессиональный переводчик ru->kz/en. Возвращай только валидный JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Translation model returned empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Translation response is not valid JSON");
  }

  const result = parsed as { kz?: TranslationPayload; en?: TranslationPayload };
  if (!result.kz || !result.en) {
    throw new Error("Translation response missing kz or en");
  }

  return result;
}
