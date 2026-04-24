const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { runQuery } = require("./db");
const { uploadDir } = require("./config");

const VALID_CATEGORIES = new Set(["gastronomia", "hotel"]);
const VALID_STATUSES = new Set(["pending", "approved", "rejected"]);

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

function withUploadsPrefix(fileName) {
  return `/uploads/${fileName}`;
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
  const rows = await runQuery("SELECT * FROM tourism_submissions WHERE public_id = ? LIMIT 1", [publicId]);
  return rows[0] ? mapRowToRecord(rows[0]) : null;
}

async function createSubmission(input) {
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

function fileNameToUrl(fileName) {
  return withUploadsPrefix(fileName);
}

module.exports = {
  buildSubmissionPayload,
  createSubmission,
  deleteAllSubmissions,
  fileNameToUrl,
  getSubmissionByPublicId,
  listAdminSubmissions,
  listApprovedSubmissions,
  maybeDeleteUpload,
  updateSubmission,
  updateSubmissionStatus
};
