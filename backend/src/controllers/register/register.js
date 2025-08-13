
const User = require('../../models/register/register');

exports.createRegister = async (req, res) => {
    try {
        console.log('Datos recibidos en backend:', req.body);
        
        // Validación mejorada
        const requiredFields = ['employeeId', 'nombres', 'apellidos', 'correo', 'telefono', 'departamento', 'role', 'password'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Faltan campos obligatorios: ${missingFields.join(', ')}`
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
            $or: [
                { employeeId: req.body.employeeId },
                { correo: req.body.correo }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: 'El usuario ya existe' 
            });
        }

        // Crear nuevo usuario
        const newUser = new User(req.body);
        await newUser.save();

        console.log('Usuario guardado en MongoDB:', newUser);

        res.status(201).json({
            success: true,
            user: {
                id: newUser._id,
                employeeId: newUser.employeeId,
                nombres: newUser.nombres,
                correo: newUser.correo
            }
        });
    } catch (error) {
        console.error('Error en el controlador:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};