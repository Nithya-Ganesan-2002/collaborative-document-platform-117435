const documentService = require('../services/documentService');

/**
 * Document controller - all endpoints require authentication (set by router)
 * Uses JWT middleware, attaches user info to `req.user`.
 */
class DocumentController {
  // PUBLIC_INTERFACE
  /**
   * Create a new document.
   * Expects { title, content (optional) }
   */
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { title, content } = req.body;
      if (!title) return res.status(400).json({ message: 'Title required' });
      const doc = await documentService.createDocument(userId, title, content);
      return res.status(201).json(doc);
    } catch (err) {
      // Still catch service errors
      return res.status(400).json({ message: err.message });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get a document by ID (must have access).
   */
  async get(req, res) {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const inviterId = req.user.id;
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
      const ownerId = req.user.id;
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
      const userId = req.user.id;
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
