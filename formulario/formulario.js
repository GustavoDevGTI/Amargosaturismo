const API_SUBMISSIONS_URL = "/api/submissions";

const typeInputs = Array.from(document.querySelectorAll('input[name="tipo"]'));
const formWrap = document.getElementById("formWrap");
const stepTip = document.getElementById("stepTip");
const form = document.getElementById("cadastroForm");
const feedback = document.getElementById("formFeedback");
const diaFuncionamentoField = document.getElementById("diaFuncionamento");
const horarioField = document.getElementById("horario");
const statusHotelField = document.getElementById("statusHotel");
const cnpjInput = document.getElementById("cnpj");
const logradouroInput = document.getElementById("logradouro");
const numeroInput = document.getElementById("numero");
const bairroInput = document.getElementById("bairro");
const whatsappInput = document.getElementById("whatsapp");
const telefoneInput = document.getElementById("telefone");
const mapLocateBtn = document.getElementById("mapLocateBtn");
const mapStatus = document.getElementById("mapStatus");
const mapSummary = document.getElementById("mapSummary");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const locationMapElement = document.getElementById("locationMap");

const fotoInput = document.getElementById("fotoArquivo");
const fotoBtn = document.getElementById("fotoBtn");
const fotoNome = document.getElementById("fotoNome");
const dropZone = document.getElementById("dropZone");
const fotoPreviewWrap = document.getElementById("fotoPreviewWrap");
const fotoPreview = document.getElementById("fotoPreview");

let selectedType = "";
let uploadedPhotoDataUrl = "";
let uploadedPhotoFile = null;
let locationMap = null;
let locationMarker = null;
let locationGeocoder = null;
let mapsLoaderPromise = null;

const defaultMapCenter = { lat: -13.0265, lng: -39.6085 };
const defaultMapZoom = 14;
const GOOGLE_MAPS_API_KEY = "AIzaSyBdddKSwLzMfQdvDOYIO2Qx5ZX7RiF6syc";

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function sanitizePhoneValue(value) {
  return String(value || "").trim().replace(/[^\d()+\-\s]/g, "");
}

function bindPhoneSanitizer(input) {
  input?.addEventListener("input", () => {
    const sanitized = sanitizePhoneValue(input.value);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
  });
}

function toSlug(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeInstagram(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const clean = raw.replace(/^@/, "").replace(/^\//, "");
  return clean ? `https://www.instagram.com/${clean}/` : "";
}

function whatsappUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = digitsOnly(raw);
  return digits ? `https://wa.me/${digits}` : "";
}

function phoneUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^tel:/i.test(raw)) return raw;
  const digits = digitsOnly(raw);
  return digits ? `tel:+${digits}` : "";
}

