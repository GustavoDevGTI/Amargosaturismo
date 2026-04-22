const STORAGE_KEY = "guia_turista_cadastros_v1";
const VALID_STATUSES = ["pending", "approved", "rejected"];

const STATUS_LABELS = {
  pending: "Pendente",
  approved: "Validado",
  rejected: "Recusado"
};

const STATUS_FILTER_LABELS = {
  pending: "pendentes",
  approved: "validados",
  rejected: "recusados",
  todos: "todos os status"
};

const CATEGORY_FILTER_LABELS = {
  todos: "todas as categorias",
  gastronomia: "bares/restaurantes",
  hotel: "hoteis/pousadas"
};

const cardsGrid = document.getElementById("cardsGrid");
const emptyState = document.getElementById("emptyState");
const statusText = document.getElementById("statusText");
const refreshBtn = document.getElementById("refreshBtn");
const clearBtn = document.getElementById("clearBtn");
const categoryFilterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const statusFilterButtons = Array.from(document.querySelectorAll("[data-status-filter]"));
const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");
const editHint = document.getElementById("editHint");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeEditBtn = document.getElementById("closeEditBtn");
const editRecordIdInput = document.getElementById("editRecordId");
const editCategoryInput = document.getElementById("editCategory");
const editNameInput = document.getElementById("editName");
const editDescriptionInput = document.getElementById("editDescription");
const editAddressLineInput = document.getElementById("editAddressLine");
const editInstagramInput = document.getElementById("editInstagram");
const editWhatsappInput = document.getElementById("editWhatsapp");
const editSubtitleInput = document.getElementById("editSubtitle");
const editHoursLineInput = document.getElementById("editHoursLine");
const editStatusLineInput = document.getElementById("editStatusLine");
const editServiceLineInput = document.getElementById("editServiceLine");
const editEmailInput = document.getElementById("editEmail");
const editPhoneInput = document.getElementById("editPhone");
const editGastronomyFields = document.getElementById("editGastronomyFields");
const editHotelFields = document.getElementById("editHotelFields");

const ICONS = {
  instagram: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5A3.95 3.95 0 0 0 16.25 3.8Zm8.93 1.35a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14ZM12 6.85A5.15 5.15 0 1 1 6.85 12 5.16 5.16 0 0 1 12 6.85Zm0 1.8A3.35 3.35 0 1 0 15.35 12 3.35 3.35 0 0 0 12 8.65Z"/></svg>`,
  whatsapp: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.57 0 .29 5.28.29 11.79c0 2.08.54 4.11 1.56 5.91L0 24l6.48-1.7a11.78 11.78 0 0 0 5.6 1.43h.01c6.5 0 11.79-5.29 11.79-11.8a11.7 11.7 0 0 0-3.36-8.45ZM12.09 21.7h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.85 1.01 1.03-3.75-.24-.39a9.77 9.77 0 0 1-1.5-5.2c0-5.43 4.42-9.84 9.86-9.84 2.63 0 5.1 1.02 6.95 2.88a9.77 9.77 0 0 1 2.89 6.96c0 5.43-4.42 9.86-9.85 9.86Zm5.4-7.34c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.51.08-.78.37s-1.02 1-1.02 2.44 1.05 2.83 1.2 3.03c.15.2 2.07 3.16 5.02 4.43.7.3 1.24.48 1.66.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.69.25-1.28.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>`,
  email: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v13.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25Zm1.8.37v.28l7.2 5.4 7.2-5.4v-.28a.45.45 0 0 0-.45-.45H5.25a.45.45 0 0 0-.45.45Zm14.4 2.53-6.66 4.99a.9.9 0 0 1-1.08 0L4.8 8.15v10.6c0 .25.2.45.45.45h13.5c.25 0 .45-.2.45-.45V8.15Z"/></svg>`,
  phone: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 2.93c.3-.3.75-.4 1.14-.25l2.3.86c.52.19.83.73.74 1.28l-.39 2.36a1.35 1.35 0 0 1-.78 1.02l-1.42.68a14.57 14.57 0 0 0 6.91 6.91l.68-1.42c.18-.38.56-.66 1.02-.78l2.36-.39c.55-.09 1.09.22 1.28.74l.86 2.3c.15.39.05.84-.25 1.14l-1.26 1.26c-.77.77-1.9 1.1-2.97.87-2.66-.59-5.2-1.98-7.58-4.35-2.37-2.38-3.76-4.92-4.35-7.58-.23-1.07.1-2.2.87-2.97l1.26-1.26Z"/></svg>`
};

