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

class UnauthorizedError extends Error {}

const authPanel = document.getElementById("authPanel");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("loginForm");
const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const loginFeedback = document.getElementById("loginFeedback");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sessionPill = document.getElementById("sessionPill");

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
const editLatitudeInput = document.getElementById("editLatitude");
const editLongitudeInput = document.getElementById("editLongitude");
const editMapLocateBtn = document.getElementById("editMapLocateBtn");
const editMapStatus = document.getElementById("editMapStatus");
const editMapSummary = document.getElementById("editMapSummary");
const editLocationMapElement = document.getElementById("editLocationMap");

let activeCategoryFilter = "todos";
let activeStatusFilter = "pending";
let recordsState = [];
let selectedEditPhotoFile = null;
let adminAuthenticated = false;
let adminMapsLoaderPromise = null;

const DEFAULT_MAP_CENTER = { lat: -13.0265, lng: -39.6085 };
const DEFAULT_MAP_ZOOM = 14;
const GOOGLE_MAPS_API_KEY = "AIzaSyBdddKSwLzMfQdvDOYIO2Qx5ZX7RiF6syc";

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

function sanitizePhoneValue(value) {
  return normalizeLine(value).replace(/[^\d()+\-\s]/g, "");
}

function bindPhoneSanitizer(input) {
  input?.addEventListener("input", () => {
    const sanitized = sanitizePhoneValue(input.value);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
  });
}

