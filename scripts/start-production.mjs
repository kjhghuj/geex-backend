import { spawn } from "node:child_process";

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || "9030";

const flag = (name) => (process.env[name] ? "set" : "missing");

console.log(`[start] HOST=${host}`);
console.log(`[start] PORT=${port}`);
console.log(`[start] DATABASE_URL=${flag("DATABASE_URL")}`);
console.log(`[start] REDIS_URL=${flag("REDIS_URL")}`);
console.log(`[start] JWT_SECRET=${flag("JWT_SECRET")}`);
console.log(`[start] COOKIE_SECRET=${flag("COOKIE_SECRET")}`);
console.log(`[start] STRIPE_API_KEY=${flag("STRIPE_API_KEY")}`);

const child = spawn(
  "npx",
  ["medusa", "start", "--host", host, "--port", port],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[start] Medusa exited by signal ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});
