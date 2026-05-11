import express from 'express';
import { MenuItem, Deal } from '../models/Menu.js';

const router = express.Router();

// GET /api/menu - Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ available: true }).sort({ category: 1, name: 1 });
    const deals = await Deal.find({ available: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        menuItems,
        deals
      }
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items'
    });
  }
});

// GET /api/menu/categories - Get unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', { available: true });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// GET /api/menu/popular - Get popular items
router.get('/popular', async (req, res) => {
  try {
    const popularItems = await MenuItem.find({
      available: true,
      isPopular: true
    }).sort({ rating: -1 }).limit(6);

    res.json({
      success: true,
      data: popularItems
    });
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular items'
    });
  }
});

// GET /api/menu/:id - Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      id: parseInt(req.params.id),
      available: true
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu item'
    });
  }
});

export default router;