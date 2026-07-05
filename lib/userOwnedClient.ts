export type UserOwnedItem = {
  id?: string;
  item_key: string;
  category?: string;
  section?: string;
  owned: boolean;
  updated_at?: string;
  [key: string]: unknown;
};

export type UserOwnedListResponse = {
  ok: boolean;
  authenticated?: boolean;
  message?: string;
  count?: number;
  items?: UserOwnedItem[];
  discordUser?: {
    id: string;
    username: string | null;
    globalName: string | null;
  };
  guild?: {
    id: string;
    discordGuildId: string;
  };
};

export type ToggleUserOwnedInput = {
  itemKey: string;
  category?: string;
  section?: string;
  owned: boolean;
};

export type ToggleUserOwnedResponse = {
  ok: boolean;
  authenticated?: boolean;
  message?: string;
  item?: UserOwnedItem;
  discordUser?: {
    id: string;
    username: string | null;
    globalName: string | null;
  };
  guild?: {
    id: string;
    discordGuildId: string;
  };
};

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  return data as T;
}

export async function fetchUserOwnedItems(): Promise<UserOwnedListResponse> {
  const response = await fetch("/api/user-owned/list", {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });

  return readJson<UserOwnedListResponse>(response);
}

export async function toggleUserOwnedItem(input: ToggleUserOwnedInput): Promise<ToggleUserOwnedResponse> {
  const response = await fetch("/api/user-owned/toggle", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      itemKey: input.itemKey,
      category: input.category ?? "unknown",
      section: input.section ?? "未分類",
      owned: input.owned
    })
  });

  return readJson<ToggleUserOwnedResponse>(response);
}

export function createOwnedItemMap(items: UserOwnedItem[] = []) {
  const ownedMap = new Map<string, boolean>();

  for (const item of items) {
    if (item.item_key) {
      ownedMap.set(item.item_key, Boolean(item.owned));
    }
  }

  return ownedMap;
}

export function isOwnedItem(itemKey: string, ownedMap: Map<string, boolean>) {
  return ownedMap.get(itemKey) === true;
}

export function isUserOwnedAuthenticated(response: UserOwnedListResponse | ToggleUserOwnedResponse) {
  return response.ok === true && response.authenticated === true;
}
