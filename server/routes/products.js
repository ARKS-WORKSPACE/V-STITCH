import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { dbFallback } from '../utils/dbFallback.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Get products with filtering, search, and sorting
router.get('/', async (req, res) => {
  try {
    const { gender, category, era, search, sort } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (gender) {
        query.gender = new RegExp('^' + gender + '$', 'i');
      }
      if (category) {
        query.category = new RegExp('^' + category + '$', 'i');
      }
      if (era) {
        query.era = new RegExp('^' + era + '$', 'i');
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { era: { $regex: search, $options: 'i' } }
        ];
      }

      let productQuery = Product.find(query);
      if (sort === 'price_low') {
        productQuery = productQuery.sort({ price: 1 });
      } else if (sort === 'price_high') {
        productQuery = productQuery.sort({ price: -1 });
      } else if (sort === 'newest') {
        productQuery = productQuery.sort({ dateAdded: -1 });
      }

      const products = await productQuery;
      res.json(products);
    } else {
      const products = await dbFallback.getProducts({ gender, category, era, search, sort });
      res.json(products);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving products', error: err.message });
  }
});

// Get similar recommended products
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Find products in same category or era, excluding current one
      const similar = await Product.find({
        _id: { $ne: id },
        $or: [
          { category: product.category },
          { era: product.era }
        ]
      }).limit(5);

      res.json(similar);
    } else {
      const similar = await dbFallback.getSimilarProducts(id);
      res.json(similar);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving similar products', error: err.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } else {
      const product = await dbFallback.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving product', error: err.message });
  }
});

// Add a new product (Consignment Submission) - AUTH PROTECTED
router.post('/', auth, async (req, res) => {
  try {
    const { title, price, category, gender, era, size, condition, image, description, quantity } = req.body;
    
    // Set sellerName dynamically from authenticated user
    const sellerName = req.user.username;

    const productData = {
      title,
      price: Number(price),
      category,
      gender,
      era,
      size,
      condition,
      image: image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop',
      description,
      sellerName,
      quantity: Number(quantity) || 1
    };

    if (isMongoConnected()) {
      const newProduct = new Product(productData);
      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } else {
      const savedProduct = await dbFallback.createProduct(productData);
      res.status(201).json(savedProduct);
    }
  } catch (err) {
    res.status(400).json({ message: 'Error creating product', error: err.message });
  }
});

export default router;
