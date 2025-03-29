import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authmiddleware.js';
import PageContent from '../models/PageContent.js';

const router = express.Router();

// Get all page content
router.get('/page-content', async (req, res) => {
  try {
    let content = await PageContent.findOne();
    if (!content) {
      // If no content exists, create default content
      content = await PageContent.create({});
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page content', error: error.message });
  }
});

// Update page content
router.put('/page-content', authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedContent = await PageContent.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );
    res.json(updatedContent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating page content', error: error.message });
  }
});

export default router; 