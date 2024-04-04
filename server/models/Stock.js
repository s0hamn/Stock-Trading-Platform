const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    sector: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    marketCap: { type: Number, required: true },
    previousClose: { type: Number, required: true },
    priceHistory: [
        {
            date: { type: Date },
            open: { type: Number },
            high: { type: Number },
            low: { type: Number },
            close: { type: Number },
        }
    ],
    dailyPrices: [
        {
            date: { type: Date },
            timestamps: [{ type: Date }],
            prices: [{ type: Number }]
        }
    ],
    marketBuyOrderQueue: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
            quantity: { type: Number, required: true, min: 0 },
            orderDate: { type: Date, default: Date.now },
            stopLoss: { type: Number, min: 0 }
        }
    ],
    marketSellOrderQueue: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
            quantity: { type: Number, required: true, min: 0 },
            orderDate: { type: Date, default: Date.now },
            stopLoss: { type: Number, min: 0 }
        }
    ],
    limitBuyOrderQueue: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
            quantity: { type: Number, required: true, min: 0 },
            price: { type: Number, required: true, min: 0 },
            orderDate: { type: Date, default: Date.now },
            stopLoss: { type: Number, min: 0 }
        }
    ],
    limitSellOrderQueue: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
            quantity: { type: Number, required: true, min: 0 },
            price: { type: Number, required: true, min: 0 },
            orderDate: { type: Date, default: Date.now },
            stopLoss: { type: Number, min: 0 }
        }
    ],
});



module.exports = mongoose.model('Stock', stockSchema);
