const express = require('express');
const router = express.Router();
const { crearTransportista, obtenerTransportistas } = require('../../controllers/transportistas/transportistas');

router.post('/', crearTransportista);
router.get('/', obtenerTransportistas);

module.exports = router;