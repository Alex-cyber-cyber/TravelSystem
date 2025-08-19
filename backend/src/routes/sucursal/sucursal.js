const express = require('express');
const router = express.Router();
const sucursalController = require('../../controllers/sucursal/sucursal');
const { getColaboradoresBySucursal } = require('../../controllers/sucursal/colaboradores');

router.post('/', sucursalController.createSucursal);
router.get('/', sucursalController.getSucursales);
router.get('/:sucursalId/colaboradores', getColaboradoresBySucursal);

module.exports = router;