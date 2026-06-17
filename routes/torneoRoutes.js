const express = require("express");
const router = express.Router();

const torneoController = require("../controllers/torneoController");

router.get("/", torneoController.obtenerTabla);

router.post("/rifar", torneoController.rifarEquipos);

router.post("/partido", torneoController.registrarPartido);

module.exports = router;