import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export default function setup() {
  const root = path.resolve(import.meta.dirname, "../..");
  const dbPath = path.join(root, "admin/internal/data/test.db");
  const databaseUrl = "file:../admin/internal/data/test.db";

  process.env.DATABASE_URL = databaseUrl;

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  execSync("pnpm exec prisma db push --skip-generate --accept-data-loss", {
    cwd: root,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });
}
