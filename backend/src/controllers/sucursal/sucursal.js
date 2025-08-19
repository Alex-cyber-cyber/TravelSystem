const sucursal = require('../../models/sucursal/sucursal');

exports.createSucursal = async (req, res) => {
    try {
        const { name, code, address, city, phone, state, email, manager } = req.body;
        const active = req.body.active || true;
        console.log('Datos recibidos en backend:', req.body);
        const newSucursal = new sucursal({
            name,
            code,
            address,
            city,
            phone,
            state,
            email,
            manager
        });

        await newSucursal.save();
        res.status(201).json({
            success: true,
            data: newSucursal,
            message: 'Sucursal creada exitosamente',
            sucursal: {
                id: newSucursal._id,
                name: newSucursal.name,
                code: newSucursal.code,
                address: newSucursal.address,
                city: newSucursal.city,
                phone: newSucursal.phone,
                state: newSucursal.state,
                email: newSucursal.email,
                manager: newSucursal.manager
            }
        });
    } catch (error) {
       if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
            success: false,
            error: `El ${field} ya existe`
        });

    }
    res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

exports.getSucursales = async (req, res) => {
    try {
        const sucursales = await sucursal.find({}, 'name code _id');
        console.log('Datos de sucursales encontrados:', sucursales); 
        res.status(200).json(sucursales);
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        res.status(500).json([]); 
    }
}
