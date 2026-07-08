import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'vintagesecret';

// Ensure database directory and file exist
function initDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ products: [], orders: [], users: [] }, null, 2), 'utf-8');
  }
}

// Read database
function readData() {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch (err) {
    console.error('Error reading local fallback DB:', err);
    return { products: [], orders: [], users: [] };
  }
}

// Write database
function writeData(data) {
  initDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local fallback DB:', err);
  }
}

export const dbFallback = {
  // Authentication Fallbacks
  registerUser: async (username, email, password) => {
    const data = readData();
    const existing = data.users.find(u => u.email === email);
    if (existing) {
      return { error: 'User with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'local_user_' + Math.random().toString(36).substr(2, 9),
      username,
      email,
      password: hashedPassword,
      dateCreated: new Date().toISOString()
    };

    data.users.push(newUser);
    writeData(data);

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    };
  },

  loginUser: async (email, password) => {
    const data = readData();
    const user = data.users.find(u => u.email === email);
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: 'Invalid credentials' };
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: { id: user._id, username: user.username, email: user.email }
    };
  },

  getUserById: async (id) => {
    const data = readData();
    const user = data.users.find(u => u._id === id);
    if (!user) return null;
    return { 
      _id: user._id, 
      username: user.username, 
      email: user.email, 
      profilePic: user.profilePic || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      shippingAddress: user.shippingAddress || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
      country: user.country || 'United States',
      dateCreated: user.dateCreated 
    };
  },

  updateUser: async (id, updateData) => {
    const data = readData();
    const userIndex = data.users.findIndex(u => u._id === id);
    if (userIndex === -1) {
      return { error: 'User not found' };
    }
    const user = data.users[userIndex];

    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        return { error: 'Current password is required to set a new password' };
      }
      const isMatch = await bcrypt.compare(updateData.currentPassword, user.password);
      if (!isMatch) {
        return { error: 'Incorrect current password' };
      }
      user.password = await bcrypt.hash(updateData.newPassword, 10);
    }

    if (updateData.username) user.username = updateData.username;
    if (updateData.email) {
      if (updateData.email !== user.email) {
        const emailExists = data.users.find(u => u.email === updateData.email);
        if (emailExists) {
          return { error: 'Email already in use' };
        }
        user.email = updateData.email;
      }
    }

    if (updateData.profilePic !== undefined) user.profilePic = updateData.profilePic;
    if (updateData.firstName !== undefined) user.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) user.lastName = updateData.lastName;
    if (updateData.shippingAddress !== undefined) user.shippingAddress = updateData.shippingAddress;
    if (updateData.city !== undefined) user.city = updateData.city;
    if (updateData.postalCode !== undefined) user.postalCode = updateData.postalCode;
    if (updateData.country !== undefined) user.country = updateData.country;

    data.users[userIndex] = user;
    writeData(data);

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      shippingAddress: user.shippingAddress || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
      country: user.country || 'United States',
      dateCreated: user.dateCreated
    };
  },

  // Products
  getProducts: async (filters = {}) => {
    const data = readData();
    let list = data.products || [];

    // Filter by gender
    if (filters.gender) {
      list = list.filter(p => p.gender && p.gender.toLowerCase() === filters.gender.toLowerCase());
    }

    // Filter by category
    if (filters.category) {
      list = list.filter(p => p.category && p.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Filter by era
    if (filters.era) {
      list = list.filter(p => p.era && p.era.toLowerCase() === filters.era.toLowerCase());
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.era && p.era.toLowerCase().includes(q))
      );
    }

    // Sort
    if (filters.sort) {
      if (filters.sort === 'price_low') {
        list.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price_high') {
        list.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'newest') {
        list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      }
    }

    return list;
  },

  getProductById: async (id) => {
    const data = readData();
    return data.products.find(p => p._id === id) || null;
  },

  getSimilarProducts: async (id) => {
    const data = readData();
    const prod = data.products.find(p => p._id === id);
    if (!prod) return [];
    
    // Find products in same category or era, excluding current one
    return data.products
      .filter(p => p._id !== id && (p.category === prod.category || p.era === prod.era))
      .slice(0, 5);
  },

  createProduct: async (productData) => {
    const data = readData();
    const newProduct = {
      ...productData,
      _id: 'local_prod_' + Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toISOString()
    };
    data.products.push(newProduct);
    writeData(data);
    return newProduct;
  },

  seedProducts: async (defaultProducts) => {
    const data = readData();
    if (!data.products || data.products.length === 0) {
      data.products = defaultProducts.map((p, idx) => ({
        _id: 'local_prod_seed_' + idx,
        ...p,
        dateAdded: new Date().toISOString()
      }));
      writeData(data);
      console.log('Seeded local fallback JSON DB.');
    }
  },

  // Orders
  getOrders: async () => {
    const data = readData();
    return data.orders || [];
  },

  createOrder: async (orderData) => {
    const data = readData();
    const newOrder = {
      _id: 'local_order_' + Math.random().toString(36).substr(2, 9),
      ...orderData,
      dateOrdered: new Date().toISOString()
    };
    data.orders.push(newOrder);

    // Deduct stock quantity
    for (const item of orderData.items || []) {
      const prod = data.products.find(p => p._id === item.productId);
      if (prod) {
        prod.quantity = Math.max(0, (prod.quantity || 1) - item.quantity);
      }
    }

    writeData(data);
    return newOrder;
  },

  getOrdersByBuyer: async (buyerId) => {
    const data = readData();
    const orders = data.orders || [];
    return orders.filter(o => o.buyerId === buyerId).reverse();
  }
};
