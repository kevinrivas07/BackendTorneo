const mongoose = require("mongoose");

const partidoSchema = new mongoose.Schema(
  {
    equipo1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      required: true
    },

    equipo2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      required: true
    },

    goles_equipo1: {
      type: Number,
      default: 0
    },

    goles_equipo2: {
      type: Number,
      default: 0
    },

    resultado: {
      type: String,
      enum: ["gana1", "gana2", "empate"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Partido", partidoSchema);