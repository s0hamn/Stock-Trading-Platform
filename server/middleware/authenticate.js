const jwt = require('jsonwebtoken');
const Trader = require('../models/Trader');

const authenticate = async (req, res, next) => {
    console.log("Inside authenticate");
    // // try {
    // const token = req.cookies.jwtoken;
    // const verifyToken = jwt.verify(token, "THISISSECRETKEYFORTRADERJSJSONWEBTOKENAUTHENTICATION");
    // const trader = await Trader.findOne({ _id: verifyToken._id, "tokens.token": token });
    // if (!trader) {
    //     throw new Error("User Not found");
    // }
    // req.token = token;
    // req.trader = trader;
    // req.traderId = trader._id;
    // console.log(req.trader);

    console.log(req.cookies);
    next();

    // } catch (e) {
    //     res.status(401).send({ error: 'Please authenticate' });
    // }
}

module.exports = authenticate;