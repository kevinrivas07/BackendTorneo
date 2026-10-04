const express = require("express");

const router = express.Router();

const torneoController = require("../controllers/torneoController");

router.get("/", torneoController.obtenerTabla);

router.get("/partidos", torneoController.obtenerPartidos);

router.post("/rifar", torneoController.rifarEquipos);

router.post("/partido", torneoController.registrarPartido);

router.put("/partido/:id", torneoController.editarPartido);

router.delete("/partido/:id", torneoController.eliminarPartido);

router.post("/reiniciar", torneoController.reiniciarTorneo);

module.exports = router;