function normalizeDisplayOrderValue(value, fallback = 1) {
  const parsed = Number.parseInt(normalizeLine(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : String(fallback);
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

function buildStructuredAddressLine(street, number, neighborhood, complement = "", reference = "") {
  const streetNumber = [normalizeLine(street), normalizeLine(number)].filter(Boolean).join(", ");
  return [streetNumber, normalizeLine(neighborhood), normalizeLine(complement), normalizeLine(reference)]
    .filter(Boolean)
    .join(" | ");
}

function buildStructuredLocationQuery(street, number, neighborhood) {
  return [
    normalizeLine(street),
    normalizeLine(number),
    normalizeLine(neighborhood),
    "Amargosa",
    "Bahia",
    "Brasil"
  ]
    .filter(Boolean)
    .join(", ");
}

function splitAddressLine(addressLine) {
  const normalized = normalizeLine(addressLine);
  const result = {
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    reference: ""
  };

  if (!normalized) {
    return result;
  }

  const pipeParts = normalized.split("|").map(normalizeLine).filter(Boolean);
  const mainAddress = pipeParts[0] || normalized;
  result.neighborhood = pipeParts[1] || "";
  result.complement = pipeParts[2] || "";
  result.reference = pipeParts[3] || "";

  const commaParts = mainAddress.split(",").map(normalizeLine).filter(Boolean);
  if (commaParts.length >= 2) {
    result.street = commaParts[0];
    result.number = commaParts[1];
    result.neighborhood = result.neighborhood || commaParts.slice(2).join(", ");
  } else {
    result.street = mainAddress;
  }

  return result;
}

function fillCatalogAddressFields(addressLine) {
  const address = splitAddressLine(addressLine);
  catalogEditAddressLineInput.value = normalizeLine(addressLine);
  catalogEditLogradouroInput.value = address.street;
  catalogEditNumeroInput.value = address.number;
  catalogEditComplementoInput.value = address.complement;
  catalogEditReferenciaInput.value = address.reference;
  catalogEditBairroInput.value = address.neighborhood;
}

function clearCatalogAddressFields() {
  catalogEditAddressLineInput.value = "";
  catalogEditLogradouroInput.value = "";
  catalogEditNumeroInput.value = "";
  catalogEditComplementoInput.value = "";
  catalogEditReferenciaInput.value = "";
  catalogEditBairroInput.value = "";
}

function buildCatalogAddressLineFromFields() {
  return buildStructuredAddressLine(
    catalogEditLogradouroInput.value,
    catalogEditNumeroInput.value,
    catalogEditBairroInput.value,
    catalogEditComplementoInput.value,
    catalogEditReferenciaInput.value
  );
}

function hasCatalogRequiredAddressParts() {
  return Boolean(
    normalizeLine(catalogEditLogradouroInput.value)
    && normalizeLine(catalogEditNumeroInput.value)
    && normalizeLine(catalogEditBairroInput.value)
  );
}

function buildDirectionsUrl(mapQuery) {
  return mapQuery ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}` : "";
}

function getLatLngLiteral(position) {
  if (!position) {
    return null;
  }

  if (typeof position.lat === "function" && typeof position.lng === "function") {
    return {
      lat: Number(position.lat()),
      lng: Number(position.lng())
    };
  }

  if (typeof position.lat === "number" && typeof position.lng === "number") {
    return {
      lat: Number(position.lat),
      lng: Number(position.lng)
    };
  }

  return null;
}

function formatCoordinate(value) {
  return Number(value).toFixed(6);
}

function buildDirectionsUrlFromCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return "";
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function hasConfirmedCoordinates(latitude, longitude) {
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
}

function createAdminMapPickerState(options) {
  return {
    canvas: options.canvas,
    statusNode: options.statusNode,
    summaryNode: options.summaryNode,
    latitudeInput: options.latitudeInput,
    longitudeInput: options.longitudeInput,
    locateButton: options.locateButton,
    buildQuery: options.buildQuery,
    idleMessage: options.idleMessage,
    notFoundMessage: options.notFoundMessage,
    locatedMessage: options.locatedMessage,
    adjustedMessage: options.adjustedMessage,
    changedMessage: options.changedMessage,
    map: null,
    marker: null,
    geocoder: null
  };
}

function setMapPickerStatus(state, message, isError = false) {
  if (!state?.statusNode) {
    return;
  }

  state.statusNode.textContent = message;
  state.statusNode.classList.toggle("is-error", Boolean(isError));
}

function updateMapPickerSummary(state, position) {
  const literal = getLatLngLiteral(position);

  if (!state?.summaryNode) {
    return;
  }

  if (!literal) {
    state.summaryNode.hidden = true;
    state.summaryNode.textContent = "";
    return;
  }

  state.summaryNode.hidden = false;
  state.summaryNode.textContent = `Posicao confirmada: ${formatCoordinate(literal.lat)}, ${formatCoordinate(literal.lng)}.`;
}

function clearMapPickerCoordinates(state) {
  state.latitudeInput.value = "";
  state.longitudeInput.value = "";
  updateMapPickerSummary(state, null);
}

function storeMapPickerCoordinates(state, position) {
  const literal = getLatLngLiteral(position);

  if (!literal) {
    clearMapPickerCoordinates(state);
    return;
  }

  state.latitudeInput.value = literal.lat.toFixed(8);
  state.longitudeInput.value = literal.lng.toFixed(8);
  updateMapPickerSummary(state, literal);
}

function ensureMapPickerInstance(state) {
  if (!state?.canvas || !window.google?.maps) {
    return;
  }

  if (!state.map) {
    state.map = new google.maps.Map(state.canvas, {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    state.geocoder = new google.maps.Geocoder();
    state.canvas.classList.add("is-ready");

    state.map.addListener("click", (event) => {
      if (!event.latLng) {
        return;
      }

      placeMapPickerMarker(state, event.latLng);
      setMapPickerStatus(state, state.adjustedMessage);
    });
  }
}

function ensureAdminMapsReady(state) {
  if (window.google?.maps) {
    ensureMapPickerInstance(state);
    return Promise.resolve();
  }

  if (!adminMapsLoaderPromise) {
    adminMapsLoaderPromise = new Promise((resolve, reject) => {
      window.__amargosaInitAdminMapPicker = () => {
        try {
          ensureMapPickerInstance(submissionMapPickerState);
          ensureMapPickerInstance(catalogMapPickerState);
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          delete window.__amargosaInitAdminMapPicker;
        }
      };

      const script = document.createElement("script");
      script.id = "googleMapsAdminPickerScript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=__amargosaInitAdminMapPicker`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        adminMapsLoaderPromise = null;
        delete window.__amargosaInitAdminMapPicker;
        reject(new Error("Nao foi possivel carregar o mapa neste momento."));
      };

      document.head.appendChild(script);
    });
  }

  return adminMapsLoaderPromise.then(() => {
    ensureMapPickerInstance(state);
  });
}

function placeMapPickerMarker(state, position, shouldCenter = true) {
  const literal = getLatLngLiteral(position);

  if (!literal || !state.map || !window.google?.maps) {
    return;
  }

  if (!state.marker) {
    state.marker = new google.maps.Marker({
      position: literal,
      map: state.map,
      draggable: true,
      title: "Localizacao confirmada"
    });

    state.marker.addListener("dragend", (event) => {
      storeMapPickerCoordinates(state, event.latLng);
      setMapPickerStatus(state, state.adjustedMessage);
    });
  } else {
    state.marker.setPosition(literal);
    state.marker.setMap(state.map);
  }

  if (shouldCenter) {
    state.map.setCenter(literal);
  }

  storeMapPickerCoordinates(state, literal);
}