let activeCategoryFilter = "todos";
let activeStatusFilter = "pending";

function normalizeLine(value) {
  return String(value || "").trim();
}

function normalizeCategory(value) {
  return value === "gastronomia" || value === "hotel" ? value : "";
}

function normalizeStatus(value) {
  return VALID_STATUSES.includes(value) ? value : "approved";
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function buildPhoneUrl(value) {
  const digits = digitsOnly(value);
  return digits ? `tel:+${digits}` : "";
}

function buildMapQuery(name, addressLine) {
  return [normalizeLine(name), normalizeLine(addressLine), "Amargosa, Bahia, Brasil"]
    .filter(Boolean)
    .join(", ");
}

function buildDirectionsUrl(mapQuery) {
  return mapQuery ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}` : "";
}

function readRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeRecord).filter(Boolean) : [];
  } catch (_) {
    return [];
  }
}

function writeRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function normalizeRecord(record) {
  const category = normalizeCategory(record?.category);
  const name = normalizeLine(record?.name);

  if (!category || !name) {
    return null;
  }

  const contacts = record.contacts || {};
  const guide = record.guide || {};

  return {
    ...record,
    category,
    name,
    description: normalizeLine(record.description),
    createdAt: normalizeLine(record.createdAt),
    updatedAt: normalizeLine(record.updatedAt || record.createdAt),
    approvalStatus: normalizeStatus(record.approvalStatus),
    approvalUpdatedAt: normalizeLine(record.approvalUpdatedAt || record.updatedAt || record.createdAt),
    metaLines: Array.isArray(record.metaLines) ? record.metaLines.filter(Boolean) : [],
    contacts: {
      instagram: normalizeLine(contacts.instagram),
      whatsapp: normalizeLine(contacts.whatsapp),
      email: normalizeLine(contacts.email),
      phone: normalizeLine(contacts.phone),
      phoneUrl: normalizeLine(contacts.phoneUrl || buildPhoneUrl(contacts.phone))
    },
    guide: {
      subtitle: normalizeLine(guide.subtitle),
      description: normalizeLine(guide.description),
      hoursLine: normalizeLine(guide.hoursLine),
      addressLine: normalizeLine(guide.addressLine),
      statusLine: normalizeLine(guide.statusLine),
      serviceLine: normalizeLine(guide.serviceLine),
      mapQuery: normalizeLine(guide.mapQuery),
      directionsUrl: normalizeLine(guide.directionsUrl),
      popupTitleColor: normalizeLine(guide.popupTitleColor) || (category === "hotel" ? "#3568c9" : "#c9642b")
    }
  };
}

function fallbackImage(category) {
  return category === "gastronomia"
    ? "https://placehold.co/1200x800?text=Bar+ou+Restaurante"
    : "https://placehold.co/1200x800?text=Hotel+ou+Pousada";
}

function formatDateTime(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Data nao informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(parsed);
}

function findAddressLine(record) {
  if (record.guide?.addressLine) {
    return record.guide.addressLine;
  }

  return (record.metaLines || []).find((line) => /CEP\s|\s\|\s|Rua|Avenida|Travessa|Praça|Praca|Largo|Rodovia|BA-/i.test(line)) || "";
}

function getGuideDescription(record) {
  return record.guide?.description || record.description || "Sem descricao informada.";
}

function getGuideSubtitle(record) {
  return record.guide?.subtitle || "";
}

function mergeGuideDescription(subtitle, description) {
  const subtitleText = normalizeLine(subtitle);
  const descriptionText = normalizeLine(description);

  if (!subtitleText) {
    return descriptionText || "Sem descricao informada.";
  }

  if (!descriptionText) {
    return subtitleText;
  }

  const normalizedSubtitle = subtitleText.toLocaleLowerCase("pt-BR");
  const normalizedDescriptionText = descriptionText.toLocaleLowerCase("pt-BR");

  if (
    normalizedDescriptionText === normalizedSubtitle
    || normalizedDescriptionText.startsWith(`${normalizedSubtitle}.`)
    || normalizedDescriptionText.startsWith(`${normalizedSubtitle},`)
  ) {
    return descriptionText;
  }

  const normalizedDescription = `${descriptionText.charAt(0).toLocaleLowerCase("pt-BR")}${descriptionText.slice(1)}`;
  return `${subtitleText}, ${normalizedDescription}`;
}

function getGastronomyMetaLines(record) {
  const addressLine = findAddressLine(record);
  const hoursLine = normalizeLine(record.guide?.hoursLine || record.metaLines?.[0]);

  return [hoursLine, addressLine].filter(Boolean);
}

function getHotelMetaLines(record) {
  const addressLine = findAddressLine(record);
  const emailLine = normalizeLine(record.contacts?.email) || "E-mail nao informado";
  const phoneLine = normalizeLine(record.contacts?.phone);

  return [addressLine, emailLine, phoneLine].filter(Boolean);
}

function buildGuideUrl(record) {
  const params = new URLSearchParams();

  if (record.category) {
    params.set("filter", record.category);
  }

  if (record.pointId || record.mapFocus) {
    params.set("focus", record.pointId || record.mapFocus);
  }

  return `../wifi-publico.html?${params.toString()}#mapa`;
}

