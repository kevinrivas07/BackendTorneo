const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definida");
    }

    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    throw error;
  }
};

module.exports = conectarDB;