const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { authenticate, isAdmin, isOwnerOrAdmin } = require('../middlewares/auth');
const {
    register,
    login,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    addProjectToUser,
    removeProjectFromUser
} = require('../controllers/userController');

// Rutas públicas
router.post('/register', upload.single('image'), register);
router.post('/login', login);

// Rutas protegidas
router.get('/', authenticate, isAdmin, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, isOwnerOrAdmin('id'), upload.single('image'), updateUser);
router.delete('/:id', authenticate, isOwnerOrAdmin('id'), deleteUser);

// Rutas de administración
router.patch('/:id/role', authenticate, isAdmin, changeUserRole);

// Gestión de proyectos en usuario
router.post('/:userId/projects/:projectId', authenticate, addProjectToUser);
router.delete('/:userId/projects/:projectId', authenticate, removeProjectFromUser);

module.exports = router;
