const express = require('express');
const router = express.Router();
const personasController = require('../../controllers/personal/personal');


router.use((req, res, next)=> {
    console.log(`Solicitud recibida: ${req.method} ${req.path}`);
  next();
});

router.get('/', (req, res, next) => {
  console.log('Middleware específico para GET /');
  next();
}, personasController.obtenerEmployees);

router.post('/', personasController.crearEmployees);
router.get('/', personasController.obtenerEmployees);

module.exports = router;
