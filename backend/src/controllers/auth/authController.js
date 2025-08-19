const User = require('../../models/register/register');
const jwt = require('jsonwebtoken');
const config = require('../../../config');

exports.login = async (req, res) => {   
    try {
        const { email, password } = req.body;
        console.log('Datos de login recibidos:', req.body);
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }

        const user = await User.findOne({ correo: email });
        console.log('Usuario encontrado:', user);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña incorrecta'
            });
        }
            const payload = {
                sub: user._id.toString(),
                role: user.role,
                departamento: user.departamento
            };
            const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '8h' });

            res.status(200).json({
                success: true,
                token,
                user: {
                id: user._id,
                employeeId: user.employeeId,
                nombres: user.nombres,
                correo: user.correo,
                role: user.role,
                departamento: user.departamento
                }
            });
    console.log('Usuario autenticado con éxito:', user);
    } catch (error) {
        console.error('Error en el controlador de login:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
}