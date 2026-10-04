const Equipo = require("../models/Equipo");
const Partido = require("../models/Partido");

/* ==========================
   TABLA DE POSICIONES
========================== */

exports.obtenerTabla = async (req, res) => {
  try {
    const equipos = await Equipo.find();

    const tabla = equipos
      .map((equipo) => ({
        id: equipo._id.toString(),
        jugador: equipo.jugador,
        equipo: equipo.equipo,
        pj: equipo.pj,
        pg: equipo.pg,
        pe: equipo.pe,
        pp: equipo.pp,
        puntos: equipo.puntos,
        goles_favor: equipo.goles_favor,
        goles_contra: equipo.goles_contra,
      }))
      .sort((a, b) => {
        if (b.puntos !== a.puntos) {
          return b.puntos - a.puntos;
        }

        const difA = a.goles_favor - a.goles_contra;
        const difB = b.goles_favor - b.goles_contra;

        return difB - difA;
      });

    res.json(tabla);
  } catch (error) {
    console.error("Error obtenerTabla:", error);

    res.status(500).json({
      mensaje: "Error al obtener la tabla",
      error: error.message,
    });
  }
};

/* ==========================
   OBTENER PARTIDOS
========================== */

exports.obtenerPartidos = async (req, res) => {
  try {
    const partidos = await Partido.find()
      .populate("equipo1", "equipo jugador")
      .populate("equipo2", "equipo jugador");

    const resultado = partidos.map((p) => ({
      id: p._id,
      id_equipo1: p.equipo1?._id,
      id_equipo2: p.equipo2?._id,
      equipo1: p.equipo1?.equipo || "Equipo eliminado",
      equipo2: p.equipo2?.equipo || "Equipo eliminado",
      goles_equipo1: p.goles_equipo1,
      goles_equipo2: p.goles_equipo2,
      resultado: p.resultado,
    }));

    res.json(resultado);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener los partidos",
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

/* ==========================
   ELIMINAR PARTIDO
========================== */

exports.eliminarPartido = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await Partido.findById(id);

    if (!partido) {
      return res.status(404).json({
        mensaje: "Partido no encontrado",
      });
    }

    const eq1 = await Equipo.findById(partido.equipo1);
    const eq2 = await Equipo.findById(partido.equipo2);

    if (eq1 && eq2) {
      const g1 = partido.goles_equipo1;
      const g2 = partido.goles_equipo2;

      eq1.pj -= 1;
      eq2.pj -= 1;

      eq1.goles_favor -= g1;
      eq1.goles_contra -= g2;

      eq2.goles_favor -= g2;
      eq2.goles_contra -= g1;

      if (partido.resultado === "gana1") {
        eq1.pg -= 1;
        eq1.puntos -= 3;
        eq2.pp -= 1;
      } else if (partido.resultado === "gana2") {
        eq2.pg -= 1;
        eq2.puntos -= 3;
        eq1.pp -= 1;
      } else {
        eq1.pe -= 1;
        eq2.pe -= 1;

        eq1.puntos -= 1;
        eq2.puntos -= 1;
      }

      await eq1.save();
      await eq2.save();
    }

    await Partido.findByIdAndDelete(id);

    res.json({
      mensaje: "Partido eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar el partido",
      error: error.message,
    });
  }
};

/* ==========================
   EDITAR PARTIDO
========================== */

exports.editarPartido = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      golesEquipo1,
      golesEquipo2,
      resultado,
    } = req.body;

    const partido = await Partido.findById(id);

    if (!partido) {
      return res.status(404).json({
        mensaje: "Partido no encontrado",
      });
    }

    const eq1 = await Equipo.findById(partido.equipo1);
    const eq2 = await Equipo.findById(partido.equipo2);

    if (!eq1 || !eq2) {
      return res.status(404).json({
        mensaje: "Equipos no encontrados",
      });
    }

    /* Primero revertimos el resultado anterior */

    const viejoG1 = partido.goles_equipo1;
    const viejoG2 = partido.goles_equipo2;

    eq1.goles_favor -= viejoG1;
    eq1.goles_contra -= viejoG2;

    eq2.goles_favor -= viejoG2;
    eq2.goles_contra -= viejoG1;

    if (partido.resultado === "gana1") {
      eq1.pg -= 1;
      eq1.puntos -= 3;
      eq2.pp -= 1;
    } else if (partido.resultado === "gana2") {
      eq2.pg -= 1;
      eq2.puntos -= 3;
      eq1.pp -= 1;
    } else {
      eq1.pe -= 1;
      eq2.pe -= 1;
      eq1.puntos -= 1;
      eq2.puntos -= 1;
    }

    /* Aplicamos el nuevo resultado */

    const g1 = Number(golesEquipo1) || 0;
    const g2 = Number(golesEquipo2) || 0;

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

    partido.goles_equipo1 = g1;
    partido.goles_equipo2 = g2;
    partido.resultado = resultado;

    await eq1.save();
    await eq2.save();
    await partido.save();

    res.json({
      mensaje: "Partido actualizado correctamente",
      partido,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al editar el partido",
      error: error.message,
    });
  }
};

/* ==========================
   REINICIAR TORNEO
========================== */

exports.reiniciarTorneo = async (req, res) => {
  try {
    await Partido.deleteMany({});
    await Equipo.deleteMany({});

    res.json({
      mensaje: "Torneo reiniciado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al reiniciar el torneo",
      error: error.message,
    });
  }
};