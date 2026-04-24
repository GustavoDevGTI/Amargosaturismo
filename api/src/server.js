require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const helmet = require("helmet");

const { admin, port, uploadDir, maxUploadBytes } = require("./config");
const {
  clearSessionCookie,
  getSessionFromRequest,
  requireAdminAuth,
  setSessionCookie,
  validateAdminCredentials
} = require("./adminAuth");
const {
  createSubmission,
  deleteAllSubmissions,
  fileNameToUrl,
  listAdminSubmissions,
  listApprovedSubmissions,
  maybeDeleteUpload,
  updateSubmission,
  updateSubmissionStatus
} = require("./submissions");
const {
  listAdminCards,
  listPublicCards,
  updateCard
} = require("./cards");
const { getPool } = require("./db");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
    callback(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadBytes
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Envie apenas arquivos de imagem."));
  }
});

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir, {
  maxAge: "7d"
}));

function buildPayloadFromRequest(req) {
  const body = req.body || {};
  return {
    id: body.id,
    approvalStatus: body.approvalStatus,
    category: body.category,
    pointId: body.pointId,
    mapFocus: body.mapFocus,
    name: body.name,
    cnpj: body.cnpj,
    description: body.description,
    photoUrl: req.file ? fileNameToUrl(req.file.filename) : body.photoUrl,
    imageAlt: body.imageAlt,
    instagram: body.instagram,
    whatsapp: body.whatsapp,
    email: body.email,
    phone: body.phone,
    addressLine: body.addressLine,
    daysLine: body.daysLine,
    hoursLine: body.hoursLine,
    scheduleLine: body.scheduleLine,
    subtitle: body.subtitle,
    statusLine: body.statusLine,
    serviceLine: body.serviceLine,
    mapQuery: body.mapQuery,
    directionsUrl: body.directionsUrl,
    popupTitleColor: body.popupTitleColor,
    latitude: body.latitude,
    longitude: body.longitude,
    displayOrder: body.displayOrder,
    isActive: body.isActive
  };
}

app.get("/api/health", async (_req, res, next) => {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/public/submissions", async (req, res, next) => {
  try {
    const records = await listApprovedSubmissions({
      category: req.query.category
    });
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

app.get("/api/public/cards", async (_req, res, next) => {
  try {
    const records = await listPublicCards();
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/session", (req, res) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    clearSessionCookie(res);
    res.json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    username: session.username
  });
});

app.post("/api/admin/login", (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (!validateAdminCredentials(username, password)) {
    clearSessionCookie(res);
    res.status(401).json({
      message: "Usuario ou senha invalidos."
    });
    return;
  }

  setSessionCookie(res, admin.username);
  res.json({
    message: "Login realizado com sucesso.",
    username: admin.username
  });
});

app.post("/api/admin/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({
    message: "Sessao encerrada com sucesso."
  });
});

app.use("/api/admin", requireAdminAuth);

app.get("/api/admin/submissions", async (req, res, next) => {
  try {
    const records = await listAdminSubmissions({
      status: req.query.status,
      category: req.query.category
    });
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/cards", async (req, res, next) => {
  try {
    const records = await listAdminCards({
      category: req.query.category
    });
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

app.post("/api/submissions", upload.single("photo"), async (req, res, next) => {
  try {
    const record = await createSubmission(buildPayloadFromRequest(req));
    res.status(201).json({
      message: "Cadastro enviado com sucesso e aguardando validacao.",
      record
    });
  } catch (error) {
    if (req.file) {
      await maybeDeleteUpload(fileNameToUrl(req.file.filename));
    }
    next(error);
  }
});

app.patch("/api/admin/submissions/:id", upload.single("photo"), async (req, res, next) => {
  try {
    const currentPhotoUrl = req.body.currentPhotoUrl || "";
    const record = await updateSubmission(req.params.id, buildPayloadFromRequest(req));
    if (req.file && currentPhotoUrl && currentPhotoUrl !== record.photoSrc) {
      await maybeDeleteUpload(currentPhotoUrl);
    }
    res.json({
      message: "Cadastro atualizado com sucesso.",
      record
    });
  } catch (error) {
    if (req.file) {
      await maybeDeleteUpload(fileNameToUrl(req.file.filename));
    }
    next(error);
  }
});

app.patch("/api/admin/cards/:id", upload.single("photo"), async (req, res, next) => {
  try {
    const currentPhotoUrl = req.body.currentPhotoUrl || "";
    const record = await updateCard(req.params.id, buildPayloadFromRequest(req));
    if (req.file && currentPhotoUrl && currentPhotoUrl !== record.photoSrc) {
      await maybeDeleteUpload(currentPhotoUrl);
    }
    res.json({
      message: "Card atualizado com sucesso.",
      record
    });
  } catch (error) {
    if (req.file) {
      await maybeDeleteUpload(fileNameToUrl(req.file.filename));
    }
    next(error);
  }
});

app.patch("/api/admin/submissions/:id/status", async (req, res, next) => {
  try {
    const record = await updateSubmissionStatus(req.params.id, req.body.status);
    res.json({
      message: "Status atualizado com sucesso.",
      record
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/submissions", async (_req, res, next) => {
  try {
    const deletedCount = await deleteAllSubmissions();
    res.json({
      message: `${deletedCount} cadastro(s) removido(s).`,
      deletedCount
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Erro interno do servidor."
  });
});

app.listen(port, () => {
  console.log(`API do Amargosa Turismo ouvindo na porta ${port}`);
});
