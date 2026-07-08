import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  gender: { type: String, required: true }, // 'men', 'women', 'unisex'
  era: { type: String, required: true }, // '70s', '80s', '90s', etc.
  size: { type: String, required: true },
  condition: { type: String, required: true }, // 'Excellent', 'Very Good', 'Good', 'Fair'
  image: { type: String, required: true },
  description: { type: String, required: true },
  sellerName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  dateAdded: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
