const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { verifyToken } = require('../../middlewares/authMiddleware');   
const User = require('../../models/register/register');


router.post('/login', authController.login);


router.get('/me', verifyToken, async (req, res) => {
  try {
    const u = await User.findById(req.userId)
      .select('nombres correo role departamento employeeId');
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({
      id: u._id,
      employeeId: u.employeeId,
      nombres: u.nombres,
      correo: u.correo,
      role: u.role,
      departamento: u.departamento
    });
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});

module.exports = router;
