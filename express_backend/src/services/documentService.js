require('dotenv').config();
const supabaseService = require('./supabaseService');

/**
 * Document Service - Handles document CRUD and collaboration via Supabase.
 */
class DocumentService {
  constructor() {
    this.supabase = supabaseService.getClient();
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new document for the specified user.
   * @param {string} userId - Supabase user's ID.
   * @param {string} title - Document title.
   * @param {string} content - Initial document content.
   * @returns {Promise<object>} New document record or error.
   */
  async createDocument(userId, title, content = '') {
    const { data, error } = await this.supabase
      .from('documents')
      .insert([{ title, content, owner_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // PUBLIC_INTERFACE
  /**
   * Get a document by ID, ensuring the user has access (owner or collaborator).
   * @param {string} userId
   * @param {string} docId
   */
  async getDocument(userId, docId) {
    // Owner OR shared with user
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`)
      .single();
    if (error) throw error;
    return data;
  }

  // PUBLIC_INTERFACE
  /**
   * Update document (if user has access)
   * @param {string} userId
   * @param {string} docId
   * @param {object} updates (fields: title, content)
   */
  async updateDocument(userId, docId, updates) {
    // Only allow if owner or collaborator
    await this.getDocument(userId, docId); // will throw if no access
    const { data, error } = await this.supabase
      .from('documents')
      .update(updates)
      .eq('id', docId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // PUBLIC_INTERFACE
  /**
   * Delete document (only if owner)
   * @param {string} userId
   * @param {string} docId
   */
  async deleteDocument(userId, docId) {
    // Fetch to check ownership
    const doc = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .single();
    if (doc.error) throw doc.error;
    if (doc.data.owner_id !== userId) throw new Error('Only owner can delete');
    const { error } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', docId);
    if (error) throw error;
    return { success: true };
  }

  // PUBLIC_INTERFACE
  /**
   * List all documents visible to user (owned or shared)
   * @param {string} userId
   */
  async listDocuments(userId) {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // PUBLIC_INTERFACE
  /**
   * Invite user to collaborate (owner only)
   * @param {string} inviterId - Owner ID
   * @param {string} docId
   * @param {string} inviteeId - invited user's ID (Supabase)
   */
  async inviteCollaborator(inviterId, docId, inviteeId) {
    const doc = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .single();
    if (doc.error) throw doc.error;
    if (doc.data.owner_id !== inviterId) throw new Error('Only owner can invite');
    let collaborators = doc.data.collaborators || [];
    if (!collaborators.includes(inviteeId)) {
      collaborators.push(inviteeId);
      const { error } = await this.supabase
        .from('documents')
        .update({ collaborators })
        .eq('id', docId);
      if (error) throw error;
    }
    // Could send notification here
    return { success: true };
  }

  // PUBLIC_INTERFACE
  /**
   * Remove a collaborator (owner only)
   * @param {string} ownerId
   * @param {string} docId
   * @param {string} collaboratorId
   */
  async removeCollaborator(ownerId, docId, collaboratorId) {
    const doc = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .single();
    if (doc.error) throw doc.error;
    if (doc.data.owner_id !== ownerId) throw new Error('Only owner can remove collaborators');
    let collaborators = doc.data.collaborators || [];
    collaborators = collaborators.filter(u => u !== collaboratorId);
    const { error } = await this.supabase
      .from('documents')
      .update({ collaborators })
      .eq('id', docId);
    if (error) throw error;
    return { success: true };
  }

  // PUBLIC_INTERFACE
  /**
   * Sync collaborator edits: just overwrite document content with new changes;
   * Supabase RLS policies can enforce proper access.
   * @param {string} userId
   * @param {string} docId
   * @param {string} newContent
   */
  async syncDocumentContent(userId, docId, newContent) {
    // Only allow if user has access
    await this.getDocument(userId, docId); // access check
    const { data, error } = await this.supabase
      .from('documents')
      .update({ content: newContent })
      .eq('id', docId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

module.exports = new DocumentService();
