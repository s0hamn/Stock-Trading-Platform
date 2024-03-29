
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
    orderType: { type: String, enum: ['Buy', 'Sell'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    priceLimit: { type: Number, min: 0 },
    orderDate: { type: Date, default: Date.now },
    stopLoss: { type: Number, min: 0 }
});

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ stockId: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
