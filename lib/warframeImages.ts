type ExportWarframe = { uniqueName?: string; name?: string };
type ExportImage = { uniqueName?: string; textureLocation?: string };

function firstArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(entry)) return entry as T[];
    }
  }
  return [];
}

function imageUrl(path: string) {
  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "/");
  return `https://content.warframe.com/MobileExport${normalized}`;
}

export async function fetchWarframeImages(): Promise<Record<string, string>> {
  try {
    const [warframesResponse, imagesResponse] = await Promise.all([
      fetch("https://content.warframe.com/MobileExport/Manifest/ExportWarframes.json", { next: { revalidate: 86400 } }),
      fetch("https://content.warframe.com/MobileExport/Manifest/ExportManifest.json", { next: { revalidate: 86400 } }),
    ]);
    if (!warframesResponse.ok || !imagesResponse.ok) return {};
    const warframes = firstArray<ExportWarframe>(await warframesResponse.json());
    const images = firstArray<ExportImage>(await imagesResponse.json());
    const pathByUniqueName = new Map(images.filter((item) => item.uniqueName && item.textureLocation).map((item) => [item.uniqueName!, item.textureLocation!]));
    const result: Record<string, string> = {};
    for (const frame of warframes) {
      if (!frame.name || !frame.uniqueName) continue;
      const texture = pathByUniqueName.get(frame.uniqueName);
      if (texture) result[frame.name.toLowerCase()] = imageUrl(texture);
    }
    return result;
  } catch {
    return {};
  }
}
