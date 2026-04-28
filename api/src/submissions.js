const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { runQuery, getPool } = require("./db");
const { uploadDir } = require("./config");

const VALID_CATEGORIES = new Set(["gastronomia", "hotel"]);
const VALID_STATUSES = new Set(["pending", "approved", "rejected"]);

let ensureSubmissionsPromise = null;

function normalizeLine(value) {
  return String(value || "").trim();
}

function digitsOnly(value) {
  return normalizeLine(value).replace(/\D/g, "");
}

function normalizeCategory(value) {
  const category = normalizeLine(value);
  return VALID_CATEGORIES.has(category) ? category : "";
}

function normalizeStatus(value, fallback = "pending") {
  const status = normalizeLine(value);
  return VALID_STATUSES.has(status) ? status : fallback;
}

function normalizeInstagram(value) {
  const raw = normalizeLine(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const clean = raw.replace(/^@/, "").replace(/^\//, "");
  return clean ? `https://www.instagram.com/${clean}/` : "";
}

function normalizeWhatsapp(value) {
  const raw = normalizeLine(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = digitsOnly(raw);
  return digits ? `https://wa.me/${digits}` : "";
}

function normalizePhone(value) {
  return normalizeLine(value);
}

function buildPhoneUrl(value) {
  const digits = digitsOnly(value);
  return digits ? `tel:+${digits}` : "";
}

function toSlug(value) {
  return normalizeLine(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildDirectionsUrl(query) {
  return query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : "";
}

function buildGastronomyScheduleLine(daysLine, hoursLine) {
  return [normalizeLine(daysLine), normalizeLine(hoursLine)].filter(Boolean).join(", ");
}

function serializeDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function mapRowToRecord(row) {
  const contacts = {
    instagram: normalizeLine(row.instagram_url),
    whatsapp: normalizeLine(row.whatsapp_url),
    email: normalizeLine(row.email),
    phone: normalizeLine(row.phone),
    phoneUrl: normalizeLine(row.phone_url)
  };

  const guide = {
    daysLine: normalizeLine(row.days_line),
    subtitle: normalizeLine(row.subtitle),
    description: normalizeLine(row.category === "hotel"
      ? [normalizeLine(row.service_line), normalizeLine(row.description)].filter(Boolean).join(". ")
      : row.description),
    hoursLine: normalizeLine(row.hours_line),
    addressLine: normalizeLine(row.address_line),
    statusLine: normalizeLine(row.status_line),
    serviceLine: normalizeLine(row.service_line),
    mapQuery: normalizeLine(row.map_query),
    directionsUrl: normalizeLine(row.directions_url),
    popupTitleColor: normalizeLine(row.popup_title_color),
    coords: row.latitude != null && row.longitude != null
      ? { lat: Number(row.latitude), lng: Number(row.longitude) }
      : null
  };

  const metaLines = row.category === "gastronomia"
    ? [buildGastronomyScheduleLine(row.days_line, row.hours_line), row.address_line].filter(Boolean)
    : [row.address_line, row.email || "E-mail nao informado", row.phone].filter(Boolean);

  return {
    id: row.public_id,
    createdAt: serializeDate(row.created_at),
    updatedAt: serializeDate(row.updated_at),
    approvalStatus: normalizeStatus(row.approval_status, "pending"),
    approvalUpdatedAt: serializeDate(row.approval_updated_at),
    category: normalizeCategory(row.category),
    pointId: normalizeLine(row.point_id),
    mapFocus: normalizeLine(row.map_focus),
    name: normalizeLine(row.name),
    cnpj: normalizeLine(row.cnpj),
    description: normalizeLine(row.description),
    photoSrc: normalizeLine(row.photo_url),
    metaLines,
    contacts,
    guide
  };
}

function validatePayload(payload, mode = "create") {
  const category = normalizeCategory(payload.category);
  const name = normalizeLine(payload.name);
  const description = normalizeLine(payload.description);
  const addressLine = normalizeLine(payload.addressLine);

  if (!category) {
    return "Categoria invalida.";
  }

  if (!name) {
    return "Nome do estabelecimento e obrigatorio.";
  }

  if (!description) {
    return "Descricao obrigatoria.";
  }

  if (!addressLine) {
    return "Endereco completo obrigatorio.";
  }

  if (mode === "create" && !payload.photoUrl) {
    return "Foto obrigatoria.";
  }

  if (category === "gastronomia") {
    if (!normalizeLine(payload.daysLine)) {
      return "Dia de funcionamento obrigatorio para gastronomia.";
    }

    if (!normalizeLine(payload.hoursLine)) {
      return "Horario obrigatorio para gastronomia.";
    }
  }

  if (category === "hotel" && !normalizeLine(payload.statusLine)) {
    return "Funcionamento da hospedagem obrigatorio para hotel/pousada.";
  }

  return "";
}

function buildSubmissionPayload(input, previousRecord = null) {
  const category = normalizeCategory(input.category || previousRecord?.category);
  const name = normalizeLine(input.name || previousRecord?.name);
  const slug = toSlug(name) || `${Date.now()}`;
  const pointId = normalizeLine(input.pointId || previousRecord?.pointId)
    || `${category === "gastronomia" ? "gas" : "hotel"}-${slug}`;
  const addressLine = normalizeLine(input.addressLine || previousRecord?.guide?.addressLine);
  const mapQuery = normalizeLine(input.mapQuery || previousRecord?.guide?.mapQuery)
    || [name, addressLine, "Amargosa, Bahia, Brasil"].filter(Boolean).join(", ");
  const phone = normalizePhone(input.phone || previousRecord?.contacts?.phone);

  return {
    publicId: normalizeLine(input.id || previousRecord?.id) || `cad-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    approvalStatus: normalizeStatus(input.approvalStatus, previousRecord?.approvalStatus || "pending"),
    category,
    pointId,
    mapFocus: normalizeLine(input.mapFocus || previousRecord?.mapFocus) || pointId,
    name,
    cnpj: normalizeLine(input.cnpj || previousRecord?.cnpj),
    description: normalizeLine(input.description || previousRecord?.description),
    photoUrl: normalizeLine(input.photoUrl || previousRecord?.photoSrc),
    instagramUrl: normalizeInstagram(input.instagram || previousRecord?.contacts?.instagram),
    whatsappUrl: normalizeWhatsapp(input.whatsapp || previousRecord?.contacts?.whatsapp),
    email: normalizeLine(input.email || previousRecord?.contacts?.email),
    phone,
    phoneUrl: buildPhoneUrl(phone),
    addressLine,
    daysLine: normalizeLine(input.daysLine || previousRecord?.guide?.daysLine),
    hoursLine: normalizeLine(input.hoursLine || previousRecord?.guide?.hoursLine),
    subtitle: normalizeLine(input.subtitle || previousRecord?.guide?.subtitle),
    statusLine: normalizeLine(input.statusLine || previousRecord?.guide?.statusLine),
    serviceLine: normalizeLine(input.serviceLine || previousRecord?.guide?.serviceLine),
    mapQuery,
    directionsUrl: normalizeLine(input.directionsUrl || previousRecord?.guide?.directionsUrl) || buildDirectionsUrl(mapQuery),
    popupTitleColor: normalizeLine(input.popupTitleColor || previousRecord?.guide?.popupTitleColor)
      || (category === "hotel" ? "#3568c9" : "#c9642b"),
    latitude: input.latitude != null && input.latitude !== "" ? Number(input.latitude) : previousRecord?.guide?.coords?.lat ?? null,
    longitude: input.longitude != null && input.longitude !== "" ? Number(input.longitude) : previousRecord?.guide?.coords?.lng ?? null
  };
}

async function listAdminSubmissions(filters = {}) {
  await ensureSubmissionsReady();

  const params = [];
  const conditions = [];

  if (normalizeStatus(filters.status, "") && filters.status !== "todos") {
    conditions.push("approval_status = ?");
    params.push(filters.status);
  }

  if (normalizeCategory(filters.category) && filters.category !== "todos") {
    conditions.push("category = ?");
    params.push(filters.category);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await runQuery(
    `SELECT * FROM tourism_submissions ${whereClause} ORDER BY updated_at DESC, id DESC`,
    params
  );

  return rows.map(mapRowToRecord);
}

async function listApprovedSubmissions(filters = {}) {
  await ensureSubmissionsReady();

  const params = ["approved"];
  const conditions = ["approval_status = ?"];

  if (normalizeCategory(filters.category)) {
    conditions.push("category = ?");
    params.push(filters.category);
  }

  const rows = await runQuery(
    `SELECT * FROM tourism_submissions WHERE ${conditions.join(" AND ")} ORDER BY updated_at DESC, id DESC`,
    params
  );

  return rows.map(mapRowToRecord);
}

async function getSubmissionByPublicId(publicId) {
  await ensureSubmissionsReady();

  const rows = await runQuery("SELECT * FROM tourism_submissions WHERE public_id = ? LIMIT 1", [publicId]);
  return rows[0] ? mapRowToRecord(rows[0]) : null;
}

async function createSubmission(input) {
  await ensureSubmissionsReady();

  const payload = buildSubmissionPayload(input);
  const error = validatePayload(payload, "create");

  if (error) {
    const validationError = new Error(error);
    validationError.statusCode = 400;
    throw validationError;
  }

  await runQuery(
    `INSERT INTO tourism_submissions (
      public_id, approval_status, category, point_id, map_focus, name, cnpj, description, photo_url,
      instagram_url, whatsapp_url, email, phone, phone_url, address_line, days_line, hours_line, subtitle,
      status_line, service_line, map_query, directions_url, popup_title_color, latitude, longitude,
      approval_updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      payload.publicId,
      payload.approvalStatus,
      payload.category,
      payload.pointId,
      payload.mapFocus,
      payload.name,
      payload.cnpj,
      payload.description,
      payload.photoUrl,
      payload.instagramUrl,
      payload.whatsappUrl,
      payload.email,
      payload.phone,
      payload.phoneUrl,
      payload.addressLine,
      payload.daysLine,
      payload.hoursLine,
      payload.subtitle,
      payload.statusLine,
      payload.serviceLine,
      payload.mapQuery,
      payload.directionsUrl,
      payload.popupTitleColor,
      payload.latitude,
      payload.longitude
    ]
  );

  return getSubmissionByPublicId(payload.publicId);
}

async function updateSubmission(publicId, input) {
  const currentRecord = await getSubmissionByPublicId(publicId);

  if (!currentRecord) {
    const error = new Error("Cadastro nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const payload = buildSubmissionPayload({ ...input, id: publicId }, currentRecord);
  const validationError = validatePayload(payload, "update");

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  await runQuery(
    `UPDATE tourism_submissions
      SET category = ?, point_id = ?, map_focus = ?, name = ?, cnpj = ?, description = ?, photo_url = ?,
          instagram_url = ?, whatsapp_url = ?, email = ?, phone = ?, phone_url = ?, address_line = ?,
          days_line = ?, hours_line = ?, subtitle = ?, status_line = ?, service_line = ?, map_query = ?,
          directions_url = ?, popup_title_color = ?, latitude = ?, longitude = ?, updated_at = NOW()
      WHERE public_id = ?`,
    [
      payload.category,
      payload.pointId,
      payload.mapFocus,
      payload.name,
      payload.cnpj,
      payload.description,
      payload.photoUrl,
      payload.instagramUrl,
      payload.whatsappUrl,
      payload.email,
      payload.phone,
      payload.phoneUrl,
      payload.addressLine,
      payload.daysLine,
      payload.hoursLine,
      payload.subtitle,
      payload.statusLine,
      payload.serviceLine,
      payload.mapQuery,
      payload.directionsUrl,
      payload.popupTitleColor,
      payload.latitude,
      payload.longitude,
      publicId
    ]
  );

  return getSubmissionByPublicId(publicId);
}

async function updateSubmissionStatus(publicId, nextStatus) {
  const status = normalizeStatus(nextStatus, "");
  if (!status) {
    const error = new Error("Status invalido.");
    error.statusCode = 400;
    throw error;
  }

  const currentRecord = await getSubmissionByPublicId(publicId);

  if (!currentRecord) {
    const error = new Error("Cadastro nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await runQuery(
    `UPDATE tourism_submissions
      SET approval_status = ?, approval_updated_at = NOW(), updated_at = NOW()
      WHERE public_id = ?`,
    [status, publicId]
  );

  return getSubmissionByPublicId(publicId);
}

async function deleteAllSubmissions() {
  await ensureSubmissionsReady();

  const rows = await runQuery("SELECT photo_url FROM tourism_submissions");
  await runQuery("DELETE FROM tourism_submissions");
  await Promise.all(rows.map((row) => maybeDeleteUpload(row.photo_url)));
  return rows.length;
}

async function maybeDeleteUpload(photoUrl) {
  const normalized = normalizeLine(photoUrl);
  if (!normalized.startsWith("/uploads/")) {
    return;
  }

  const fileName = normalized.slice("/uploads/".length);
  if (!fileName) {
    return;
  }

  const filePath = path.join(uploadDir, fileName);
  try {
    await fs.unlink(filePath);
  } catch (_) {
    // ignore missing files during cleanup
  }
}

async function ensureSubmissionTable() {
  await runQuery(
    `CREATE TABLE IF NOT EXISTS tourism_submissions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      public_id VARCHAR(64) NOT NULL,
      approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      category ENUM('gastronomia', 'hotel') NOT NULL,
      point_id VARCHAR(128) NOT NULL,
      map_focus VARCHAR(128) NOT NULL,
      name VARCHAR(255) NOT NULL,
      cnpj VARCHAR(32) NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      photo_url LONGTEXT NOT NULL,
      instagram_url VARCHAR(500) NOT NULL DEFAULT '',
      whatsapp_url VARCHAR(500) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      phone VARCHAR(64) NOT NULL DEFAULT '',
      phone_url VARCHAR(255) NOT NULL DEFAULT '',
      address_line VARCHAR(255) NOT NULL,
      days_line VARCHAR(255) NOT NULL DEFAULT '',
      hours_line VARCHAR(255) NOT NULL DEFAULT '',
      subtitle VARCHAR(255) NOT NULL DEFAULT '',
      status_line VARCHAR(255) NOT NULL DEFAULT '',
      service_line VARCHAR(255) NOT NULL DEFAULT '',
      map_query VARCHAR(500) NOT NULL DEFAULT '',
      directions_url VARCHAR(500) NOT NULL DEFAULT '',
      popup_title_color VARCHAR(32) NOT NULL DEFAULT '',
      latitude DECIMAL(10, 8) NULL,
      longitude DECIMAL(11, 8) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      approval_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_tourism_submissions_public_id (public_id),
      KEY idx_tourism_submissions_status (approval_status),
      KEY idx_tourism_submissions_category (category),
      KEY idx_tourism_submissions_point (point_id)
    )`
  );
}

async function ensureTableColumn(columnName, definition) {
  const [rows] = await getPool().query(
    `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tourism_submissions'
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [columnName]
  );

  if (!rows.length) {
    await runQuery(`ALTER TABLE tourism_submissions ADD COLUMN ${definition}`);
  }
}

async function ensureTableColumnType(columnName, expectedDataType, alterStatement) {
  const [rows] = await getPool().query(
    `SELECT DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tourism_submissions'
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [columnName]
  );

  if (rows[0]?.DATA_TYPE && rows[0].DATA_TYPE.toLowerCase() !== expectedDataType) {
    await runQuery(alterStatement);
  }
}

async function ensureSubmissionSchema() {
  await ensureSubmissionTable();
  await ensureTableColumnType("photo_url", "longtext", "ALTER TABLE tourism_submissions MODIFY COLUMN photo_url LONGTEXT NOT NULL");
  await ensureTableColumn("latitude", "latitude DECIMAL(10, 8) NULL AFTER popup_title_color");
  await ensureTableColumn("longitude", "longitude DECIMAL(11, 8) NULL AFTER latitude");
  await ensureTableColumn("approval_updated_at", "approval_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER updated_at");
}

async function ensureSubmissionsReady() {
  if (!ensureSubmissionsPromise) {
    ensureSubmissionsPromise = ensureSubmissionSchema().catch((error) => {
      ensureSubmissionsPromise = null;
      throw error;
    });
  }

  return ensureSubmissionsPromise;
}

module.exports = {
  buildSubmissionPayload,
  createSubmission,
  deleteAllSubmissions,
  getSubmissionByPublicId,
  ensureSubmissionsReady,
  listAdminSubmissions,
  listApprovedSubmissions,
  maybeDeleteUpload,
  updateSubmission,
  updateSubmissionStatus
};
