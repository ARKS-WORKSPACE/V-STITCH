import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  isCustom: { type: Boolean, default: false },
  fabric: { type: String },
  color: { type: String },
  vendor: { type: String }
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  paymentCardName: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  buyerId: { type: String }, // Links to the User who purchased
  dateOrdered: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