function resetMapPicker(state, showMessage = true) {
  clearMapPickerCoordinates(state);

  if (state.marker) {
    state.marker.setMap(null);
    state.marker = null;
  }

  if (state.map) {
    state.map.setCenter(DEFAULT_MAP_CENTER);
    state.map.setZoom(DEFAULT_MAP_ZOOM);
  }

  if (showMessage) {
    setMapPickerStatus(state, state.idleMessage);
  }
}

function hydrateMapPickerFromCoordinates(state, latitude, longitude, statusMessage) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    clearMapPickerCoordinates(state);
    setMapPickerStatus(state, statusMessage || state.idleMessage);
    return;
  }

  state.latitudeInput.value = lat.toFixed(8);
  state.longitudeInput.value = lng.toFixed(8);
  updateMapPickerSummary(state, { lat, lng });
  setMapPickerStatus(state, statusMessage || "Localizacao atual carregada. Clique em \"Abrir / localizar\" para revisar ou ajustar.");
}

function invalidateMapPicker(state) {
  if (!state.latitudeInput.value && !state.longitudeInput.value) {
    return;
  }

  resetMapPicker(state, false);
  setMapPickerStatus(state, state.changedMessage);
}

async function openMapPickerAtAddress(state) {
  const query = normalizeLine(state.buildQuery());
  const existingLatitude = Number(state.latitudeInput.value);
  const existingLongitude = Number(state.longitudeInput.value);
  const hasExistingCoordinates = Number.isFinite(existingLatitude) && Number.isFinite(existingLongitude);

  if (!query && !hasExistingCoordinates) {
    setMapPickerStatus(state, "Informe um nome e um endereco antes de localizar no mapa.", true);
    return;
  }

  state.locateButton.disabled = true;
  setMapPickerStatus(state, "Carregando mapa e localizando endereco...");

  try {
    await ensureAdminMapsReady(state);
  } catch (error) {
    setMapPickerStatus(state, error.message || "Nao foi possivel carregar o mapa neste momento.", true);
    state.locateButton.disabled = false;
    return;
  }

  if (hasExistingCoordinates) {
    state.map.setCenter({ lat: existingLatitude, lng: existingLongitude });
    state.map.setZoom(17);
    placeMapPickerMarker(state, { lat: existingLatitude, lng: existingLongitude }, false);
    setMapPickerStatus(state, "Localizacao atual carregada no mapa. Ajuste o pino se precisar.");
    state.locateButton.disabled = false;
    return;
  }

  state.geocoder.geocode({ address: query }, (results, status) => {
    state.locateButton.disabled = false;

    if (status === "OK" && results?.[0]) {
      const result = results[0];
      const location = result.geometry?.location;

      if (result.geometry?.viewport) {
        state.map.fitBounds(result.geometry.viewport);
      } else {
        state.map.setCenter(location);
        state.map.setZoom(17);
      }

      placeMapPickerMarker(state, location, false);
      setMapPickerStatus(state, state.locatedMessage);
      return;
    }

    resetMapPicker(state, false);
    setMapPickerStatus(state, state.notFoundMessage, true);
  });
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

  return `../guia-do-turista.html?${params.toString()}#pontos`;
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

function setLoginFeedback(message, tone = "info") {
  if (!loginFeedback) {
    return;
  }

  loginFeedback.textContent = message || "";

  if (tone === "info") {
    loginFeedback.removeAttribute("data-tone");
    return;
  }

  loginFeedback.dataset.tone = tone;
}

function setAuthenticatedView(isAuthenticated, username = "") {
  adminAuthenticated = Boolean(isAuthenticated);

  if (authPanel) {
    authPanel.hidden = adminAuthenticated;
  }

  if (adminApp) {
    adminApp.hidden = !adminAuthenticated;
  }

  if (sessionPill) {
    sessionPill.textContent = username ? `Sessao ativa: ${username}` : "Sessao admin ativa";
  }
}

function resetAdminState() {
  recordsState = [];
  catalogRecordsState = [];

  if (cardsGrid) {
    cardsGrid.innerHTML = "";
  }

  if (catalogCardsGrid) {
    catalogCardsGrid.innerHTML = "";
  }

  if (statusText) {
    statusText.textContent = "";
  }

  if (catalogStatusText) {
    catalogStatusText.textContent = "";
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  if (catalogEmptyState) {
    catalogEmptyState.hidden = true;
  }
}

function handleUnauthorized(message = "Sua sessao expirou. Faca login novamente.") {
  closeEditDialog();
  closeCatalogEditDialog();
  resetAdminState();
  setAuthenticatedView(false);
  setLoginFeedback(message, "error");
  loginPasswordInput?.focus();
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "same-origin",
    ...options
  });
  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    handleUnauthorized(result.message || "Sua sessao expirou. Faca login novamente.");
    throw new UnauthorizedError(result.message || "Nao autorizado.");
  }

  if (!response.ok) {
    throw new Error(result.message || "Nao foi possivel concluir a operacao no servidor.");
  }

  return result;
}

