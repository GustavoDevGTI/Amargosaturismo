const path = require("path");

const rootDir = path.resolve(__dirname, "..");

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = {
  port: toNumber(process.env.API_PORT, 3000),
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || "uploads"),
  maxUploadBytes: toNumber(process.env.MAX_UPLOAD_MB, 4) * 1024 * 1024,
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "turimo@123",
    sessionSecret: process.env.ADMIN_SESSION_SECRET || "change-this-admin-session-secret",
    sessionCookieName: process.env.ADMIN_SESSION_COOKIE_NAME || "amargosa_admin_session",
    sessionTtlHours: toNumber(process.env.ADMIN_SESSION_TTL_HOURS, 12),
    cookieSecure: String(process.env.ADMIN_COOKIE_SECURE || "").toLowerCase() === "true"
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    port: toNumber(process.env.DB_PORT, 3306),
    database: process.env.DB_NAME || "amargosaturismo",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || ""
  }
};
