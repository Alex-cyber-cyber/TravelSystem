const Transportista = require('../../models/transportistas/transportistas');

exports.crearTransportista = async (req, res) => {
  try {
    const transportista = new Transportista(req.body);
    await transportista.save();
    res.status(201).json(transportista);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerTransportistas = async (req, res) => {
  try {
    const transportistas = await Transportista.find({ activo: true });
    res.json(transportistas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};