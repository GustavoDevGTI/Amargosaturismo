const STORAGE_KEY = "guia_turista_cadastros_v1";

const typeInputs = Array.from(document.querySelectorAll('input[name="tipo"]'));
const formWrap = document.getElementById("formWrap");
const stepTip = document.getElementById("stepTip");
const form = document.getElementById("cadastroForm");
const feedback = document.getElementById("formFeedback");
const horarioField = document.getElementById("horario");
const statusHotelField = document.getElementById("statusHotel");
const cnpjInput = document.getElementById("cnpj");
const cepInput = document.getElementById("cep");
const estadoInput = document.getElementById("estado");

const fotoInput = document.getElementById("fotoArquivo");
const fotoBtn = document.getElementById("fotoBtn");
const fotoNome = document.getElementById("fotoNome");
const dropZone = document.getElementById("dropZone");
const fotoPreviewWrap = document.getElementById("fotoPreviewWrap");
const fotoPreview = document.getElementById("fotoPreview");

let selectedType = "";
let uploadedPhotoDataUrl = "";

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

function applyCepMask(value) {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function parseLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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

  horarioField.required = type === "gastronomia";
  statusHotelField.required = type === "hotel";
  clearFeedback();
}

function buildAddressLine(data) {
  const logradouro = data.get("logradouro").trim();
  const numero = data.get("numero").trim();
  const bairro = data.get("bairro").trim();
  const cidade = data.get("cidade").trim();
  const estado = data.get("estado").trim().toUpperCase();
  const cep = applyCepMask(data.get("cep").trim());

  const ruaNumero = [logradouro, numero].filter(Boolean).join(", ");
  const cidadeEstado = [cidade, estado].filter(Boolean).join(" - ");

  return [ruaNumero, bairro, cidadeEstado, cep ? `CEP ${cep}` : ""]
    .filter(Boolean)
    .join(" | ");
}

function buildMapQuery(name, data) {
  return [
    name,
    data.get("logradouro").trim(),
    data.get("numero").trim(),
    data.get("bairro").trim(),
    data.get("cidade").trim(),
    data.get("estado").trim().toUpperCase(),
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

function buildGuideData(data, category, name, description, addressLine, contacts) {
  const gasExtra = data.get("gasExtra").trim();
  const horario = data.get("horario").trim();
  const statusHotel = data.get("statusHotel").trim();
  const servicoHotel = data.get("servicoHotel").trim();
  const mapQuery = buildMapQuery(name, data);

  if (category === "gastronomia") {
    return {
      subtitle: gasExtra,
      description,
      hoursLine: horario,
      addressLine,
      mapQuery,
      directionsUrl: buildDirectionsUrl(mapQuery),
      metaLines: [horario, addressLine].filter(Boolean),
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
  const email = data.get("email").trim();
  const telefone = data.get("telefone").trim();

  const lines = [];

  if (category === "gastronomia") {
    lines.push(data.get("horario").trim());
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

  lines.push(...parseLines(data.get("extrasMeta")));

  return lines.filter(Boolean);
}

function saveRecord(record) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  current.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current.length;
}

cnpjInput.addEventListener("input", () => {
  cnpjInput.value = applyCnpjMask(cnpjInput.value);
});

cepInput.addEventListener("input", () => {
  cepInput.value = applyCepMask(cepInput.value);
});

estadoInput.addEventListener("input", () => {
  estadoInput.value = String(estadoInput.value || "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 2);
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
    clearPhotoSelection();
    clearFeedback();
  }, 0);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!selectedType) {
    showFeedback("Selecione primeiro o tipo de estabelecimento.", true);
    return;
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

  const cnpjFormatted = applyCnpjMask(data.get("cnpj").trim());
  const description = data.get("descricao").trim();
  const addressLine = buildAddressLine(data);

  const fallbackPhoto = selectedType === "gastronomia"
    ? "https://placehold.co/1200x800?text=Bar+ou+Restaurante"
    : "https://placehold.co/1200x800?text=Hotel+ou+Pousada";

  const instagram = normalizeInstagram(data.get("instagram").trim());
  const whatsapp = whatsappUrl(data.get("whatsapp").trim());
  const email = data.get("email").trim();
  const phone = data.get("telefone").trim();
  const contacts = {
    instagram,
    whatsapp,
    email,
    phone,
    phoneUrl: phoneUrl(phone)
  };
  const guide = buildGuideData(data, selectedType, nomeOriginal, description, addressLine, contacts);

  const createdAt = new Date().toISOString();

  const record = {
    id: `cad-${Date.now()}`,
    createdAt,
    updatedAt: createdAt,
    approvalStatus: "pending",
    approvalUpdatedAt: createdAt,
    category: selectedType,
    pointId,
    mapFocus,
    name: nomeOriginal,
    cnpj: cnpjFormatted,
    description,
    photoSrc: uploadedPhotoDataUrl || fallbackPhoto,
    metaLines: buildMetaLines(data, selectedType, addressLine, cnpjFormatted),
    contacts,
    guide
  };

  try {
    const total = saveRecord(record);
    form.reset();
    showFeedback(`Cadastro enviado com sucesso. Total de estabelecimentos cadastrados: ${total}. Agora ele aguarda validacao no painel Admin.`);
  } catch (error) {
    if (error && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      showFeedback("Nao foi possivel salvar. O armazenamento local do navegador ficou cheio.", true);
      return;
    }
    showFeedback("Ocorreu um erro ao salvar o cadastro.", true);
  }
});
