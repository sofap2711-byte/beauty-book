const { execSync } = require("child_process");

// 1. Generate Prisma Client for the current platform
try {
  execSync("npx prisma generate --schema=./prisma/schema.prisma", { stdio: "inherit" });
} catch (e) {
  console.error("Prisma generate failed:", e.message);
  process.exit(1);
}

// 2. Run migrations using direct connection (POSTGRES_URL)
const migrateUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

try {
  execSync("npx prisma migrate deploy --schema=./prisma/schema.prisma", {
    stdio: "inherit",
    env: { ...process.env, POSTGRES_PRISMA_URL: migrateUrl },
  });
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
}

// 3. Build Next.js app
try {
  execSync("next build", { stdio: "inherit" });
} catch (e) {
  console.error("Build failed:", e.message);
  process.exit(1);
}
