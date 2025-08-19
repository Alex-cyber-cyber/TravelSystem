const Viaje = require('../../models/viaje/viaje');
const AsignarSucursales = require('../../models/AsignarSucursales/AsignarSucursales');
const Transportistas = require('../../models/transportistas/transportistas');

function rangeUTC(iso) {
  const d = new Date(iso);
  const start = new Date(d); start.setUTCHours(0,0,0,0);
  const end = new Date(d);   end.setUTCHours(23,59,59,999);
  return { start, end };
}

async function getViajesPorFecha(req, res) {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.json([]);
    const { start, end } = rangeUTC(fecha);

    const viajes = await Viaje.find({ fecha: { $gte: start, $lte: end } })
      .select('colaboradores')
      .lean();

    return res.json(viajes);
  } catch (err) {
    console.error('getViajesPorFecha error:', err);
    return res.status(500).json({ error: 'Error obteniendo viajes por fecha' });
  }
}

async function crearViaje(req, res) {
  try {
    const { fecha, sucursal_id, transportista_id, colaboradores = [], observaciones } = req.body;
    if (!fecha || !sucursal_id || !transportista_id || !colaboradores.length) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const { start, end } = rangeUTC(fecha);

    const conflict = await Viaje.findOne({
      fecha: { $gte: start, $lte: end },
      colaboradores: { $in: colaboradores }
    }).lean();
    if (conflict) {
      return res.status(409).json({ error: 'Uno o más colaboradores ya tienen viaje en esa fecha' });
    }

    const asignaciones = await AsignarSucursales.find({
      sucursal_id,
      personal_id: { $in: colaboradores }
    }).select('personal_id distancia_km').lean();

    const asignados = new Set(asignaciones.map(a => String(a.personal_id)));
    const faltantes = colaboradores.filter(id => !asignados.has(String(id)));
    if (faltantes.length) {
      return res.status(400).json({ error: 'Hay colaboradores no asignados a la sucursal seleccionada' });
    }

    const total_km = asignaciones.reduce((acc, a) => acc + Number(a.distancia_km || 0), 0);
    if (total_km > 100) {
      return res.status(400).json({ error: 'La suma de distancias supera los 100 km' });
    }

    const transp = await Transportistas.findById(transportista_id).select('tarifa').lean();
    const tarifa_total = Number(transp?.tarifa || 0);

    const nuevo = await Viaje.create({
      fecha,
      sucursal_id,
      transportista_id,
      colaboradores,
      observaciones,
      registrado_por: req.userId,
      total_km,
      tarifa_total
    });

    return res.status(201).json(nuevo);
  } catch (err) {
    console.error('crearViaje error:', err);
    return res.status(500).json({ error: 'Error al crear el viaje' });
  }
}

module.exports = { getViajesPorFecha, crearViaje };
