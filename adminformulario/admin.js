const API_BASE_URL = "/api";
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

const ICONS = {
  instagram: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5A3.95 3.95 0 0 0 16.25 3.8Zm8.93 1.35a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14ZM12 6.85A5.15 5.15 0 1 1 6.85 12 5.16 5.16 0 0 1 12 6.85Zm0 1.8A3.35 3.35 0 1 0 15.35 12 3.35 3.35 0 0 0 12 8.65Z"/></svg>`,
  whatsapp: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.57 0 .29 5.28.29 11.79c0 2.08.54 4.11 1.56 5.91L0 24l6.48-1.7a11.78 11.78 0 0 0 5.6 1.43h.01c6.5 0 11.79-5.29 11.79-11.8a11.7 11.7 0 0 0-3.36-8.45ZM12.09 21.7h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.85 1.01 1.03-3.75-.24-.39a9.77 9.77 0 0 1-1.5-5.2c0-5.43 4.42-9.84 9.86-9.84 2.63 0 5.1 1.02 6.95 2.88a9.77 9.77 0 0 1 2.89 6.96c0 5.43-4.42 9.86-9.85 9.86Zm5.4-7.34c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.51.08-.78.37s-1.02 1-1.02 2.44 1.05 2.83 1.2 3.03c.15.2 2.07 3.16 5.02 4.43.7.3 1.24.48 1.66.62.7.22 1.34.19 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.69.25-1.28.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>`,
  email: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v13.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25Zm1.8.37v.28l7.2 5.4 7.2-5.4v-.28a.45.45 0 0 0-.45-.45H5.25a.45.45 0 0 0-.45.45Zm14.4 2.53-6.66 4.99a.9.9 0 0 1-1.08 0L4.8 8.15v10.6c0 .25.2.45.45.45h13.5c.25 0 .45-.2.45-.45V8.15Z"/></svg>`,
  phone: `<svg class="card-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 2.93c.3-.3.75-.4 1.14-.25l2.3.86c.52.19.83.73.74 1.28l-.39 2.36a1.35 1.35 0 0 1-.78 1.02l-1.42.68a14.57 14.57 0 0 0 6.91 6.91l.68-1.42c.18-.38.56-.66 1.02-.78l2.36-.39c.55-.09 1.09.22 1.28.74l.86 2.3c.15.39.05.84-.25 1.14l-1.26 1.26c-.77.77-1.9 1.1-2.97.87-2.66-.59-5.2-1.98-7.58-4.35-2.37-2.38-3.76-4.92-4.35-7.58-.23-1.07.1-2.2.87-2.97l1.26-1.26Z"/></svg>`
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
const editDaysLineInput = document.getElementById("editDaysLine");
const editSubtitleInput = document.getElementById("editSubtitle");
const editHoursLineInput = document.getElementById("editHoursLine");
const editStatusLineInput = document.getElementById("editStatusLine");
const editServiceLineInput = document.getElementById("editServiceLine");
const editEmailInput = document.getElementById("editEmail");
const editPhoneInput = document.getElementById("editPhone");
const editGastronomyFields = document.getElementById("editGastronomyFields");
const editHotelFields = document.getElementById("editHotelFields");
const editPhotoInput = document.getElementById("editPhoto");
const editCurrentPhotoUrlInput = document.getElementById("editCurrentPhotoUrl");
const editPhotoPreviewWrap = document.getElementById("editPhotoPreviewWrap");
const editPhotoPreview = document.getElementById("editPhotoPreview");

let activeCategoryFilter = "todos";
let activeStatusFilter = "pending";
let recordsState = [];
let selectedEditPhotoFile = null;

function normalizeLine(value) {
  return String(value || "").trim();
}

function normalizeCategory(value) {
  return value === "gastronomia" || value === "hotel" ? value : "";
}

function normalizeStatus(value) {
  return VALID_STATUSES.includes(value) ? value : "pending";
}

function digitsOnly(value) {
  return normalizeLine(value).replace(/\D/g, "");
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

function buildGastronomyScheduleLine(daysLine, hoursLine, fallbackLine = "") {
  const parts = [normalizeLine(daysLine), normalizeLine(hoursLine)].filter(Boolean);
  return parts.length ? parts.join(", ") : normalizeLine(fallbackLine);
}

function fallbackImage(category) {
  if (category === "gastronomia") {
    return "https://placehold.co/1200x800?text=Bar+ou+Restaurante";
  }

  if (category === "hotel") {
    return "https://placehold.co/1200x800?text=Hotel+ou+Pousada";
  }

  return "https://placehold.co/1200x800?text=Ponto+Turistico";
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
  return [
    buildGastronomyScheduleLine(record.guide?.daysLine, record.guide?.hoursLine),
    normalizeLine(record.guide?.addressLine)
  ].filter(Boolean);
}

function getHotelMetaLines(record) {
  return [
    normalizeLine(record.guide?.addressLine),
    normalizeLine(record.contacts?.email) || "E-mail nao informado",
    normalizeLine(record.contacts?.phone)
  ].filter(Boolean);
}

function buildGuideUrl(record) {
  const params = new URLSearchParams();

  if (record.category) {
    params.set("filter", record.category);
  }

  if (record.pointId || record.mapFocus) {
    params.set("focus", record.pointId || record.mapFocus);
  }

  return `../guia-do-turista.html?${params.toString()}#mapa`;
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

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Nao foi possivel concluir a operacao no servidor.");
  }

  return result;
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
    statusText.textContent = "Nenhum cadastro sincronizado com o servidor ainda.";
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

  const guideButton = document.createElement("button");
  guideButton.className = "card-button";
  guideButton.type = "button";
  guideButton.textContent = isApproved ? "Ver no guia" : "Aguardando validacao";
  guideButton.disabled = !isApproved;
  if (isApproved) {
    guideButton.addEventListener("click", () => {
      window.open(buildGuideUrl(record), "_blank", "noopener,noreferrer");
    });
  }
  actions.appendChild(guideButton);

  const linksInline = document.createElement("div");
  linksInline.className = "card-actions-inline";

  const instagramLink = iconLink(contacts.instagram, "card-link--instagram", "Instagram", ICONS.instagram);
  const whatsappLink = iconLink(contacts.whatsapp, "card-link--whatsapp", "WhatsApp", ICONS.whatsapp);
  const emailLink = iconLink(contacts.email ? `mailto:${contacts.email}` : "", "card-link--email", "E-mail", ICONS.email);
  const phoneLink = iconLink(contacts.phoneUrl || buildPhoneUrl(contacts.phone), "card-link--phone", "Contato", ICONS.phone);
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
  const filtered = filterRecords(recordsState);

  cardsGrid.innerHTML = "";
  filtered.forEach((record) => {
    cardsGrid.appendChild(createCard(record));
  });

  setEmptyState(recordsState, filtered);
  setStatus(recordsState, filtered.length);
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

function resetEditPhotoSelection() {
  selectedEditPhotoFile = null;
  editPhotoInput.value = "";
}

function setEditPhotoPreview(url) {
  const normalized = normalizeLine(url);
  if (!normalized) {
    editPhotoPreviewWrap.hidden = true;
    editPhotoPreview.src = "";
    return;
  }

  editPhotoPreviewWrap.hidden = false;
  editPhotoPreview.src = normalized;
}

function getEditDraft(record) {
  return {
    name: record.name || "",
    description: record.description || "",
    addressLine: record.guide?.addressLine || "",
    instagram: record.contacts?.instagram || "",
    whatsapp: record.contacts?.whatsapp || "",
    daysLine: record.category === "gastronomia" ? (record.guide?.daysLine || "") : "",
    subtitle: record.category === "gastronomia" ? (record.guide?.subtitle || "") : "",
    hoursLine: record.category === "gastronomia" ? (record.guide?.hoursLine || "") : "",
    statusLine: record.category === "hotel" ? (record.guide?.statusLine || "") : "",
    serviceLine: record.category === "hotel" ? (record.guide?.serviceLine || "") : "",
    email: record.category === "hotel" ? (record.contacts?.email || "") : "",
    phone: record.category === "hotel" ? (record.contacts?.phone || "") : "",
    photoSrc: record.photoSrc || ""
  };
}

function openEditDialog(recordId) {
  const record = recordsState.find((item) => item.id === recordId);

  if (!record) {
    return;
  }

  const draft = getEditDraft(record);

  editRecordIdInput.value = record.id || "";
  editCategoryInput.value = record.category || "";
  editCurrentPhotoUrlInput.value = draft.photoSrc;
  editNameInput.value = draft.name;
  editDescriptionInput.value = draft.description;
  editAddressLineInput.value = draft.addressLine;
  editInstagramInput.value = draft.instagram;
  editWhatsappInput.value = draft.whatsapp;
  editDaysLineInput.value = draft.daysLine;
  editSubtitleInput.value = draft.subtitle;
  editHoursLineInput.value = draft.hoursLine;
  editStatusLineInput.value = draft.statusLine;
  editServiceLineInput.value = draft.serviceLine;
  editEmailInput.value = draft.email;
  editPhoneInput.value = draft.phone;
  resetEditPhotoSelection();
  setEditPhotoPreview(draft.photoSrc);
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

  resetEditPhotoSelection();

  if (typeof editDialog.close === "function") {
    editDialog.close();
    return;
  }

  editDialog.removeAttribute("open");
}

function buildEditPayload() {
  const category = normalizeCategory(editCategoryInput.value);
  const name = normalizeLine(editNameInput.value);
  const addressLine = normalizeLine(editAddressLineInput.value);
  const mapQuery = buildMapQuery(name, addressLine);

  return {
    category,
    name,
    description: normalizeLine(editDescriptionInput.value),
    addressLine,
    instagram: normalizeLine(editInstagramInput.value),
    whatsapp: normalizeLine(editWhatsappInput.value),
    email: category === "hotel" ? normalizeLine(editEmailInput.value) : "",
    phone: category === "hotel" ? normalizeLine(editPhoneInput.value) : "",
    daysLine: category === "gastronomia" ? normalizeLine(editDaysLineInput.value) : "",
    subtitle: category === "gastronomia" ? normalizeLine(editSubtitleInput.value) : "",
    hoursLine: category === "gastronomia" ? normalizeLine(editHoursLineInput.value) : "",
    statusLine: category === "hotel" ? normalizeLine(editStatusLineInput.value) : "",
    serviceLine: category === "hotel" ? normalizeLine(editServiceLineInput.value) : "",
    mapQuery,
    directionsUrl: buildDirectionsUrl(mapQuery),
    popupTitleColor: category === "hotel" ? "#3568c9" : "#c9642b",
    photoUrl: normalizeLine(editCurrentPhotoUrlInput.value),
    currentPhotoUrl: normalizeLine(editCurrentPhotoUrlInput.value)
  };
}

async function loadRecords() {
  statusText.textContent = "Sincronizando cadastros com o servidor...";
  const result = await apiRequest("/admin/submissions");
  recordsState = Array.isArray(result.records) ? result.records : [];
  renderCards();
}

async function saveEditedRecord(event) {
  event.preventDefault();

  const recordId = normalizeLine(editRecordIdInput.value);
  const payload = buildEditPayload();

  if (!recordId || !payload.category) {
    return;
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value || "");
  });

  if (selectedEditPhotoFile) {
    formData.append("photo", selectedEditPhotoFile);
  }

  try {
    await apiRequest(`/admin/submissions/${encodeURIComponent(recordId)}`, {
      method: "PATCH",
      body: formData
    });
    closeEditDialog();
    await loadRecords();
  } catch (error) {
    window.alert(error.message || "Nao foi possivel salvar a edicao.");
  }
}

