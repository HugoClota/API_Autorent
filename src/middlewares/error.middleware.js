const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code) {
    switch (err.code) {
      case '23505': // UNIQUE (email, matrícula, DNI duplicado)
        return res.status(409).json({
          error: 'Ya existe un registro con esos datos únicos',
          detail: err.detail,
        });
      case '23P01': // EXCLUDE (reserva solapada en fechas)
        return res.status(409).json({
          error: 'El coche ya está reservado en ese rango de fechas',
        });
      case '23514': // CHECK (datos obligatorios de cliente, precios, horas)
        return res.status(400).json({
          error: 'Los datos no cumplen las reglas de validación de la BD',
          constraint: err.constraint,
        });
      case '23503': // FOREIGN KEY
        return res.status(400).json({
          error: 'Referencia a un ID que no existe o el registro está en uso',
          detail: err.detail,
        });
      case '22P02': // ENUM o tipo de dato inválido
        return res.status(400).json({
          error: 'Formato de dato o valor ENUM inválido',
        });
    }
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;