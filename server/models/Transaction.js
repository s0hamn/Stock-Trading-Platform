const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User Collection
        required: true
    },
    stock_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock', // Reference to Stock Collection
        required: true
    },
    transaction_type: {
        type: String,
        enum: ['Buy', 'Sell'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
