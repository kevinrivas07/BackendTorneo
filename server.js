require("dotenv").config();

const express = require("express");
const cors = require("cors");

const conectarDB = require("./config/db");
const torneoRoutes = require("./routes/torneoRoutes");

const app = express();

// ==========================
// MIDDLEWARES
// ==========================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ==========================
// RUTA PRINCIPAL
// ==========================

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Backend Torneo funcionando correctamente",
  });
});

// ==========================
// DIAGNÓSTICO
// ==========================

app.get("/api/diagnostico", (req, res) => {
  res.json({
    mensaje: "ESTE ES EL BACKEND NUEVO",
    version: "2026-10-03-TEST",
    rutas: [
      "GET /api/torneo",
      "GET /api/torneo/partidos",
      "POST /api/torneo/partido",
      "DELETE /api/torneo/reiniciar"
    ]
  });
});

// ==========================
// RUTAS DEL TORNEO + MONGODB
// ==========================

app.use(
  "/api/torneo",
  async (req, res, next) => {
    try {
      await conectarDB();
      next();
    } catch (error) {
      console.error("❌ MongoDB no disponible:", error.message);

      res.status(500).json({
        ok: false,
        mensaje: "No se pudo conectar con MongoDB",
        error: error.message,
      });
    }
  },
  torneoRoutes
);

// ==========================
// 404
// ==========================

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================
// ERRORES
// ==========================

app.use((error, req, res, next) => {
  console.error("ERROR DEL SERVIDOR:", error);

  res.status(500).json({
    ok: false,
    mensaje: "Error interno del servidor",
    error: error.message,
  });
});

// ==========================
// SERVIDOR LOCAL
// ==========================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`✅ Servidor iniciado en http://localhost:${PORT}`);
  });
}

module.exports = app;