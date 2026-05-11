const { execSync } = require("child_process");

if (process.env.MIGRATE_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.MIGRATE_DATABASE_URL;
}

try {
  execSync("npx prisma migrate deploy --schema=./prisma/schema.prisma", { stdio: "inherit" });
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
}

try {
  execSync("next build", { stdio: "inherit" });
} catch (e) {
  console.error("Build failed:", e.message);
  process.exit(1);
}
