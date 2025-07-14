const supabaseService = require('../services/supabaseService');

/**
 * Authentication Controller handles registration, login, and logout using Supabase auth.
 */
class AuthController {
  // PUBLIC_INTERFACE
  /**
   * Register a new user.
   * Expects { email, password } in request body.
   */
  async register(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
    try {
      const { user, error } = await supabaseService.getClient().auth.signUp({ email, password });
      if (error) return res.status(400).json({ message: error.message });
      return res.status(201).json({ user });
    } catch (err) {
      return res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Login a user.
   * Expects { email, password } in request body.
   */
  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
    try {
      const { session, user, error } = await supabaseService.getClient().auth.signInWithPassword({ email, password });
      if (error || !session) return res.status(401).json({ message: error ? error.message : 'Invalid credentials.' });
      // In a real application, set an HttpOnly cookie or return a JWT; here, return session for simplicity.
      return res.status(200).json({ session, user });
    } catch (err) {
      return res.status(500).json({ message: 'Login failed.', error: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Log out the current user.
   * Requires Supabase access token to be provided in Authorization header as "Bearer <token>".
   */
  async logout(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization token is required.' });
    try {
      const { error } = await supabaseService.getClient().auth.signOut();
      if (error) return res.status(400).json({ message: error.message });
      return res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err) {
      return res.status(500).json({ message: 'Logout failed.', error: err.message });
    }
  }
}

module.exports = new AuthController();
