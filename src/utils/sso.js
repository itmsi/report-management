const crypto = require('crypto');

// Generate random UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

// Generate random string
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Hash password
async function hashPassword(password) {
  const bcrypt = require('bcrypt');
  return await bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password, hashedPassword) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
function generateJWT(payload, secret, options = {}) {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secret, options);
}

// Verify JWT token
function verifyJWT(token, secret) {
  const jwt = require('jsonwebtoken');
  return jwt.verify(token, secret);
}

// Generate authorization code
function generateAuthorizationCode() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate state parameter for OAuth2
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  generateUUID,
  generateRandomString,
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  generateAuthorizationCode,
  generateState,
};
