const express = require('express');
const documentController = require('../controllers/document');
const { jwtAuth } = require('../middleware'); // import middleware

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document CRUD and collaboration routes
 */

// Secure all document endpoints: require valid JWT
router.use(jwtAuth);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: List all documents visible to the user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents returned
 *       401:
 *         description: Unauthorized
 */
router.get('/', documentController.list.bind(documentController));

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document created
 *       400:
 *         description: Bad request
 */
router.post('/', documentController.create.bind(documentController));

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get a specific document (if access allowed)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Document ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document detail
 *       403:
 *         description: Forbidden
 */
router.get('/:id', documentController.get.bind(documentController));

/**
 * @swagger
 * /documents/{id}:
 *   patch:
 *     summary: Update document fields (title/content)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Document ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document updated
 *       403:
 *         description: Forbidden
 */
router.patch('/:id', documentController.update.bind(documentController));

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete document (owner only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Document ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', documentController.delete.bind(documentController));

/**
 * @swagger
 * /documents/{id}/invite:
 *   post:
 *     summary: Invite a user to collaborate (owner only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Document ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inviteeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitation successful
 *       403:
 *         description: Forbidden
 */
router.post('/:id/invite', documentController.invite.bind(documentController));

/**
 * @swagger
 * /documents/{id}/remove-collaborator:
 *   post:
 *     summary: Remove a collaborator (owner only)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Document ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collaboratorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Collaborator removed
 *       403:
 *         description: Forbidden
 */
router.post('/:id/remove-collaborator', documentController.removeCollaborator.bind(documentController));

/**
 * @swagger
 * /documents/{id}/sync:
 *   post:
 *     summary: Real-time collaboration sync (update document content)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Document ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Content synced
 *       403:
 *         description: Forbidden
 */
router.post('/:id/sync', documentController.syncContent.bind(documentController));

module.exports = router;
