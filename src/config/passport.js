const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('./db');

// Función común para buscar o registrar el usuario de OAuth en PostgreSQL
async function findOrCreateOAuthUser(email, firstName, lastName, provider) {
  // 1. Comprobar si ya existe el usuario por email
  const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // 2. Si no existe, crearlo cumpliendo la constraint ck_users_customer_data
  const randomPassword = crypto.randomBytes(16).toString('hex');
  const password_hash = await bcrypt.hash(randomPassword, 10);
  const tempDoc = `${provider.toUpperCase()}-${Date.now()}`;

  const query = `
    INSERT INTO users (
      email, password_hash, role, first_name, last_name,
      document_type, document_number, driving_license_number,
      driving_license_expiry, birth_date, phone, address
    )
    VALUES ($1, $2, 'customer', $3, $4, 'passport', $5, $5, '2035-01-01', '2000-01-01', '000000000', 'Pendiente (OAuth)')
    RETURNING *
  `;
  const values = [
    email,
    password_hash,
    firstName || 'Usuario',
    lastName || provider,
    tempDoc,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Estrategia Google (Gmail)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'pendiente') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (!email) return done(new Error('No se pudo obtener el email de Google'), null);

          const user = await findOrCreateOAuthUser(
            email,
            profile.name?.givenName || profile.displayName,
            profile.name?.familyName || 'Google',
            'google'
          );
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// Estrategia GitHub
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'pendiente') {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            (profile.emails && profile.emails[0] && profile.emails[0].value) ||
            `${profile.username}@github.oauth.local`;

          const user = await findOrCreateOAuthUser(
            email,
            profile.displayName || profile.username,
            'GitHub',
            'github'
          );
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;