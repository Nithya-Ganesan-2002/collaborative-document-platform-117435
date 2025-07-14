const supabaseService = require('../services/supabaseService');

/**
 * JWT Authentication Middleware
 * Verifies the Supabase JWT and attaches user info to request object.
 * Rejects with consistent error response on missing/invalid/expired tokens.
 *
 * Usage: Attach to Express routes that require authentication.
 */
// PUBLIC_INTERFACE
async function jwtAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: 'error', message: 'Authorization header missing.' });
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ status: 'error', message: 'Authorization token malformed or missing.' });
    }

    // Verify token with Supabase (does NOT check session revocation for performance, trust JWT expiry)
    const { data, error } = await supabaseService.getClient().auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired authorization token.' });
    }
    // Attach user info to request for downstream access
    req.user = data.user;
    req.token = token;
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err.stack);
    return res.status(500).json({ status: 'error', message: 'Internal authentication error.' });
  }
}

module.exports = {
  jwtAuth,
};
