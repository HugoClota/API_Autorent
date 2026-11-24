const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoRent API - DAW M12 PR3',
      version: '1.0.0',
      description: 'API RESTful para la plataforma de alquiler de vehículos AutoRent (Express + PostgreSQL + JWT + OAuth)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Sistema'],
          summary: 'Comprobar estado de la API',
          responses: { 200: { description: 'API operativa' } },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Autenticación'],
          summary: 'Registrar nuevo cliente',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'first_name', 'last_name', 'document_type', 'document_number', 'driving_license_number', 'driving_license_expiry', 'birth_date', 'phone', 'address'],
                  properties: {
                    email: { type: 'string', example: 'cliente@autorent.test' },
                    password: { type: 'string', example: 'Pass1234!' },
                    first_name: { type: 'string', example: 'Laura' },
                    last_name: { type: 'string', example: 'Gómez' },
                    document_type: { type: 'string', enum: ['dni', 'nie', 'passport'], example: 'dni' },
                    document_number: { type: 'string', example: '44556677M' },
                    driving_license_number: { type: 'string', example: '44556677M' },
                    driving_license_expiry: { type: 'string', format: 'date', example: '2030-06-15' },
                    birth_date: { type: 'string', format: 'date', example: '1996-04-20' },
                    phone: { type: 'string', example: '622334455' },
                    address: { type: 'string', example: 'C/ Balmes 50, Barcelona' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Usuario creado y token JWT devuelto' } },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar sesión y obtener token JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'nuevo@autorent.test' },
                    password: { type: 'string', example: 'Password123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login correcto con JWT' },
            401: { description: 'Credenciales incorrectas' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Autenticación'],
          summary: 'Obtener perfil del usuario autenticado',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Datos del usuario' }, 401: { description: 'No autorizado' } },
        },
      },
      '/api/branches': {
        get: {
          tags: ['Sucursales (Branches)'],
          summary: 'Listar todas las sucursales',
          responses: { 200: { description: 'Lista de sucursales' } },
        },
        post: {
          tags: ['Sucursales (Branches)'],
          summary: 'Crear sucursal (Solo Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Sabadell Centro' },
                    address: { type: 'string', example: 'Rambla 100' },
                    city: { type: 'string', example: 'Sabadell' },
                    postal_code: { type: 'string', example: '08201' },
                    phone: { type: 'string', example: '937000001' },
                    opening_time: { type: 'string', example: '08:00' },
                    closing_time: { type: 'string', example: '20:00' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Sucursal creada' } },
        },
      },
      '/api/branches/{id}': {
        get: {
          tags: ['Sucursales (Branches)'],
          summary: 'Obtener sucursal por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Sucursal encontrada' }, 404: { description: 'No encontrada' } },
        },
        put: {
          tags: ['Sucursales (Branches)'],
          summary: 'Actualizar sucursal (Solo Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Sucursal actualizada' } },
        },
        delete: {
          tags: ['Sucursales (Branches)'],
          summary: 'Eliminar sucursal (Solo Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Sucursal eliminada' } },
        },
      },
      '/api/models': {
        get: {
          tags: ['Modelos (Car Models)'],
          summary: 'Listar catálogo de modelos',
          responses: { 200: { description: 'Lista de modelos' } },
        },
        post: {
          tags: ['Modelos (Car Models)'],
          summary: 'Crear modelo de coche (Solo Admin)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Modelo creado' } },
        },
      },
      '/api/models/{id}': {
        get: {
          tags: ['Modelos (Car Models)'],
          summary: 'Obtener modelo por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Modelo encontrado' } },
        },
        put: {
          tags: ['Modelos (Car Models)'],
          summary: 'Actualizar modelo (Solo Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Modelo actualizado' } },
        },
        delete: {
          tags: ['Modelos (Car Models)'],
          summary: 'Eliminar modelo (Solo Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Modelo eliminado' } },
        },
      },
      '/api/cars': {
        get: {
          tags: ['Vehículos (Cars)'],
          summary: 'Listar flota de vehículos',
          parameters: [
            { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
            { name: 'available', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: { 200: { description: 'Lista de vehículos' } },
        },
        post: {
          tags: ['Vehículos (Cars)'],
          summary: 'Añadir vehículo (Solo Admin)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Vehículo añadido' } },
        },
      },
      '/api/cars/{id}': {
        get: {
          tags: ['Vehículos (Cars)'],
          summary: 'Obtener vehículo por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Vehículo encontrado' } },
        },
        put: {
          tags: ['Vehículos (Cars)'],
          summary: 'Actualizar vehículo (Solo Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Vehículo actualizado' } },
        },
        delete: {
          tags: ['Vehículos (Cars)'],
          summary: 'Eliminar vehículo (Solo Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Vehículo eliminado' } },
        },
      },
      '/api/users': {
        get: {
          tags: ['Usuarios (Users)'],
          summary: 'Listar todos los usuarios (Solo Admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de usuarios' } },
        },
        post: {
          tags: ['Usuarios (Users)'],
          summary: 'Crear usuario (Solo Admin)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Usuario creado' } },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Usuarios (Users)'],
          summary: 'Obtener usuario por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Usuario encontrado' } },
        },
        put: {
          tags: ['Usuarios (Users)'],
          summary: 'Actualizar usuario',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Usuario actualizado' } },
        },
        delete: {
          tags: ['Usuarios (Users)'],
          summary: 'Eliminar usuario (Solo Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Usuario eliminado' } },
        },
      },
      '/api/reservations': {
        get: {
          tags: ['Reservas (Reservations)'],
          summary: 'Listar reservas (filtrable por ?user_id=)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'user_id', in: 'query', schema: { type: 'integer' } }],
          responses: { 200: { description: 'Lista de reservas' } },
        },
        post: {
          tags: ['Reservas (Reservations)'],
          summary: 'Crear nueva reserva',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['user_id', 'car_id', 'pickup_branch_id', 'return_branch_id', 'pickup_at', 'return_at', 'total_price'],
                  properties: {
                    user_id: { type: 'integer', example: 3 },
                    car_id: { type: 'integer', example: 1 },
                    pickup_branch_id: { type: 'integer', example: 1 },
                    return_branch_id: { type: 'integer', example: 1 },
                    pickup_at: { type: 'string', format: 'date-time', example: '2027-03-10T10:00:00Z' },
                    return_at: { type: 'string', format: 'date-time', example: '2027-03-13T10:00:00Z' },
                    total_price: { type: 'number', example: 105.00 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Reserva creada' },
            409: { description: 'El coche ya tiene una reserva solapada en esas fechas' },
          },
        },
      },
      '/api/reservations/{id}': {
        get: {
          tags: ['Reservas (Reservations)'],
          summary: 'Obtener reserva por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Reserva encontrada' } },
        },
        put: {
          tags: ['Reservas (Reservations)'],
          summary: 'Actualizar reserva',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Reserva actualizada' } },
        },
        delete: {
          tags: ['Reservas (Reservations)'],
          summary: 'Eliminar reserva',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Reserva eliminada' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;