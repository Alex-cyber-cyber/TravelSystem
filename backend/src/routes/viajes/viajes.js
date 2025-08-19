const express = require('express');
const router = express.Router();
const Viaje = require('../../models/viaje/viaje'); 
const { verifyToken, requireTripPermission } = require('../../middlewares/authMiddleware');


router.post('/', verifyToken, requireTripPermission, async (req, res) => {
  try {
    const body = req.body || {};
    const viaje = new Viaje({
      ...body,
      registrado_por: req.userId, 
    });
    await viaje.save();
    res.status(201).json(viaje);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.json([]);

    const start = new Date(fecha);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fecha);
    end.setHours(23, 59, 59, 999);

    const viajes = await Viaje.find({ fecha: { $gte: start, $lte: end } })
      .select('fecha sucursal_id transportista_id colaboradores registrado_por');

    res.json(viajes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
