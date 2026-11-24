const pool = require('../config/db');

// GET /api/reservations (opcional: ?user_id=3)
const getReservations = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    let query = `
      SELECT r.*, u.email AS user_email, u.first_name, u.last_name,
             car.license_plate, m.brand, m.name AS model_name,
             bp.name AS pickup_branch, br.name AS return_branch
      FROM reservations r
      JOIN users u ON u.id = r.user_id
      JOIN cars car ON car.id = r.car_id
      JOIN car_models m ON m.id = car.car_model_id
      JOIN branches bp ON bp.id = r.pickup_branch_id
      JOIN branches br ON br.id = r.return_branch_id
    `;
    const values = [];

    if (user_id) {
      values.push(user_id);
      query += ` WHERE r.user_id = $1`;
    }

    query += ' ORDER BY r.pickup_at DESC';
    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/reservations/:id
const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT r.*, u.email AS user_email, car.license_plate, m.brand, m.name AS model_name,
             bp.name AS pickup_branch, br.name AS return_branch
      FROM reservations r
      JOIN users u ON u.id = r.user_id
      JOIN cars car ON car.id = r.car_id
      JOIN car_models m ON m.id = car.car_model_id
      JOIN branches bp ON bp.id = r.pickup_branch_id
      JOIN branches br ON br.id = r.return_branch_id
      WHERE r.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/reservations
const createReservation = async (req, res, next) => {
  try {
    const {
      user_id, car_id, pickup_branch_id, return_branch_id,
      pickup_at, return_at, status, total_price
    } = req.body;

    const query = `
      INSERT INTO reservations (user_id, car_id, pickup_branch_id, return_branch_id, pickup_at, return_at, status, total_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      user_id, car_id, pickup_branch_id, return_branch_id,
      pickup_at, return_at, status || 'pending', total_price
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/reservations/:id
const updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      car_id, pickup_branch_id, return_branch_id,
      pickup_at, return_at, status, total_price
    } = req.body;

    const query = `
      UPDATE reservations
      SET car_id = $1, pickup_branch_id = $2, return_branch_id = $3,
          pickup_at = $4, return_at = $5, status = $6, total_price = $7
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      car_id, pickup_branch_id, return_branch_id,
      pickup_at, return_at, status, total_price, id
    ];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reservations/:id
const deleteReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM reservations WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ message: 'Reserva eliminada correctamente', reservation: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReservations, getReservationById, createReservation, updateReservation, deleteReservation
};