const Project = require('../models/Project');
const User = require('../models/User');

// Crear proyecto
const createProject = async (req, res) => {
    try {
        const { title, description, technologies, status, startDate, endDate } = req.body;

        const project = await Project.create({
            title,
            description,
            technologies: technologies || [],
            status: status || 'planificado',
            startDate,
            endDate,
            createdBy: req.user._id
        });

        // Añadir el proyecto al array de proyectos del usuario automáticamente
        const user = await User.findById(req.user._id);
        if (!user.projects.includes(project._id)) {
            user.projects.push(project._id);
            await user.save();
        }

        res.status(201).json({
            success: true,
            message: 'Proyecto creado exitosamente',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear proyecto',
            error: error.message
        });
    }
};

// Obtener todos los proyectos
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('createdBy', 'username email');
        
        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener proyectos',
            error: error.message
        });
    }
};

// Obtener proyecto por ID
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('createdBy', 'username email');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener proyecto',
            error: error.message
        });
    }
};

// Obtener proyectos del usuario autenticado
const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ createdBy: req.user._id });
        
        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener proyectos',
            error: error.message
        });
    }
};

// Actualizar proyecto
const updateProject = async (req, res) => {
    try {
        const { title, description, technologies, status, startDate, endDate } = req.body;
        
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        // Verificar permisos: solo el creador o admin pueden actualizar
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar este proyecto'
            });
        }

        if (title) project.title = title;
        if (description) project.description = description;
        if (technologies) project.technologies = technologies;
        if (status) project.status = status;
        if (startDate) project.startDate = startDate;
        if (endDate) project.endDate = endDate;

        await project.save();

        res.json({
            success: true,
            message: 'Proyecto actualizado exitosamente',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar proyecto',
            error: error.message
        });
    }
};

// Eliminar proyecto
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        // Verificar permisos: solo el creador o admin pueden eliminar
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este proyecto'
            });
        }

        // Eliminar el proyecto de todos los usuarios que lo tienen
        await User.updateMany(
            { projects: project._id },
            { $pull: { projects: project._id } }
        );

        await Project.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Proyecto eliminado exitosamente'
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
    createProject,
    getAllProjects,
    getProjectById,
    getMyProjects,
    updateProject,
    deleteProject
};
