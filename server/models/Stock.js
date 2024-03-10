const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    sector: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    marketCap: { type: String, required: true },
    previousClose: { type: Number, required: true },
    priceHistory: [
        {
            date: { type: Date },
            closingPrice: { type: Number }
        }
    ],
    dailyPrices: [
        {
            date: { type: Date },
            timestamps: [{ type: Date }],
            prices: [{ type: Number }]
        }
    ]
});

module.exports = mongoose.model('Stock', stockSchema);

