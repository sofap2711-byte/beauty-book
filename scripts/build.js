const { execSync } = require("child_process");

// 1. Generate Prisma Client for the current platform (Linux on Vercel)
try {
  execSync("npx prisma generate --schema=./prisma/schema.prisma", { stdio: "inherit" });
} catch (e) {
  console.error("Prisma generate failed:", e.message);
  process.exit(1);
}

// 2. Build Next.js app
try {
  execSync("next build", { stdio: "inherit" });
} catch (e) {
  console.error("Build failed:", e.message);
  process.exit(1);
}