function applyCnpjMask(value) {
  const digits = digitsOnly(value).slice(0, 14);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function showFeedback(message, isError = false) {
  feedback.hidden = false;
  feedback.classList.toggle("error", isError);
  feedback.textContent = message;
}

function clearFeedback() {
  feedback.hidden = true;
  feedback.classList.remove("error");
  feedback.textContent = "";
}

function setMapStatus(message, isError = false) {
  if (!mapStatus) {
    return;
  }

  mapStatus.textContent = message;
  mapStatus.classList.toggle("is-error", Boolean(isError));
}

function formatCoordinate(value) {
  return Number(value).toFixed(6);
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

function updateMapSummary(position) {
  const literal = getLatLngLiteral(position);

  if (!literal || !mapSummary) {
    if (mapSummary) {
      mapSummary.hidden = true;
      mapSummary.textContent = "";
    }
    return;
  }

  mapSummary.hidden = false;
  mapSummary.textContent = `Posicao confirmada: ${formatCoordinate(literal.lat)}, ${formatCoordinate(literal.lng)}.`;
}

function clearStoredCoordinates() {
  latitudeInput.value = "";
  longitudeInput.value = "";
  updateMapSummary(null);
}

function storeCoordinates(position) {
  const literal = getLatLngLiteral(position);

  if (!literal) {
    clearStoredCoordinates();
    return;
  }

  latitudeInput.value = literal.lat.toFixed(8);
  longitudeInput.value = literal.lng.toFixed(8);
  updateMapSummary(literal);
}

function placeLocationMarker(position, shouldCenter = true) {
  const literal = getLatLngLiteral(position);

  if (!literal || !locationMap || !window.google?.maps) {
    return;
  }

  if (!locationMarker) {
    locationMarker = new google.maps.Marker({
      position: literal,
      map: locationMap,
      draggable: true,
      title: "Localizacao confirmada do estabelecimento"
    });

    locationMarker.addListener("dragend", (event) => {
      storeCoordinates(event.latLng);
      setMapStatus("Pino ajustado manualmente. Localizacao confirmada para o cadastro.");
    });
  } else {
    locationMarker.setPosition(literal);
  }

  if (shouldCenter) {
    locationMap.setCenter(literal);
  }

  storeCoordinates(literal);
}

function resetLocationSelection(showMessage = true) {
  clearStoredCoordinates();

  if (locationMarker) {
    locationMarker.setMap(null);
    locationMarker = null;
  }

  if (locationMap) {
    locationMap.setCenter(defaultMapCenter);
    locationMap.setZoom(defaultMapZoom);
  }

  if (showMessage) {
    setMapStatus('Preencha rua, numero e bairro. Depois clique em "Localizar no mapa".');
  }
}

function invalidateLocationSelection() {
  if (!latitudeInput.value && !longitudeInput.value) {
    return;
  }

  resetLocationSelection(false);
  setMapStatus('O endereco foi alterado. Clique em "Localizar no mapa" para confirmar a nova posicao.');
}

function buildLocationQueryFromInputs() {
  return [
    logradouroInput?.value.trim(),
    numeroInput?.value.trim(),
    bairroInput?.value.trim(),
    "Amargosa",
    "Bahia",
    "Brasil"
  ]
    .filter(Boolean)
    .join(", ");
}

function initLocationPicker() {
  if (!locationMapElement || !window.google?.maps || locationMap) {
    return;
  }

  locationMap = new google.maps.Map(locationMapElement, {
    center: defaultMapCenter,
    zoom: defaultMapZoom,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });
  locationGeocoder = new google.maps.Geocoder();
  locationMapElement.classList.add("is-ready");

  locationMap.addListener("click", (event) => {
    if (!event.latLng) {
      return;
    }

    placeLocationMarker(event.latLng);
    setMapStatus("Ponto confirmado no mapa. Se precisar, arraste o pino para refinar a localizacao.");
  });

  setMapStatus('Preencha rua, numero e bairro. Depois clique em "Localizar no mapa".');
}

function ensureLocationPickerReady() {
  if (locationMap && locationGeocoder && window.google?.maps) {
    return Promise.resolve();
  }

  if (window.google?.maps) {
    initLocationPicker();
    return Promise.resolve();
  }

  if (!mapsLoaderPromise) {
    setMapStatus("Carregando o mapa para confirmar a localizacao...");

    mapsLoaderPromise = new Promise((resolve, reject) => {
      window.__amargosaInitLocationPicker = () => {
        try {
          initLocationPicker();
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          delete window.__amargosaInitLocationPicker;
        }
      };

      const script = document.createElement("script");
      script.id = "googleMapsLocationPickerScript";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=__amargosaInitLocationPicker`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        mapsLoaderPromise = null;
        delete window.__amargosaInitLocationPicker;
        reject(new Error("Nao foi possivel carregar o mapa neste momento."));
      };

      document.head.appendChild(script);
    });
  }

  return mapsLoaderPromise;
}

async function locateAddressOnMap() {
  if (!logradouroInput.value.trim() || !numeroInput.value.trim() || !bairroInput.value.trim()) {
    setMapStatus("Informe rua, numero e bairro antes de localizar no mapa.", true);
    return;
  }

  mapLocateBtn.disabled = true;

  try {
    await ensureLocationPickerReady();
  } catch (error) {
    setMapStatus(error.message || "O mapa ainda esta carregando. Aguarde alguns segundos e tente novamente.", true);
    mapLocateBtn.disabled = false;
    return;
  }

  const query = buildLocationQueryFromInputs();
  setMapStatus("Localizando o endereco informado no mapa...");

  locationGeocoder.geocode({ address: query }, (results, status) => {
    mapLocateBtn.disabled = false;

    if (status === "OK" && results?.[0]) {
      const result = results[0];
      const location = result.geometry?.location;

      if (result.geometry?.viewport) {
        locationMap.fitBounds(result.geometry.viewport);
      } else {
        locationMap.setCenter(location);
        locationMap.setZoom(17);
      }

      placeLocationMarker(location, false);
      setMapStatus("Endereco encontrado. Confira o pino e, se precisar, arraste ou clique no mapa para ajustar.");
      return;
    }

    resetLocationSelection(false);
    setMapStatus("Nao foi possivel localizar esse endereco. Revise os campos e tente novamente.", true);
  });
}

function setDropState(active) {
  dropZone.classList.toggle("is-dragover", active);
}

function clearPhotoSelection() {
  uploadedPhotoDataUrl = "";
  uploadedPhotoFile = null;
  fotoInput.value = "";
  fotoNome.textContent = "Nenhuma foto selecionada";
  dropZone.classList.remove("has-file");
  setDropState(false);
  fotoPreview.src = "";
  fotoPreview.alt = "Preview da foto selecionada";
  fotoPreviewWrap.hidden = true;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

async function handlePhotoFile(file) {
  if (!file) return;
  if (!file.type || !file.type.startsWith("image/")) {
    showFeedback("Arquivo invalido. Envie somente imagem.", true);
    return;
  }
  if (file.size > 1_500_000) {
    showFeedback("A foto e muito grande. Use uma imagem de ate 1,5 MB.", true);
    return;
  }

  try {
    uploadedPhotoFile = file;
    uploadedPhotoDataUrl = await readAsDataUrl(file);
    fotoNome.textContent = `Foto selecionada: ${file.name}`;
    dropZone.classList.add("has-file");
    fotoPreview.src = uploadedPhotoDataUrl;
    fotoPreview.alt = `Preview da foto: ${file.name}`;
    fotoPreviewWrap.hidden = false;
    clearFeedback();
  } catch (_) {
    showFeedback("Nao foi possivel carregar a foto.", true);
  }
}

function pickType(type) {
  selectedType = type;
  formWrap.hidden = false;
  stepTip.textContent = `Categoria escolhida: ${type === "gastronomia" ? "Bar / Restaurante" : "Hotel / Pousada"}.`;

  document.querySelectorAll(".category-fields").forEach((block) => {
    block.hidden = block.dataset.show !== type;
  });

  diaFuncionamentoField.required = type === "gastronomia";
  horarioField.required = type === "gastronomia";
  statusHotelField.required = type === "hotel";
  clearFeedback();
}

function buildAddressLine(data) {
  const logradouro = data.get("logradouro").trim();
  const numero = data.get("numero").trim();
  const bairro = data.get("bairro").trim();

  const ruaNumero = [logradouro, numero].filter(Boolean).join(", ");

  return [ruaNumero, bairro]
    .filter(Boolean)
    .join(" | ");
}

function buildMapQuery(name, data) {
  return [
    name,
    data.get("logradouro").trim(),
    data.get("numero").trim(),
    data.get("bairro").trim(),
    "Amargosa",
    "Bahia",
    "Brasil"
  ]
    .filter(Boolean)
    .join(", ");
}

function buildDirectionsUrl(mapQuery) {
  if (!mapQuery) {
    return "";
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;
}

function renderAttendanceHoursFromDigits(value) {
  const digits = filterAttendanceDigits(value);

  if (!digits) {
    return "";
  }

  if (digits.length < 2) {
    return digits;
  }

  if (digits.length === 2) {
    return digits;
  }

  if (digits.length === 3) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  const startHour = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  const endDigits = digits.slice(4);

  if (!endDigits) {
    return `${startHour} ate `;
  }

  if (endDigits.length <= 2) {
    return `${startHour} ate ${endDigits}`;
  }

  return `${startHour} ate ${endDigits.slice(0, 2)}:${endDigits.slice(2)}`;
}

function isValidTimeDigitsFragment(value) {
  const digits = digitsOnly(value).slice(0, 4);

  if (!digits) {
    return true;
  }

  if (digits.length >= 1 && Number(digits[0]) > 2) {
    return false;
  }

  if (digits.length >= 2 && Number(digits.slice(0, 2)) > 23) {
    return false;
  }

  if (digits.length >= 3 && Number(digits[2]) > 5) {
    return false;
  }

  if (digits.length >= 4 && Number(digits.slice(2, 4)) > 59) {
    return false;
  }

  return true;
}

function isValidAttendanceDigitsPartial(value) {
  const digits = digitsOnly(value).slice(0, 8);
  return isValidTimeDigitsFragment(digits.slice(0, 4)) && isValidTimeDigitsFragment(digits.slice(4));
}

function filterAttendanceDigits(value) {
  const rawDigits = digitsOnly(value).slice(0, 8);
  let result = "";

  for (const digit of rawDigits) {
    const candidate = `${result}${digit}`;
    if (isValidAttendanceDigitsPartial(candidate)) {
      result = candidate;
    }
  }

  return result;
}

function extractAttendanceHoursDigits(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  if (/^\d{1,8}$/.test(raw)) {
    return filterAttendanceDigits(raw);
  }

  return filterAttendanceDigits(raw);
}

function setAttendanceHoursDigits(input, value) {
  const digits = filterAttendanceDigits(value);
  input.dataset.attendanceDigits = digits;
  input.value = renderAttendanceHoursFromDigits(digits);

  if (document.activeElement === input && typeof input.setSelectionRange === "function") {
    const cursor = input.value.length;
    requestAnimationFrame(() => input.setSelectionRange(cursor, cursor));
  }
}

function getAttendanceHoursDigits(input) {
  return input.dataset.attendanceDigits || extractAttendanceHoursDigits(input.value);
}

function normalizeAttendanceHours(value) {
  return renderAttendanceHoursFromDigits(filterAttendanceDigits(value));
}

function isCompleteAttendanceHours(value) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d ate (?:[01]\d|2[0-3]):[0-5]\d$/.test(String(value || "").trim());
}

function buildGastronomyScheduleLine(daysLine, hoursLine) {
  return [String(daysLine || "").trim(), String(hoursLine || "").trim()]
    .filter(Boolean)
    .join(", ");
}

function buildGuideData(data, category, name, description, addressLine, contacts) {
  const gasExtra = data.get("gasExtra").trim();
  const diaFuncionamento = data.get("diaFuncionamento").trim();
  const horario = normalizeAttendanceHours(data.get("horario").trim());
  const statusHotel = data.get("statusHotel").trim();
  const servicoHotel = data.get("servicoHotel").trim();
  const mapQuery = buildMapQuery(name, data);
  const scheduleLine = buildGastronomyScheduleLine(diaFuncionamento, horario);

  if (category === "gastronomia") {
    return {
      subtitle: gasExtra,
      description,
      daysLine: diaFuncionamento,
      hoursLine: horario,
      addressLine,
      mapQuery,
      directionsUrl: buildDirectionsUrl(mapQuery),
      metaLines: [scheduleLine, addressLine].filter(Boolean),
      popupTitleColor: "#c9642b"
    };
  }

  const hotelDescription = [servicoHotel, description]
    .filter(Boolean)
    .join(servicoHotel && description ? ". " : "");

  return {
    subtitle: statusHotel,
    description: hotelDescription || description || servicoHotel,
    statusLine: statusHotel,
    serviceLine: servicoHotel,
    addressLine,
    mapQuery,
    directionsUrl: buildDirectionsUrl(mapQuery),
    metaLines: [addressLine, contacts.email, contacts.phone].filter(Boolean),
    popupTitleColor: "#3568c9"
  };
}

function buildMetaLines(data, category, addressLine, cnpjFormatted) {
  const complemento = data.get("complemento").trim();
  const referencia = data.get("referencia").trim();
  const email = String(data.get("email") || "").trim();
  const telefone = sanitizePhoneValue(data.get("telefone"));

  const lines = [];

  if (category === "gastronomia") {
    lines.push(buildGastronomyScheduleLine(data.get("diaFuncionamento").trim(), normalizeAttendanceHours(data.get("horario").trim())));
    lines.push(addressLine);
    if (complemento) lines.push(`Complemento: ${complemento}`);
    if (referencia) lines.push(`Referencia: ${referencia}`);
    if (cnpjFormatted) lines.push(`CNPJ: ${cnpjFormatted}`);
    if (data.get("gasExtra").trim()) lines.push(data.get("gasExtra").trim());
  } else {
    lines.push(data.get("statusHotel").trim());
    if (data.get("servicoHotel").trim()) lines.push(data.get("servicoHotel").trim());
    lines.push(addressLine);
    if (complemento) lines.push(`Complemento: ${complemento}`);
    if (referencia) lines.push(`Referencia: ${referencia}`);
    if (cnpjFormatted) lines.push(`CNPJ: ${cnpjFormatted}`);
    if (email) lines.push(email);
    if (telefone) lines.push(telefone);
  }

  return lines.filter(Boolean);
}

function buildSubmissionPayload(data, category, pointId, mapFocus) {
  const nomeOriginal = data.get("nome").trim();
  const description = data.get("descricao").trim();
  const addressLine = buildAddressLine(data);
  const cnpjFormatted = applyCnpjMask(data.get("cnpj").trim());
  const mapQuery = buildMapQuery(nomeOriginal, data);
  const latitude = String(data.get("latitude") || "").trim();
  const longitude = String(data.get("longitude") || "").trim();
  const instagram = normalizeInstagram(data.get("instagram").trim());
  const whatsapp = whatsappUrl(data.get("whatsapp").trim());
  const email = String(data.get("email") || "").trim();
  const phone = sanitizePhoneValue(data.get("telefone"));
  const hoursLine = category === "gastronomia"
    ? normalizeAttendanceHours(data.get("horario").trim())
    : "";

  return {
    category,
    pointId,
    mapFocus,
    name: nomeOriginal,
    cnpj: cnpjFormatted,
    description,
    addressLine,
    instagram,
    whatsapp,
    email,
    phone,
    daysLine: category === "gastronomia" ? data.get("diaFuncionamento").trim() : "",
    hoursLine,
    subtitle: category === "gastronomia" ? data.get("gasExtra").trim() : "",
    statusLine: category === "hotel" ? data.get("statusHotel").trim() : "",
    serviceLine: category === "hotel" ? data.get("servicoHotel").trim() : "",
    mapQuery,
    directionsUrl: buildDirectionsUrl(latitude && longitude ? `${latitude},${longitude}` : mapQuery),
    popupTitleColor: category === "hotel" ? "#3568c9" : "#c9642b",
    latitude,
    longitude
  };
}

async function submitRecord(payload) {
  const requestBody = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    requestBody.append(key, value || "");
  });

  requestBody.append("photo", uploadedPhotoFile);

  const response = await fetch(API_SUBMISSIONS_URL, {
    method: "POST",
    body: requestBody
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Nao foi possivel enviar o cadastro.");
  }

  return result;
}

cnpjInput.addEventListener("input", () => {
  cnpjInput.value = applyCnpjMask(cnpjInput.value);
});

horarioField.addEventListener("focus", () => {
  if (horarioField.value) {
    setAttendanceHoursDigits(horarioField, getAttendanceHoursDigits(horarioField));
  }
});

horarioField.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const currentDigits = getAttendanceHoursDigits(horarioField);
  const navigationKeys = ["Tab", "ArrowLeft", "ArrowRight", "Home", "End"];

  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    setAttendanceHoursDigits(horarioField, `${currentDigits}${event.key}`);
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    setAttendanceHoursDigits(horarioField, currentDigits.slice(0, -1));
    return;
  }

  if (event.key === "Delete") {
    event.preventDefault();
    setAttendanceHoursDigits(horarioField, "");
    return;
  }

  if (!navigationKeys.includes(event.key) && event.key.length === 1) {
    event.preventDefault();
  }
});

horarioField.addEventListener("beforeinput", (event) => {
  const currentDigits = getAttendanceHoursDigits(horarioField);

  if (event.inputType === "insertText") {
    const nextDigits = digitsOnly(event.data || "");
    if (!nextDigits) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setAttendanceHoursDigits(horarioField, `${currentDigits}${nextDigits}`);
    return;
  }

  if (event.inputType === "deleteContentBackward") {
    event.preventDefault();
    setAttendanceHoursDigits(horarioField, currentDigits.slice(0, -1));
    return;
  }

  if (event.inputType === "deleteContentForward") {
    event.preventDefault();
    setAttendanceHoursDigits(horarioField, "");
  }
});

horarioField.addEventListener("paste", (event) => {
  event.preventDefault();
  const pastedText = event.clipboardData ? event.clipboardData.getData("text") : "";
  setAttendanceHoursDigits(horarioField, `${getAttendanceHoursDigits(horarioField)}${pastedText}`);
});

horarioField.addEventListener("input", () => {
  setAttendanceHoursDigits(horarioField, extractAttendanceHoursDigits(horarioField.value));
});

fotoBtn.addEventListener("click", () => {
  fotoInput.click();
});

dropZone.addEventListener("click", () => {
  fotoInput.click();
});

dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fotoInput.click();
  }
});

fotoInput.addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  await handlePhotoFile(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    setDropState(true);
  });
});

["dragleave", "dragend"].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => {
    setDropState(false);
  });
});

dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  setDropState(false);
  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  await handlePhotoFile(file);
});

[logradouroInput, numeroInput, bairroInput].forEach((input) => {
  input?.addEventListener("input", invalidateLocationSelection);
});

bindPhoneSanitizer(whatsappInput);
bindPhoneSanitizer(telefoneInput);
mapLocateBtn?.addEventListener("click", locateAddressOnMap);

typeInputs.forEach((input) => {
  input.addEventListener("change", () => pickType(input.value));
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    selectedType = "";
    formWrap.hidden = true;
    stepTip.textContent = "Primeiro selecione uma categoria para liberar o formulario.";
    document.querySelectorAll(".category-fields").forEach((block) => {
      block.hidden = true;
    });
    delete horarioField.dataset.attendanceDigits;
    clearPhotoSelection();
    resetLocationSelection();
    clearFeedback();
  }, 0);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedType) {
    showFeedback("Selecione primeiro o tipo de estabelecimento.", true);
    return;
  }

  if (selectedType === "gastronomia") {
    setAttendanceHoursDigits(horarioField, extractAttendanceHoursDigits(horarioField.value));
    if (!isCompleteAttendanceHours(horarioField.value)) {
      showFeedback("Informe o horario completo. Ex: 12:00 ate 14:00.", true);
      horarioField.focus();
      return;
    }
  }

  const data = new FormData(form);
  const nomeOriginal = data.get("nome").trim();
  if (!nomeOriginal) {
    showFeedback("Informe o nome do estabelecimento.", true);
    return;
  }

  const prefix = selectedType === "gastronomia" ? "gas" : "hotel";
  const slug = toSlug(nomeOriginal) || `item-${Date.now()}`;
  const pointId = `${prefix}-${slug}`;
  const mapFocus = pointId;

  if (!uploadedPhotoDataUrl || !uploadedPhotoFile) {
    showFeedback("Envie a foto obrigatoria do estabelecimento antes de continuar.", true);
    return;
  }

  if (!latitudeInput.value || !longitudeInput.value) {
    showFeedback('Confirme a localizacao no mapa antes de enviar o cadastro.', true);
    mapLocateBtn?.focus();
    return;
  }

  const payload = buildSubmissionPayload(data, selectedType, pointId, mapFocus);

  try {
    await submitRecord(payload);
    form.reset();
    showFeedback("Cadastro enviado com sucesso. Agora ele aguarda validacao no painel Admin.");
  } catch (error) {
    showFeedback(error.message || "Ocorreu um erro ao enviar o cadastro.", true);
  }
});
