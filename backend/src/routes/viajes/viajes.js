const express = require('express');
const router = express.Router();
const Viaje = require('../../models/viaje/viaje');
const { checkRole } = require('../../middlewares/authMiddleware');

router.post('/', checkRole('gerente'), async (req, res) => {
  try {
    const viaje = new Viaje(req.body);
    await viaje.save();
    res.status(201).json(viaje);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    const viajes = await Viaje.find({ fecha: new Date(fecha) })
      .populate('sucursal_id transportista_id colaboradores registrado_por');
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;