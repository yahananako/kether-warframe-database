import crypto from "node:crypto";

import {
  addGiveawayEntry,
  attachGiveawayMessage,
  cancelGiveaway,
  createGiveaway,
  findGiveaway,
  findGiveawayById,
  finishGiveaway,
  listGiveawayEntries,
  replaceGiveawayWinners,
  type GiveawayEntryRow,
  type GiveawayRow,
} from "./clanBotStore";
import {
  discordBotFetch,
  ephemeralMessage,
  getInteractionDisplayName,
  getInteractionUser,
  getInteractionUserId,
} from "./discordApi";

export const GIVEAWAY_JOIN_PREFIX = "kether_giveaway_join:";

const MANAGE_GUILD = 1n << 5n;
const ADMINISTRATOR = 1n << 3n;

type DiscordMessage = {
  id: string;
};

function getNestedCommand(interaction: any) {
  const options = Array.isArray(interaction.data?.options)
    ? interaction.data.options
    : [];
  const subcommand = options.find((option: any) => option.type === 1);

  return {
    name: String(subcommand?.name ?? ""),
    options: Array.isArray(subcommand?.options) ? subcommand.options : [],
  };
}

function getOptionValue(options: any[], name: string) {
  return options.find((option) => option.name === name)?.value;
}

function canManageGiveaways(interaction: any) {
  const rawPermissions = interaction.member?.permissions;

  if (typeof rawPermissions === "string") {
    try {
      const permissions = BigInt(rawPermissions);

      if (
        (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
        (permissions & MANAGE_GUILD) === MANAGE_GUILD
      ) {
        return true;
      }
    } catch {
      // Invalid permission payload falls through to the explicit role allow-list.
    }
  }

  const managerRoleIds = (process.env.DISCORD_GIVEAWAY_MANAGER_ROLE_IDS ?? "")
    .split(",")
    .map((roleId) => roleId.trim())
    .filter(Boolean);
  const memberRoleIds = Array.isArray(interaction.member?.roles)
    ? interaction.member.roles.map(String)
    : [];

  return managerRoleIds.some((roleId) => memberRoleIds.includes(roleId));
}

function buildGiveawayComponents(giveawayId: string) {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1,
          custom_id: `${GIVEAWAY_JOIN_PREFIX}${giveawayId}`,
          label: "參加抽獎",
          emoji: { name: "🎟️" },
        },
      ],
    },
  ];
}

function winnerText(winners: string[]) {
  return winners.length > 0
    ? winners.map((userId) => `<@${userId}>`).join("、")
    : "本次沒有符合資格的參加者";
}

function buildGiveawayMessage(
  giveaway: GiveawayRow,
  entryCount: number,
  winners: string[] | null = null,
) {
  const ended = winners !== null;

  return {
    embeds: [
      {
        title: ended ? "🎉 KETHER 抽獎結果" : "🎁 KETHER 氏族抽獎",
        description: ended
          ? `**獎品：${giveaway.prize}**\n\n中獎者：${winnerText(winners)}`
          : `**獎品：${giveaway.prize}**\n\n按下方按鈕參加，讓命運的星軌替你轉動喵。`,
        color: ended ? 0xf6a6d8 : 0xd6b36a,
        fields: [
          {
            name: "中獎名額",
            value: `${giveaway.winner_count} 名`,
            inline: true,
          },
          {
            name: "參加人數",
            value: `${entryCount} 人`,
            inline: true,
          },
          {
            name: "狀態",
            value: ended ? "已開獎" : "進行中",
            inline: true,
          },
        ],
        footer: {
          text: `抽獎編號：${giveaway.id}`,
        },
        timestamp: ended
          ? giveaway.ended_at ?? new Date().toISOString()
          : giveaway.created_at,
      },
    ],
    components: ended ? [] : buildGiveawayComponents(giveaway.id),
    allowed_mentions: ended
      ? { parse: [], users: winners }
      : { parse: [] },
  };
}

