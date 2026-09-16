import crypto from "node:crypto";
import sharp from "sharp";

import {
  findVerifiedIdentityConflict,
  saveVerificationAttempt,
} from "./clanBotStore";
import {
  discordBotFetch,
  ephemeralMessage,
  getInteractionDisplayName,
  getInteractionUserId,
} from "./discordApi";

const DEFAULT_CLAN_NAME = "KETHER OF PARADISO";
const DEFAULT_MORTAL_ROLE_NAME = "凡人";
const DEFAULT_ANGEL_ROLE_NAME = "天使";
const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024;
const VISION_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

type DiscordAttachment = {
  id: string;
  filename?: string;
  content_type?: string;
  size?: number;
  url?: string;
  proxy_url?: string;
  width?: number;
  height?: number;
};

type DiscordRole = {
  id: string;
  name: string;
  managed?: boolean;
  position?: number;
};

type VisionEvidence = {
  text: string;
  provider: string;
  detectedLanguages: string[];
};

type EmblemEvidence = {
  matched: boolean;
  score: number;
  width: number;
  height: number;
};

let googleAccessTokenCache:
  | {
      token: string;
      expiresAt: number;
    }
  | null = null;

function getTopLevelOption(interaction: any, name: string) {
  const options = Array.isArray(interaction.data?.options)
    ? interaction.data.options
    : [];

  return options.find((option: any) => option.name === name)?.value;
}

function normalizeIdentity(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function getAttachment(interaction: any): DiscordAttachment | null {
  const attachmentId = String(getTopLevelOption(interaction, "screenshot") ?? "");

  if (!attachmentId) return null;

  return interaction.data?.resolved?.attachments?.[attachmentId] ?? null;
}

function validatePlayerId(value: string) {
  const playerId = value.normalize("NFKC").trim();

  if (
    playerId.length < 2 ||
    playerId.length > 40 ||
    /[\r\n\t]/.test(playerId) ||
    !normalizeIdentity(playerId)
  ) {
    throw new Error("遊戲 ID 必須是 2～40 個字元，且不能包含換行或控制字元。");
  }

  return playerId;
}

function validateAttachment(attachment: DiscordAttachment | null) {
  if (!attachment?.id || !attachment.url) {
    throw new Error("找不到驗證截圖，請重新選擇圖片附件。");
  }

  const contentType = String(attachment.content_type ?? "").toLowerCase();

  if (!contentType.startsWith("image/")) {
    throw new Error("氏族驗證只能使用 PNG、JPG 或 WebP 圖片。");
  }

  if (Number(attachment.size ?? 0) > MAX_SCREENSHOT_BYTES) {
    throw new Error("驗證截圖不能超過 8 MB。");
  }

  const url = new URL(attachment.url);
  const allowedHosts = new Set([
    "cdn.discordapp.com",
    "media.discordapp.net",
    "images-ext-1.discordapp.net",
    "images-ext-2.discordapp.net",
  ]);

  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    throw new Error("截圖來源不是 Discord 官方附件網址，已停止驗證。");
  }

  return attachment;
}

