const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar el token JWT
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No se proporcionó token de autenticación' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token inválido o expirado',
            error: error.message 
        });
    }
};

// Middleware para verificar si el usuario es admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado. Se requieren permisos de administrador' 
        });
    }
    next();
};

// Middleware para verificar si el usuario es el propietario o admin
const isOwnerOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        const resourceOwnerId = req.params[paramName];
        
        if (req.user.role === 'admin' || req.user._id.toString() === resourceOwnerId) {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para realizar esta acción' 
            });
        }
    };
};

module.exports = { authenticate, isAdmin, isOwnerOrAdmin };
