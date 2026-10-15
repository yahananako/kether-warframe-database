import { incarnonCatalog } from "./incarnonWeapons";
import { buildIncarnonAcquisition } from "./incarnonAcquisition.shared.mjs";
import type { EquipmentCatalogRow } from "./equipmentCatalog.generated";
import type { WeaponAcquisitionRecord } from "../app/api/discord/data/weapons";

export type IncarnonAcquisitionRow = EquipmentCatalogRow & WeaponAcquisitionRecord & {
  incarnonKind: "genesis" | "natural";
  rotation: number | null;
};

export const INCARNON_WEAPONS = buildIncarnonAcquisition(incarnonCatalog) as IncarnonAcquisitionRow[];
