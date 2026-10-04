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
// CONEXIÓN A MONGODB
// ==========================

conectarDB();

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
// RUTAS DEL TORNEO
// ==========================

app.use("/api/torneo", torneoRoutes);

// ==========================
// RUTA PARA ERRORES 404
// ==========================

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================
// MANEJO DE ERRORES
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

// ==========================
// EXPORTAR PARA VERCEL
// ==========================

module.exports = app;