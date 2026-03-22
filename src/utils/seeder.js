require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Project = require('../models/Project');
const User = require('../models/User');

const projectsData = [
    {
        title: 'Sistema de Gestión de Tareas',
        description: 'Aplicación web para gestionar tareas con sistema de prioridades y fechas límite',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        status: 'completado'
    },
    {
        title: 'Tienda Online',
        description: 'Plataforma de comercio electrónico con carrito de compras y sistema de pagos',
        technologies: ['Vue.js', 'Stripe', 'PostgreSQL', 'Node.js'],
        status: 'en_progreso'
    },
    {
        title: 'API REST para Blog',
        description: 'API completa para un sistema de blog con autenticación JWT y roles',
        technologies: ['Express', 'MongoDB', 'JWT', 'Cloudinary'],
        status: 'completado'
    },
    {
        title: 'Dashboard Analítico',
        description: 'Panel de control con gráficos y estadísticas en tiempo real',
        technologies: ['React', 'D3.js', 'WebSocket', 'Firebase'],
        status: 'en_progreso'
    },
    {
        title: 'App de Chat en Tiempo Real',
        description: 'Aplicación de mensajería instantánea con Socket.io',
        technologies: ['Socket.io', 'React', 'Node.js', 'Redis'],
        status: 'planificado'
    },
    {
        title: 'Sistema de Reservas',
        description: 'Plataforma para reservar citas y gestionar calendarios',
        technologies: ['Angular', 'NestJS', 'MySQL', 'TypeScript'],
        status: 'en_progreso'
    },
    {
        title: 'Portfolio Personal',
        description: 'Sitio web portfolio con animaciones y diseño responsivo',
        technologies: ['Next.js', 'TailwindCSS', 'Framer Motion'],
        status: 'completado'
    },
    {
        title: 'Plataforma de Cursos Online',
        description: 'Sistema completo de e-learning con videos y exámenes',
        technologies: ['React', 'Express', 'MongoDB', 'AWS S3'],
        status: 'pausado'
    }
];

const seedProjects = async () => {
    try {
        await connectDB();
        
        console.log('Iniciando seed de proyectos...');

        // Buscar un usuario existente para asignar los proyectos
        let user = await User.findOne();
        
        if (!user) {
            console.log('No hay usuarios en la base de datos. Creando usuario de prueba...');
            user = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            });
            console.log('Usuario de prueba creado');
        }

        // Eliminar proyectos existentes
        await Project.deleteMany();
        console.log('Proyectos anteriores eliminados');

        // Crear proyectos con el usuario encontrado/creado
        const projectsWithUser = projectsData.map(project => ({
            ...project,
            createdBy: user._id
        }));

        const createdProjects = await Project.insertMany(projectsWithUser);
        console.log(`${createdProjects.length} proyectos creados exitosamente`);

        // Añadir los proyectos al array del usuario
        user.projects = createdProjects.map(p => p._id);
        await user.save();
        console.log(`Proyectos asociados al usuario ${user.username}`);

        console.log('Seed completado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error en el seed:', error);
        process.exit(1);
    }
};

seedProjects();