async function fetchAdminSession() {
  const response = await fetch(`${API_BASE_URL}/admin/session`, {
    credentials: "same-origin"
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Nao foi possivel validar a sessao admin.");
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
    statusText.textContent = "Nenhum cadastro pendente no momento.";
    return;
  }

  const categoryText = CATEGORY_FILTER_LABELS[activeCategoryFilter] || CATEGORY_FILTER_LABELS.todos;

  statusText.textContent = `Pendentes: ${records.length}. Exibindo ${visibleCount} cadastro(s) em ${categoryText}.`;
}

function setEmptyState(records, filtered) {
  if (filtered.length) {
    emptyState.hidden = true;
    return;
  }

  emptyState.hidden = false;

  if (!records.length) {
    emptyState.textContent = "Nenhum cadastro pendente no momento.";
    return;
  }

  const categoryText = CATEGORY_FILTER_LABELS[activeCategoryFilter] || CATEGORY_FILTER_LABELS.todos;
  emptyState.textContent = `Nenhum cadastro pendente encontrado em ${categoryText}.`;
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
    photoSrc: record.photoSrc || "",
    latitude: record.guide?.coords?.lat ?? null,
    longitude: record.guide?.coords?.lng ?? null
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
  hydrateMapPickerFromCoordinates(
    submissionMapPickerState,
    draft.latitude,
    draft.longitude,
    Number.isFinite(Number(draft.latitude)) && Number.isFinite(Number(draft.longitude))
      ? "Localizacao atual carregada. Clique em \"Abrir / localizar\" para revisar ou ajustar."
      : submissionMapPickerState.idleMessage
  );
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
  resetMapPicker(submissionMapPickerState);

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
  const latitude = normalizeLine(editLatitudeInput.value);
  const longitude = normalizeLine(editLongitudeInput.value);

  return {
    category,
    name,
    description: normalizeLine(editDescriptionInput.value),
    addressLine,
    instagram: normalizeLine(editInstagramInput.value),
    whatsapp: normalizeLine(editWhatsappInput.value),
    email: category === "hotel" ? normalizeLine(editEmailInput.value) : "",
    phone: category === "hotel" ? sanitizePhoneValue(editPhoneInput.value) : "",
    daysLine: category === "gastronomia" ? normalizeLine(editDaysLineInput.value) : "",
    subtitle: category === "gastronomia" ? normalizeLine(editSubtitleInput.value) : "",
    hoursLine: category === "gastronomia" ? normalizeLine(editHoursLineInput.value) : "",
    statusLine: category === "hotel" ? normalizeLine(editStatusLineInput.value) : "",
    serviceLine: category === "hotel" ? normalizeLine(editServiceLineInput.value) : "",
    mapQuery,
    directionsUrl: buildDirectionsUrlFromCoordinates(latitude, longitude) || buildDirectionsUrl(mapQuery),
    popupTitleColor: category === "hotel" ? "#3568c9" : "#c9642b",
    photoUrl: normalizeLine(editCurrentPhotoUrlInput.value),
    currentPhotoUrl: normalizeLine(editCurrentPhotoUrlInput.value),
    latitude,
    longitude
  };
}

async function loadRecords() {
  statusText.textContent = "Sincronizando cadastros com o servidor...";
  const result = await apiRequest("/admin/submissions?status=pending");
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

  if (payload.addressLine && !hasConfirmedCoordinates(payload.latitude, payload.longitude)) {
    window.alert("Confirme a localizacao no mapa antes de salvar este cadastro.");
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
    if (error instanceof UnauthorizedError) {
      return;
    }
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
    if (targetStatus === "approved") {
      await loadCatalogCards();
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return;
    }
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
    if (error instanceof UnauthorizedError) {
      return;
    }
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
    if (error instanceof UnauthorizedError) {
      return;
    }
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

editNameInput?.addEventListener("input", () => invalidateMapPicker(submissionMapPickerState));
editAddressLineInput?.addEventListener("input", () => invalidateMapPicker(submissionMapPickerState));
editMapLocateBtn?.addEventListener("click", () => {
  openMapPickerAtAddress(submissionMapPickerState);
});
bindPhoneSanitizer(editPhoneInput);
bindPhoneSanitizer(editWhatsappInput);
editForm.addEventListener("submit", saveEditedRecord);
cancelEditBtn.addEventListener("click", closeEditDialog);
closeEditBtn.addEventListener("click", closeEditDialog);

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
const newCatalogCardBtn = document.getElementById("newCatalogCardBtn");
const catalogRefreshBtn = document.getElementById("catalogRefreshBtn");
const catalogFilterButtons = Array.from(document.querySelectorAll("[data-catalog-filter]"));
const catalogEditDialog = document.getElementById("catalogEditDialog");
const catalogEditForm = document.getElementById("catalogEditForm");
const catalogEditTitle = document.getElementById("catalogEditTitle");
const catalogEditHint = document.getElementById("catalogEditHint");
const catalogCancelEditBtn = document.getElementById("catalogCancelEditBtn");
const catalogCloseEditBtn = document.getElementById("catalogCloseEditBtn");
const catalogEditRecordIdInput = document.getElementById("catalogEditRecordId");
const catalogEditCategoryInput = document.getElementById("catalogEditCategory");
const catalogEditCurrentPhotoUrlInput = document.getElementById("catalogEditCurrentPhotoUrl");
const catalogEditPointIdInput = document.getElementById("catalogEditPointId");
const catalogEditDisplayOrderInput = document.getElementById("catalogEditDisplayOrder");
const catalogEditIsActiveInput = document.getElementById("catalogEditIsActive");
const catalogEditHasWifiInput = document.getElementById("catalogEditHasWifi");
const catalogEditNameInput = document.getElementById("catalogEditName");
const catalogEditSubtitleInput = document.getElementById("catalogEditSubtitle");
const catalogEditDescriptionInput = document.getElementById("catalogEditDescription");
const catalogEditAddressLineInput = document.getElementById("catalogEditAddressLine");
const catalogEditLogradouroInput = document.getElementById("catalogEditLogradouro");
const catalogEditNumeroInput = document.getElementById("catalogEditNumero");
const catalogEditComplementoInput = document.getElementById("catalogEditComplemento");
const catalogEditReferenciaInput = document.getElementById("catalogEditReferencia");
const catalogEditBairroInput = document.getElementById("catalogEditBairro");
const catalogEditScheduleLineInput = document.getElementById("catalogEditScheduleLine");
const catalogEditPhotoInput = document.getElementById("catalogEditPhoto");
const catalogEditPhotoPreviewWrap = document.getElementById("catalogEditPhotoPreviewWrap");
const catalogEditPhotoPreview = document.getElementById("catalogEditPhotoPreview");
const catalogEditInstagramInput = document.getElementById("catalogEditInstagram");
const catalogEditWhatsappInput = document.getElementById("catalogEditWhatsapp");
const catalogEditEmailInput = document.getElementById("catalogEditEmail");
const catalogEditPhoneInput = document.getElementById("catalogEditPhone");
const catalogWifiFieldWrap = document.getElementById("catalogWifiFieldWrap");
const catalogScheduleFieldWrap = document.getElementById("catalogScheduleFieldWrap");
const catalogSocialFields = document.getElementById("catalogSocialFields");
const catalogHotelContactFields = document.getElementById("catalogHotelContactFields");
const catalogEditLatitudeInput = document.getElementById("catalogEditLatitude");
const catalogEditLongitudeInput = document.getElementById("catalogEditLongitude");
const catalogMapLocateBtn = document.getElementById("catalogMapLocateBtn");
const catalogMapStatus = document.getElementById("catalogMapStatus");
const catalogMapSummary = document.getElementById("catalogMapSummary");
const catalogLocationMapElement = document.getElementById("catalogLocationMap");

let catalogActiveCategoryFilter = "todos";
let catalogRecordsState = [];
let selectedCatalogPhotoFile = null;
let catalogEditMode = "edit";

const submissionMapPickerState = createAdminMapPickerState({
  canvas: editLocationMapElement,
  statusNode: editMapStatus,
  summaryNode: editMapSummary,
  latitudeInput: editLatitudeInput,
  longitudeInput: editLongitudeInput,
  locateButton: editMapLocateBtn,
  buildQuery: () => [normalizeLine(editNameInput.value), normalizeLine(editAddressLineInput.value), "Amargosa, Bahia, Brasil"]
    .filter(Boolean)
    .join(", "),
  idleMessage: 'Clique em "Abrir / localizar" para revisar ou corrigir a posicao no mapa.',
  notFoundMessage: "Nao foi possivel localizar este cadastro no mapa. Revise o endereco e tente novamente.",
  locatedMessage: "Endereco encontrado. Confira o pino e ajuste manualmente se precisar.",
  adjustedMessage: "Pino ajustado manualmente. A nova localizacao sera salva com o cadastro.",
  changedMessage: "O endereco foi alterado. Clique em \"Abrir / localizar\" para confirmar a nova localizacao."
});

const catalogMapPickerState = createAdminMapPickerState({
  canvas: catalogLocationMapElement,
  statusNode: catalogMapStatus,
  summaryNode: catalogMapSummary,
  latitudeInput: catalogEditLatitudeInput,
  longitudeInput: catalogEditLongitudeInput,
  locateButton: catalogMapLocateBtn,
  buildQuery: () => buildStructuredLocationQuery(
    catalogEditLogradouroInput.value,
    catalogEditNumeroInput.value,
    catalogEditBairroInput.value
  ),
  idleMessage: 'Preencha rua, numero e bairro. Depois clique em "Abrir / localizar".',
  notFoundMessage: "Nao foi possivel localizar este card no mapa. Revise o endereco e tente novamente.",
  locatedMessage: "Endereco do card encontrado. Confira o pino e ajuste se precisar.",
  adjustedMessage: "Pino ajustado manualmente. A nova localizacao sera salva no card.",
  changedMessage: "O endereco do card foi alterado. Clique em \"Abrir / localizar\" para confirmar a nova localizacao."
});

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

  return [];
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
  description.className = "card-description";
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

  const deleteButton = document.createElement("button");
  deleteButton.className = "danger-btn card-danger-btn";
  deleteButton.type = "button";
  deleteButton.textContent = "Excluir card";
  deleteButton.addEventListener("click", () => deleteCatalogCard(record.id, record.name));
  actions.appendChild(deleteButton);

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

function setCatalogFieldGroupState(group, hidden) {
  if (!group) {
    return;
  }

  group.hidden = hidden;

  group.querySelectorAll("input, textarea, select").forEach((field) => {
    field.disabled = hidden;

    if (hidden) {
      if (field.type === "checkbox" || field.type === "radio") {
        field.checked = false;
      } else {
        field.value = "";
      }
    }
  });
}

function toggleCatalogDialogFields(category) {
  const normalized = normalizeCatalogCategory(category);
  const isTourism = normalized === "turistico";
  const isHotel = normalized === "hotel";
  const isGastronomy = normalized === "gastronomia";

  setCatalogFieldGroupState(catalogScheduleFieldWrap, !isGastronomy);
  setCatalogFieldGroupState(catalogSocialFields, isTourism);
  setCatalogFieldGroupState(catalogHotelContactFields, !isHotel);
  setCatalogFieldGroupState(catalogWifiFieldWrap, !isTourism);

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
    hasWifi: Boolean(record.hasWifi),
    name: record.name || "",
    subtitle: record.subtitle || "",
    description: record.description || "",
    addressLine: record.addressLine || "",
    scheduleLine: record.scheduleLine || "",
    photoSrc: record.photoSrc || "",
    instagram: contacts.instagram || "",
    whatsapp: contacts.whatsapp || "",
    email: contacts.email || "",
    phone: contacts.phone || "",
    latitude: record.latitude ?? null,
    longitude: record.longitude ?? null
  };
}

function openCatalogEditDialog(recordId) {
  const record = catalogRecordsState.find((item) => item.id === recordId);

  if (!record) {
    return;
  }

  const draft = getCatalogEditDraft(record);
  catalogEditMode = "edit";
  if (catalogEditTitle) {
    catalogEditTitle.textContent = "Editar card publicado";
  }
  catalogEditRecordIdInput.value = draft.id;
  catalogEditCategoryInput.value = draft.category;
  catalogEditCurrentPhotoUrlInput.value = draft.photoSrc;
  catalogEditPointIdInput.value = draft.pointId;
  catalogEditDisplayOrderInput.value = draft.displayOrder || 0;
  catalogEditIsActiveInput.checked = draft.isActive;
  catalogEditHasWifiInput.checked = draft.hasWifi;
  catalogEditNameInput.value = draft.name;
  catalogEditSubtitleInput.value = draft.subtitle;
  catalogEditDescriptionInput.value = draft.description;
  fillCatalogAddressFields(draft.addressLine);
  catalogEditScheduleLineInput.value = draft.scheduleLine;
  catalogEditInstagramInput.value = draft.instagram;
  catalogEditWhatsappInput.value = draft.whatsapp;
  catalogEditEmailInput.value = draft.email;
  catalogEditPhoneInput.value = draft.phone;
  hydrateMapPickerFromCoordinates(
    catalogMapPickerState,
    draft.latitude,
    draft.longitude,
    hasConfirmedCoordinates(draft.latitude, draft.longitude)
      ? "Localizacao atual do card carregada. Clique em \"Abrir / localizar\" para revisar ou ajustar."
      : catalogMapPickerState.idleMessage
  );
  resetCatalogPhotoSelection();
  setCatalogPhotoPreview(draft.photoSrc);
  toggleCatalogDialogFields(draft.category);

  if (typeof catalogEditDialog.showModal === "function") {
    catalogEditDialog.showModal();
  } else {
    catalogEditDialog.setAttribute("open", "open");
  }
}

function openCatalogCreateDialog() {
  const category = normalizeCatalogCategory(catalogActiveCategoryFilter === "todos" ? "turistico" : catalogActiveCategoryFilter);

  catalogEditMode = "create";
  if (catalogEditTitle) {
    catalogEditTitle.textContent = "Criar card publicado";
  }

  catalogEditForm?.reset();
  catalogEditRecordIdInput.value = "";
  catalogEditCategoryInput.value = category;
  catalogEditCurrentPhotoUrlInput.value = "";
  catalogEditPointIdInput.value = "";
  catalogEditDisplayOrderInput.value = "";
  catalogEditIsActiveInput.checked = true;
  catalogEditHasWifiInput.checked = false;
  catalogEditSubtitleInput.value = "";
  catalogEditLatitudeInput.value = "";
  catalogEditLongitudeInput.value = "";
  clearCatalogAddressFields();
  resetCatalogPhotoSelection();
  setCatalogPhotoPreview("");
  resetMapPicker(catalogMapPickerState);
  toggleCatalogDialogFields(category);

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

  catalogEditMode = "edit";
  resetCatalogPhotoSelection();
  resetMapPicker(catalogMapPickerState);

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
  const latitude = normalizeLine(catalogEditLatitudeInput.value);
  const longitude = normalizeLine(catalogEditLongitudeInput.value);
  const displayOrderValue = normalizeLine(catalogEditDisplayOrderInput.value);
  const addressLine = buildCatalogAddressLineFromFields();
  catalogEditAddressLineInput.value = addressLine;

  return {
    category,
    name: normalizeLine(catalogEditNameInput.value),
    subtitle: normalizeLine(catalogEditSubtitleInput.value),
    description: normalizeLine(catalogEditDescriptionInput.value),
    addressLine,
    scheduleLine: isGastronomy ? normalizeLine(catalogEditScheduleLineInput.value) : "",
    instagram: isTourism ? "" : normalizeLine(catalogEditInstagramInput.value),
    whatsapp: isTourism ? "" : normalizeLine(catalogEditWhatsappInput.value),
    email: isHotel ? normalizeLine(catalogEditEmailInput.value) : "",
    phone: isHotel ? sanitizePhoneValue(catalogEditPhoneInput.value) : "",
    pointId: normalizeLine(catalogEditPointIdInput.value),
    imageAlt: normalizeLine(catalogEditNameInput.value),
    photoUrl: normalizeLine(catalogEditCurrentPhotoUrlInput.value),
    currentPhotoUrl: normalizeLine(catalogEditCurrentPhotoUrlInput.value),
    displayOrder: catalogEditMode === "create" && !displayOrderValue
      ? ""
      : normalizeDisplayOrderValue(displayOrderValue, 1),
    isActive: catalogEditIsActiveInput.checked ? "true" : "false",
    hasWifi: isTourism && catalogEditHasWifiInput.checked ? "true" : "false",
    latitude,
    longitude,
    directionsUrl: buildDirectionsUrlFromCoordinates(latitude, longitude)
  };
}

async function saveCatalogCard(event) {
  event.preventDefault();

  const recordId = normalizeLine(catalogEditRecordIdInput.value);
  const payload = buildCatalogPayload();
  const isCreateMode = catalogEditMode === "create";

  if ((!isCreateMode && !recordId) || !payload.name || !payload.description) {
    window.alert("Preencha pelo menos nome e descricao do card.");
    return;
  }

  if (isCreateMode && !selectedCatalogPhotoFile && !payload.photoUrl) {
    window.alert("Envie uma imagem para criar o card.");
    return;
  }

  if (payload.addressLine && !hasConfirmedCoordinates(payload.latitude, payload.longitude)) {
    window.alert("Confirme a localizacao no mapa antes de salvar este card.");
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
    const endpoint = isCreateMode ? "/admin/cards" : `/admin/cards/${encodeURIComponent(recordId)}`;
    await apiRequest(endpoint, {
      method: isCreateMode ? "POST" : "PATCH",
      body: formData
    });
    closeCatalogEditDialog();
    await loadCatalogCards();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return;
    }
    window.alert(error.message || "Nao foi possivel salvar o card oficial.");
  }
}

async function deleteCatalogCard(recordId, recordName = "") {
  const normalizedId = normalizeLine(recordId);

  if (!normalizedId) {
    return;
  }

  const label = normalizeLine(recordName) || "este card";
  const confirmed = window.confirm(`Deseja excluir ${label}? O card saira do guia publico.`);

  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(`/admin/cards/${encodeURIComponent(normalizedId)}`, {
      method: "DELETE"
    });
    await loadCatalogCards();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return;
    }
    window.alert(error.message || "Nao foi possivel excluir o card.");
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
    if (error instanceof UnauthorizedError) {
      return;
    }
    catalogStatusText.textContent = error.message || "Nao foi possivel atualizar os cards oficiais.";
  }
});

