const express = require('express');
const router = express.Router();
const sweetsController = require('../controllers/sweetsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Add sweet with up to 10 images - auth required
router.post('/', authMiddleware, upload.array('images', 10), sweetsController.addSweet);

// Get home sweets - public access (no auth)
router.get('/home', sweetsController.getHomePageSweets);

// Get all sweets - public access (no auth)
router.get('/', sweetsController.getAllSweets);

// Search sweets - auth required
router.get('/search', sweetsController.searchSweets);

// Update sweet with up to 10 images - auth required
router.put('/:id', authMiddleware, upload.array('images', 10), sweetsController.updateSweet);

// Delete sweet (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, sweetsController.deleteSweet);

// Purchase sweet (authenticated users)
router.post('/:id/purchase', authMiddleware, sweetsController.purchaseSweet);

// Restock sweet (admin only)
router.post('/:id/restock', authMiddleware, adminMiddleware, sweetsController.restockSweet);

module.exports = router;
