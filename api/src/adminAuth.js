const crypto = require("crypto");

const { admin } = require("./config");

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest();
}

function safeCompare(left, right) {
  const leftHash = hashValue(left);
  const rightHash = hashValue(right);
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function signPayload(payload) {
  return crypto
    .createHmac("sha256", admin.sessionSecret)
    .update(payload, "utf8")
    .digest("base64url");
}

function createSessionToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + (Math.max(admin.sessionTtlHours, 1) * 60 * 60 * 1000)
  }), "utf8").toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

function readSessionToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0) {
    return null;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = signPayload(payload);

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data || data.username !== admin.username || !Number.isFinite(Number(data.expiresAt))) {
      return null;
    }

    if (Number(data.expiresAt) <= Date.now()) {
      return null;
    }

    return {
      username: data.username,
      expiresAt: Number(data.expiresAt)
    };
  } catch (_error) {
    return null;
  }
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((accumulator, entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex <= 0) {
        return accumulator;
      }

      const key = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Number(options.maxAge) || 0)}`);
  }

  parts.push(`Path=${options.path || "/"}`);

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  parts.push(`SameSite=${options.sameSite || "Strict"}`);

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function setSessionCookie(res, username) {
  const token = createSessionToken(username);
  res.append("Set-Cookie", serializeCookie(admin.sessionCookieName, token, {
    httpOnly: true,
    maxAge: Math.max(admin.sessionTtlHours, 1) * 60 * 60,
    path: "/",
    sameSite: "Strict",
    secure: admin.cookieSecure
  }));
}

function clearSessionCookie(res) {
  res.append("Set-Cookie", serializeCookie(admin.sessionCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "Strict",
    secure: admin.cookieSecure
  }));
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  return readSessionToken(cookies[admin.sessionCookieName]);
}

function requireAdminAuth(req, res, next) {
  const session = getSessionFromRequest(req);

  if (!session) {
    clearSessionCookie(res);
    res.status(401).json({
      message: "Sessao admin expirada ou inexistente."
    });
    return;
  }

  req.adminSession = session;
  next();
}

function validateAdminCredentials(username, password) {
  return safeCompare(username, admin.username) && safeCompare(password, admin.password);
}

module.exports = {
  clearSessionCookie,
  getSessionFromRequest,
  requireAdminAuth,
  setSessionCookie,
  validateAdminCredentials
};