async function downloadScreenshot(attachment: DiscordAttachment) {
  const response = await fetch(attachment.url!, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Discord 截圖下載失敗（${response.status}）。`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.length === 0 || bytes.length > MAX_SCREENSHOT_BYTES) {
    throw new Error("驗證截圖是空白檔案或超過 8 MB。");
  }

  const metadata = await sharp(bytes).metadata();

  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < 640 ||
    metadata.height < 360 ||
    metadata.width > 7680 ||
    metadata.height > 7680
  ) {
    throw new Error("截圖解析度需介於 640×360 與 7680×7680，並完整顯示個人簡介。");
  }

  return bytes;
}

function base64Url(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getGoogleAccessToken() {
  if (
    googleAccessTokenCache &&
    googleAccessTokenCache.expiresAt > Date.now() + 60_000
  ) {
    return googleAccessTokenCache.token;
  }

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!serviceAccountEmail || !privateKey) {
    throw new Error(
      "氏族截圖辨識尚未啟用：缺少 GOOGLE_SERVICE_ACCOUNT_EMAIL 或 GOOGLE_PRIVATE_KEY。",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: VISION_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsignedToken), privateKey);
  const assertion = `${unsignedToken}.${base64Url(signature)}`;
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json();

  if (!response.ok || typeof data.access_token !== "string") {
    throw new Error(
      `Google 圖像辨識登入失敗（${response.status}）。請檢查服務帳號與 Vision API 權限。`,
    );
  }

  googleAccessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  };

  return data.access_token as string;
}

async function readScreenshotText(bytes: Buffer): Promise<VisionEvidence> {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(
    "https://vision.googleapis.com/v1/images:annotate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: bytes.toString("base64") },
            features: [
              { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
            ],
            imageContext: {
              languageHints: ["en", "zh-TW"],
            },
          },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    },
  );
  const data = await response.json();
  const annotation = data?.responses?.[0];

  if (!response.ok || annotation?.error) {
    const reason = annotation?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Google Vision 無法辨識截圖：${String(reason).slice(0, 300)}`);
  }

  const text = String(
    annotation?.fullTextAnnotation?.text ||
      annotation?.textAnnotations?.[0]?.description ||
      "",
  ).trim();
  const detectedLanguages = Array.from(
    new Set(
      (annotation?.fullTextAnnotation?.pages ?? [])
        .flatMap((page: any) => page?.property?.detectedLanguages ?? [])
        .map((item: any) => String(item?.languageCode ?? ""))
        .filter(Boolean),
    ),
  ) as string[];

  if (!text) {
    throw new Error("截圖裡沒有辨識到文字；請關閉模糊效果並重新截取完整個人簡介。");
  }

  return {
    text,
    provider: "Google Cloud Vision",
    detectedLanguages,
  };
}

function evenlySample<T>(items: T[], maximum: number) {
  if (items.length <= maximum) return items;

  const sampled: T[] = [];
  const step = items.length / maximum;

  for (let index = 0; index < maximum; index += 1) {
    sampled.push(items[Math.floor(index * step)]);
  }

  return sampled;
}

async function buildLogoSamples(referenceBytes: Buffer, width: number) {
  const { data, info } = await sharp(referenceBytes)
    .trim()
    .resize({ width, height: width, fit: "contain" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const foreground: Array<[number, number]> = [];
  const background: Array<[number, number]> = [];

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * 4 + 3];

      if (alpha >= 160) foreground.push([x, y]);
      else if (alpha <= 20) background.push([x, y]);
    }
  }

  return {
    width: info.width,
    height: info.height,
    foreground: evenlySample(foreground, 120),
    background: evenlySample(background, 120),
  };
}

function averageAt(
  screen: Buffer,
  screenWidth: number,
  offsetX: number,
  offsetY: number,
  points: Array<[number, number]>,
) {
  if (points.length === 0) return 0;

  let total = 0;

  for (const [x, y] of points) {
    total += screen[(offsetY + y) * screenWidth + offsetX + x];
  }

  return total / points.length;
}

function scoreLogoPatch(
  screen: Buffer,
  screenWidth: number,
  offsetX: number,
  offsetY: number,
  foreground: Array<[number, number]>,
  background: Array<[number, number]>,
) {
  const foregroundMean = averageAt(
    screen,
    screenWidth,
    offsetX,
    offsetY,
    foreground,
  );
  const backgroundMean = averageAt(
    screen,
    screenWidth,
    offsetX,
    offsetY,
    background,
  );
  const direction = foregroundMean >= backgroundMean ? 1 : -1;
  const contrast = Math.min(1, Math.abs(foregroundMean - backgroundMean) / 90);
  let agreement = 0;

  for (const [x, y] of foreground) {
    const value = screen[(offsetY + y) * screenWidth + offsetX + x];

    if ((value - backgroundMean) * direction >= 18) agreement += 1;
  }

  const agreementRatio = foreground.length > 0
    ? agreement / foreground.length
    : 0;

  return contrast * 0.55 + agreementRatio * 0.45;
}

