require("dotenv").config();

const express = require("express");
const cors = require("cors");

const conectarDB = require("./config/db");
const torneoRoutes = require("./routes/torneoRoutes");

const app = express();

// Conexión MongoDB
conectarDB();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    mensaje: "Backend Torneo funcionando"
  });
});

// Rutas
app.use("/api/torneo", torneoRoutes);

// Solo inicia servidor en local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`✅ Servidor iniciado en puerto ${PORT}`);
  });
}

// Exportar para Vercel
module.exports = app;