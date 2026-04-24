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

const fotoInput = document.getElementById("fotoArquivo");
const fotoBtn = document.getElementById("fotoBtn");
const fotoNome = document.getElementById("fotoNome");
const dropZone = document.getElementById("dropZone");
const fotoPreviewWrap = document.getElementById("fotoPreviewWrap");
const fotoPreview = document.getElementById("fotoPreview");

let selectedType = "";
let uploadedPhotoDataUrl = "";
let uploadedPhotoFile = null;

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
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
  const telefone = data.get("telefone").trim();

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
  const instagram = normalizeInstagram(data.get("instagram").trim());
  const whatsapp = whatsappUrl(data.get("whatsapp").trim());
  const email = String(data.get("email") || "").trim();
  const phone = data.get("telefone").trim();
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
    directionsUrl: buildDirectionsUrl(mapQuery),
    popupTitleColor: category === "hotel" ? "#3568c9" : "#c9642b"
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

  const payload = buildSubmissionPayload(data, selectedType, pointId, mapFocus);

  try {
    await submitRecord(payload);
    form.reset();
    showFeedback("Cadastro enviado com sucesso. Agora ele aguarda validacao no painel Admin.");
  } catch (error) {
    showFeedback(error.message || "Ocorreu um erro ao enviar o cadastro.", true);
  }
});