function iconLink(href, variantClass, label, iconMarkup) {
  if (!href) {
    return null;
  }

  const anchor = document.createElement("a");
  anchor.className = `card-link ${variantClass} card-link--icon`;
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.ariaLabel = label;
  anchor.title = label;
  anchor.innerHTML = `${iconMarkup}<span class="sr-only">${label}</span>`;
  return anchor;
}

function createStatusBadge(status) {
  const span = document.createElement("span");
  span.className = `status-badge status-badge--${status}`;
  span.textContent = STATUS_LABELS[status] || "Status";
  return span;
}

function createReviewButton(label, variantClass, onClick, disabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `review-btn ${variantClass}`;
  button.textContent = label;
  button.disabled = Boolean(disabled);
  button.addEventListener("click", onClick);
  return button;
}

function getEditDraft(record) {
  return {
    name: record.name || "",
    description: record.description || "",
    addressLine: record.guide?.addressLine || findAddressLine(record),
    instagram: record.contacts?.instagram || "",
    whatsapp: record.contacts?.whatsapp || "",
    subtitle: record.category === "gastronomia" ? (record.guide?.subtitle || "") : "",
    hoursLine: record.category === "gastronomia" ? (record.guide?.hoursLine || "") : "",
    statusLine: record.category === "hotel" ? (record.guide?.statusLine || "") : "",
    serviceLine: record.category === "hotel" ? (record.guide?.serviceLine || "") : "",
    email: record.category === "hotel" ? (record.contacts?.email || "") : "",
    phone: record.category === "hotel" ? (record.contacts?.phone || "") : ""
  };
}

function buildGuideDataFromAdmin(category, values, contacts) {
  const mapQuery = buildMapQuery(values.name, values.addressLine);

  if (category === "gastronomia") {
    return {
      subtitle: values.subtitle,
      description: values.description,
      hoursLine: values.hoursLine,
      addressLine: values.addressLine,
      mapQuery,
      directionsUrl: buildDirectionsUrl(mapQuery),
      popupTitleColor: "#c9642b"
    };
  }

  const hotelDescription = [values.serviceLine, values.description]
    .filter(Boolean)
    .join(values.serviceLine && values.description ? ". " : "");

  return {
    subtitle: values.statusLine,
    description: hotelDescription || values.description || values.serviceLine,
    statusLine: values.statusLine,
    serviceLine: values.serviceLine,
    addressLine: values.addressLine,
    mapQuery,
    directionsUrl: buildDirectionsUrl(mapQuery),
    popupTitleColor: "#3568c9"
  };
}

