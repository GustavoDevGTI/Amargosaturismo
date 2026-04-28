const crypto = require("crypto");
const { runQuery, getPool } = require("./db");
const cardSeeds = require("./cardSeeds");
const { listApprovedSubmissions } = require("./submissions");

const VALID_CARD_CATEGORIES = new Set(["turistico", "gastronomia", "hotel"]);
const VALID_MARKER_ICONS = new Set(["attraction", "heritage", "gastronomy", "lodging"]);
const MAX_CARD_DESCRIPTION_LENGTH = 280;

let ensureCardsPromise = null;

function normalizeLine(value) {
  return String(value || "").trim();
}

function normalizeDescription(value) {
  return normalizeLine(value).slice(0, MAX_CARD_DESCRIPTION_LENGTH);
}

function pickInputValue(input, key, fallback = "") {
  if (!Object.prototype.hasOwnProperty.call(input, key)) {
    return fallback;
  }

  return input[key] === undefined ? fallback : input[key];
}

function normalizeMediaUrl(value) {
  const normalized = normalizeLine(value);

  if (!normalized || /^(?:https?:|data:|blob:|\/)/i.test(normalized)) {
    return normalized;
  }

  return `/${normalized.replace(/^\.?\//, "")}`;
}

function digitsOnly(value) {
  return normalizeLine(value).replace(/\D/g, "");
}

