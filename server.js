const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Aquí se guardará el estado del torneo en memoria
let jugadoresEquipos = [];

// 1. Obtener la tabla de posiciones actual (Ordenada por puntos y luego por diferencia de goles)
app.get('/api/torneo', (req, res) => {
    const tablaOrdenada = [...jugadoresEquipos].sort((a, b) => {
        // Primero ordenar por puntos de mayor a menor
        if (b.puntos !== a.puntos) {
            return b.puntos - a.puntos;
        }
        // Si empatan en puntos, ordenar por diferencia de goles (gf - gc)
        const difA = a.goles_favor - a.goles_contra;
        const difB = b.goles_favor - b.goles_contra;
        return difB - difA;
    });
    res.json(tablaOrdenada);
});

// 2. RIFAR EQUIPOS ALEATORIAMENTE
app.post('/api/torneo/rifar', (req, res) => {
    const { nombres, nombresEquipos } = req.body;

    if (!nombres || !nombresEquipos || nombres.length !== nombresEquipos.length) {
        return res.status(400).json({ error: "La cantidad de jugadores y equipos debe ser igual" });
    }

    const equiposMezclados = [...nombresEquipos].sort(() => Math.random() - 0.5);

    jugadoresEquipos = nombres.map((jugador, index) => ({
        id: index + 1,
        jugador: jugador,
        equipo: equiposMezclados[index],
        pj: 0, pg: 0, pe: 0, pp: 0, puntos: 0,
        goles_favor: 0,  // <-- Inicializado en 0
        goles_contra: 0  // <-- Inicializado en 0
    }));

    res.json(jugadoresEquipos);
});

// 3. ASIGNACIÓN MANUAL
app.post('/api/torneo/manual', (req, res) => {
    const { parejas } = req.body; 

    jugadoresEquipos = parejas.map((p, index) => ({
        id: index + 1,
        jugador: p.jugador,
        equipo: p.equipo,
        pj: 0, pg: 0, pe: 0, pp: 0, puntos: 0,
        goles_favor: 0,  // <-- Inicializado en 0
        goles_contra: 0  // <-- Inicializado en 0
    }));

    res.json(jugadoresEquipos);
});

// 4. REGISTRAR PARTIDO (Procesando resultado y goles)
app.post('/api/torneo/partido', (req, res) => {
    // Ahora extraemos también los goles que manda el frontend
    const { idEquipo1, idEquipo2, resultado, golesEquipo1, golesEquipo2 } = req.body; 

    const eq1 = jugadoresEquipos.find(e => e.id === parseInt(idEquipo1));
    const eq2 = jugadoresEquipos.find(e => e.id === parseInt(idEquipo2));

    if (!eq1 || !eq2 || eq1.id === eq2.id) {
        return res.status(400).json({ error: "Equipos no válidos" });
    }

    // Convertir a números por seguridad
    const g1 = parseInt(golesEquipo1) || 0;
    const g2 = parseInt(golesEquipo2) || 0;

    // Sumar partido jugado a ambos
    eq1.pj += 1;
    eq2.pj += 1;

    // Acumular Goles a Favor (GF) y Goles en Contra (GC)
    eq1.goles_favor += g1;
    eq1.goles_contra += g2;

    eq2.goles_favor += g2;
    eq2.goles_contra += g1;

    // Determinar puntos y estado de partidos
    if (resultado === "gana1") {
        eq1.pg += 1;
        eq1.puntos += 3;
        eq2.pp += 1; 
    } else if (resultado === "gana2") {
        eq2.pg += 1;
        eq2.puntos += 3;
        eq1.pp += 1; 
    } else if (resultado === "empate") {
        eq1.pe += 1;
        eq1.puntos += 1;
        eq2.pe += 1;
        eq2.puntos += 1;
    }

    res.json({ mensaje: "Partido registrado con éxito", tabla: jugadoresEquipos });
});

// 5. REINICIAR TORNEO
app.delete('/api/torneo/reiniciar', (req, res) => {
    jugadoresEquipos = [];
    res.json({ mensaje: "Torneo reiniciado" });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});