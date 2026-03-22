const User = require('../models/User');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../config/cloudinary');

// Generar JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registrar nuevo usuario
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            // Si se subió una imagen, eliminarla de Cloudinary
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({ 
                success: false, 
                message: 'El usuario o email ya existe' 
            });
        }

        // Crear usuario con imagen si se proporcionó
        const userData = {
            username,
            email,
            password,
            role: 'user' // Siempre se crea como user
        };

        if (req.file) {
            userData.image = req.file.path;
            userData.cloudinary_id = req.file.filename;
        }

        const user = await User.create(userData);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        // Si hay error y se subió una imagen, eliminarla
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        res.status(500).json({ 
            success: false, 
            message: 'Error al registrar usuario',
            error: error.message 
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al iniciar sesión',
            error: error.message 
        });
    }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('projects');
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener usuarios',
            error: error.message 
        });
    }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('projects');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener usuario',
            error: error.message 
        });
    }
};

// Actualizar usuario
const updateUser = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        // Si se sube una nueva imagen
        if (req.file) {
            // Eliminar la imagen anterior si existe
            if (user.cloudinary_id) {
                await cloudinary.uploader.destroy(user.cloudinary_id);
            }
            user.image = req.file.path;
            user.cloudinary_id = req.file.filename;
        }

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: user
        });
    } catch (error) {
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar usuario',
            error: error.message 
        });
    }
};

// Eliminar usuario (propio o admin puede eliminar cualquiera)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        // Eliminar imagen de Cloudinary si existe
        if (user.cloudinary_id) {
            await cloudinary.uploader.destroy(user.cloudinary_id);
        }

        // Eliminar todos los proyectos del usuario
        await Project.deleteMany({ createdBy: user._id });

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Usuario y su imagen eliminados exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar usuario',
            error: error.message 
        });
    }
};

// Cambiar rol de usuario (solo admin)
const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rol inválido. Debe ser "user" o "admin"' 
            });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: `Rol actualizado a ${role} exitosamente`,
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al cambiar rol',
            error: error.message 
        });
    }
};

// Añadir proyecto al array de proyectos del usuario (evitando duplicados)
const addProjectToUser = async (req, res) => {
    try {
        const { userId, projectId } = req.params;

        const user = await User.findById(userId);
        const project = await Project.findById(projectId);

        if (!user || !project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario o proyecto no encontrado' 
            });
        }

        // Evitar duplicados
        if (user.projects.includes(projectId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'El proyecto ya está asociado a este usuario' 
            });
        }

        user.projects.push(projectId);
        await user.save();

        const updatedUser = await User.findById(userId).populate('projects');

        res.json({
            success: true,
            message: 'Proyecto añadido exitosamente',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al añadir proyecto',
            error: error.message 
        });
    }
};

// Eliminar proyecto del array de usuario
const removeProjectFromUser = async (req, res) => {
    try {
        const { userId, projectId } = req.params;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        user.projects = user.projects.filter(p => p.toString() !== projectId);
        await user.save();

        const updatedUser = await User.findById(userId).populate('projects');

        res.json({
            success: true,
            message: 'Proyecto eliminado del usuario exitosamente',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar proyecto',
            error: error.message 
        });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    addProjectToUser,
    removeProjectFromUser
};