newCatalogCardBtn?.addEventListener("click", openCatalogCreateDialog);

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

catalogEditNameInput?.addEventListener("input", () => invalidateMapPicker(catalogMapPickerState));
[
  catalogEditLogradouroInput,
  catalogEditNumeroInput,
  catalogEditComplementoInput,
  catalogEditReferenciaInput,
  catalogEditBairroInput
].forEach((input) => {
  input?.addEventListener("input", () => {
    catalogEditAddressLineInput.value = buildCatalogAddressLineFromFields();
    invalidateMapPicker(catalogMapPickerState);
  });
});
catalogEditCategoryInput?.addEventListener("change", () => {
  toggleCatalogDialogFields(catalogEditCategoryInput.value);
});
catalogMapLocateBtn?.addEventListener("click", () => {
  if (
    !hasCatalogRequiredAddressParts()
    && !hasConfirmedCoordinates(catalogEditLatitudeInput.value, catalogEditLongitudeInput.value)
  ) {
    setMapPickerStatus(catalogMapPickerState, "Informe rua, numero e bairro antes de localizar no mapa.", true);
    return;
  }

  openMapPickerAtAddress(catalogMapPickerState);
});
bindPhoneSanitizer(catalogEditPhoneInput);
bindPhoneSanitizer(catalogEditWhatsappInput);
catalogEditForm?.addEventListener("submit", saveCatalogCard);
catalogCancelEditBtn?.addEventListener("click", closeCatalogEditDialog);
catalogCloseEditBtn?.addEventListener("click", closeCatalogEditDialog);

