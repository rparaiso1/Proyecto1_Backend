# Proyecto 1 - Backend con Node.js y MongoDB

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

## Descripción

API REST completa desarrollada con Express y MongoDB que implementa un sistema de gestión de usuarios y proyectos con autenticación JWT, roles de usuario, subida de imágenes a Cloudinary y operaciones CRUD completas.

## Características

- **Servidor Express** con arquitectura RESTful
- **Base de datos MongoDB** (MongoAtlas)
- **Dos modelos relacionados**: Usuario y Proyecto
- **Sistema de autenticación** con JWT
- **Gestión de roles**: user y admin
- **Subida de imágenes** a Cloudinary con middleware Multer
- **Eliminación automática** de imágenes de Cloudinary al borrar usuario
- **Prevención de duplicados** en arrays de relaciones
- **Seeder** para poblar la base de datos
- **CRUD completo** para todas las colecciones
- **Documentación completa** en Markdown

## Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB & Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación y autorización
- **Bcrypt** - Encriptación de contraseñas
- **Cloudinary** - Almacenamiento de imágenes
- **Multer** - Manejo de archivos multipart/form-data
- **Dotenv** - Variables de entorno

## Estructura del Proyecto

```
Proyecto_1/
├── src/
│   ├── config/
│   │   ├── db.js              # Configuración de MongoDB
│   │   └── cloudinary.js      # Configuración de Cloudinary
│   ├── models/
│   │   ├── User.js            # Modelo de Usuario
│   │   └── Project.js         # Modelo de Proyecto
│   ├── controllers/
│   │   ├── userController.js  # Controladores de usuarios
│   │   └── projectController.js # Controladores de proyectos
│   ├── routes/
│   │   ├── userRoutes.js      # Rutas de usuarios
│   │   └── projectRoutes.js   # Rutas de proyectos
│   ├── middlewares/
│   │   └── auth.js            # Middlewares de autenticación
│   └── utils/
│       └── seeder.js          # Semilla de datos
├── index.js                    # Punto de entrada
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Proyecto_1
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

El archivo `.env` ya está incluido con las siguientes variables (configura Cloudinary con tus credenciales):

```env
DB_URL=mongodb+srv://rparaiso:Prometeo_2025@cluster0.eqznswm.mongodb.net/?appName=Cluster0
PORT=8080
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**IMPORTANTE**: Debes configurar tus propias credenciales de Cloudinary. Obtén tus credenciales en [https://cloudinary.com/](https://cloudinary.com/)

### 4. Ejecutar el seeder (opcional)

```bash
npm run seed
```

### 5. Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:8080`

## Endpoints de la API

### Rutas Públicas

#### Registro de Usuario
```http
POST /api/users/register
Content-Type: multipart/form-data

{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "password123",
  "image": <archivo>
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta**: Devuelve un token JWT que debe usarse en las siguientes peticiones.

### Rutas Protegidas (requieren token)

**Header requerido**: `Authorization: Bearer <token>`

### Usuarios

#### Obtener todos los usuarios (solo admin)
```http
GET /api/users
```

#### Obtener usuario por ID
```http
GET /api/users/:id
```

#### Actualizar usuario (solo propietario o admin)
```http
PUT /api/users/:id
Content-Type: multipart/form-data

{
  "username": "nuevoNombre",
  "email": "nuevo@email.com",
  "image": <archivo>
}
```

#### Eliminar usuario (solo propietario o admin)
```http
DELETE /api/users/:id
```
**Nota**: Al eliminar un usuario, su imagen en Cloudinary también se elimina automáticamente.

#### Cambiar rol de usuario (solo admin)
```http
PATCH /api/users/:id/role
Content-Type: application/json

{
  "role": "admin"
}
```

#### Añadir proyecto a usuario
```http
POST /api/users/:userId/projects/:projectId
```
**Nota**: No permite duplicados en el array de proyectos.

#### Eliminar proyecto de usuario
```http
DELETE /api/users/:userId/projects/:projectId
```

### Proyectos

Todas las rutas de proyectos requieren autenticación.

#### Crear proyecto
```http
POST /api/projects
Content-Type: application/json

{
  "title": "Mi Proyecto",
  "description": "Descripción del proyecto",
  "technologies": ["React", "Node.js"],
  "status": "en_progreso"
}
```

#### Obtener todos los proyectos
```http
GET /api/projects
```

#### Obtener mis proyectos
```http
GET /api/projects/my-projects
```

#### Obtener proyecto por ID
```http
GET /api/projects/:id
```

#### Actualizar proyecto (solo creador o admin)
```http
PUT /api/projects/:id
Content-Type: application/json

{
  "title": "Título actualizado",
  "status": "completado"
}
```

#### Eliminar proyecto (solo creador o admin)
```http
DELETE /api/projects/:id
```

## Sistema de Roles y Permisos

### Rol: `user` (por defecto)
- Crear proyectos
- Ver todos los proyectos
- Editar sus propios proyectos
- Eliminar sus propios proyectos
- Ver su propio perfil
- Actualizar su propio perfil
- Eliminar su propia cuenta
- No puede cambiar su rol
- No puede eliminar otros usuarios
- No puede ver todos los usuarios

### Rol: `admin`
- Todos los permisos de user
- Ver todos los usuarios
- Cambiar roles de cualquier usuario
- Eliminar cualquier usuario
- Editar cualquier proyecto
- Eliminar cualquier proyecto

### Crear el Primer Admin

Los usuarios nuevos **siempre** se crean con rol `user`. Para crear el primer administrador:

1. Registra un usuario normal
2. Ve a MongoDB Atlas
3. Localiza el documento del usuario en la colección `users`
4. Cambia manualmente el campo `role` de `"user"` a `"admin"`

Después, ese admin puede cambiar el rol de otros usuarios mediante la API.

## Modelos de Datos

### Usuario (User)

```javascript
{
  username: String (único, requerido),
  email: String (único, requerido),
  password: String (hasheado, requerido),
  role: String (enum: ['user', 'admin'], default: 'user'),
  image: String (URL de Cloudinary),
  cloudinary_id: String,
  projects: [ObjectId] (referencia a Project),
  timestamps: true
}
```

### Proyecto (Project)

```javascript
{
  title: String (requerido),
  description: String (requerido),
  technologies: [String],
  status: String (enum: ['planificado', 'en_progreso', 'completado', 'pausado']),
  startDate: Date,
  endDate: Date,
  createdBy: ObjectId (referencia a User, requerido),
  timestamps: true
}
```

## Seeder

El proyecto incluye un seeder que crea 8 proyectos de ejemplo:

```bash
npm run seed
```

Esto:
1. Elimina todos los proyectos existentes
2. Crea un usuario de prueba si no existe ninguno
3. Inserta 8 proyectos de ejemplo
4. Asocia los proyectos al usuario

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (salt rounds: 10)
- Tokens JWT con expiración de 30 días
- Las contraseñas nunca se devuelven en las respuestas JSON
- Validación de roles en middlewares
- Verificación de propiedad de recursos
- Manejo seguro de archivos con Cloudinary

## Notas Importantes

1. **Archivo .env**: Normalmente este archivo no se sube a GitHub, pero para facilitar la corrección del proyecto escolar, está incluido en el repositorio. **En producción, NUNCA subir este archivo**.

2. **Cloudinary**: Debes configurar tus propias credenciales de Cloudinary en el archivo `.env` para que la subida de imágenes funcione correctamente.

3. **Integridad de datos**: El sistema previene automáticamente:
   - Duplicados en el array de proyectos de usuarios
   - Pérdida de datos al añadir nuevos proyectos (usa `push`, no reemplaza)
   - Imágenes huérfanas en Cloudinary (elimina automáticamente al borrar usuario)

4. **Validaciones**: Los modelos incluyen validaciones a nivel de Mongoose para garantizar la integridad de los datos.

## Pruebas con Postman

Se recomienda usar Postman o Thunder Client para probar la API:

1. Registra un usuario con una imagen
2. Inicia sesión y copia el token JWT
3. Añade el token en el header `Authorization: Bearer <token>`
4. Prueba todos los endpoints

## 👨‍💻 Autor

**Proyecto desarrollado para The Power MBA/MTA**  
Curso: Master en Desarrollo de Software  
Módulo: Backend con Node.js

## 📄 Licencia

ISC

---

**Proyecto completado con todos los requisitos solicitados.**

### Checklist de Requisitos

- Servidor con Express
- Base de datos MongoAtlas
- Mínimo 2 modelos (Usuario y Proyecto)
- Modelo de usuarios con array de datos de otra colección
- Usuarios nuevos se crean con rol "user"
- Primer admin se inserta manualmente en MongoAtlas
- Admins pueden cambiar roles
- Usuario no puede cambiar su propio rol
- Usuario puede eliminar su propia cuenta
- Admin puede eliminar cualquier cuenta
- Usuario normal no puede borrar cuenta de otro usuario
- Campo imagen en usuarios
- Middleware de subida con Cloudinary
- Eliminación de imagen al borrar usuario
- No se duplican elementos en array
- No se sobrescriben datos anteriores en array
- Seeder implementado
- Documentación en README.md
- CRUD completo de todas las colecciones
- Sistema de roles funcional