export async function detectClanEmblem(
  bytes: Buffer,
  referenceOverride?: Buffer,
): Promise<EmblemEvidence> {
  const screenshot = await sharp(bytes)
    .rotate()
    .resize({ width: 360, withoutEnlargement: true })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let referenceBytes = referenceOverride;

  if (!referenceBytes) {
    const referenceUrl =
      process.env.KETHER_CLAN_EMBLEM_URL?.trim() ||
      "https://kether-warframe-database.vercel.app/kether-clan-logo.png";
    const referenceResponse = await fetch(referenceUrl, {
      cache: "force-cache",
      signal: AbortSignal.timeout(10_000),
    });

    if (!referenceResponse.ok) {
      throw new Error("無法載入 KETHER 氏族徽章範本。");
    }

    referenceBytes = Buffer.from(await referenceResponse.arrayBuffer());
  }
  const maximumScale = Math.min(80, Math.floor(screenshot.info.width / 3));
  const scales = [24, 32, 40, 48, 60, 72].filter(
    (size) => size <= maximumScale && size <= screenshot.info.height,
  );
  let bestScore = 0;

  for (const scale of scales) {
    const sample = await buildLogoSamples(referenceBytes, scale);
    const stride = Math.max(3, Math.round(scale / 10));

    for (
      let y = 0;
      y <= screenshot.info.height - sample.height;
      y += stride
    ) {
      for (
        let x = 0;
        x <= screenshot.info.width - sample.width;
        x += stride
      ) {
        const score = scoreLogoPatch(
          screenshot.data,
          screenshot.info.width,
          x,
          y,
          sample.foreground,
          sample.background,
        );

        if (score > bestScore) bestScore = score;
      }
    }
  }

  return {
    matched: bestScore >= 0.57,
    score: Number(bestScore.toFixed(3)),
    width: screenshot.info.width,
    height: screenshot.info.height,
  };
}

