const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

TraderSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hash = await bcrypt.hash(this.password, 8)
        this.password = hash;
    }

    next();

});

const TraderModel = mongoose.model('Trader', TraderSchema);

module.exports = TraderModel;
