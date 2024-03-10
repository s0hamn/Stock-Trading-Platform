const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stocks: [{
        stock_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        average_price: {
            type: Number,
            required: true
        },
        date_added: {
            type: Date,
            default: Date.now
        }
    }],
    
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;