async function loginAdmin(event) {
  event.preventDefault();

  const username = normalizeLine(loginUsernameInput?.value);
  const password = String(loginPasswordInput?.value || "");

  if (!username || !password) {
    setLoginFeedback("Preencha usuario e senha para entrar no painel.", "error");
    return;
  }

  if (loginSubmitBtn) {
    loginSubmitBtn.disabled = true;
  }

  setLoginFeedback("Validando credenciais...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Nao foi possivel realizar o login.");
    }

    setAuthenticatedView(true, result.username || username);
    setLoginFeedback("Login realizado com sucesso.", "success");
    if (loginPasswordInput) {
      loginPasswordInput.value = "";
    }
    await initializeAdminData();
  } catch (error) {
    setAuthenticatedView(false);
    setLoginFeedback(error.message || "Nao foi possivel realizar o login.", "error");
  } finally {
    if (loginSubmitBtn) {
      loginSubmitBtn.disabled = false;
    }
  }
}

async function logoutAdmin() {
  try {
    await fetch(`${API_BASE_URL}/admin/logout`, {
      method: "POST",
      credentials: "same-origin"
    });
  } finally {
    handleUnauthorized("Sessao encerrada. Faca login novamente para continuar.");
  }
}

async function initializeAdminData() {
  try {
    await Promise.all([
      loadRecords(),
      loadCatalogCards()
    ]);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return;
    }

    statusText.textContent = error.message || "Nao foi possivel carregar os cadastros do servidor.";
    emptyState.hidden = false;
    emptyState.textContent = "Verifique se a API e o banco MySQL estao ativos.";
    catalogStatusText.textContent = error.message || "Nao foi possivel carregar os cards oficiais.";
    catalogEmptyState.hidden = false;
    catalogEmptyState.textContent = "Verifique se a API e o banco MySQL estao ativos.";
  }
}

async function initAdminApp() {
  setAuthenticatedView(false);
  setLoginFeedback("Validando sessao atual...", "info");

  try {
    const session = await fetchAdminSession();

    if (!session.authenticated) {
      setAuthenticatedView(false);
      setLoginFeedback("", "info");
      loginUsernameInput?.focus();
      return;
    }

    setAuthenticatedView(true, session.username || "");
    setLoginFeedback("Sessao ativa.", "success");
    await initializeAdminData();
  } catch (error) {
    setAuthenticatedView(false);
    setLoginFeedback(error.message || "Nao foi possivel validar a sessao admin.", "error");
  }
}

loginForm?.addEventListener("submit", loginAdmin);
logoutBtn?.addEventListener("click", logoutAdmin);

initAdminApp();
