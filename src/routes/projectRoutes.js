const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
    createProject,
    getAllProjects,
    getProjectById,
    getMyProjects,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post('/', createProject);
router.get('/', getAllProjects);
router.get('/my-projects', getMyProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