async function setRecordStatus(recordId, nextStatus) {
  const targetStatus = normalizeStatus(nextStatus);

  if (!recordId) {
    return;
  }

  if (targetStatus === "rejected") {
    const confirmed = window.confirm("Deseja recusar este cadastro? Ele nao aparecera no guia publico enquanto estiver recusado.");
    if (!confirmed) {
      return;
    }
  }

  try {
    await apiRequest(`/admin/submissions/${encodeURIComponent(recordId)}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: targetStatus })
    });
    if (normalizeLine(editRecordIdInput.value) === recordId) {
      closeEditDialog();
    }
    await loadRecords();
  } catch (error) {
    window.alert(error.message || "Nao foi possivel atualizar o status.");
  }
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

refreshBtn.addEventListener("click", async () => {
  try {
    await loadRecords();
  } catch (error) {
    statusText.textContent = error.message || "Nao foi possivel atualizar a lista.";
  }
});

clearBtn.addEventListener("click", async () => {
  const ok = confirm("Deseja realmente apagar todos os estabelecimentos cadastrados no servidor?");
  if (!ok) {
    return;
  }

  try {
    await apiRequest("/admin/submissions", {
      method: "DELETE"
    });
    closeEditDialog();
    await loadRecords();
  } catch (error) {
    window.alert(error.message || "Nao foi possivel limpar os cadastros.");
  }
});

editPhotoInput.addEventListener("change", () => {
  const file = editPhotoInput.files && editPhotoInput.files[0];
  if (!file) {
    selectedEditPhotoFile = null;
    setEditPhotoPreview(editCurrentPhotoUrlInput.value);
    return;
  }

  selectedEditPhotoFile = file;
  const reader = new FileReader();
  reader.onload = () => setEditPhotoPreview(reader.result);
  reader.onerror = () => {
    selectedEditPhotoFile = null;
    setEditPhotoPreview(editCurrentPhotoUrlInput.value);
    window.alert("Nao foi possivel carregar a nova imagem.");
  };
  reader.readAsDataURL(file);
});

editForm.addEventListener("submit", saveEditedRecord);
cancelEditBtn.addEventListener("click", closeEditDialog);
closeEditBtn.addEventListener("click", closeEditDialog);

loadRecords().catch((error) => {
  statusText.textContent = error.message || "Nao foi possivel carregar os cadastros do servidor.";
  emptyState.hidden = false;
  emptyState.textContent = "Verifique se a API e o banco MySQL estao ativos.";
});

const CATALOG_FILTER_LABELS = {
  todos: "todos os cards oficiais",
  turistico: "pontos turisticos",
  gastronomia: "gastronomia",
  hotel: "hoteis/pousadas"
};

const CATALOG_CATEGORY_BADGES = {
  turistico: "Ponto turistico",
  gastronomia: "Gastronomia",
  hotel: "Hotel/Pousada"
};

const catalogCardsGrid = document.getElementById("catalogCardsGrid");
const catalogEmptyState = document.getElementById("catalogEmptyState");
const catalogStatusText = document.getElementById("catalogStatusText");
const catalogRefreshBtn = document.getElementById("catalogRefreshBtn");
const catalogFilterButtons = Array.from(document.querySelectorAll("[data-catalog-filter]"));
const catalogEditDialog = document.getElementById("catalogEditDialog");
const catalogEditForm = document.getElementById("catalogEditForm");
const catalogEditHint = document.getElementById("catalogEditHint");
const catalogCancelEditBtn = document.getElementById("catalogCancelEditBtn");
const catalogCloseEditBtn = document.getElementById("catalogCloseEditBtn");
const catalogEditRecordIdInput = document.getElementById("catalogEditRecordId");
const catalogEditCategoryInput = document.getElementById("catalogEditCategory");
const catalogEditCurrentPhotoUrlInput = document.getElementById("catalogEditCurrentPhotoUrl");
const catalogEditPointIdInput = document.getElementById("catalogEditPointId");
const catalogEditDisplayOrderInput = document.getElementById("catalogEditDisplayOrder");
const catalogEditIsActiveInput = document.getElementById("catalogEditIsActive");
const catalogEditNameInput = document.getElementById("catalogEditName");
const catalogEditSubtitleInput = document.getElementById("catalogEditSubtitle");
const catalogEditDescriptionInput = document.getElementById("catalogEditDescription");
const catalogEditAddressLineInput = document.getElementById("catalogEditAddressLine");
const catalogEditScheduleLineInput = document.getElementById("catalogEditScheduleLine");
const catalogEditPhotoInput = document.getElementById("catalogEditPhoto");
const catalogEditPhotoPreviewWrap = document.getElementById("catalogEditPhotoPreviewWrap");
const catalogEditPhotoPreview = document.getElementById("catalogEditPhotoPreview");
const catalogEditInstagramInput = document.getElementById("catalogEditInstagram");
const catalogEditWhatsappInput = document.getElementById("catalogEditWhatsapp");
const catalogEditEmailInput = document.getElementById("catalogEditEmail");
const catalogEditPhoneInput = document.getElementById("catalogEditPhone");
const catalogScheduleFieldWrap = document.getElementById("catalogScheduleFieldWrap");
const catalogSocialFields = document.getElementById("catalogSocialFields");
const catalogHotelContactFields = document.getElementById("catalogHotelContactFields");

let catalogActiveCategoryFilter = "todos";
let catalogRecordsState = [];
let selectedCatalogPhotoFile = null;

function normalizeCatalogCategory(value) {
  return ["turistico", "gastronomia", "hotel"].includes(value) ? value : "turistico";
}

function categoryBadgeLabel(category) {
  return CATALOG_CATEGORY_BADGES[normalizeCatalogCategory(category)] || "Card";
}

function createCategoryBadge(category) {
  const normalized = normalizeCatalogCategory(category);
  const badge = document.createElement("span");
  badge.className = `category-badge category-badge--${normalized}`;
  badge.textContent = categoryBadgeLabel(normalized);
  return badge;
}

function buildCatalogMetaLines(record) {
  const contacts = record.contacts || {};

  if (record.category === "gastronomia") {
    return [normalizeLine(record.scheduleLine), normalizeLine(record.addressLine)].filter(Boolean);
  }

  if (record.category === "hotel") {
    return [
      normalizeLine(record.addressLine),
      normalizeLine(contacts.email) || "E-mail nao informado",
      normalizeLine(contacts.phone)
    ].filter(Boolean);
  }

  return [normalizeLine(record.addressLine)].filter(Boolean);
}

function filterCatalogRecords(records) {
  return records.filter((record) => {
    return catalogActiveCategoryFilter === "todos" || record.category === catalogActiveCategoryFilter;
  });
}

function setCatalogStatus(records, visibleCount) {
  if (!records.length) {
    catalogStatusText.textContent = "Nenhum card oficial sincronizado com o servidor ainda.";
    return;
  }

  const counts = records.reduce((accumulator, record) => {
    const key = normalizeCatalogCategory(record.category);
    accumulator[key] += 1;
    accumulator.total += 1;
    accumulator.active += record.isActive ? 1 : 0;
    return accumulator;
  }, {
    total: 0,
    active: 0,
    turistico: 0,
    gastronomia: 0,
    hotel: 0
  });

  const inactiveCount = counts.total - counts.active;
  const label = CATALOG_FILTER_LABELS[catalogActiveCategoryFilter] || CATALOG_FILTER_LABELS.todos;

  catalogStatusText.textContent = `Cards oficiais: ${counts.total} | Ativos: ${counts.active} | Inativos: ${inactiveCount}. Exibindo ${visibleCount} card(s) em ${label}.`;
}

function setCatalogEmptyState(records, filtered) {
  if (filtered.length) {
    catalogEmptyState.hidden = true;
    return;
  }

  catalogEmptyState.hidden = false;

  if (!records.length) {
    catalogEmptyState.textContent = "Nenhum card oficial encontrado na base ainda.";
    return;
  }

  const label = CATALOG_FILTER_LABELS[catalogActiveCategoryFilter] || CATALOG_FILTER_LABELS.todos;
  catalogEmptyState.textContent = `Nenhum card oficial encontrado em ${label}.`;
}

function createCatalogCard(record) {
  const article = document.createElement("article");
  article.className = "attraction-card";
  article.dataset.category = record.category || "";
  article.dataset.pointId = record.pointId || "";
  article.dataset.cardId = record.id || "";

  const image = document.createElement("img");
  image.src = record.photoSrc || fallbackImage(record.category);
  image.alt = record.imageAlt || record.name || "Card oficial";
  image.loading = "lazy";

  const content = document.createElement("div");
  content.className = "card-content";

  const topline = document.createElement("div");
  topline.className = "catalog-card-topline";
  topline.appendChild(createCategoryBadge(record.category));
  topline.appendChild(createStatusBadge(record.isActive ? "approved" : "rejected"));

  const title = document.createElement("h3");
  title.textContent = record.name || "Sem nome";

  const subtitle = normalizeLine(record.subtitle);
  const description = document.createElement("p");
  description.textContent = subtitle
    ? mergeGuideDescription(subtitle, record.description || "")
    : normalizeLine(record.description) || "Sem descricao informada.";

  const metaLines = buildCatalogMetaLines(record);
  const meta = document.createElement("div");
  meta.className = "card-meta";
  metaLines.forEach((line) => {
    const span = document.createElement("span");
    span.textContent = line;
    meta.appendChild(span);
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const editButton = document.createElement("button");
  editButton.className = "card-button";
  editButton.type = "button";
  editButton.textContent = "Editar card";
  editButton.addEventListener("click", () => openCatalogEditDialog(record.id));
  actions.appendChild(editButton);

  const linksInline = document.createElement("div");
  linksInline.className = "card-actions-inline";
  const contacts = record.contacts || {};
  const actionLinks = record.category === "turistico"
    ? []
    : record.category === "gastronomia"
      ? [
          iconLink(contacts.instagram, "card-link--instagram", "Instagram", ICONS.instagram),
          iconLink(contacts.whatsapp, "card-link--whatsapp", "WhatsApp", ICONS.whatsapp)
        ]
      : [
          iconLink(contacts.instagram, "card-link--instagram", "Instagram", ICONS.instagram),
          iconLink(contacts.email ? `mailto:${contacts.email}` : "", "card-link--email", "E-mail", ICONS.email),
          iconLink(contacts.whatsapp, "card-link--whatsapp", "WhatsApp", ICONS.whatsapp),
          iconLink(contacts.phoneUrl || buildPhoneUrl(contacts.phone), "card-link--phone", "Contato", ICONS.phone)
        ];

  actionLinks.forEach((link) => {
    if (link) {
      linksInline.appendChild(link);
    }
  });

  if (linksInline.children.length) {
    actions.appendChild(linksInline);
  }

  const footerNote = document.createElement("p");
  footerNote.className = "card-date";
  footerNote.textContent = `Ordem ${Number(record.displayOrder || 0)} | Atualizado em ${formatDateTime(record.updatedAt)}`;

  content.appendChild(topline);
  content.appendChild(title);
  content.appendChild(description);
  if (metaLines.length) {
    content.appendChild(meta);
  }
  content.appendChild(actions);
  content.appendChild(footerNote);

  article.appendChild(image);
  article.appendChild(content);
  return article;
}

function renderCatalogCards() {
  const filtered = filterCatalogRecords(catalogRecordsState);

  catalogCardsGrid.innerHTML = "";
  filtered.forEach((record) => {
    catalogCardsGrid.appendChild(createCatalogCard(record));
  });

  setCatalogEmptyState(catalogRecordsState, filtered);
  setCatalogStatus(catalogRecordsState, filtered.length);
}

function updateCatalogFilterButtons() {
  catalogFilterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.catalogFilter === catalogActiveCategoryFilter);
  });
}

function setCatalogActiveCategoryFilter(value) {
  catalogActiveCategoryFilter = ["todos", "turistico", "gastronomia", "hotel"].includes(value) ? value : "todos";
  updateCatalogFilterButtons();
  renderCatalogCards();
}

function resetCatalogPhotoSelection() {
  selectedCatalogPhotoFile = null;
  if (catalogEditPhotoInput) {
    catalogEditPhotoInput.value = "";
  }
}

function setCatalogPhotoPreview(url) {
  const normalized = normalizeLine(url);
  if (!normalized) {
    catalogEditPhotoPreviewWrap.hidden = true;
    catalogEditPhotoPreview.src = "";
    return;
  }

  catalogEditPhotoPreviewWrap.hidden = false;
  catalogEditPhotoPreview.src = normalized;
}

function toggleCatalogDialogFields(category) {
  const normalized = normalizeCatalogCategory(category);
  const isTourism = normalized === "turistico";
  const isHotel = normalized === "hotel";
  const isGastronomy = normalized === "gastronomia";

  catalogScheduleFieldWrap.hidden = !isGastronomy;
  catalogSocialFields.hidden = isTourism;
  catalogHotelContactFields.hidden = !isHotel;

  if (catalogEditHint) {
    catalogEditHint.textContent = isTourism
      ? "Esse card turistico aparece no Guia do Turista assim que a alteracao for salva."
      : isHotel
        ? "Os dados de contato e hospedagem serao publicados no guia logo apos salvar."
        : "Esse card de gastronomia sera atualizado no guia assim que a alteracao for salva.";
  }
}

function getCatalogEditDraft(record) {
  const contacts = record.contacts || {};
  return {
    id: record.id || "",
    pointId: record.pointId || "",
    category: normalizeCatalogCategory(record.category),
    displayOrder: Number(record.displayOrder || 0),
    isActive: Boolean(record.isActive),
    name: record.name || "",
    subtitle: record.subtitle || "",
    description: record.description || "",
    addressLine: record.addressLine || "",
    scheduleLine: record.scheduleLine || "",
    photoSrc: record.photoSrc || "",
    instagram: contacts.instagram || "",
    whatsapp: contacts.whatsapp || "",
    email: contacts.email || "",
    phone: contacts.phone || ""
  };
}

function openCatalogEditDialog(recordId) {
  const record = catalogRecordsState.find((item) => item.id === recordId);

  if (!record) {
    return;
  }

  const draft = getCatalogEditDraft(record);
  catalogEditRecordIdInput.value = draft.id;
  catalogEditCategoryInput.value = draft.category;
  catalogEditCurrentPhotoUrlInput.value = draft.photoSrc;
  catalogEditPointIdInput.value = draft.pointId;
  catalogEditDisplayOrderInput.value = draft.displayOrder || 0;
  catalogEditIsActiveInput.checked = draft.isActive;
  catalogEditNameInput.value = draft.name;
  catalogEditSubtitleInput.value = draft.subtitle;
  catalogEditDescriptionInput.value = draft.description;
  catalogEditAddressLineInput.value = draft.addressLine;
  catalogEditScheduleLineInput.value = draft.scheduleLine;
  catalogEditInstagramInput.value = draft.instagram;
  catalogEditWhatsappInput.value = draft.whatsapp;
  catalogEditEmailInput.value = draft.email;
  catalogEditPhoneInput.value = draft.phone;
  resetCatalogPhotoSelection();
  setCatalogPhotoPreview(draft.photoSrc);
  toggleCatalogDialogFields(draft.category);

  if (typeof catalogEditDialog.showModal === "function") {
    catalogEditDialog.showModal();
  } else {
    catalogEditDialog.setAttribute("open", "open");
  }
}

function closeCatalogEditDialog() {
  if (!catalogEditDialog.hasAttribute("open")) {
    return;
  }

  resetCatalogPhotoSelection();

  if (typeof catalogEditDialog.close === "function") {
    catalogEditDialog.close();
    return;
  }

  catalogEditDialog.removeAttribute("open");
}

function buildCatalogPayload() {
  const category = normalizeCatalogCategory(catalogEditCategoryInput.value);
  const isTourism = category === "turistico";
  const isHotel = category === "hotel";
  const isGastronomy = category === "gastronomia";

  return {
    category,
    name: normalizeLine(catalogEditNameInput.value),
    subtitle: normalizeLine(catalogEditSubtitleInput.value),
    description: normalizeLine(catalogEditDescriptionInput.value),
    addressLine: normalizeLine(catalogEditAddressLineInput.value),
    scheduleLine: isGastronomy ? normalizeLine(catalogEditScheduleLineInput.value) : "",
    instagram: isTourism ? "" : normalizeLine(catalogEditInstagramInput.value),
    whatsapp: isTourism ? "" : normalizeLine(catalogEditWhatsappInput.value),
    email: isHotel ? normalizeLine(catalogEditEmailInput.value) : "",
    phone: isHotel ? normalizeLine(catalogEditPhoneInput.value) : "",
    imageAlt: normalizeLine(catalogEditNameInput.value),
    photoUrl: normalizeLine(catalogEditCurrentPhotoUrlInput.value),
    currentPhotoUrl: normalizeLine(catalogEditCurrentPhotoUrlInput.value),
    displayOrder: normalizeLine(catalogEditDisplayOrderInput.value) || "0",
    isActive: catalogEditIsActiveInput.checked ? "true" : "false"
  };
}

async function saveCatalogCard(event) {
  event.preventDefault();

  const recordId = normalizeLine(catalogEditRecordIdInput.value);
  const payload = buildCatalogPayload();

  if (!recordId || !payload.name || !payload.description) {
    window.alert("Preencha pelo menos nome e descricao do card.");
    return;
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value || "");
  });

  if (selectedCatalogPhotoFile) {
    formData.append("photo", selectedCatalogPhotoFile);
  }

  try {
    await apiRequest(`/admin/cards/${encodeURIComponent(recordId)}`, {
      method: "PATCH",
      body: formData
    });
    closeCatalogEditDialog();
    await loadCatalogCards();
  } catch (error) {
    window.alert(error.message || "Nao foi possivel salvar o card oficial.");
  }
}

async function loadCatalogCards() {
  if (!catalogCardsGrid) {
    return;
  }

  catalogStatusText.textContent = "Sincronizando cards oficiais com o servidor...";
  const result = await apiRequest("/admin/cards");
  catalogRecordsState = Array.isArray(result.records) ? result.records : [];
  renderCatalogCards();
}

catalogFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCatalogActiveCategoryFilter(button.dataset.catalogFilter || "todos");
  });
});

catalogRefreshBtn?.addEventListener("click", async () => {
  try {
    await loadCatalogCards();
  } catch (error) {
    catalogStatusText.textContent = error.message || "Nao foi possivel atualizar os cards oficiais.";
  }
});

catalogEditPhotoInput?.addEventListener("change", () => {
  const file = catalogEditPhotoInput.files && catalogEditPhotoInput.files[0];
  if (!file) {
    selectedCatalogPhotoFile = null;
    setCatalogPhotoPreview(catalogEditCurrentPhotoUrlInput.value);
    return;
  }

  selectedCatalogPhotoFile = file;
  const reader = new FileReader();
  reader.onload = () => setCatalogPhotoPreview(reader.result);
  reader.onerror = () => {
    selectedCatalogPhotoFile = null;
    setCatalogPhotoPreview(catalogEditCurrentPhotoUrlInput.value);
    window.alert("Nao foi possivel carregar a nova imagem do card.");
  };
  reader.readAsDataURL(file);
});

catalogEditForm?.addEventListener("submit", saveCatalogCard);
catalogCancelEditBtn?.addEventListener("click", closeCatalogEditDialog);
catalogCloseEditBtn?.addEventListener("click", closeCatalogEditDialog);

loadCatalogCards().catch((error) => {
  catalogStatusText.textContent = error.message || "Nao foi possivel carregar os cards oficiais.";
  catalogEmptyState.hidden = false;
  catalogEmptyState.textContent = "Verifique se a API e o banco MySQL estao ativos.";
});
