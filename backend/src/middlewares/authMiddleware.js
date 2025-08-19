const jwt = require('jsonwebtoken');
const config = require('../../config');

function extractToken(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'];
  if (!h) return null;
  if (typeof h === 'string' && h.startsWith('Bearer ')) return h.slice(7);
  return h; 
}

exports.verifyToken = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(403).json({ error: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    req.userId   = decoded.sub || decoded.id || decoded._id;
    req.userRole = (decoded.role || '').toLowerCase();
    req.userDept = (decoded.departamento || '').toLowerCase();
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

exports.requireTripPermission = (req, res, next) => {
  const role = (req.userRole || '').toLowerCase();
  const dept = (req.userDept || '').toLowerCase();
  const isAdmin = role.includes('admin');
  const isGerenteTienda = role.includes('gerente') && (dept.includes('tienda') || role.includes('tienda'));
  if (isAdmin || isGerenteTienda) return next();
  return res.status(403).json({ error: 'Acceso denegado (solo Gerente de tienda o Admin)' });
};