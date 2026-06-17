const Equipo = require("../models/Equipo");
const Partido = require("../models/Partido");

/* ==========================
   TABLA DE POSICIONES
========================== */

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
    console.error(error);
    res.status(500).json({
      mensaje: "Error al obtener la tabla",
      error: error.message,
    });
  }
};

/* ==========================
   RIFAR EQUIPOS
========================== */

exports.rifarEquipos = async (req, res) => {
  try {
    const { nombres, nombresEquipos } = req.body;

    if (!nombres || !nombresEquipos) {
      return res.status(400).json({
        mensaje: "Datos incompletos",
      });
    }

    if (nombres.length !== nombresEquipos.length) {
      return res.status(400).json({
        mensaje: "La cantidad de jugadores y equipos debe ser igual",
      });
    }

    await Equipo.deleteMany({});
    await Partido.deleteMany({});

    const equiposMezclados = [...nombresEquipos].sort(
      () => Math.random() - 0.5
    );

    const registros = nombres.map((jugador, index) => ({
      jugador,
      equipo: equiposMezclados[index],
    }));

    const equipos = await Equipo.insertMany(registros);

    res.json(equipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al rifar equipos",
      error: error.message,
    });
  }
};

/* ==========================
   REGISTRAR PARTIDO
========================== */

exports.registrarPartido = async (req, res) => {
  try {
    const {
      idEquipo1,
      idEquipo2,
      golesEquipo1,
      golesEquipo2,
      resultado,
    } = req.body;

    const eq1 = await Equipo.findById(idEquipo1);
    const eq2 = await Equipo.findById(idEquipo2);

    if (!eq1 || !eq2) {
      return res.status(404).json({
        mensaje: "Equipos no encontrados",
      });
    }

    const g1 = Number(golesEquipo1) || 0;
    const g2 = Number(golesEquipo2) || 0;

    eq1.pj += 1;
    eq2.pj += 1;

    eq1.goles_favor += g1;
    eq1.goles_contra += g2;

    eq2.goles_favor += g2;
    eq2.goles_contra += g1;

    if (resultado === "gana1") {
      eq1.pg += 1;
      eq1.puntos += 3;
      eq2.pp += 1;
    } else if (resultado === "gana2") {
      eq2.pg += 1;
      eq2.puntos += 3;
      eq1.pp += 1;
    } else {
      eq1.pe += 1;
      eq2.pe += 1;

      eq1.puntos += 1;
      eq2.puntos += 1;
    }

    await eq1.save();
    await eq2.save();

    const partido = await Partido.create({
      equipo1: eq1._id,
      equipo2: eq2._id,
      goles_equipo1: g1,
      goles_equipo2: g2,
      resultado,
    });

    res.json({
      mensaje: "Partido registrado correctamente",
      partido,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al registrar partido",
      error: error.message,
    });
  }
};