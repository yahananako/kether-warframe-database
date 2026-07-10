import { NextRequest, NextResponse } from "next/server";
import { buildRelicAcquisitionResponse } from "../../discord/relicAcquisition";

type DiscordField = {
  name?: string;
  value?: string;
};

type DiscordEmbed = {
  title?: string;
  description?: string;
  fields?: DiscordField[];
};

type DiscordResponse = {
  content?: string;
  embeds?: DiscordEmbed[];
};

function cleanTitle(value: string) {
  return value
    .replace(/[🥜🌱🧿🔎✨]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickCategory(fields: DiscordField[]) {
  const categoryField = fields.find((field) =>
    ["分類", "世代", "狀態", "結果整理"].includes(String(field.name ?? ""))
  );

  return categoryField?.value ?? "遺物";
}

function normalizeDetails(embed: DiscordEmbed) {
  const fields = embed.fields ?? [];
  const details = fields
    .map((field) => ({
      label: String(field.name ?? "資訊"),
      value: String(field.value ?? "").trim(),
    }))
    .filter((field) => field.value);

  if (embed.description) {
    details.unshift({
      label: "說明",
      value: embed.description,
    });
  }

  return details;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const value = query.trim();

  if (!value) {
    return NextResponse.json({
      query,
      count: 0,
      results: [],
    });
  }

  const response = buildRelicAcquisitionResponse(value) as DiscordResponse;

  const content = String(response.content ?? "").trim();
  const embeds = response.embeds ?? [];

  if (content.startsWith("找不到") || embeds.length === 0) {
    return NextResponse.json({
      query,
      count: 0,
      message: content,
      results: [],
    });
  }

  const results = embeds.map((embed, index) => {
    const fields = embed.fields ?? [];
    const title = cleanTitle(String(embed.title ?? `遺物查詢結果 ${index + 1}`));

    return {
      name: title || `遺物查詢結果 ${index + 1}`,
      category: pickCategory(fields),
      details: normalizeDetails(embed),
    };
  });

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}
