/**
 * Middleware index.
 * Consolidates all middleware exports for convenient usage across the app.
 */
const { jwtAuth } = require('./auth');
module.exports = {
  jwtAuth,
};
