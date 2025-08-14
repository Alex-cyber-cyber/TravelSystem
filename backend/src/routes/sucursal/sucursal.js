const express = require('express');
const router = express.Router();
const sucursalController = require('../../controllers/sucursal/sucursal');

router.post('/', sucursalController.createSucursal);
router.get('/', sucursalController.getSucursales);

module.exports = router;