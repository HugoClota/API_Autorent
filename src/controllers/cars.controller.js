const pool = require('../config/db');

// GET /api/cars (acepta filtros opcionales: ?branch_id=1&available=true)
const getCars = async (req, res, next) => {
  try {
    const { branch_id, available } = req.query;
    let query = `
      SELECT c.*, m.brand, m.name AS model_name, m.daily_price, b.name AS branch_name
      FROM cars c
      JOIN car_models m ON m.id = c.car_model_id
      JOIN branches b ON b.id = c.branch_id
      WHERE 1=1
    `;
    const values = [];

    if (branch_id) {
      values.push(branch_id);
      query += ` AND c.branch_id = $${values.length}`;
    }
    if (available !== undefined) {
      values.push(available === 'true');
      query += ` AND c.is_available = $${values.length}`;
    }

    query += ' ORDER BY c.id ASC';
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/cars/:id
const getCarById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT c.*, m.brand, m.name AS model_name, m.daily_price, b.name AS branch_name
      FROM cars c
      JOIN car_models m ON m.id = c.car_model_id
      JOIN branches b ON b.id = c.branch_id
      WHERE c.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/cars
const createCar = async (req, res, next) => {
  try {
    const { car_model_id, branch_id, license_plate, color, year, mileage_km, is_available } = req.body;
    const query = `
      INSERT INTO cars (car_model_id, branch_id, license_plate, color, year, mileage_km, is_available)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      car_model_id, branch_id, license_plate, color, year,
      mileage_km ?? 0, is_available ?? true
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/cars/:id
const updateCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { car_model_id, branch_id, license_plate, color, year, mileage_km, is_available } = req.body;
    const query = `
      UPDATE cars
      SET car_model_id = $1, branch_id = $2, license_plate = $3, color = $4,
          year = $5, mileage_km = $6, is_available = $7
      WHERE id = $8
      RETURNING *
    `;
    const values = [car_model_id, branch_id, license_plate, color, year, mileage_km, is_available, id];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cars/:id
const deleteCar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json({ message: 'Vehículo eliminado correctamente', car: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar };