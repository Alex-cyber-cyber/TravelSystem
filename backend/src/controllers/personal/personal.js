const { default: mongoose } = require('mongoose');
const personas = require('../../models/personal/personal');

exports.crearEmployees = async (req, res) => {
  try {
    const { 
      employeeId: idEmpleado, 
      nombres, 
      email, 
      telefono: phone, 
      departamento, 
      fechaContratacion, 
      estado 
    } = req.body;

    console.log('Datos recibidos en backend:', req.body);
    
    const nuevoEmpleado = new personas({
      idEmpleado,
      nombres,
      email,
      phone,
      departamento,
      fechaContratacion,
      estado: estado || 'activo' 
    });

    await nuevoEmpleado.save();
    
    res.status(201).json({
      success: true,
      data: nuevoEmpleado,
      message: 'Empleado creado exitosamente'
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
      error: 'Error interno del servidor'
    });
  }
};

exports.obtenerEmployees = async (req, res) => {
  try {
    console.log('Intentado Obtener Empleados...');
    const db = mongoose.connection;
    if(db.readyState !== 1) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    const count = await personas.countDocuments();
    console.log(`Total de empleados en la base de datos: ${count}`);

    const empleados = await personas.find({}, 'nombres idEmpleado _id').lean();

    if(!empleados || !Array.isArray(empleados)) {
      throw new Error('La respuesta no es un array valido');
    }
    console.log('Empleados encontrados:', empleados.length);
    res.status(200).json(empleados);
  }catch (error){
    console.error('Error critico en Obtener Empleados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
