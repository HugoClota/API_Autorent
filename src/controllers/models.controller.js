const pool = require('../config/db');

// GET /api/models
const getModels = async (req, res, next) => {
  try {
    const query = `
      SELECT m.*, c.name AS category_name
      FROM car_models m
      JOIN car_categories c ON c.id = m.car_category_id
      ORDER BY m.id ASC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/models/:id
const getModelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT m.*, c.name AS category_name
      FROM car_models m
      JOIN car_categories c ON c.id = m.car_category_id
      WHERE m.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Modelo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/models
const createModel = async (req, res, next) => {
  try {
    const {
      car_category_id, brand, name, fuel, transmission,
      seats, trunk_capacity_liters, daily_price, deposit_amount, image_url
    } = req.body;

    const query = `
      INSERT INTO car_models (car_category_id, brand, name, fuel, transmission, seats, trunk_capacity_liters, daily_price, deposit_amount, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      car_category_id, brand, name, fuel, transmission,
      seats, trunk_capacity_liters, daily_price, deposit_amount, image_url || null
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/models/:id
const updateModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      car_category_id, brand, name, fuel, transmission,
      seats, trunk_capacity_liters, daily_price, deposit_amount, image_url
    } = req.body;

    const query = `
      UPDATE car_models
      SET car_category_id = $1, brand = $2, name = $3, fuel = $4, transmission = $5,
          seats = $6, trunk_capacity_liters = $7, daily_price = $8, deposit_amount = $9, image_url = $10
      WHERE id = $11
      RETURNING *
    `;
    const values = [
      car_category_id, brand, name, fuel, transmission,
      seats, trunk_capacity_liters, daily_price, deposit_amount, image_url || null, id
    ];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Modelo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/models/:id
const deleteModel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM car_models WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Modelo no encontrado' });
    res.json({ message: 'Modelo eliminado correctamente', model: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getModels, getModelById, createModel, updateModel, deleteModel };