function normalizeWhatsapp(value) {
  const raw = normalizeLine(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = digitsOnly(raw);
  return digits ? `https://wa.me/${digits}` : "";
}

function normalizeCategory(value) {
  const category = normalizeLine(value);
  return VALID_CARD_CATEGORIES.has(category) ? category : "";
}

function defaultMarkerIconForCategory(category) {
  if (category === "gastronomia") {
    return "gastronomy";
  }

  if (category === "hotel") {
    return "lodging";
  }

  return "attraction";
}

function normalizeMarkerIcon(value, category = "") {
  const normalized = normalizeLine(value).toLowerCase();
  return VALID_MARKER_ICONS.has(normalized) ? normalized : defaultMarkerIconForCategory(category);
}

function buildPhoneUrl(value) {
  const digits = digitsOnly(value);
  return digits ? `tel:+${digits}` : "";
}

function buildDirectionsUrlFromCoordinates(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "";
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPositiveInteger(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNullableNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeComparable(value) {
  return normalizeLine(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeEmail(value) {
  const email = normalizeLine(value);
  const comparable = normalizeComparable(email);

  if (comparable === "e-mail nao informado" || comparable === "email nao informado") {
    return "";
  }

  return email;
}

function normalizeBool(value, fallback = true) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = normalizeLine(value).toLowerCase();
  if (!normalized) {
    return fallback;
  }

  return ["1", "true", "on", "yes", "sim"].includes(normalized);
}

function toSlug(value) {
  return normalizeLine(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shortHash(value) {
  return crypto.createHash("sha1").update(normalizeLine(value)).digest("hex").slice(0, 10);
}

function buildPromotedPublicId(submissionId) {
  const normalized = normalizeLine(submissionId);
  const preferred = `card-${normalized}`;
  return preferred.length <= 64 ? preferred : `card-${shortHash(normalized)}`;
}

function buildScheduleLineFromSubmission(record) {
  const guide = record.guide || {};

  if (record.category === "gastronomia") {
    return [guide.daysLine, guide.hoursLine].map(normalizeLine).filter(Boolean).join(", ");
  }

  return normalizeLine(guide.statusLine);
}

function buildDescriptionFromSubmission(record) {
  const guide = record.guide || {};
  return normalizeDescription(guide.description || record.description);
}

function buildCardPayloadFromSubmission(record) {
  const category = normalizeCategory(record.category);
  const guide = record.guide || {};
  const contacts = record.contacts || {};
  const coords = guide.coords || {};
  const latitude = toNullableNumber(coords.lat);
  const longitude = toNullableNumber(coords.lng);
  const name = normalizeLine(record.name);
  const pointPrefix = category === "hotel" ? "hotel" : "gas";
  const fallbackPointId = `${pointPrefix}-${toSlug(name) || shortHash(record.id)}`;

  return {
    publicId: buildPromotedPublicId(record.id),
    pointId: normalizeLine(record.pointId || record.mapFocus) || fallbackPointId,
    category,
    name,
    subtitle: category === "hotel"
      ? normalizeLine(guide.statusLine || guide.subtitle || guide.serviceLine)
      : normalizeLine(guide.subtitle),
    description: buildDescriptionFromSubmission(record),
    photoUrl: normalizeMediaUrl(record.photoSrc),
    imageAlt: name,
    addressLine: normalizeLine(guide.addressLine),
    scheduleLine: buildScheduleLineFromSubmission(record),
    instagramUrl: normalizeLine(contacts.instagram),
    whatsappUrl: normalizeWhatsapp(contacts.whatsapp),
    email: normalizeEmail(contacts.email),
    phone: normalizeLine(contacts.phone),
    latitude,
    longitude,
    directionsUrl: normalizeLine(guide.directionsUrl) || buildDirectionsUrlFromCoordinates(latitude, longitude),
    markerIcon: normalizeMarkerIcon("", category),
    hasWifi: false,
    isActive: true
  };
}

function mapRowToCard(row) {
  const category = normalizeCategory(row.category);
  const email = normalizeEmail(row.email);
  const phone = normalizeLine(row.phone);
  const latitude = toNullableNumber(row.latitude);
  const longitude = toNullableNumber(row.longitude);
  const directionsUrl = normalizeLine(row.directions_url) || buildDirectionsUrlFromCoordinates(latitude, longitude);

  return {
    id: normalizeLine(row.public_id),
    pointId: normalizeLine(row.point_id),
    category,
    name: normalizeLine(row.name),
    subtitle: normalizeLine(row.subtitle),
    description: normalizeDescription(row.description),
    photoSrc: normalizeMediaUrl(row.image_url),
    imageAlt: normalizeLine(row.image_alt) || normalizeLine(row.name),
    addressLine: normalizeLine(row.address_line),
    scheduleLine: normalizeLine(row.schedule_line),
    displayOrder: toNumber(row.display_order, 0),
    isActive: Boolean(row.is_active),
    latitude,
    longitude,
    directionsUrl,
    markerIcon: normalizeMarkerIcon(row.marker_icon, category),
    hasWifi: normalizeBool(row.has_wifi, false),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : normalizeLine(row.updated_at),
    contacts: {
      instagram: normalizeLine(row.instagram_url),
      whatsapp: normalizeLine(row.whatsapp_url),
      email,
      phone,
      phoneUrl: buildPhoneUrl(phone)
    }
  };
}

async function ensureCardTable() {
  await runQuery(
    `CREATE TABLE IF NOT EXISTS tourism_cards (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      public_id VARCHAR(64) NOT NULL,
      point_id VARCHAR(128) NOT NULL,
      category ENUM('turistico', 'gastronomia', 'hotel') NOT NULL,
      name VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      image_url LONGTEXT NOT NULL,
      image_alt VARCHAR(255) NOT NULL DEFAULT '',
      address_line VARCHAR(255) NOT NULL DEFAULT '',
      schedule_line VARCHAR(255) NOT NULL DEFAULT '',
      instagram_url VARCHAR(500) NOT NULL DEFAULT '',
      whatsapp_url VARCHAR(500) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      phone VARCHAR(64) NOT NULL DEFAULT '',
      latitude DECIMAL(10, 8) NULL,
      longitude DECIMAL(11, 8) NULL,
      directions_url VARCHAR(500) NOT NULL DEFAULT '',
      marker_icon ENUM('attraction', 'heritage', 'gastronomy', 'lodging') NOT NULL DEFAULT 'attraction',
      has_wifi TINYINT(1) NOT NULL DEFAULT 0,
      display_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_tourism_cards_public_id (public_id),
      UNIQUE KEY uk_tourism_cards_point_id (point_id),
      KEY idx_tourism_cards_category (category),
      KEY idx_tourism_cards_active_order (is_active, display_order)
    )`
  );
}

async function ensureTableColumn(columnName, definition) {
  const [rows] = await getPool().query(
    `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tourism_cards'
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [columnName]
  );
  if (!rows.length) {
    await runQuery(`ALTER TABLE tourism_cards ADD COLUMN ${definition}`);
  }
}

async function ensureTableColumnType(columnName, expectedDataType, alterStatement) {
  const [rows] = await getPool().query(
    `SELECT DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'tourism_cards'
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [columnName]
  );

  if (rows[0]?.DATA_TYPE && rows[0].DATA_TYPE.toLowerCase() !== expectedDataType) {
    await runQuery(alterStatement);
  }
}

async function ensureCardSchema() {
  await ensureCardTable();
  await ensureTableColumnType("image_url", "longtext", "ALTER TABLE tourism_cards MODIFY COLUMN image_url LONGTEXT NOT NULL");
  await ensureTableColumn("latitude", "latitude DECIMAL(10, 8) NULL AFTER phone");
  await ensureTableColumn("longitude", "longitude DECIMAL(11, 8) NULL AFTER latitude");
  await ensureTableColumn("directions_url", "directions_url VARCHAR(500) NOT NULL DEFAULT '' AFTER longitude");
  await ensureTableColumn("marker_icon", "marker_icon ENUM('attraction', 'heritage', 'gastronomy', 'lodging') NOT NULL DEFAULT 'attraction' AFTER directions_url");
  await ensureTableColumn("has_wifi", "has_wifi TINYINT(1) NOT NULL DEFAULT 0 AFTER marker_icon");
}

async function seedCardsIfEmpty() {
  const countRows = await runQuery("SELECT COUNT(*) AS total FROM tourism_cards");
  const total = toNumber(countRows[0]?.total, 0);

  if (total > 0) {
    return;
  }

  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    for (const card of cardSeeds) {
      const category = normalizeCategory(card.category);
      await connection.execute(
        `INSERT INTO tourism_cards (
          public_id, point_id, category, name, subtitle, description, image_url, image_alt,
          address_line, schedule_line, instagram_url, whatsapp_url, email, phone,
          latitude, longitude, directions_url, marker_icon, has_wifi, display_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          normalizeLine(card.publicId),
          normalizeLine(card.pointId),
          category,
          normalizeLine(card.name),
          normalizeLine(card.subtitle),
          normalizeDescription(card.description),
          normalizeLine(card.imageUrl),
          normalizeLine(card.imageAlt || card.name),
          normalizeLine(card.addressLine),
          normalizeLine(card.scheduleLine),
          normalizeLine(card.instagramUrl),
          normalizeLine(card.whatsappUrl),
          normalizeEmail(card.email),
          normalizeLine(card.phone),
          toNullableNumber(card.latitude),
          toNullableNumber(card.longitude),
          normalizeLine(card.directionsUrl),
          normalizeMarkerIcon(card.markerIcon, category),
          normalizeBool(card.hasWifi, false) ? 1 : 0,
          toNumber(card.displayOrder, 0),
          normalizeBool(card.isActive, true) ? 1 : 0
        ]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function backfillSeedMapMetadata() {
  for (const card of cardSeeds) {
    const category = normalizeCategory(card.category);
    await runQuery(
      `UPDATE tourism_cards
        SET latitude = COALESCE(latitude, ?),
            longitude = COALESCE(longitude, ?),
            directions_url = CASE WHEN directions_url IS NULL OR directions_url = '' THEN ? ELSE directions_url END,
            marker_icon = CASE WHEN marker_icon IS NULL OR marker_icon = '' THEN ? ELSE marker_icon END,
            has_wifi = CASE WHEN ? = 1 THEN 1 ELSE has_wifi END
        WHERE public_id = ? OR point_id = ?`,
      [
        toNullableNumber(card.latitude),
        toNullableNumber(card.longitude),
        normalizeLine(card.directionsUrl),
        normalizeMarkerIcon(card.markerIcon, category),
        normalizeBool(card.hasWifi, false) ? 1 : 0,
        normalizeLine(card.publicId),
        normalizeLine(card.pointId)
      ]
    );
  }
}

async function ensureCardsSeeded() {
  if (!ensureCardsPromise) {
    ensureCardsPromise = (async () => {
      await ensureCardSchema();
      await seedCardsIfEmpty();
      await backfillSeedMapMetadata();
    })();
  }

  return ensureCardsPromise;
}

async function resolvePromotedPointId(connection, requestedPointId, publicId) {
  const basePointId = normalizeLine(requestedPointId) || `card-${shortHash(publicId)}`;
  let candidate = basePointId;
  let attempt = 0;

  while (attempt < 10) {
    const [rows] = await connection.execute(
      "SELECT public_id FROM tourism_cards WHERE point_id = ? LIMIT 1",
      [candidate]
    );

    if (!rows.length || rows[0].public_id === publicId) {
      return candidate;
    }

    attempt += 1;
    const suffix = attempt === 1 ? shortHash(publicId) : `${shortHash(publicId)}-${attempt}`;
    candidate = `${basePointId.slice(0, Math.max(1, 127 - suffix.length))}-${suffix}`;
  }

  return `card-${shortHash(`${publicId}-${Date.now()}`)}`;
}

async function getCategoryInsertionOrder(connection, category) {
  const [rows] = await connection.execute(
    `SELECT id, category, display_order
       FROM tourism_cards
      ORDER BY display_order ASC, id ASC
      FOR UPDATE`
  );
  const lastCategoryIndex = rows.reduce((lastIndex, row, index) => (
    row.category === category ? index : lastIndex
  ), -1);
  const insertionIndex = lastCategoryIndex >= 0 ? lastCategoryIndex + 1 : rows.length;

  for (const [index, row] of rows.entries()) {
    const nextOrder = index >= insertionIndex ? index + 2 : index + 1;
    if (toNumber(row.display_order, 0) !== nextOrder) {
      await connection.execute(
        "UPDATE tourism_cards SET display_order = ? WHERE id = ?",
        [nextOrder, row.id]
      );
    }
  }

  return insertionIndex + 1;
}

async function getRequestedInsertionOrder(connection, requestedOrder, category) {
  const requested = toPositiveInteger(requestedOrder, 0);

  if (!requested) {
    return getCategoryInsertionOrder(connection, category);
  }

  const [rows] = await connection.execute(
    `SELECT id, display_order
       FROM tourism_cards
      ORDER BY display_order ASC, id ASC
      FOR UPDATE`
  );
  const targetPosition = Math.min(Math.max(requested, 1), rows.length + 1);

  for (const [index, row] of rows.entries()) {
    const nextOrder = index >= targetPosition - 1 ? index + 2 : index + 1;
    if (toNumber(row.display_order, 0) !== nextOrder) {
      await connection.execute(
        "UPDATE tourism_cards SET display_order = ? WHERE id = ?",
        [nextOrder, row.id]
      );
    }
  }

  return targetPosition;
}

async function promoteSubmissionToCard(record, options = {}) {
  await ensureCardsSeeded();

  const payload = buildCardPayloadFromSubmission(record);
  const validationError = validateCardPayload(payload);

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute(
      "SELECT * FROM tourism_cards WHERE public_id = ? LIMIT 1 FOR UPDATE",
      [payload.publicId]
    );
    if (existingRows.length) {
      if (options.updateExisting === false) {
        await connection.commit();
        return mapRowToCard(existingRows[0]);
      }

      const pointId = await resolvePromotedPointId(connection, payload.pointId, payload.publicId);
      await connection.execute(
        `UPDATE tourism_cards
          SET point_id = ?, category = ?, name = ?, subtitle = ?, description = ?, image_url = ?, image_alt = ?,
              address_line = ?, schedule_line = ?, instagram_url = ?, whatsapp_url = ?, email = ?, phone = ?,
              latitude = ?, longitude = ?, directions_url = ?, marker_icon = ?, has_wifi = ?, is_active = 1, updated_at = NOW()
          WHERE public_id = ?`,
        [
          pointId,
          payload.category,
          payload.name,
          payload.subtitle,
          payload.description,
          payload.photoUrl,
          payload.imageAlt,
          payload.addressLine,
          payload.scheduleLine,
          payload.instagramUrl,
          payload.whatsappUrl,
          payload.email,
          payload.phone,
          payload.latitude,
          payload.longitude,
          payload.directionsUrl,
          payload.markerIcon,
          payload.hasWifi ? 1 : 0,
          payload.publicId
        ]
      );
    } else {
      const pointId = await resolvePromotedPointId(connection, payload.pointId, payload.publicId);
      const displayOrder = await getCategoryInsertionOrder(connection, payload.category);
      await connection.execute(
        `INSERT INTO tourism_cards (
          public_id, point_id, category, name, subtitle, description, image_url, image_alt,
          address_line, schedule_line, instagram_url, whatsapp_url, email, phone,
          latitude, longitude, directions_url, marker_icon, has_wifi, display_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          payload.publicId,
          pointId,
          payload.category,
          payload.name,
          payload.subtitle,
          payload.description,
          payload.photoUrl,
          payload.imageAlt,
          payload.addressLine,
          payload.scheduleLine,
          payload.instagramUrl,
          payload.whatsappUrl,
          payload.email,
          payload.phone,
          payload.latitude,
          payload.longitude,
          payload.directionsUrl,
          payload.markerIcon,
          payload.hasWifi ? 1 : 0,
          displayOrder
        ]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getCardByPublicId(payload.publicId);
}

async function promoteApprovedSubmissionsToCards() {
  await ensureCardsSeeded();
  const records = await listApprovedSubmissions();
  const promotedCards = [];

  for (const record of records) {
    promotedCards.push(await promoteSubmissionToCard(record, { updateExisting: false }));
  }

  return promotedCards;
}

async function listPublicCards() {
  await ensureCardsSeeded();
  await promoteApprovedSubmissionsToCards();
  const rows = await runQuery(
    `SELECT * FROM tourism_cards
      WHERE is_active = 1
      ORDER BY display_order ASC, id ASC`
  );

  return rows.map(mapRowToCard);
}

async function listAdminCards(filters = {}) {
  await ensureCardsSeeded();
  await promoteApprovedSubmissionsToCards();
  const params = [];
  const conditions = [];
  const category = normalizeCategory(filters.category);

  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await runQuery(
    `SELECT * FROM tourism_cards ${whereClause} ORDER BY display_order ASC, id ASC`,
    params
  );

  return rows.map(mapRowToCard);
}

async function getCardByPublicId(publicId) {
  await ensureCardsSeeded();
  const rows = await runQuery(
    "SELECT * FROM tourism_cards WHERE public_id = ? LIMIT 1",
    [publicId]
  );

  return rows[0] ? mapRowToCard(rows[0]) : null;
}

async function reorderCardsForUpdate(connection, publicId, requestedOrder) {
  const [rows] = await connection.execute(
    `SELECT id, public_id, display_order
       FROM tourism_cards
      ORDER BY display_order ASC, id ASC
      FOR UPDATE`
  );
  const currentIndex = rows.findIndex((row) => row.public_id === publicId);

  if (currentIndex === -1) {
    const error = new Error("Card nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const [movingCard] = rows.splice(currentIndex, 1);
  const targetPosition = Math.min(
    Math.max(toPositiveInteger(requestedOrder, currentIndex + 1), 1),
    rows.length + 1
  );

  rows.splice(targetPosition - 1, 0, movingCard);

  for (const [index, row] of rows.entries()) {
    const nextOrder = index + 1;
    if (toNumber(row.display_order, 0) !== nextOrder) {
      await connection.execute(
        "UPDATE tourism_cards SET display_order = ? WHERE id = ?",
        [nextOrder, row.id]
      );
    }
  }

  return targetPosition;
}

function validateCardPayload(payload) {
  if (!normalizeCategory(payload.category)) {
    return "Categoria do card invalida.";
  }

  if (!normalizeLine(payload.name)) {
    return "Nome do card obrigatorio.";
  }

  if (!normalizeLine(payload.description)) {
    return "Descricao do card obrigatoria.";
  }

  if (!normalizeLine(payload.photoUrl)) {
    return "Imagem do card obrigatoria.";
  }

  return "";
}

function buildCardPayload(input, currentCard = null) {
  const hasLatitude = Object.prototype.hasOwnProperty.call(input, "latitude");
  const hasLongitude = Object.prototype.hasOwnProperty.call(input, "longitude");
  const latitude = hasLatitude
    ? (input.latitude === "" ? null : toNullableNumber(input.latitude))
    : currentCard?.latitude ?? null;
  const longitude = hasLongitude
    ? (input.longitude === "" ? null : toNullableNumber(input.longitude))
    : currentCard?.longitude ?? null;
  const directionsUrl = buildDirectionsUrlFromCoordinates(latitude, longitude)
    || normalizeLine(pickInputValue(input, "directionsUrl", currentCard?.directionsUrl));

  const category = normalizeCategory(pickInputValue(input, "category", currentCard?.category));
  const shouldReuseMarkerIcon = Object.prototype.hasOwnProperty.call(input, "markerIcon")
    || currentCard?.category === category;
  const markerIconInput = shouldReuseMarkerIcon
    ? pickInputValue(input, "markerIcon", currentCard?.markerIcon)
    : "";

  return {
    category,
    name: normalizeLine(pickInputValue(input, "name", currentCard?.name)),
    subtitle: normalizeLine(pickInputValue(input, "subtitle", currentCard?.subtitle)),
    description: normalizeDescription(pickInputValue(input, "description", currentCard?.description)),
    photoUrl: normalizeMediaUrl(pickInputValue(input, "photoUrl", currentCard?.photoSrc)),
    imageAlt: normalizeLine(pickInputValue(input, "imageAlt", currentCard?.imageAlt || input.name || currentCard?.name)),
    addressLine: normalizeLine(pickInputValue(input, "addressLine", currentCard?.addressLine)),
    scheduleLine: normalizeLine(pickInputValue(input, "scheduleLine", currentCard?.scheduleLine)),
    instagramUrl: normalizeLine(pickInputValue(input, "instagram", currentCard?.contacts?.instagram)),
    whatsappUrl: normalizeWhatsapp(pickInputValue(input, "whatsapp", currentCard?.contacts?.whatsapp)),
    email: normalizeEmail(pickInputValue(input, "email", currentCard?.contacts?.email)),
    phone: normalizeLine(pickInputValue(input, "phone", currentCard?.contacts?.phone)),
    displayOrder: toPositiveInteger(pickInputValue(input, "displayOrder", currentCard?.displayOrder || 1), currentCard?.displayOrder || 1),
    isActive: normalizeBool(pickInputValue(input, "isActive", currentCard?.isActive ?? true), currentCard?.isActive ?? true),
    hasWifi: category === "turistico"
      ? normalizeBool(pickInputValue(input, "hasWifi", currentCard?.hasWifi ?? false), currentCard?.hasWifi ?? false)
      : false,
    latitude,
    longitude,
    directionsUrl,
    markerIcon: normalizeMarkerIcon(markerIconInput, category)
  };
}

async function createCard(input) {
  await ensureCardsSeeded();

  const payload = buildCardPayload(input);
  const validationError = validateCardPayload(payload);

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const slug = toSlug(payload.name) || shortHash(`${payload.category}-${Date.now()}`);
  const publicIdBase = normalizeLine(input.publicId || input.id) || `manual-${slug}-${shortHash(`${Date.now()}-${payload.name}`)}`;
  const publicId = publicIdBase.length <= 64 ? publicIdBase : `manual-${shortHash(publicIdBase)}`;
  const prefix = payload.category === "hotel" ? "hotel" : payload.category === "gastronomia" ? "gas" : "tur";
  const requestedPointId = normalizeLine(input.pointId) || `${prefix}-${slug}`;
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute(
      "SELECT public_id FROM tourism_cards WHERE public_id = ? LIMIT 1 FOR UPDATE",
      [publicId]
    );

    if (existingRows.length) {
      const error = new Error("Ja existe um card com esse identificador.");
      error.statusCode = 409;
      throw error;
    }

    const pointId = await resolvePromotedPointId(connection, requestedPointId, publicId);
    const displayOrder = await getRequestedInsertionOrder(connection, input.displayOrder, payload.category);

    await connection.execute(
      `INSERT INTO tourism_cards (
        public_id, point_id, category, name, subtitle, description, image_url, image_alt,
        address_line, schedule_line, instagram_url, whatsapp_url, email, phone,
        latitude, longitude, directions_url, marker_icon, has_wifi, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publicId,
        pointId,
        payload.category,
        payload.name,
        payload.subtitle,
        payload.description,
        payload.photoUrl,
        payload.imageAlt,
        payload.addressLine,
        payload.scheduleLine,
        payload.instagramUrl,
        payload.whatsappUrl,
        payload.email,
        payload.phone,
        payload.latitude,
        payload.longitude,
        payload.directionsUrl,
        payload.markerIcon,
        payload.hasWifi ? 1 : 0,
        displayOrder,
        payload.isActive ? 1 : 0
      ]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getCardByPublicId(publicId);
}

async function updateCard(publicId, input) {
  const currentCard = await getCardByPublicId(publicId);

  if (!currentCard) {
    const error = new Error("Card nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const payload = buildCardPayload(input, currentCard);
  const validationError = validateCardPayload(payload);

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();

    const displayOrder = await reorderCardsForUpdate(connection, publicId, payload.displayOrder);

    await connection.execute(
      `UPDATE tourism_cards
        SET category = ?, name = ?, subtitle = ?, description = ?, image_url = ?, image_alt = ?,
            address_line = ?, schedule_line = ?, instagram_url = ?, whatsapp_url = ?, email = ?, phone = ?,
            latitude = ?, longitude = ?, directions_url = ?, marker_icon = ?, has_wifi = ?, display_order = ?, is_active = ?, updated_at = NOW()
        WHERE public_id = ?`,
      [
        payload.category,
        payload.name,
        payload.subtitle,
        payload.description,
        payload.photoUrl,
        payload.imageAlt,
        payload.addressLine,
        payload.scheduleLine,
        payload.instagramUrl,
        payload.whatsappUrl,
        payload.email,
        payload.phone,
        payload.latitude,
        payload.longitude,
        payload.directionsUrl,
        payload.markerIcon,
        payload.hasWifi ? 1 : 0,
        displayOrder,
        payload.isActive ? 1 : 0,
        publicId
      ]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getCardByPublicId(publicId);
}

async function deleteCard(publicId) {
  const currentCard = await getCardByPublicId(publicId);

  if (!currentCard) {
    const error = new Error("Card nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await runQuery("DELETE FROM tourism_cards WHERE public_id = ?", [publicId]);
  return currentCard;
}

async function setPromotedSubmissionCardActive(submissionId, isActive) {
  await ensureCardsSeeded();

  const publicId = buildPromotedPublicId(submissionId);
  await runQuery(
    "UPDATE tourism_cards SET is_active = ?, updated_at = NOW() WHERE public_id = ?",
    [isActive ? 1 : 0, publicId]
  );

  return getCardByPublicId(publicId);
}

module.exports = {
  createCard,
  deleteCard,
  getCardByPublicId,
  listAdminCards,
  listPublicCards,
  promoteApprovedSubmissionsToCards,
  promoteSubmissionToCard,
  setPromotedSubmissionCardActive,
  updateCard
};