function buildMetaLines(category, guide, contacts) {
  if (category === "gastronomia") {
    return [guide.hoursLine, guide.addressLine].filter(Boolean);
  }

  return [guide.statusLine, guide.serviceLine, guide.addressLine, contacts.email, contacts.phone].filter(Boolean);
}

function filterRecords(records) {
  return records.filter((record) => {
    const matchesCategory = activeCategoryFilter === "todos" || record.category === activeCategoryFilter;
    const matchesStatus = activeStatusFilter === "todos" || record.approvalStatus === activeStatusFilter;
    return matchesCategory && matchesStatus;
  });
}

function setStatus(records, visibleCount) {
  if (!records.length) {
    statusText.textContent = "Nenhum cadastro salvo neste navegador.";
    return;
  }

  const counts = records.reduce((accumulator, record) => {
    accumulator[record.approvalStatus] += 1;
    return accumulator;
  }, { pending: 0, approved: 0, rejected: 0 });

  const categoryText = CATEGORY_FILTER_LABELS[activeCategoryFilter] || CATEGORY_FILTER_LABELS.todos;
  const statusFilterText = STATUS_FILTER_LABELS[activeStatusFilter] || STATUS_FILTER_LABELS.todos;

  statusText.textContent = `Pendentes: ${counts.pending} | Validados: ${counts.approved} | Recusados: ${counts.rejected}. Exibindo ${visibleCount} cadastro(s) em ${categoryText} com filtro ${statusFilterText}.`;
}

function setEmptyState(records, filtered) {
  if (filtered.length) {
    emptyState.hidden = true;
    return;
  }

  emptyState.hidden = false;

  if (!records.length) {
    emptyState.textContent = "Nenhum estabelecimento cadastrado ainda.";
    return;
  }

  const categoryText = CATEGORY_FILTER_LABELS[activeCategoryFilter] || CATEGORY_FILTER_LABELS.todos;
  const statusFilterText = STATUS_FILTER_LABELS[activeStatusFilter] || STATUS_FILTER_LABELS.todos;
  emptyState.textContent = `Nenhum cadastro encontrado em ${categoryText} com filtro ${statusFilterText}.`;
}

