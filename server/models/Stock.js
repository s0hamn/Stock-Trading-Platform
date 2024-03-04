const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    sector: {type: String, required: true},
    currentPrice: { type: Number, required: true },
    marketCap: {type: Number, required: true},
    previousClose: {type: Number, required: true},
    priceHistory: [
        {
            date: { type: Date, required: true },
            closingPrice: { type: Number, required: true }
        }
    ],
    dailyPrices: [
        {
            date: { type: Date, required: true },
            timestamps: [{ type: Date, required: true }],
            prices: [{ type: Number, required: true }]
        }
    ]
});

module.exports = mongoose.model('Stock', stockSchema);

