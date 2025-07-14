const documentService = require('../services/documentService');
const supabaseService = require('../services/supabaseService');

/**
 * Extracts user ID from Supabase JWT access token. Returns user.id or throws error.
 */
async function getUserIdFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Authorization token missing');
  const token = authHeader.split(' ')[1];
  if (!token) throw new Error('Authorization token missing');
  // Get user from Supabase auth
  const { data, error } = await supabaseService.getClient().auth.getUser(token);
  if (error || !data?.user) throw new Error('Invalid/expired token');
  return data.user.id;
}

class DocumentController {
  // PUBLIC_INTERFACE
  /**
   * Create a new document.
   * Expects { title, content (optional) }
   */
  async create(req, res) {
    try {
      const userId = await getUserIdFromRequest(req);
      const { title, content } = req.body;
      if (!title) return res.status(400).json({ message: 'Title required' });
      const doc = await documentService.createDocument(userId, title, content);
      return res.status(201).json(doc);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get a document by ID (must have access).
   */
  async get(req, res) {
    try {
      const userId = await getUserIdFromRequest(req);
      const { id } = req.params;
      const doc = await documentService.getDocument(userId, id);
      return res.status(200).json(doc);
    } catch (err) {
      return res.status(403).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update document.
   * Expects partial update {title, content}.
   */
  async update(req, res) {
    try {
      const userId = await getUserIdFromRequest(req);
      const { id } = req.params;
      const updates = {};
      if ('title' in req.body) updates.title = req.body.title;
      if ('content' in req.body) updates.content = req.body.content;
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Nothing to update' });
      }
      const doc = await documentService.updateDocument(userId, id, updates);
      return res.status(200).json(doc);
    } catch (err) {
      return res.status(403).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete document (owner only)
   */
  async delete(req, res) {
    try {
      const userId = await getUserIdFromRequest(req);
      const { id } = req.params;
      await documentService.deleteDocument(userId, id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(403).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * List all documents visible to user.
   */
  async list(req, res) {
    try {
      const userId = await getUserIdFromRequest(req);
      const docs = await documentService.listDocuments(userId);
      return res.status(200).json(docs);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Invite user to collaborate (owner only)
   * Expects { inviteeId: string }
   */
  async invite(req, res) {
    try {
      const inviterId = await getUserIdFromRequest(req);
      const { id } = req.params;
      const { inviteeId } = req.body;
      if (!inviteeId) return res.status(400).json({ message: 'inviteeId required' });
      await documentService.inviteCollaborator(inviterId, id, inviteeId);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(403).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Remove collaborator (owner only)
   * Expects { collaboratorId: string }
   */
  async removeCollaborator(req, res) {
    try {
      const ownerId = await getUserIdFromRequest(req);
      const { id } = req.params;
      const { collaboratorId } = req.body;
      if (!collaboratorId) return res.status(400).json({ message: 'collaboratorId required' });
      await documentService.removeCollaborator(ownerId, id, collaboratorId);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(403).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Real-time sync (for basic text overwrite). Expects { content }.
   * "Collaborator" role or owner only.
   */
  async syncContent(req, res) {
    try {
      const userId = await getUserIdFromRequest(req);
      const { id } = req.params;
      const { content } = req.body;
      if (typeof content !== 'string') return res.status(400).json({ message: 'Content required' });
      const doc = await documentService.syncDocumentContent(userId, id, content);
      return res.status(200).json(doc);
    } catch (err) {
      return res.status(403).json({ message: err.message });
    }
  }
}

module.exports = new DocumentController();
