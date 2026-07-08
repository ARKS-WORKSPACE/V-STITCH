import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { dbFallback } from '../utils/dbFallback.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Place a new order - AUTH PROTECTED
router.post('/', auth, async (req, res) => {
  try {
    const { items, customerName, email, shippingAddress, city, postalCode, country, paymentCardName, totalPrice } = req.body;
    const buyerId = req.user.id;

    const orderData = {
      items,
      customerName,
      email,
      shippingAddress,
      city,
      postalCode,
      country,
      paymentCardName,
      totalPrice: Number(totalPrice),
      buyerId
    };

    if (isMongoConnected()) {
      // Mongoose save order
      const newOrder = new Order(orderData);
      const savedOrder = await newOrder.save();

      // Decrement product quantities in MongoDB (only for non-custom items)
      for (const item of items) {
        if (!item.isCustom && mongoose.Types.ObjectId.isValid(item.productId)) {
          try {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { quantity: -item.quantity }
            });
          } catch (err) {
            console.error(`Failed to update quantity for product ${item.productId}:`, err.message);
          }
        }
      }

      res.status(201).json(savedOrder);
    } else {
      // Local fallback save order
      const savedOrder = await dbFallback.createOrder(orderData);
      res.status(201).json(savedOrder);
    }
  } catch (err) {
    res.status(400).json({ message: 'Error processing order', error: err.message });
  }
});

// Get orders of the logged-in user - AUTH PROTECTED
router.get('/my-orders', auth, async (req, res) => {
  try {
    const buyerId = req.user.id;
    if (isMongoConnected()) {
      const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
      res.json(orders);
    } else {
      const orders = await dbFallback.getOrdersByBuyer(buyerId);
      res.json(orders);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving orders', error: err.message });
  }
});

export default router;
