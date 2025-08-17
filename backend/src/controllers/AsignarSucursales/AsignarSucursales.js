const AsignarSucursales = require('../../models/AsignarSucursales/AsignarSucursales');
const Personal = require('../../models/personal/personal');
const Sucursal = require('../../models/sucursal/sucursal');

async function crearAsignacion(personal_id, sucursal_id, distancia_km) {
   const asignacionExistente = await AsignarSucursales.findOne({
       personal_id,
       sucursal_id
   });

   if (asignacionExistente) {
       throw new Error('Este colaborador ya está asignado a esta sucursal');
   }

   const nuevaAsignacion = new AsignarSucursales({
       personal_id,
       sucursal_id,
       distancia_km
   });
   await nuevaAsignacion.save();
   return nuevaAsignacion;
}

async function obtenerAsignacionesPorPersonal(personal_id) {
    return await AsignarSucursales.find({ personal_id }).populate('sucursal_id');
}

async function obtenerEmployees() {
    return await Personal.find({}, 'nombres idEmpleado _id');
}

async function obtenerSucursales() {
    return await Sucursal.find({}, 'name _id');
}
async function obtenerTodasAsignaciones() {
    try {
        const asignaciones = await AsignarSucursales.find().lean();
        const resultados = await Promise.all(asignaciones.map(async (asignacion) => {
            const personal = await Personal.findById(asignacion.personal_id, 'nombres idEmpleado');
            const sucursal = await Sucursal.findById(asignacion.sucursal_id, 'name');
            return {
                ...asignacion,
                personal_id: personal,
                sucursal_id: sucursal
            };
        }));
        return resultados;
    } catch (error) {
        console.error('Error en obtenerTodasAsignaciones:', error);
        throw error;
    }
}

async function eliminarAsignacion(id) {
    return await AsignarSucursales.findByIdAndDelete(id);
}

module.exports = {
    crearAsignacion,
    obtenerAsignacionesPorPersonal,
    obtenerTodasAsignaciones,
    eliminarAsignacion, 
    obtenerEmployees,
    obtenerSucursales
};