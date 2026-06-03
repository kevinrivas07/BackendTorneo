const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let jugadoresEquipos = [];
let historialPartidos = [];
let partidoIdCounter = 1;

app.get('/api/torneo', (req, res) => {
    const tablaOrdenada = [...jugadoresEquipos].sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        const difA = a.goles_favor - a.goles_contra;
        const difB = b.goles_favor - b.goles_contra;
        return difB - difA;
    });
    res.json(tablaOrdenada);
});

app.post('/api/torneo/rifar', (req, res) => {
    const { nombres, nombresEquipos } = req.body;
    if (!nombres || !nombresEquipos || nombres.length !== nombresEquipos.length) {
        return res.status(400).json({ error: "La cantidad de jugadores y equipos debe ser igual" });
    }
    const equiposMezclados = [...nombresEquipos].sort(() => Math.random() - 0.5);
    jugadoresEquipos = nombres.map((jugador, index) => ({
        id: index + 1,
        jugador,
        equipo: equiposMezclados[index],
        pj: 0, pg: 0, pe: 0, pp: 0, puntos: 0,
        goles_favor: 0,
        goles_contra: 0
    }));
    historialPartidos = [];
    partidoIdCounter = 1;
    res.json(jugadoresEquipos);
});

app.post('/api/torneo/manual', (req, res) => {
    const { parejas } = req.body;
    jugadoresEquipos = parejas.map((p, index) => ({
        id: index + 1,
        jugador: p.jugador,
        equipo: p.equipo,
        pj: 0, pg: 0, pe: 0, pp: 0, puntos: 0,
        goles_favor: 0,
        goles_contra: 0
    }));
    historialPartidos = [];
    partidoIdCounter = 1;
    res.json(jugadoresEquipos);
});

app.post('/api/torneo/partido', (req, res) => {
    const { idEquipo1, idEquipo2, resultado, golesEquipo1, golesEquipo2 } = req.body;

    const eq1 = jugadoresEquipos.find(e => e.id === parseInt(idEquipo1));
    const eq2 = jugadoresEquipos.find(e => e.id === parseInt(idEquipo2));

    if (!eq1 || !eq2 || eq1.id === eq2.id) {
        return res.status(400).json({ error: "Equipos no válidos" });
    }

    const g1 = parseInt(golesEquipo1) || 0;
    const g2 = parseInt(golesEquipo2) || 0;

    eq1.pj += 1; eq2.pj += 1;
    eq1.goles_favor += g1; eq1.goles_contra += g2;
    eq2.goles_favor += g2; eq2.goles_contra += g1;

    if (resultado === 'gana1') { eq1.pg += 1; eq1.puntos += 3; eq2.pp += 1; }
    else if (resultado === 'gana2') { eq2.pg += 1; eq2.puntos += 3; eq1.pp += 1; }
    else { eq1.pe += 1; eq1.puntos += 1; eq2.pe += 1; eq2.puntos += 1; }

    historialPartidos.push({
        id: partidoIdCounter++,
        id_equipo1: eq1.id,
        id_equipo2: eq2.id,
        equipo1: eq1.equipo,
        equipo2: eq2.equipo,
        goles_equipo1: g1,
        goles_equipo2: g2,
        resultado
    });

    res.json({ mensaje: "Partido registrado con éxito", tabla: jugadoresEquipos });
});

app.get('/api/torneo/partidos', (req, res) => {
    res.json([...historialPartidos].reverse());
});

app.delete('/api/torneo/partido/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const partido = historialPartidos.find(p => p.id === id);
    if (!partido) return res.status(404).json({ error: 'No encontrado' });

    const eq1 = jugadoresEquipos.find(e => e.id === partido.id_equipo1);
    const eq2 = jugadoresEquipos.find(e => e.id === partido.id_equipo2);

    if (eq1 && eq2) {
        eq1.pj -= 1; eq2.pj -= 1;
        eq1.goles_favor -= partido.goles_equipo1;
        eq1.goles_contra -= partido.goles_equipo2;
        eq2.goles_favor -= partido.goles_equipo2;
        eq2.goles_contra -= partido.goles_equipo1;

        if (partido.resultado === 'gana1') { eq1.pg -= 1; eq1.puntos -= 3; eq2.pp -= 1; }
        else if (partido.resultado === 'gana2') { eq2.pg -= 1; eq2.puntos -= 3; eq1.pp -= 1; }
        else { eq1.pe -= 1; eq1.puntos -= 1; eq2.pe -= 1; eq2.puntos -= 1; }
    }

    historialPartidos = historialPartidos.filter(p => p.id !== id);
    res.json({ ok: true });
});

app.put('/api/torneo/partido/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const partido = historialPartidos.find(p => p.id === id);
    if (!partido) return res.status(404).json({ error: 'No encontrado' });

    const { golesEquipo1, golesEquipo2, resultado } = req.body;

    const eq1 = jugadoresEquipos.find(e => e.id === partido.id_equipo1);
    const eq2 = jugadoresEquipos.find(e => e.id === partido.id_equipo2);

    if (eq1 && eq2) {
        // Revertir
        eq1.goles_favor -= partido.goles_equipo1;
        eq1.goles_contra -= partido.goles_equipo2;
        eq2.goles_favor -= partido.goles_equipo2;
        eq2.goles_contra -= partido.goles_equipo1;

        if (partido.resultado === 'gana1') { eq1.pg -= 1; eq1.puntos -= 3; eq2.pp -= 1; }
        else if (partido.resultado === 'gana2') { eq2.pg -= 1; eq2.puntos -= 3; eq1.pp -= 1; }
        else { eq1.pe -= 1; eq1.puntos -= 1; eq2.pe -= 1; eq2.puntos -= 1; }

        // Aplicar nuevo
        const g1 = parseInt(golesEquipo1) || 0;
        const g2 = parseInt(golesEquipo2) || 0;
        eq1.goles_favor += g1; eq1.goles_contra += g2;
        eq2.goles_favor += g2; eq2.goles_contra += g1;

        if (resultado === 'gana1') { eq1.pg += 1; eq1.puntos += 3; eq2.pp += 1; }
        else if (resultado === 'gana2') { eq2.pg += 1; eq2.puntos += 3; eq1.pp += 1; }
        else { eq1.pe += 1; eq1.puntos += 1; eq2.pe += 1; eq2.puntos += 1; }

        partido.goles_equipo1 = g1;
        partido.goles_equipo2 = g2;
        partido.resultado = resultado;
    }

    res.json({ ok: true });
});

app.delete('/api/torneo/reiniciar', (req, res) => {
    jugadoresEquipos = [];
    historialPartidos = [];
    partidoIdCounter = 1;
    res.json({ mensaje: "Torneo reiniciado" });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});