async function editGiveawayMessage(
  giveaway: GiveawayRow,
  entryCount: number,
  winners: string[] | null = null,
) {
  if (!giveaway.message_id) return;

  await discordBotFetch(
    `/channels/${encodeURIComponent(giveaway.channel_id)}/messages/${encodeURIComponent(giveaway.message_id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(buildGiveawayMessage(giveaway, entryCount, winners)),
    },
  );
}

export function pickGiveawayWinners(
  entries: GiveawayEntryRow[],
  winnerCount: number,
  excludedUserIds: string[] = [],
) {
  const excluded = new Set(excludedUserIds);
  let pool = entries.filter((entry) => !excluded.has(entry.user_id));

  if (pool.length < Math.min(winnerCount, entries.length)) {
    pool = [...entries];
  }

  const shuffled = [...pool];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled
    .slice(0, Math.min(winnerCount, shuffled.length))
    .map((entry) => entry.user_id);
}

async function startGiveaway(interaction: any, options: any[]) {
  const guildId = String(interaction.guild_id ?? "");
  const channelId = String(interaction.channel_id ?? "");
  const creatorId = getInteractionUserId(interaction);
  const prize = String(getOptionValue(options, "prize") ?? "").trim();
  const rawWinnerCount = Number(getOptionValue(options, "winner_count") ?? 1);
  const winnerCount = Number.isInteger(rawWinnerCount)
    ? Math.min(10, Math.max(1, rawWinnerCount))
    : 1;

  if (!guildId || !channelId || !creatorId) {
    return ephemeralMessage("抽獎只能在 KETHER 氏族群頻道內建立喵。");
  }

  if (!prize || prize.length > 200) {
    return ephemeralMessage("獎品名稱必須是 1～200 個字元喵。");
  }

  const giveawayId = crypto.randomUUID().split("-")[0];
  let giveaway: GiveawayRow | null = null;

  try {
    giveaway = await createGiveaway({
      id: giveawayId,
      guildId,
      channelId,
      prize,
      winnerCount,
      createdBy: creatorId,
    });

    const message = await discordBotFetch<DiscordMessage>(
      `/channels/${encodeURIComponent(channelId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify(buildGiveawayMessage(giveaway, 0)),
      },
    );

    await attachGiveawayMessage(giveaway.id, message.id);

    return ephemeralMessage(
      `抽獎已開始喵！\n獎品：${prize}\n名額：${winnerCount} 名\n抽獎編號：\`${giveaway.id}\``,
    );
  } catch (error) {
    if (giveaway) {
      await cancelGiveaway(giveaway.id).catch(() => undefined);
    }

    const message = error instanceof Error ? error.message : String(error);

    if (/unique|duplicate|discord_giveaways_one_active/i.test(message)) {
      return ephemeralMessage("這個頻道已經有一場進行中的抽獎，請先使用 `/抽獎 結束` 喵。");
    }

    console.error("Start giveaway failed", error);
    return ephemeralMessage("抽獎建立失敗喵，請確認 BOT 有傳送訊息權限，並稍後再試一次。");
  }
}

async function endGiveaway(interaction: any, options: any[]) {
  const guildId = String(interaction.guild_id ?? "");
  const channelId = String(interaction.channel_id ?? "");
  const giveawayId = String(getOptionValue(options, "giveaway_id") ?? "").trim();
  const giveaway = await findGiveaway({
    guildId,
    channelId,
    giveawayId,
    status: "active",
  });

  if (!giveaway) {
    return ephemeralMessage("找不到進行中的抽獎喵；可填入開始時顯示的抽獎編號。");
  }

  const entries = await listGiveawayEntries(giveaway.id);
  const winners = pickGiveawayWinners(entries, giveaway.winner_count);
  const finished = await finishGiveaway(giveaway.id, winners);

  if (!finished) {
    return ephemeralMessage("這場抽獎已經由其他管理員開獎了喵。");
  }

  await editGiveawayMessage(finished, entries.length, winners);

  return ephemeralMessage(
    winners.length > 0
      ? `抽獎完成喵！中獎者：${winnerText(winners)}`
      : "抽獎已結束，但目前沒有人參加喵。",
  );
}

