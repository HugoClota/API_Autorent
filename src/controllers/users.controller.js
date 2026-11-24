const bcrypt = require('bcrypt');
const pool = require('../config/db');

const SAFE_USER_FIELDS = `
  id, email, role, first_name, last_name, document_type, document_number,
  driving_license_number, driving_license_expiry, birth_date, phone, address, is_active, created_at
`;

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT ${SAFE_USER_FIELDS} FROM users ORDER BY id ASC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = $1`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    const {
      email, password, role, first_name, last_name,
      document_type, document_number, driving_license_number,
      driving_license_expiry, birth_date, phone, address
    } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (
        email, password_hash, role, first_name, last_name,
        document_type, document_number, driving_license_number,
        driving_license_expiry, birth_date, phone, address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING ${SAFE_USER_FIELDS}
    `;
    const values = [
      email, password_hash, role || 'customer', first_name, last_name,
      document_type || null, document_number || null, driving_license_number || null,
      driving_license_expiry || null, birth_date || null, phone || null, address || null
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      email, first_name, last_name, document_type, document_number,
      driving_license_number, driving_license_expiry, birth_date, phone, address, is_active
    } = req.body;

    const query = `
      UPDATE users
      SET email = $1, first_name = $2, last_name = $3, document_type = $4,
          document_number = $5, driving_license_number = $6, driving_license_expiry = $7,
          birth_date = $8, phone = $9, address = $10, is_active = COALESCE($11, is_active)
      WHERE id = $12
      RETURNING ${SAFE_USER_FIELDS}
    `;
    const values = [
      email, first_name, last_name, document_type || null,
      document_number || null, driving_license_number || null, driving_license_expiry || null,
      birth_date || null, phone || null, address || null, is_active, id
    ];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING ${SAFE_USER_FIELDS}`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente', user: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };