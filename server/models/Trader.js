const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    },
    watchlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock'
        }
    ],
    investments: [
        {
            quantity: { type: Number },
            symbol: { type: String },
            avg: { type: Number },
            timestamp: { type: Date }
        }
    ],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

TraderSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hash = await bcrypt.hash(this.password, 8)
        this.password = hash;
    }

    next();

});

//generating auth token (jwt)
TraderSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, "THISISSECRETKEYFORTRADERJSJSONWEBTOKENAUTHENTICATION");
        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    }
    catch (err) {
        console.log(err);
    }
}

const TraderModel = mongoose.model('Trader', TraderSchema);

module.exports = TraderModel;
