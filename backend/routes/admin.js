import express from 'express';
import { Order } from '../models/Order.js';

const router = express.Router();

const activeOrderStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
const adminPin = process.env.ADMIN_PIN || '1234';

router.use((req, res, next) => {
  const providedPin = req.header('x-admin-pin');

  if (providedPin !== adminPin) {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin PIN'
    });
  }

  next();
});

// GET /api/admin/orders/active - Get all active orders
router.get('/orders/active', async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: { $in: activeOrderStatuses } })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active orders'
    });
  }
});

// GET /api/admin/orders - Get all orders (admin only)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 }) // Most recent first

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// GET /api/admin/orders/stats - Get order statistics
router.get('/orders/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'completed' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Calculate total revenue
    const orders = await Order.find({ orderStatus: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    });
  }
});

// PUT /api/admin/orders/:orderNumber/status - Update order status
router.put('/orders/:orderNumber/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { orderNumber: req.params.orderNumber },
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

export default router;
