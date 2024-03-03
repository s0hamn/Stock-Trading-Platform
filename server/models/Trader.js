const mongoose = require('mongoose');
const TraderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    panNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    funds: {
        type: Number,
        default: 0
    }
});

const TraderModel = mongoose.model('Trader', TraderSchema);

module.exports = TraderModel;
