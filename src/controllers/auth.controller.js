const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// POST /api/auth/register - Registro de nuevo cliente
const register = async (req, res, next) => {
  try {
    const {
      email, password, first_name, last_name,
      document_type, document_number, driving_license_number,
      driving_license_expiry, birth_date, phone, address
    } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (
        email, password_hash, role, first_name, last_name,
        document_type, document_number, driving_license_number,
        driving_license_expiry, birth_date, phone, address
      )
      VALUES ($1, $2, 'customer', $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, role, first_name, last_name, created_at
    `;
    const values = [
      email, password_hash, first_name, last_name,
      document_type, document_number, driving_license_number,
      driving_license_expiry, birth_date, phone, address
    ];

    const { rows } = await pool.query(query, values);
    const user = rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login - Inicio de sesión
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Debes indicar email y contraseña' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Esta cuenta está desactivada' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Inicio de sesión correcto',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me - Obtener datos del usuario logueado mediante su token
const getProfile = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, role, first_name, last_name, document_type, document_number,
              driving_license_number, driving_license_expiry, birth_date, phone, address, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password - Cambiar contraseña (requisito PR1)
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Debes indicar la contraseña actual y la nueva' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'La contraseña actual no es correcta' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, changePassword };