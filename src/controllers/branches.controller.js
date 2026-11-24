const pool = require('../config/db');

// GET /api/branches - Obtener todas las sucursales
const getBranches = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM branches ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/branches/:id - Obtener una sucursal por ID
const getBranchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM branches WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/branches - Crear una nueva sucursal
const createBranch = async (req, res, next) => {
  try {
    const {
      name,
      address,
      city,
      postal_code,
      phone,
      opening_time,
      closing_time,
      latitude,
      longitude,
    } = req.body;

    const query = `
      INSERT INTO branches (name, address, city, postal_code, phone, opening_time, closing_time, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      name,
      address,
      city,
      postal_code,
      phone,
      opening_time,
      closing_time,
      latitude || null,
      longitude || null,
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/branches/:id - Actualizar una sucursal
const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      city,
      postal_code,
      phone,
      opening_time,
      closing_time,
      latitude,
      longitude,
    } = req.body;

    const query = `
      UPDATE branches
      SET name = $1, address = $2, city = $3, postal_code = $4, phone = $5,
          opening_time = $6, closing_time = $7, latitude = $8, longitude = $9
      WHERE id = $10
      RETURNING *
    `;
    const values = [
      name,
      address,
      city,
      postal_code,
      phone,
      opening_time,
      closing_time,
      latitude || null,
      longitude || null,
      id,
    ];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/branches/:id - Eliminar una sucursal
const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM branches WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sucursal no encontrada' });
    }
    res.json({ message: 'Sucursal eliminada correctamente', branch: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};