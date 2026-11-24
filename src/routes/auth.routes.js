const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const router = express.Router();
const { register, login, getProfile, changePassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Autenticación tradicional (Email + Contraseña)
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getProfile);
router.put('/change-password', verifyToken, changePassword);

// Helper para emitir JWT tras OAuth exitoso
const oauthCallbackHandler = (req, res) => {
  const user = req.user;
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  res.json({
    message: 'Inicio de sesión con OAuth correcto',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });
};

// --- OAUTH GOOGLE (GMAIL) ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/oauth-failed' }),
  oauthCallbackHandler
);

// --- OAUTH GITHUB ---
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/api/auth/oauth-failed' }),
  oauthCallbackHandler
);

router.get('/oauth-failed', (req, res) => {
  res.status(401).json({ error: 'Error al autenticar con el proveedor OAuth' });
});

module.exports = router;