function extractMasteryRank(text: string) {
  const match = text.match(
    /(?:mastery\s*rank|legendary\s*rank|精通段位|段位|mr)\s*[:：#-]?\s*(\d{1,2})/i,
  );

  return match?.[1] ? `MR${match[1]}` : null;
}

async function resolveVerificationRoles(guildId: string) {
  const roles = await discordBotFetch<DiscordRole[]>(
    `/guilds/${encodeURIComponent(guildId)}/roles`,
  );
  const mortalId = process.env.DISCORD_MORTAL_ROLE_ID?.trim();
  const angelId = process.env.DISCORD_ANGEL_ROLE_ID?.trim();
  const mortalName =
    process.env.DISCORD_MORTAL_ROLE_NAME?.trim() || DEFAULT_MORTAL_ROLE_NAME;
  const angelName =
    process.env.DISCORD_ANGEL_ROLE_NAME?.trim() || DEFAULT_ANGEL_ROLE_NAME;
  const mortalRole = mortalId
    ? roles.find((role) => role.id === mortalId)
    : roles.find((role) => role.name.normalize("NFKC") === mortalName.normalize("NFKC"));
  const angelRole = angelId
    ? roles.find((role) => role.id === angelId)
    : roles.find((role) => role.name.normalize("NFKC") === angelName.normalize("NFKC"));

  if (!mortalRole || !angelRole) {
    throw new Error(
      `找不到「${mortalName}」或「${angelName}」身分組；請檢查名稱或環境變數中的 Role ID。`,
    );
  }

  if (mortalRole.managed || angelRole.managed) {
    throw new Error("驗證身分組是 Discord 整合管理角色，BOT 無法自動增減。");
  }

  return { mortalRole, angelRole };
}

async function assignVerifiedRole(
  guildId: string,
  userId: string,
  mortalRoleId: string,
  angelRoleId: string,
) {
  await discordBotFetch(
    `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}/roles/${encodeURIComponent(angelRoleId)}`,
    { method: "PUT" },
  );

  try {
    await discordBotFetch(
      `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}/roles/${encodeURIComponent(mortalRoleId)}`,
      { method: "DELETE" },
    );
  } catch (error) {
    await discordBotFetch(
      `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}/roles/${encodeURIComponent(angelRoleId)}`,
      { method: "DELETE" },
    ).catch(() => undefined);
    throw error;
  }
}

async function auditVerification(
  input: Parameters<typeof saveVerificationAttempt>[0],
) {
  await saveVerificationAttempt(input).catch((error) => {
    console.error("Save clan verification audit failed", error);
  });
}

function rejectedMessage(reason: string) {
  return ephemeralMessage(
    `氏族驗證沒有通過喵。\n原因：${reason}\n\n請重新截取遊戲內「個人簡介」完整畫面，讓玩家 ID、氏族名稱與氏族徽章同時清楚出現。`,
  );
}

export async function handleClanVerification(interaction: any) {
  const guildId = String(interaction.guild_id ?? "");
  const channelId = String(interaction.channel_id ?? "");
  const userId = getInteractionUserId(interaction);
  const displayName = getInteractionDisplayName(interaction);
  const expectedGuildId = process.env.DISCORD_GUILD_ID?.trim();
  const expectedChannelId = process.env.DISCORD_VERIFICATION_CHANNEL_ID?.trim();
  const expectedClanName =
    process.env.KETHER_CLAN_NAME?.trim() || DEFAULT_CLAN_NAME;
  let playerId = "";
  let attachment: DiscordAttachment | null = null;

  try {
    if (!guildId || !userId) {
      return ephemeralMessage("氏族驗證只能在 KETHER 氏族群內使用喵。");
    }

    if (expectedGuildId && guildId !== expectedGuildId) {
      return ephemeralMessage("這個 Discord 群組不是 KETHER 氏族驗證群喵。");
    }

    if (expectedChannelId && channelId !== expectedChannelId) {
      return ephemeralMessage(`請到 <#${expectedChannelId}> 使用氏族驗證喵。`);
    }

    playerId = validatePlayerId(
      String(getTopLevelOption(interaction, "player_id") ?? ""),
    );
    attachment = validateAttachment(getAttachment(interaction));
    const { mortalRole, angelRole } = await resolveVerificationRoles(guildId);
    const memberRoles = Array.isArray(interaction.member?.roles)
      ? interaction.member.roles.map(String)
      : [];

    if (memberRoles.includes(angelRole.id)) {
      if (memberRoles.includes(mortalRole.id)) {
        await discordBotFetch(
          `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}/roles/${encodeURIComponent(mortalRole.id)}`,
          { method: "DELETE" },
        );
      }

      return ephemeralMessage("你已經是「天使」身分，驗證狀態正常喵。");
    }

    if (!memberRoles.includes(mortalRole.id)) {
      return ephemeralMessage("你目前沒有「凡人」身分組，無法執行新人氏族驗證喵。");
    }

    const screenshot = await downloadScreenshot(attachment);
    const [vision, emblem] = await Promise.all([
      readScreenshotText(screenshot),
      detectClanEmblem(screenshot),
    ]);
    const normalizedText = normalizeIdentity(vision.text);
    const playerIdMatched = normalizedText.includes(normalizeIdentity(playerId));
    const clanNameMatched = normalizedText.includes(
      normalizeIdentity(expectedClanName),
    );
    const profileCueMatched =
      /profile|mastery|clan|氏族|個人簡介|段位/i.test(vision.text) ||
      (playerIdMatched && clanNameMatched);
    const masteryRank = extractMasteryRank(vision.text);
    const screenshotSha256 = crypto
      .createHash("sha256")
      .update(screenshot)
      .digest("hex");
    const evidence = {
      provider: vision.provider,
      detectedLanguages: vision.detectedLanguages,
      textSha256: crypto.createHash("sha256").update(vision.text).digest("hex"),
      screenshotSha256,
      playerIdNormalized: normalizeIdentity(playerId),
      playerIdMatched,
      clanNameMatched,
      profileCueMatched,
      emblemMatched: emblem.matched,
      emblemScore: emblem.score,
      analyzedSize: `${emblem.width}x${emblem.height}`,
    };
    const failures: string[] = [];

    if (!profileCueMatched) failures.push("畫面不像 Warframe 個人簡介");
    if (!playerIdMatched) failures.push(`截圖中的玩家 ID 與「${playerId}」不一致`);
    if (!clanNameMatched) failures.push(`沒有辨識到氏族名稱「${expectedClanName}」`);
    if (!emblem.matched) failures.push("沒有清楚辨識到 KETHER 氏族徽章");

    if (failures.length > 0) {
      const reason = failures.join("、");
      await auditVerification({
        guildId,
        discordUserId: userId,
        discordUsername: displayName,
        playerId,
        clanName: clanNameMatched ? expectedClanName : null,
        masteryRank,
        screenshotAttachmentId: attachment.id,
        status: "rejected",
        reason,
        evidence,
      });

      return rejectedMessage(reason);
    }

    const conflict = await findVerifiedIdentityConflict({
      guildId,
      discordUserId: userId,
      playerId,
      normalizedPlayerId: normalizeIdentity(playerId),
      screenshotSha256,
    });

    if (conflict) {
      const reason = conflict.kind === "player_id"
        ? "這個 Warframe 玩家 ID 已由其他 Discord 成員完成驗證"
        : "這張截圖已由其他 Discord 成員使用過";

      await auditVerification({
        guildId,
        discordUserId: userId,
        discordUsername: displayName,
        playerId,
        clanName: expectedClanName,
        masteryRank,
        screenshotAttachmentId: attachment.id,
        status: "rejected",
        reason,
        evidence,
      });

      return rejectedMessage(reason);
    }

    await assignVerifiedRole(
      guildId,
      userId,
      mortalRole.id,
      angelRole.id,
    );
    await auditVerification({
      guildId,
      discordUserId: userId,
      discordUsername: displayName,
      playerId,
      clanName: expectedClanName,
      masteryRank,
      screenshotAttachmentId: attachment.id,
      status: "verified",
      reason: "玩家 ID、氏族名稱與氏族徽章皆通過自動辨識。",
      evidence,
    });

    return {
      flags: 64,
      embeds: [
        {
          title: "✅ KETHER 氏族驗證通過",
          description:
            "凡人的封印已解除——「天使」身分組已自動授予喵。",
          color: 0xf6a6d8,
          fields: [
            { name: "玩家 ID", value: playerId, inline: true },
            { name: "氏族", value: expectedClanName, inline: true },
            { name: "階位", value: masteryRank ?? "截圖未清楚辨識", inline: true },
          ],
          footer: {
            text: "KETHER 小希 BOT｜自動驗證完成",
          },
          timestamp: new Date().toISOString(),
        },
      ],
      allowed_mentions: { parse: [] },
    };
  } catch (error) {
    console.error("Clan verification failed", error);
    const reason = error instanceof Error ? error.message : "未知錯誤";

    if (guildId && userId) {
      await auditVerification({
        guildId,
        discordUserId: userId,
        discordUsername: displayName,
        playerId: playerId || "未提供",
        screenshotAttachmentId: attachment?.id ?? null,
        status: "error",
        reason,
        evidence: { stage: "exception" },
      });
    }

    return ephemeralMessage(
      `氏族驗證暫時失敗喵。\n${reason}\n\n如果是權限問題，請把小希 BOT 的身分組移到「天使」與「凡人」上方。`,
    );
  }
}