async function rerollGiveaway(interaction: any, options: any[]) {
  const guildId = String(interaction.guild_id ?? "");
  const channelId = String(interaction.channel_id ?? "");
  const giveawayId = String(getOptionValue(options, "giveaway_id") ?? "").trim();
  const giveaway = await findGiveaway({
    guildId,
    channelId,
    giveawayId,
    status: "ended",
  });

  if (!giveaway) {
    return ephemeralMessage("找不到已結束的抽獎，請填入抽獎編號喵。");
  }

  const entries = await listGiveawayEntries(giveaway.id);
  const previousWinners = Array.isArray(giveaway.winners) ? giveaway.winners : [];
  const winners = pickGiveawayWinners(
    entries,
    giveaway.winner_count,
    previousWinners,
  );
  const updated = await replaceGiveawayWinners(giveaway.id, winners);

  if (!updated) {
    return ephemeralMessage("重新抽獎失敗，請稍後再試喵。");
  }

  await editGiveawayMessage(updated, entries.length, winners);

  return ephemeralMessage(
    winners.length > 0
      ? `已重新抽選，中獎者：${winnerText(winners)}`
      : "這場抽獎沒有參加者，無法重新抽選喵。",
  );
}

export async function handleGiveawayCommand(interaction: any) {
  if (!canManageGiveaways(interaction)) {
    return ephemeralMessage("只有具備「管理伺服器」權限或抽獎管理身分組的成員能操作抽獎喵。");
  }

  const command = getNestedCommand(interaction);

  if (command.name === "start") {
    return startGiveaway(interaction, command.options);
  }

  if (command.name === "end") {
    return endGiveaway(interaction, command.options);
  }

  if (command.name === "reroll") {
    return rerollGiveaway(interaction, command.options);
  }

  return ephemeralMessage("請選擇開始、結束或重新抽獎喵。");
}

export function isGiveawayComponent(interaction: any) {
  return String(interaction.data?.custom_id ?? "").startsWith(
    GIVEAWAY_JOIN_PREFIX,
  );
}

export async function handleGiveawayComponent(interaction: any) {
  const customId = String(interaction.data?.custom_id ?? "");
  const giveawayId = customId.slice(GIVEAWAY_JOIN_PREFIX.length);
  const guildId = String(interaction.guild_id ?? "");
  const userId = getInteractionUserId(interaction);
  const user = getInteractionUser(interaction);

  if (!giveawayId || !guildId || !userId || user?.bot === true) {
    return ephemeralMessage("這張抽獎券無效喵。");
  }

  const giveaway = await findGiveawayById(giveawayId, guildId);

  if (!giveaway || giveaway.status !== "active") {
    return ephemeralMessage("這場抽獎已經結束了喵。");
  }

  const result = await addGiveawayEntry({
    giveawayId,
    userId,
    displayName: getInteractionDisplayName(interaction),
  });

  if (!result.active) {
    return ephemeralMessage("這場抽獎剛剛已經結束了喵。");
  }

  const messageId = String(interaction.message?.id ?? "");

  if (!giveaway.message_id && messageId) {
    giveaway.message_id = messageId;
    await attachGiveawayMessage(giveaway.id, messageId);
  }

  await editGiveawayMessage(giveaway, result.count).catch((error) => {
    console.error("Refresh giveaway message failed", error);
  });

  return ephemeralMessage(
    result.joined
      ? `抽獎券已收下，現在共有 ${result.count} 人參加喵！`
      : `你已經參加過了，目前共有 ${result.count} 人喵。`,
  );
}
