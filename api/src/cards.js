const { runQuery, getPool } = require("./db");
const cardSeeds = require("./cardSeeds");

const VALID_CARD_CATEGORIES = new Set(["turistico", "gastronomia", "hotel"]);

let ensureCardsPromise = null;

function normalizeLine(value) {
  return String(value || "").trim();
}

function digitsOnly(value) {
  return normalizeLine(value).replace(/\D/g, "");
}

function normalizeCategory(value) {
  const category = normalizeLine(value);
  return VALID_CARD_CATEGORIES.has(category) ? category : "";
}

function buildPhoneUrl(value) {
  const digits = digitsOnly(value);
  return digits ? `tel:+${digits}` : "";
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeComparable(value) {
  return normalizeLine(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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

function mapRowToCard(row) {
  const email = normalizeEmail(row.email);
  const phone = normalizeLine(row.phone);

  return {
    id: normalizeLine(row.public_id),
    pointId: normalizeLine(row.point_id),
    category: normalizeCategory(row.category),
    name: normalizeLine(row.name),
    subtitle: normalizeLine(row.subtitle),
    description: normalizeLine(row.description),
    photoSrc: normalizeLine(row.image_url),
    imageAlt: normalizeLine(row.image_alt) || normalizeLine(row.name),
    addressLine: normalizeLine(row.address_line),
    scheduleLine: normalizeLine(row.schedule_line),
    displayOrder: toNumber(row.display_order, 0),
    isActive: Boolean(row.is_active),
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

async function ensureCardsSeeded() {
  if (!ensureCardsPromise) {
    ensureCardsPromise = (async () => {
      await runQuery(
        `CREATE TABLE IF NOT EXISTS tourism_cards (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          public_id VARCHAR(64) NOT NULL,
          point_id VARCHAR(128) NOT NULL,
          category ENUM('turistico', 'gastronomia', 'hotel') NOT NULL,
          name VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255) NOT NULL DEFAULT '',
          description TEXT NOT NULL,
          image_url VARCHAR(500) NOT NULL,
          image_alt VARCHAR(255) NOT NULL DEFAULT '',
          address_line VARCHAR(255) NOT NULL DEFAULT '',
          schedule_line VARCHAR(255) NOT NULL DEFAULT '',
          instagram_url VARCHAR(500) NOT NULL DEFAULT '',
          whatsapp_url VARCHAR(500) NOT NULL DEFAULT '',
          email VARCHAR(255) NOT NULL DEFAULT '',
          phone VARCHAR(64) NOT NULL DEFAULT '',
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

      const countRows = await runQuery("SELECT COUNT(*) AS total FROM tourism_cards");
      const total = toNumber(countRows[0]?.total, 0);

      if (total > 0) {
        return;
      }

      const connection = await getPool().getConnection();

      try {
        await connection.beginTransaction();

        for (const card of cardSeeds) {
          await connection.execute(
            `INSERT INTO tourism_cards (
              public_id, point_id, category, name, subtitle, description, image_url, image_alt,
              address_line, schedule_line, instagram_url, whatsapp_url, email, phone,
              display_order, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              normalizeLine(card.publicId),
              normalizeLine(card.pointId),
              normalizeCategory(card.category),
              normalizeLine(card.name),
              normalizeLine(card.subtitle),
              normalizeLine(card.description),
              normalizeLine(card.imageUrl),
              normalizeLine(card.imageAlt || card.name),
              normalizeLine(card.addressLine),
              normalizeLine(card.scheduleLine),
              normalizeLine(card.instagramUrl),
              normalizeLine(card.whatsappUrl),
              normalizeEmail(card.email),
              normalizeLine(card.phone),
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
    })();
  }

  return ensureCardsPromise;
}

async function listPublicCards() {
  await ensureCardsSeeded();
  const rows = await runQuery(
    `SELECT * FROM tourism_cards
      WHERE is_active = 1
      ORDER BY display_order ASC, id ASC`
  );

  return rows.map(mapRowToCard);
}

async function listAdminCards(filters = {}) {
  await ensureCardsSeeded();
  const params = [];
  const conditions = [];

  const category = normalizeCategory(filters.category);
  if (category && category !== "todos") {
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
  return {
    category: normalizeCategory(input.category || currentCard?.category),
    name: normalizeLine(input.name || currentCard?.name),
    subtitle: normalizeLine(input.subtitle || currentCard?.subtitle),
    description: normalizeLine(input.description || currentCard?.description),
    photoUrl: normalizeLine(input.photoUrl || currentCard?.photoSrc),
    imageAlt: normalizeLine(input.imageAlt || currentCard?.imageAlt || input.name || currentCard?.name),
    addressLine: normalizeLine(input.addressLine || currentCard?.addressLine),
    scheduleLine: normalizeLine(input.scheduleLine || currentCard?.scheduleLine),
    instagramUrl: normalizeLine(input.instagram || currentCard?.contacts?.instagram),
    whatsappUrl: normalizeLine(input.whatsapp || currentCard?.contacts?.whatsapp),
    email: normalizeEmail(input.email || currentCard?.contacts?.email),
    phone: normalizeLine(input.phone || currentCard?.contacts?.phone),
    displayOrder: toNumber(input.displayOrder, currentCard?.displayOrder || 0),
    isActive: normalizeBool(input.isActive, currentCard?.isActive ?? true)
  };
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

  await runQuery(
    `UPDATE tourism_cards
      SET category = ?, name = ?, subtitle = ?, description = ?, image_url = ?, image_alt = ?,
          address_line = ?, schedule_line = ?, instagram_url = ?, whatsapp_url = ?, email = ?, phone = ?,
          display_order = ?, is_active = ?, updated_at = NOW()
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
      payload.displayOrder,
      payload.isActive ? 1 : 0,
      publicId
    ]
  );

  return getCardByPublicId(publicId);
}

module.exports = {
  getCardByPublicId,
  listAdminCards,
  listPublicCards,
  updateCard
};
