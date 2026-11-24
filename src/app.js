const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const passport = require('./config/passport');
const errorHandler = require('./middlewares/error.middleware');

const authRoutes = require('./routes/auth.routes');
const branchesRoutes = require('./routes/branches.routes');
const modelsRoutes = require('./routes/models.routes');
const carsRoutes = require('./routes/cars.routes');
const usersRoutes = require('./routes/users.routes');
const reservationsRoutes = require('./routes/reservations.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Documentación interactiva Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta de comprobación
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API de AutoRent funcionando' });
});

// Rutas de autenticación y CRUDs
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reservations', reservationsRoutes);

// Middleware de gestión de errores
app.use(errorHandler);

module.exports = app;