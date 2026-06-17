const express = require("express");
const cors = require("cors");

const torneoRoutes = require("./routes/torneoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/torneo", torneoRoutes);

module.exports = app;