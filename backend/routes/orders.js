import express from 'express';
import { Order } from '../models/Order.js';
import { sendOrderSummaryEmail } from '../services/orderEmail.js';

const router = express.Router();

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, orderType, paymentMethod, specialInstructions } = req.body;

    // Validate required fields
    if (!customerInfo || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer info and items are required'
      });
    }

    // Calculate totals
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const deliveryFee = orderType === 'delivery' ? 150 : 0; // Rs. 150 delivery fee
    const total = subtotal + tax + deliveryFee;

    // Create order
    const order = new Order({
      customerInfo,
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      orderType,
      paymentMethod,
      specialInstructions
    });

    await order.save();

    let emailNotification = { sent: false };
    try {
      emailNotification = await sendOrderSummaryEmail(order);
    } catch (emailError) {
      console.error('Order summary email failed:', emailError.message);
      emailNotification = {
        sent: false,
        error: emailError.message
      };
    }

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        estimatedTime: order.estimatedTime,
        total: order.total,
        emailSent: emailNotification.sent
      },
      message: emailNotification.sent
        ? 'Order placed successfully! Summary sent to your email.'
        : 'Order placed successfully!'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// GET /api/orders/:orderNumber - Get order status
router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        estimatedTime: order.estimatedTime,
        total: order.total,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

// PUT /api/orders/:orderNumber/status - Update order status (for restaurant staff)
router.put('/:orderNumber/status', async (req, res) => {
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
