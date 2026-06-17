const Equipo = require("../models/Equipo");

exports.obtenerTabla = async (req, res) => {
  try {
    const tabla = await Equipo.find();

    tabla.sort((a, b) => {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }

      const difA = a.goles_favor - a.goles_contra;
      const difB = b.goles_favor - b.goles_contra;

      return difB - difA;
    });

    res.json(tabla);
  } catch (error) {
    res.status(500).json(error);
  }
};