function createCard(record) {
  const contacts = record.contacts || {};
  const isGastronomy = record.category === "gastronomia";
  const metaLines = isGastronomy ? getGastronomyMetaLines(record) : getHotelMetaLines(record);
  const subtitleText = getGuideSubtitle(record);
  const descriptionText = mergeGuideDescription(subtitleText, getGuideDescription(record));
  const isApproved = record.approvalStatus === "approved";

  const article = document.createElement("article");
  article.className = "attraction-card";
  article.dataset.category = record.category || "";
  article.dataset.pointId = record.pointId || "";
  article.dataset.status = record.approvalStatus || "";

  const image = document.createElement("img");
  image.src = record.photoSrc || fallbackImage(record.category);
  image.alt = record.name || "Estabelecimento";
  image.loading = "lazy";

  const content = document.createElement("div");
  content.className = "card-content";

  const topline = document.createElement("div");
  topline.className = "card-topline";
  topline.appendChild(createStatusBadge(record.approvalStatus));

  const dateInfo = document.createElement("span");
  dateInfo.className = "card-date";
  dateInfo.textContent = `Atualizado em ${formatDateTime(record.updatedAt || record.createdAt)}`;
  topline.appendChild(dateInfo);

  const title = document.createElement("h3");
  title.textContent = record.name || "Sem nome";

  const description = document.createElement("p");
  description.textContent = descriptionText;

  const meta = document.createElement("div");
  meta.className = "card-meta";
  metaLines.forEach((line) => {
    const span = document.createElement("span");
    span.textContent = line;
    meta.appendChild(span);
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const mapButton = document.createElement("button");
  mapButton.className = "card-button";
  mapButton.type = "button";
  mapButton.textContent = isApproved ? "Ver no mapa" : "Aguardando validacao";
  mapButton.disabled = !isApproved;
  if (isApproved) {
    mapButton.dataset.mapFocus = record.mapFocus || record.pointId || "";
    mapButton.addEventListener("click", () => {
      window.open(buildGuideUrl(record), "_blank", "noopener,noreferrer");
    });
  }
  actions.appendChild(mapButton);

  const linksInline = document.createElement("div");
  linksInline.className = "card-actions-inline";

  const instagramLink = iconLink(contacts.instagram, "card-link--instagram", "Instagram", ICONS.instagram);
  const whatsappLink = iconLink(contacts.whatsapp, "card-link--whatsapp", "WhatsApp", ICONS.whatsapp);
  const emailLink = iconLink(contacts.email ? `mailto:${contacts.email}` : "", "card-link--email", "E-mail", ICONS.email);
  const phoneLink = iconLink(contacts.phoneUrl, "card-link--phone", "Contato", ICONS.phone);
  const actionLinks = isGastronomy
    ? [instagramLink, whatsappLink]
    : [instagramLink, emailLink, whatsappLink, phoneLink];

  actionLinks.forEach((link) => {
    if (link) {
      linksInline.appendChild(link);
    }
  });

  if (linksInline.children.length) {
    actions.appendChild(linksInline);
  }

  const reviewActions = document.createElement("div");
  reviewActions.className = "card-review-actions";
  reviewActions.appendChild(createReviewButton("Editar", "review-btn--edit", () => openEditDialog(record.id), false));
  reviewActions.appendChild(createReviewButton("Validar", "review-btn--approve", () => setRecordStatus(record.id, "approved"), isApproved));
  reviewActions.appendChild(createReviewButton("Recusar", "review-btn--reject", () => setRecordStatus(record.id, "rejected"), record.approvalStatus === "rejected"));
  actions.appendChild(reviewActions);

  content.appendChild(topline);
  content.appendChild(title);
  content.appendChild(description);
  if (metaLines.length > 0) {
    content.appendChild(meta);
  }
  content.appendChild(actions);

  article.appendChild(image);
  article.appendChild(content);

  return article;
}

function renderCards() {
  const records = readRecords();
  const filtered = filterRecords(records);

  cardsGrid.innerHTML = "";

  filtered.forEach((record) => {
    cardsGrid.appendChild(createCard(record));
  });

  setEmptyState(records, filtered);
  setStatus(records, filtered.length);
}

function updateCategoryButtons() {
  categoryFilterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === activeCategoryFilter);
  });
}

function updateStatusButtons() {
  statusFilterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.statusFilter === activeStatusFilter);
  });
}

function setActiveCategoryFilter(value) {
  activeCategoryFilter = value;
  updateCategoryButtons();
  renderCards();
}

function setActiveStatusFilter(value) {
  activeStatusFilter = value;
  updateStatusButtons();
  renderCards();
}

function toggleEditCategory(category) {
  const isGastronomy = category === "gastronomia";
  editGastronomyFields.hidden = !isGastronomy;
  editHotelFields.hidden = isGastronomy;
}

function openEditDialog(recordId) {
  const record = readRecords().find((item) => item.id === recordId);

  if (!record) {
    return;
  }

  const draft = getEditDraft(record);

  editRecordIdInput.value = record.id || "";
  editCategoryInput.value = record.category || "";
  editNameInput.value = draft.name;
  editDescriptionInput.value = draft.description;
  editAddressLineInput.value = draft.addressLine;
  editInstagramInput.value = draft.instagram;
  editWhatsappInput.value = draft.whatsapp;
  editSubtitleInput.value = draft.subtitle;
  editHoursLineInput.value = draft.hoursLine;
  editStatusLineInput.value = draft.statusLine;
  editServiceLineInput.value = draft.serviceLine;
  editEmailInput.value = draft.email;
  editPhoneInput.value = draft.phone;
  editHint.textContent = `Status atual: ${STATUS_LABELS[record.approvalStatus]}. Salvar a edicao nao publica o card; a publicacao acontece ao validar.`;

  toggleEditCategory(record.category);

  if (typeof editDialog.showModal === "function") {
    editDialog.showModal();
  } else {
    editDialog.setAttribute("open", "open");
  }
}

