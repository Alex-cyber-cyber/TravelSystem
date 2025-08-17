const express = require('express');
const router = express.Router();
const AsignarSucursales = require('../../controllers/AsignarSucursales/AsignarSucursales');


router.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next();
});

router.post('/', async (req, res) => {
    const { personal_id, sucursal_id, distancia_km } = req.body;
    try {
        const nuevaAsignacion = await AsignarSucursales.crearAsignacion(personal_id, sucursal_id, distancia_km);
        res.status(201).json(nuevaAsignacion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/asignaciones', async (req, res) => {
    try {
        const asignaciones = await AsignarSucursales.obtenerTodasAsignaciones();
        res.status(200).json(asignaciones);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/asignaciones/:personal_id', async (req, res) => {
    try {
        const asignaciones = await AsignarSucursales.obtenerAsignacionesPorPersonal(req.params.personal_id);
        res.status(200).json(asignaciones);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/asignaciones/:id', async (req, res) => {
    try {
        await AsignarSucursales.eliminarAsignacion(req.params.id);
        res.status(200).json({ message: 'Asignación eliminada correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;