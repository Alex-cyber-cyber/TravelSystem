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

        // Buscar usuario por correo
        const user = await User.findOne({ correo: email });
        console.log('Usuario encontrado:', user);
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Contraseña incorrecta'
            });
        }

        // Generar token JWT
        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '8h' });

        res.status(200).json({
            success: true,
            token,
        user: {
            id: user._id,
            employeeId: user.employeeId,
            nombres: user.nombres,
            correo: user.correo
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