function closeEditDialog() {
  if (!editDialog.hasAttribute("open")) {
    return;
  }

  if (typeof editDialog.close === "function") {
    editDialog.close();
    return;
  }

  editDialog.removeAttribute("open");
}

function saveEditedRecord(event) {
  event.preventDefault();

  const recordId = normalizeLine(editRecordIdInput.value);
  const category = normalizeCategory(editCategoryInput.value);
  const records = readRecords();
  const recordIndex = records.findIndex((item) => item.id === recordId);

  if (recordIndex === -1 || !category) {
    return;
  }

  const currentRecord = records[recordIndex];
  const now = new Date().toISOString();
  const values = {
    name: normalizeLine(editNameInput.value) || currentRecord.name,
    description: normalizeLine(editDescriptionInput.value),
    addressLine: normalizeLine(editAddressLineInput.value),
    subtitle: normalizeLine(editSubtitleInput.value),
    hoursLine: normalizeLine(editHoursLineInput.value),
    statusLine: normalizeLine(editStatusLineInput.value),
    serviceLine: normalizeLine(editServiceLineInput.value)
  };

  const contacts = {
    ...currentRecord.contacts,
    instagram: normalizeLine(editInstagramInput.value),
    whatsapp: normalizeLine(editWhatsappInput.value),
    email: category === "hotel" ? normalizeLine(editEmailInput.value) : "",
    phone: category === "hotel" ? normalizeLine(editPhoneInput.value) : ""
  };
  contacts.phoneUrl = buildPhoneUrl(contacts.phone);

  const guide = buildGuideDataFromAdmin(category, values, contacts);
  const updatedRecord = {
    ...currentRecord,
    name: values.name,
    description: values.description,
    contacts,
    guide,
    metaLines: buildMetaLines(category, guide, contacts),
    updatedAt: now
  };

  records[recordIndex] = updatedRecord;
  writeRecords(records);
  closeEditDialog();
  renderCards();
}

function setRecordStatus(recordId, nextStatus) {
  const targetStatus = normalizeStatus(nextStatus);
  const records = readRecords();
  const recordIndex = records.findIndex((item) => item.id === recordId);

  if (recordIndex === -1) {
    return;
  }

  const currentRecord = records[recordIndex];

  if (currentRecord.approvalStatus === targetStatus) {
    return;
  }

  if (targetStatus === "rejected") {
    const confirmed = window.confirm("Deseja recusar este cadastro? Ele nao aparecera no guia publico enquanto estiver recusado.");
    if (!confirmed) {
      return;
    }
  }

  const now = new Date().toISOString();
  records[recordIndex] = {
    ...currentRecord,
    approvalStatus: targetStatus,
    approvalUpdatedAt: now,
    updatedAt: now
  };

  writeRecords(records);

  if (normalizeLine(editRecordIdInput.value) === recordId) {
    closeEditDialog();
  }

  renderCards();
}

categoryFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveCategoryFilter(button.dataset.filter || "todos");
  });
});

statusFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveStatusFilter(button.dataset.statusFilter || "todos");
  });
});

refreshBtn.addEventListener("click", () => {
  renderCards();
});

clearBtn.addEventListener("click", () => {
  const ok = confirm("Deseja realmente apagar todos os estabelecimentos cadastrados neste navegador?");
  if (!ok) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  closeEditDialog();
  renderCards();
});

editForm.addEventListener("submit", saveEditedRecord);
cancelEditBtn.addEventListener("click", closeEditDialog);
closeEditBtn.addEventListener("click", closeEditDialog);

renderCards();
