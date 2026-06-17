require("dotenv").config();

const app = require("./app");
const conectarDB = require("./config/db");

conectarDB();

app.listen(process.env.PORT || 5000, () => {
  console.log("Servidor iniciado");
});