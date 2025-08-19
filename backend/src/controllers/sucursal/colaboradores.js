const AsignarSucursales = require('../../models/AsignarSucursales/AsignarSucursales');

async function getColaboradoresBySucursal(req, res) {
  try {
    const { sucursalId } = req.params;

    const asignaciones = await AsignarSucursales.find({ sucursal_id: sucursalId })
      .populate({ path: 'personal_id', select: 'nombres idEmpleado' })
      .lean();

    const colaboradores = asignaciones.map(a => ({
      _id: a.personal_id?._id,          
      personal_id: a.personal_id,       
      distancia_km: a.distancia_km      
    }));

    res.json(colaboradores);
  } catch (err) {
    console.error('getColaboradoresBySucursal error:', err);
    res.status(500).json({ error: 'Error obteniendo colaboradores por sucursal' });
  }
}

module.exports = { getColaboradoresBySucursal };
