const mongoose = require("mongoose");

const equipoSchema = new mongoose.Schema({
  jugador: {
    type: String,
    required: true,
  },

  equipo: {
    type: String,
    required: true,
  },

  pj: {
    type: Number,
    default: 0,
  },

  pg: {
    type: Number,
    default: 0,
  },

  pe: {
    type: Number,
    default: 0,
  },

  pp: {
    type: Number,
    default: 0,
  },

  puntos: {
    type: Number,
    default: 0,
  },

  goles_favor: {
    type: Number,
    default: 0,
  },

  goles_contra: {
    type: Number,
    default: 0,
  }
});

module.exports = mongoose.model("Equipo", equipoSchema);