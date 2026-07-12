import { neon } from "@neondatabase/serverless";

export function getNeonSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("缺少 DATABASE_URL，Neon 資料庫尚未連接。");
  }

  return neon(databaseUrl);
}
