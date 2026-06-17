const express = require("express");
const cors = require("cors");

const torneoRoutes = require("./routes/torneoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/torneo", torneoRoutes);

app.get("/test", (req, res) => {
  res.json({
    ok: true,
    mongoUriExiste: !!process.env.MONGO_URI
  });
});

module.exports = app;