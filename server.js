const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Aquí se guardará el estado del torneo en memoria
let jugadoresEquipos = [];

// 1. Obtener la tabla de posiciones actual (Ordenada por puntos)
app.get('/api/torneo', (req, res) => {
    const tablaOrdenada = [...jugadoresEquipos].sort((a, b) => b.puntos - a.puntos);
    res.json(tablaOrdenada);
});

// 2. RIFAR EQUIPOS ALEATORIAMENTE
app.post('/api/torneo/rifar', (req, res) => {
    const { nombres, nombresEquipos } = req.body;

    if (!nombres || !nombresEquipos || nombres.length !== nombresEquipos.length) {
        return res.status(400).json({ error: "La cantidad de jugadores y equipos debe ser igual" });
    }

    // Mezclar los equipos aleatoriamente
    const equiposMezclados = [...nombresEquipos].sort(() => Math.random() - 0.5);

    jugadoresEquipos = nombres.map((jugador, index) => ({
        id: index + 1,
        jugador: jugador,
        equipo: equiposMezclados[index],
        pj: 0, pg: 0, pe: 0, pp: 0, puntos: 0
    }));

    res.json(jugadoresEquipos);
});

// 3. ASIGNACIÓN MANUAL (Ingresar tú mismo quién va con qué equipo)
app.post('/api/torneo/manual', (req, res) => {
    const { parejas } = req.body; // Array de objetos { jugador, equipo }

    jugadoresEquipos = parejas.map((p, index) => ({
        id: index + 1,
        jugador: p.jugador,
        equipo: p.equipo,
        pj: 0, pg: 0, pe: 0, pp: 0, puntos: 0
    }));

    res.json(jugadoresEquipos);
});

// 4. REGISTRAR PARTIDO (Ganó, Empató o Perdió)
app.post('/api/torneo/partido', (req, res) => {
    const { idEquipo1, idEquipo2, resultado } = req.body; 
    // resultado puede ser: "gana1", "gana2", "empate"

    const eq1 = jugadoresEquipos.find(e => e.id === parseInt(idEquipo1));
    const eq2 = jugadoresEquipos.find(e => e.id === parseInt(idEquipo2));

    if (!eq1 || !eq2 || eq1.id === eq2.id) {
        return res.status(400).json({ error: "Equipos no válidos" });
    }

    // Sumar partido jugado a ambos
    eq1.pj += 1;
    eq2.pj += 1;

    if (resultado === "gana1") {
        eq1.pg += 1;
        eq1.puntos += 3;
        
        eq2.pp += 1; // Equipo 2 pierde
    } else if (resultado === "gana2") {
        eq2.pg += 1;
        eq2.puntos += 3;
        
        eq1.pp += 1; // Equipo 1 pierde
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