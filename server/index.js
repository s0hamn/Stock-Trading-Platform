const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const TraderModel = require('./models/Trader');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const OTP = require('./models/OTP');
var cookies = require("cookie-parser");
const Stock = require('./models/Stock');
const socketIo = require('socket.io');
const Portfolio = require('./models/Portfolio');
const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;
const Transaction = require('./models/Transaction');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const cron = require('node-cron');
const moment = require('moment-timezone');


// const executeOrder = require('executeOrder')

const MONGODB_URI = process.env.MONGODB_URI



var request = require('request');

const app = express();
const server = http.createServer(app);
// app.use(cors({
//     origin: (origin, callback) => {
//         callback(null, true);
//     },
//     credentials: true,
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
//     preflightContinue: false,
//     optionsSuccessStatus: 204
// }));
const io = socketIo(server);


app.use(cookies());



app.use(cors(
    {
        origin:'*',
        credentials: true
    }
));

app.use(express.json());

io.on('connection', socket => {
    // console.log('Client connected');
    socket.on('allStocks', () => {
        // console.log('Client requested all stocks');
        sendAllStocks(socket);

        setInterval(() => {
            sendAllStocks(socket);
        }, 10000);
    });
    socket.on('allTransactions', () => {
        // console.log('Client requested all transactions');
        sendAllTransactions(socket);
        setInterval(() => {
            sendAllTransactions(socket);
        }, 10000);
    });
    socket.on('someStocks', (investments) => {
        // console.log('Client requested some stocks');
        sendStocks(socket, investments);

        setInterval(() => {
            sendStocks(socket, investments);
        }, 10000);
    });

    socket.on('stockChart', async (symbol) => {
        // console.log('Client requested stock chart:', symbol);
        sendStockChart(socket, symbol);

        setInterval(() => {
            sendStockChart(socket, symbol);
        }, 10000);

    });

    socket.on('watchlistStocks', async (watchlist) => {
        // console.log('Client requested watchlist stocks');
        sendWatchlist(socket, watchlist);

        setInterval(() => {
            sendWatchlist(socket, watchlist);
        }, 10000);
    });

});


cron.schedule('0 12 * * *', async () => {
    try {
        console.log('Running cron job to update previous day prices at 17:30 PM IST');
        const response = await axios.get('https://stock-trading-platform-o3zp.onrender.com/updatePreviousDayPrices');
        if (response.status === 200) {
            console.log(response.data);
        }
    }
    catch (error) {
        console.error('Error updating previous day prices:', error);
    }
}, {
    timezone: 'UTC'
});

app.get('/updatePreviousDayPrices', async (req, res) => {
    try {
        console.log('Updating previous day prices...');
        const stocks = await Stock.find();
        for (const stock of stocks) {
            let highestPrice = stock.currentPrice;
            let lowestPrice = stock.currentPrice;
            let totalVolume = 0;

            if (stock.dailyPrices.length > 0) {
                highestPrice = stock.dailyPrices.reduce((max, dp) => dp.high > max ? dp.high : max, stock.dailyPrices[0].high);
                lowestPrice = stock.dailyPrices.reduce((min, dp) => dp.low < min ? dp.low : min, stock.dailyPrices[0].low);
                totalVolume = stock.dailyPrices.reduce((total, dp) => total + dp.volume, 0);
            }

            const openPrice = stock.previousClose;
            const closePrice = stock.currentPrice;
            const date = new Date();

            const priceHistoryObject = {
                open: openPrice,
                high: highestPrice,
                low: lowestPrice,
                close: closePrice,
                volume: totalVolume,
                date: date
            };

            stock.previousHistory.push(priceHistoryObject);
            stock.previousClose = stock.currentPrice;
            stock.dailyPrices = [];
            stock.limitBuyOrderQueue = [];
            stock.limitSellOrderQueue = [];
            stock.marketBuyOrderQueue = [];
            stock.marketSellOrderQueue = [];
            await stock.save();
        }

        console.log('Previous day prices updated successfully.');
        res.status(200).send('Updated daily prices');
    } catch (error) {
        console.error('Error updating previous day prices:', error);
        res.status(500).send('Error updating daily prices');
    }
});

cron.schedule('*/14 * * * *', () => {
    console.log('Running cron job to keep server alive every 4 minutes');
    keepServerAlive();
});

async function keepServerAlive() {
    try {
        // Replace the URL with your server's URL and endpoint
        const response = await axios.get('https://stock-trading-platform-o3zp.onrender.com/keepAlive');
        console.log('Self ping successful:', response.data);
    } catch (error) {
        console.error('Self ping failed:', error.message);
    }
}

app.get('/keepAlive', async (req, res) => {
    try {
        res.status(200).send('Server is alive!');
    }
    catch (err) {
        res.status(500).send('Server is not alive!');
    }
});

async function sendStockChart(socket, symbol) {
    try {
        const stock = await Stock.findOne({
            symbol: symbol
        });
        if (!stock) {
            return socket.emit('stockChart', { message: 'Stock not found' });
        }
        socket.emit('stockChart', stock);
    } catch (error) {
        console.error('Error fetching stock:', error);
        socket.emit('stockChart', { message: 'Internal server error' });
    }
}


// Function to fetch all stocks from MongoDB and send them to the client
async function sendAllStocks(socket) {
    try {
        const stocks = await Stock.find();
        socket.emit('stockUpdate', stocks);
        // console.log('Server sending stockUpdate event:', stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
}

async function sendAllTransactions(socket) {
    try {
        const transactions = await Transaction.find();
        socket.emit('transactionsUpdate', transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

async function sendStocks(socket, investments) {
    const stocks = [];
    try {
        if (investments == null || investments.length === 0) {
            // console.log('No investments');
            socket.emit('stockUpdate', stocks);

            return;
        }

        for (let i = 0; i < investments.length; i++) {
            // console.log(investments[i].symbol);
            const stock = await Stock.findOne({ symbol: investments[i].symbol });
            if (stock) {
                stocks.push(stock);
            }
        }
        socket.emit('stockUpdate', stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
}




const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.OTP_EMAIL,
        pass: process.env.OTP_PASS,
    },
});



function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
function sendOTP(email, otp) {
    const mailOptions = {
        from: process.env.OTP_EMAIL, // Your Gmail email address
        to: email,
        subject: 'OTP for Login',
        text: `Your OTP for login is: ${otp}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


mongoose.connect(MONGODB_URI)
    .then(() => { console.log("connected to the database\n") })
    .catch((err) => { console.log(err); })


async function comparePassword(password, hash) {
    const result = await bcrypt.compareSync(password, hash);
    // console.log("login result brrrrrrrrrrrr", result);
    return result;
}

function calculateTimestampIndex(date) {
    // Calculate the time in minutes since 9:00 AM
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = (hours - 9) * 60 + minutes;

    // Calculate the index based on 5-minute intervals
    return Math.floor(totalMinutes / 5);
}

async function updateDailyPrices(stock, price, quantity) {
    const currentTimeStamp = calculateTimestampIndex(new Date());
    const lastDailyPrice = stock.dailyPrices[stock.dailyPrices.length - 1];

    //timestamp is 0 when time is 9 to 9:05 am and 1 when time is 9:05 to 9:10 am and so onn
    if (lastDailyPrice && currentTimeStamp === lastDailyPrice.timestamp) {
        // console.log("Inside if")
        const lastDailyPriceIndex = stock.dailyPrices.length - 1;

        await Stock.findByIdAndUpdate(stock._id, {
            $set: {
                [`dailyPrices.${lastDailyPriceIndex}.close`]: price,
                [`dailyPrices.${lastDailyPriceIndex}.high`]: Math.max(price, stock.dailyPrices[lastDailyPriceIndex].high),
                [`dailyPrices.${lastDailyPriceIndex}.low`]: Math.min(price, stock.dailyPrices[lastDailyPriceIndex].low),
                [`dailyPrices.${lastDailyPriceIndex}.volume`]: stock.dailyPrices[lastDailyPriceIndex].volume + quantity
            }
        });

    } else {
        await Stock.findByIdAndUpdate(stock._id, {
            $push: {
                dailyPrices: {
                    timestamp: currentTimeStamp,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    volume: quantity
                }
            }
        });

    }
}


async function executeOrder(symbol, orderType, orderCategory) {

    try {
        const stock = await Stock.findOne({ symbol: symbol });

        if (!stock) {
            return;
        }

        const marketBuyOrderQueue = stock.marketBuyOrderQueue;
        const marketSellOrderQueue = stock.marketSellOrderQueue;
        const limitBuyOrderQueue = stock.limitBuyOrderQueue;
        const limitSellOrderQueue = stock.limitSellOrderQueue;


        if (marketBuyOrderQueue.length != 0 && marketSellOrderQueue.length == 0 && limitSellOrderQueue.length == 0) {
            return;
        } else if (limitBuyOrderQueue.length != 0 && marketSellOrderQueue.length == 0 && limitSellOrderQueue.length == 0) {
            return;
        }

        limitBuyOrderQueue.sort((a, b) => {
            // First, compare by price in descending order
            if (a.price > b.price) return -1;
            if (a.price < b.price) return 1;
            // If prices are equal, compare by orderDate in ascending order
            return a.orderDate - b.orderDate;
        });

        // Sort sell orderslimitBuyOrderQueue
        limitSellOrderQueue.sort((a, b) => {
            // First, compare by price in ascending order
            if (a.price < b.price) return -1;
            if (a.price > b.price) return 1;
            // If prices are equal, compare by orderDate in ascending order
            return a.orderDate - b.orderDate;
        });

        marketBuyOrderQueue.sort((a, b) => {
            return a.orderDate - b.orderDate;
        });

        marketSellOrderQueue.sort((a, b) => {
            return a.orderDate - b.orderDate;
        });

        // console.log(orderType, orderCategory)
        if (orderType === 'market') {
            if (orderCategory === 'Buy') {
                executeMarketBuyOrder(symbol, marketBuyOrderQueue, marketSellOrderQueue, limitSellOrderQueue);
            } else {
                executeMarketSellOrder(symbol, marketBuyOrderQueue, marketSellOrderQueue, limitBuyOrderQueue);
            }
        } else {
            if (orderCategory === 'Buy') {
                executeLimitBuyOrder(symbol, limitBuyOrderQueue, limitSellOrderQueue, marketSellOrderQueue);
            } else {
                executeLimitSellOrder(symbol, limitBuyOrderQueue, limitSellOrderQueue, marketBuyOrderQueue);
            }
        }










    }
    catch (err) {
        console.log(err);
    }




}


async function executeMarketBuyOrder(symbol, marketBuyOrderQueue, marketSellOrderQueue, limitSellOrderQueue) {
    // console.log("SYMBOL", symbol)
    // console.log(marketBuyOrderQueue)
    // console.log(marketSellOrderQueue)
    // console.log(limitSellOrderQueue)
    const stock = await Stock.findOne({ symbol: symbol });
    if (!stock) {
        return;
    }

    // console.log(stock._id)


    while (marketBuyOrderQueue.length && marketSellOrderQueue.length) {


        const marketBuyOrder = marketBuyOrderQueue[0];
        const marketSellOrder = marketSellOrderQueue[0];

        if (marketBuyOrder.quantity === marketSellOrder.quantity) {

            // console.log("Inside equal quantity");
            // console.log("Market Buy Order", marketBuyOrder);
            // console.log("Market Sell Order", marketSellOrder);
            // console.log("Stock", stock);
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            // Remove the sell order
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }
            });

            // console.log("A", a);
            // console.log("B", b);




            const buyerId = marketBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            console.log("Seller", seller);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketSellOrder.quantity * (stock.currentPrice - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                quantity: marketBuyOrder.quantity,
                sellerGain: sellerGain,
                price: stock.currentPrice
            });

            marketBuyOrderQueue.shift();
            marketSellOrderQueue.shift();

            updateBuyerInvestments(buyerId, symbol, marketBuyOrder.quantity, stock.currentPrice);

            updateSellerInvestments(sellerId, symbol, marketBuyOrder.quantity, stock.currentPrice);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        }
        else if (marketBuyOrder.quantity < marketSellOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            // Update the sell order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketSellOrderQueue.0.quantity": marketSellOrder.quantity - marketBuyOrder.quantity
                }
            });

            const quantity = marketSellOrder.quantity - marketBuyOrder.quantity;

            const buyerId = marketBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketBuyOrder.quantity * (stock.currentPrice - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketBuyOrder.quantity,
                price: stock.currentPrice
            });

            marketBuyOrderQueue.shift();
            marketSellOrderQueue[0].quantity = quantity;

            updateBuyerInvestments(buyerId, symbol, marketBuyOrder.quantity, stock.currentPrice);
            updateSellerInvestments(sellerId, symbol, marketBuyOrder.quantity, stock.currentPrice);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });


        } else { // marketBuyOrder.quantity > marketSellOrder.quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }
            });

            // Update the buy order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketBuyOrderQueue.0.quantity": marketBuyOrder.quantity - marketSellOrder.quantity
                }
            });

            const buyerId = marketBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // const quantity = marketBuyOrder.quantity - marketSellOrder.quantity;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketSellOrder.quantity * (stock.currentPrice - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                quantity: marketSellOrder.quantity,
                price: stock.currentPrice
            });

            marketSellOrderQueue.shift();
            marketBuyOrderQueue[0].quantity = marketBuyOrder.quantity - marketSellOrder.quantity

            updateBuyerInvestments(buyerId, symbol, marketSellOrder.quantity, stock.currentPrice);
            updateSellerInvestments(sellerId, symbol, marketSellOrder.quantity, stock.currentPrice);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });
        }



    }

    console.log("here")
    while (marketBuyOrderQueue.length && limitSellOrderQueue.length) {
        console.log("HERE")
        const marketBuyOrder = marketBuyOrderQueue[0];
        const limitSellOrder = limitSellOrderQueue[0];
        console.log("Market Buy Order", marketBuyOrder);
        console.log("Limit Sell Order", limitSellOrder);

        if (marketBuyOrder.quantity === limitSellOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            // Remove the sell order
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitSellOrderQueue: { _id: limitSellOrder._id }
                }
            });

            const buyerId = marketBuyOrder.userId;
            const sellerId = limitSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketBuyOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: limitSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketBuyOrder.quantity,
                price: stock.currentPrice
            });



            marketBuyOrderQueue.shift();
            limitSellOrderQueue.shift();

            // update current price of stock
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitSellOrder.price
                }
            });
            updateDailyPrices(stock, limitSellOrder.price, marketBuyOrder.quantity);
            // setting the daily price
            //comparing current time with the timestamp of the last element in the dailyPrices array which is updated every 5 mins



            updateBuyerInvestments(buyerId, symbol, marketBuyOrder.quantity, limitSellOrder.price);
            updateSellerInvestments(sellerId, symbol, marketBuyOrder.quantity, limitSellOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        }
        else if (marketBuyOrder.quantity < limitSellOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            // Update the sell order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "limitSellOrderQueue.0.quantity": limitSellOrder.quantity - marketBuyOrder.quantity
                }
            });

            const quantity = limitSellOrder.quantity - marketBuyOrder.quantity;

            const buyerId = marketBuyOrder.userId;
            const sellerId = limitSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketBuyOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: limitSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketBuyOrder.quantity,
                price: stock.currentPrice
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitSellOrder.price
                }
            });

            marketBuyOrderQueue.shift();
            limitSellOrderQueue[0].quantity = quantity;

            updateDailyPrices(stock, limitSellOrder.price, marketBuyOrder.quantity);

            updateBuyerInvestments(buyerId, symbol, marketBuyOrder.quantity, limitSellOrder.price);
            updateSellerInvestments(sellerId, symbol, marketBuyOrder.quantity, limitSellOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else { // marketBuyOrder.quantity > limitSellOrder.quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitSellOrderQueue: { _id: limitSellOrder._id }
                }
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketBuyOrderQueue.0.quantity": marketBuyOrder.quantity - limitSellOrder.quantity
                }
            });

            const buyerId = marketBuyOrder.userId;
            const sellerId = limitSellOrder.userId;

            // const quantity = marketBuyOrder.quantity - limitSellOrder.quantity;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = limitSellOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: limitSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: limitSellOrder.quantity,
                price: stock.currentPrice
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitSellOrder.price
                }
            });

            limitSellOrderQueue.shift();

            marketBuyOrderQueue[0].quantity = marketBuyOrder.quantity - limitSellOrder.quantity
            updateDailyPrices(stock, limitSellOrder.price, limitSellOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, limitSellOrder.quantity, limitSellOrder.price);
            updateSellerInvestments(sellerId, symbol, limitSellOrder.quantity, limitSellOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        }

    }


}



async function executeMarketSellOrder(symbol, marketBuyOrderQueue, marketSellOrderQueue, limitBuyOrderQueue) {
    const stock = await Stock.findOne({ symbol: symbol });
    if (!stock) {
        return;
    }

    // console.log("Inside market sell order")

    while (marketSellOrderQueue.length && marketBuyOrderQueue.length) {
        const marketSellOrder = marketSellOrderQueue[0];
        const marketBuyOrder = marketBuyOrderQueue[0];

        if (marketSellOrder.quantity === marketBuyOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }
            });

            // Remove the buy order
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            const buyerId = marketBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            console.log("Seller", seller);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketBuyOrder.quantity * (stock.currentPrice - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketSellOrder.quantity,
                price: stock.currentPrice
            });

            marketSellOrderQueue.shift();
            marketBuyOrderQueue.shift();

            updateBuyerInvestments(buyerId, symbol, marketSellOrder.quantity, stock.currentPrice);
            updateSellerInvestments(sellerId, symbol, marketSellOrder.quantity, stock.currentPrice);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else if (marketSellOrder.quantity < marketBuyOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }
            });

            // Update the buy order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketBuyOrderQueue.0.quantity": marketBuyOrder.quantity - marketSellOrder.quantity
                }
            });

            const quantity = marketBuyOrder.quantity - marketSellOrder.quantity;

            const buyerId = marketBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketSellOrder.quantity * (stock.currentPrice - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketSellOrder.quantity,
                price: stock.currentPrice
            });

            marketSellOrderQueue.shift();
            marketBuyOrderQueue[0].quantity = quantity;

            updateBuyerInvestments(buyerId, symbol, marketSellOrder.quantity, stock.currentPrice);
            updateSellerInvestments(sellerId, symbol, marketSellOrder.quantity, stock.currentPrice);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            // Update the buy order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketSellOrderQueue.0.quantity": marketSellOrder.quantity - marketBuyOrder.quantity
                }
            });

            const buyerId = marketBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // const quantity = marketBuyOrder.quantity - marketSellOrder.quantity;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketBuyOrder.quantity * (stock.currentPrice - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketBuyOrder.quantity,
                price: stock.currentPrice
            });

            marketBuyOrderQueue.shift();

            marketSellOrderQueue[0].quantity = marketSellOrder.quantity - marketBuyOrder.quantity

            updateBuyerInvestments(buyerId, symbol, marketBuyOrder.quantity, stock.currentPrice);
            updateSellerInvestments(sellerId, symbol, marketBuyOrder.quantity, stock.currentPrice);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });


        }
    }

    while (marketSellOrderQueue.length && limitBuyOrderQueue.length) {
        const marketSellOrder = marketSellOrderQueue[0];
        const limitBuyOrder = limitBuyOrderQueue[0];

        if (marketSellOrder.quantity === limitBuyOrder.quantity) {
            // console.log("Inside equal quantity");
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }
            });

            // Remove the buy order
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitBuyOrderQueue: { _id: limitBuyOrder._id }
                }
            });

            const buyerId = limitBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketSellOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: limitBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                sellerGain: sellerGain,
                stock_id: stock._id,
                quantity: marketSellOrder.quantity,
                price: limitBuyOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitBuyOrder.price
                }
            });

            marketSellOrderQueue.shift();
            limitBuyOrderQueue.shift();
            updateDailyPrices(stock, limitBuyOrder.price, marketSellOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, marketSellOrder.quantity, limitBuyOrder.price);
            updateSellerInvestments(sellerId, symbol, marketSellOrder.quantity, limitBuyOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else if (marketSellOrder.quantity < limitBuyOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }

            });

            // Update the buy order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "limitBuyOrderQueue.0.quantity": limitBuyOrder.quantity - marketSellOrder.quantity
                }
            });

            const quantity = limitBuyOrder.quantity - marketSellOrder.quantity

            const buyerId = limitBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketSellOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: limitBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: limitBuyOrder.quantity,
                price: limitBuyOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitBuyOrder.price
                }
            });

            marketSellOrderQueue.shift();
            limitBuyOrderQueue[0].quantity = quantity;
            updateDailyPrices(stock, limitBuyOrder.price, marketSellOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, marketSellOrder.quantity, limitBuyOrder.price);
            updateSellerInvestments(sellerId, symbol, marketSellOrder.quantity, limitBuyOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        }
        else {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitBuyOrderQueue: { _id: limitBuyOrder._id }
                }
            });

            // Update the sell order quantity

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketSellOrderQueue.0.quantity": marketSellOrder.quantity - limitBuyOrder.quantity
                }
            });


            const buyerId = limitBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // const quantity = limitBuyOrder.quantity - marketSellOrder.quantity;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = limitSellOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: limitBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketSellOrder.quantity,
                price: limitBuyOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitBuyOrder.price
                }
            });

            limitBuyOrderQueue.shift();

            marketSellOrderQueue[0].quantity = marketSellOrder.quantity - limitBuyOrder.quantity // Update the sell order quantity
            updateDailyPrices(stock, limitBuyOrder.price, limitBuyOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);  // Update buyer's investments
            updateSellerInvestments(sellerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price); // Update seller's investments

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });


        }
    }



}

async function executeLimitBuyOrder(symbol, limitBuyOrderQueue, limitSellOrderQueue, marketSellOrderQueue) {
    const stock = await Stock.findOne({ symbol: symbol });
    if (!stock) {
        return;
    }

    while (limitBuyOrderQueue.length && marketSellOrderQueue.length) {
        const limitBuyOrder = limitBuyOrderQueue[0];
        const marketSellOrder = marketSellOrderQueue[0];

        if (limitBuyOrder.quantity === marketSellOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitBuyOrderQueue: { _id: limitBuyOrder._id }
                }
            });

            // Remove the sell order
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }
            });

            const buyerId = limitBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketSellOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: limitBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: limitBuyOrder.quantity,
                price: limitBuyOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitBuyOrder.price
                }
            });

            limitBuyOrderQueue.shift();
            marketSellOrderQueue.shift();
            updateDailyPrices(stock, limitBuyOrder.price, limitBuyOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);
            updateSellerInvestments(sellerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else if (limitBuyOrder.quantity < marketSellOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitBuyOrderQueue: { _id: limitBuyOrder._id }
                }
            });

            // Update the sell order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketSellOrderQueue.0.quantity": marketSellOrder.quantity - limitBuyOrder.quantity
                }
            });

            const quantity = marketSellOrder.quantity - limitBuyOrder.quantity;

            const buyerId = limitBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = limitBuyOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: limitBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: limitBuyOrder.quantity,
                price: limitBuyOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitBuyOrder.price
                }
            });

            limitBuyOrderQueue.shift();
            marketSellOrderQueue[0].quantity = quantity;
            updateDailyPrices(stock, limitBuyOrder.price, limitBuyOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);
            updateSellerInvestments(sellerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else { // limitBuyOrder.quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketSellOrderQueue: { _id: marketSellOrder._id }
                }
            });

            // Update the buy order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "limitBuyOrderQueue.0.quantity": limitBuyOrder.quantity - marketSellOrder.quantity
                }
            });

            const buyerId = limitBuyOrder.userId;
            const sellerId = marketSellOrder.userId;

            // const quantity = limitBuyOrder.quantity - marketSellOrder.quantity;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketSellOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: limitBuyOrder.userId,
                seller_id: marketSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketSellOrder.quantity,
                price: limitBuyOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitBuyOrder.price
                }
            });

            marketSellOrderQueue.shift();

            limitBuyOrderQueue[0].quantity = limitBuyOrder.quantity - marketSellOrder.quantity
            updateDailyPrices(stock, limitBuyOrder.price, marketSellOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, marketSellOrder.quantity, limitBuyOrder.price);  // Update buyer's investments
            updateSellerInvestments(sellerId, symbol, marketSellOrder.quantity, limitBuyOrder.price); // Update seller's investments

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        }
    }

    while (limitBuyOrderQueue.length && limitSellOrderQueue.length) {

        const limitBuyOrder = limitBuyOrderQueue[0];
        const limitSellOrder = limitSellOrderQueue[0];

        if (limitBuyOrder.price >= limitSellOrder.price) {
            if (limitBuyOrder.quantity === limitSellOrder.quantity) {
                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitBuyOrderQueue: { _id: limitBuyOrder._id }
                    }
                });

                // Remove the sell order

                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitSellOrderQueue: { _id: limitSellOrder._id }
                    }
                });

                const buyerId = limitBuyOrder.userId;
                const sellerId = limitSellOrder.userId;

                // Create a transaction
                const seller = await TraderModel.findById(sellerId);
                const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
                const sellerGain = limitBuyOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
                await Transaction.create({
                    buyer_id: limitBuyOrder.userId,
                    seller_id: limitSellOrder.userId,
                    stock_id: stock._id,
                    sellerGain: sellerGain,
                    quantity: limitBuyOrder.quantity,
                    price: limitBuyOrder.price
                });

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        currentPrice: limitBuyOrder.price
                    }
                });

                limitBuyOrderQueue.shift();
                limitSellOrderQueue.shift();

                updateDailyPrices(stock, limitBuyOrder.price, limitBuyOrder.quantity);
                updateBuyerInvestments(buyerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);
                updateSellerInvestments(sellerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        lastTradedOn: Date.now()
                    }
                });

            } else if (limitBuyOrder.quantity < limitSellOrder.quantity) {
                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitBuyOrderQueue: { _id: limitBuyOrder._id }
                    }
                });

                // Update the sell order quantity
                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        "limitSellOrderQueue.0.quantity": limitSellOrder.quantity - limitBuyOrder.quantity
                    }
                });

                const quantity = limitSellOrder.quantity - limitBuyOrder.quantity;

                const buyerId = limitBuyOrder.userId;
                const sellerId = limitSellOrder.userId;

                // Create a transaction
                const seller = await TraderModel.findById(sellerId);
                const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
                const sellerGain = limitBuyOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
                await Transaction.create({
                    buyer_id: limitBuyOrder.userId,
                    seller_id: limitSellOrder.userId,
                    stock_id: stock._id,
                    sellerGain: sellerGain,
                    quantity: limitBuyOrder.quantity,
                    price: limitBuyOrder.price
                });

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        currentPrice: limitBuyOrder.price
                    }
                });

                limitBuyOrderQueue.shift();
                limitSellOrderQueue[0].quantity = quantity;
                updateDailyPrices(stock, limitBuyOrder.price, limitBuyOrder.quantity);
                updateBuyerInvestments(buyerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);
                updateSellerInvestments(sellerId, symbol, limitBuyOrder.quantity, limitBuyOrder.price);

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        lastTradedOn: Date.now()
                    }
                });
            } else {
                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitSellOrderQueue: { _id: limitSellOrder._id }
                    }
                });

                // Update the buy order quantity
                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        "limitBuyOrderQueue.0.quantity": limitBuyOrder.quantity - limitSellOrder.quantity
                    }
                });

                const buyerId = limitBuyOrder.userId;
                const sellerId = limitSellOrder.userId;

                // const quantity = limitBuyOrder.quantity - limitSellOrder.quantity;
                const seller = await TraderModel.findById(sellerId);
                const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
                const sellerGain = limitSellOrder.quantity * (limitBuyOrder.price - stockInInvestmentArray.avg);
                // Create a transaction
                await Transaction.create({
                    buyer_id: limitBuyOrder.userId,
                    seller_id: limitSellOrder.userId,
                    stock_id: stock._id,
                    sellerGain: sellerGain,
                    quantity: limitSellOrder.quantity,
                    price: limitBuyOrder.price
                });


                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        currentPrice: limitBuyOrder.price
                    }
                });

                limitSellOrderQueue.shift();

                limitBuyOrderQueue[0].quantity = limitBuyOrder.quantity - limitSellOrder.quantity

                updateDailyPrices(stock, limitBuyOrder.price, limitSellOrder.quantity);
                updateBuyerInvestments(buyerId, symbol, limitSellOrder.quantity, limitBuyOrder.price);  // Update buyer's investments
                updateSellerInvestments(sellerId, symbol, limitSellOrder.quantity, limitBuyOrder.price); // Update seller's investments

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        lastTradedOn: Date.now()
                    }
                });


            }
        }
    }


}

async function executeLimitSellOrder(symbol, limitBuyOrderQueue, limitSellOrderQueue, marketBuyOrderQueue) {
    const stock = await Stock.findOne({ symbol });

    if (!stock) {
        return;
    }

    while (limitSellOrderQueue.length && marketBuyOrderQueue.length) {
        const limitSellOrder = limitSellOrderQueue[0];
        const marketBuyOrder = marketBuyOrderQueue[0];

        if (limitSellOrder.quantity === marketBuyOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitSellOrderQueue: { _id: limitSellOrder._id }
                }
            });

            // Remove the buy order
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            const buyerId = marketBuyOrder.userId;
            const sellerId = limitSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketBuyOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: limitSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: limitSellOrder.quantity,
                price: limitSellOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitSellOrder.price
                }
            });

            limitSellOrderQueue.shift();
            marketBuyOrderQueue.shift();
            updateDailyPrices(stock, limitSellOrder.price, limitSellOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, limitSellOrder.quantity, limitSellOrder.price);
            updateSellerInvestments(sellerId, symbol, limitSellOrder.quantity, limitSellOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else if (limitSellOrder.quantity < marketBuyOrder.quantity) {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    limitSellOrderQueue: { _id: limitSellOrder._id }
                }
            });

            // Update the buy order quantity
            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "marketBuyOrderQueue.0.quantity": marketBuyOrder.quantity - limitSellOrder.quantity
                }
            });

            const quantity = marketBuyOrder.quantity - limitSellOrder.quantity;

            const buyerId = marketBuyOrder.userId;
            const sellerId = limitSellOrder.userId;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = limitSellOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: limitSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: limitSellOrder.quantity,
                price: limitSellOrder.price
            });

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitSellOrder.price
                }
            });

            limitSellOrderQueue.shift();
            marketBuyOrderQueue[0].quantity = quantity;
            updateDailyPrices(stock, limitSellOrder.price, limitSellOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, limitSellOrder.quantity, limitSellOrder.price);
            updateSellerInvestments(sellerId, symbol, limitSellOrder.quantity, limitSellOrder.price);

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });

        } else {
            await Stock.findByIdAndUpdate(stock._id, {
                $pull: {
                    marketBuyOrderQueue: { _id: marketBuyOrder._id }
                }
            });

            // Update the buy order quantity

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    "limitSellOrderQueue.0.quantity": limitSellOrder.quantity - marketBuyOrder.quantity
                }
            });

            const buyerId = marketBuyOrder.userId;
            const sellerId = limitSellOrder.userId;

            // const quantity = limitSellOrder.quantity - marketBuyOrder.quantity;

            // Create a transaction
            const seller = await TraderModel.findById(sellerId);
            const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
            const sellerGain = marketBuyOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
            await Transaction.create({
                buyer_id: marketBuyOrder.userId,
                seller_id: limitSellOrder.userId,
                stock_id: stock._id,
                sellerGain: sellerGain,
                quantity: marketBuyOrder.quantity,
                price: limitSellOrder.price
            });


            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    currentPrice: limitSellOrder.price
                }
            });

            marketBuyOrderQueue.shift();

            limitSellOrderQueue[0].quantity = limitSellOrder.quantity - marketBuyOrder.quantity
            updateDailyPrices(stock, limitSellOrder.price, marketBuyOrder.quantity);
            updateBuyerInvestments(buyerId, symbol, marketBuyOrder.quantity, limitSellOrder.price);  // Update buyer's investments
            updateSellerInvestments(sellerId, symbol, marketBuyOrder.quantity, limitSellOrder.price); // Update seller's investments

            await Stock.findByIdAndUpdate(stock._id, {
                $set: {
                    lastTradedOn: Date.now()
                }
            });


        }


    }

    while (limitSellOrderQueue.length && limitBuyOrderQueue.length) {
        const limitSellOrder = limitSellOrderQueue[0];
        const limitBuyOrder = limitBuyOrderQueue[0];

        if (limitSellOrder.price <= limitBuyOrder.price) {
            if (limitSellOrder.quantity === limitBuyOrder.quantity) {
                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitSellOrderQueue: { _id: limitSellOrder._id }
                    }
                });

                // Remove the sell order
                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitBuyOrderQueue: { _id: limitBuyOrder._id }
                    }
                });

                const buyerId = limitBuyOrder.userId;
                const sellerId = limitSellOrder.userId;

                // Create a transaction
                const seller = await TraderModel.findById(sellerId);
                const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
                const sellerGain = limitBuyOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
                await Transaction.create({
                    buyer_id: limitBuyOrder.userId,
                    seller_id: limitSellOrder.userId,
                    stock_id: stock._id,
                    sellerGain: sellerGain,
                    quantity: limitSellOrder.quantity,
                    price: limitSellOrder.price
                });

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        currentPrice: limitSellOrder.price
                    }
                });

                limitSellOrderQueue.shift();
                limitBuyOrderQueue.shift();
                updateDailyPrices(stock, limitSellOrder.price, limitSellOrder.quantity);
                updateBuyerInvestments(buyerId, symbol, limitSellOrder.quantity, limitSellOrder.price);
                updateSellerInvestments(sellerId, symbol, limitSellOrder.quantity, limitSellOrder.price);
                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        lastTradedOn: Date.now()
                    }
                });

            } else if (limitSellOrder.quantity < limitBuyOrder.quantity) {
                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitSellOrderQueue: { _id: limitSellOrder._id }
                    }
                });

                // Update the sell order quantity
                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        "limitBuyOrderQueue.0.quantity": limitBuyOrder.quantity - limitSellOrder.quantity
                    }
                });

                const quantity = limitBuyOrder.quantity - limitSellOrder.quantity;

                const buyerId = limitBuyOrder.userId;
                const sellerId = limitSellOrder.userId;

                // Create a transaction
                const seller = await TraderModel.findById(sellerId);
                const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
                const sellerGain = limitSellOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
                await Transaction.create({
                    buyer_id: limitBuyOrder.userId,
                    seller_id: limitSellOrder.userId,
                    stock_id: stock._id,
                    sellerGain: sellerGain,
                    quantity: limitSellOrder.quantity,
                    price: limitSellOrder.price
                });

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        currentPrice: limitSellOrder.price
                    }

                });

                limitSellOrderQueue.shift();
                limitBuyOrderQueue[0].quantity = quantity;
                updateDailyPrices(stock, limitSellOrder.price, limitSellOrder.quantity);
                updateBuyerInvestments(buyerId, symbol, limitSellOrder.quantity, limitSellOrder.price);
                updateSellerInvestments(sellerId, symbol, limitSellOrder.quantity, limitSellOrder.price);

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        lastTradedOn: Date.now()
                    }
                });

            } else {

                await Stock.findByIdAndUpdate(stock._id, {
                    $pull: {
                        limitBuyOrderQueue: { _id: limitBuyOrder._id }
                    }
                });

                // Update the buy order quantity
                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        "limitSellOrderQueue.0.quantity": limitSellOrder.quantity - limitBuyOrder.quantity
                    }
                });

                const buyerId = limitBuyOrder.userId;
                const sellerId = limitSellOrder.userId;

                // const quantity = limitSellOrder.quantity - limitBuyOrder.quantity;

                // Create a transaction
                const seller = await TraderModel.findById(sellerId);
                const stockInInvestmentArray = seller.investments.find(investment => investment.symbol === symbol);
                const sellerGain = limitBuyOrder.quantity * (limitSellOrder.price - stockInInvestmentArray.avg);
                await Transaction.create({
                    buyer_id: limitBuyOrder.userId,
                    seller_id: limitSellOrder.userId,
                    stock_id: stock._id,
                    sellerGain: sellerGain,
                    quantity: limitBuyOrder.quantity,
                    price: limitSellOrder.price
                });

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        currentPrice: limitSellOrder.price
                    }
                });

                limitBuyOrderQueue.shift();

                limitSellOrderQueue[0].quantity = limitSellOrder.quantity - limitBuyOrder.quantity
                updateDailyPrices(stock, limitSellOrder.price, limitBuyOrder.quantity);
                updateBuyerInvestments(buyerId, symbol, limitBuyOrder.quantity, limitSellOrder.price);  // Update buyer's investments
                updateSellerInvestments(sellerId, symbol, limitBuyOrder.quantity, limitSellOrder.price); // Update seller's investments

                await Stock.findByIdAndUpdate(stock._id, {
                    $set: {
                        lastTradedOn: Date.now()
                    }
                });

            }
        }
    }
}






// Function to update buyer's investment array
const updateBuyerInvestments = async (buyerId, symbol, quantity, price) => {
    let buyer = await TraderModel.findOne({ _id: buyerId });

    // Find the index of the stock in investments array
    const index = buyer.investments.findIndex(investment => investment.symbol === symbol);

    if (index !== -1) {
        // Stock already exists in investments, update quantity
        const investment = buyer.investments[index];
        const prevTotal = investment.quantity * investment.avg;
        const newTotal = prevTotal + (quantity * price);
        investment.quantity += quantity;
        investment.avg = newTotal / investment.quantity;

    } else {
        // Stock does not exist in investments, add new entry
        if (quantity > 0) {
            buyer.investments.push({
                symbol,
                quantity,
                avg: price,
                timestamp: new Date()
            });
        }
    }

    buyer.funds -= quantity * price;

    // Save the updated buyer document
    await buyer.save();
};

// Function to update seller's investment array
const updateSellerInvestments = async (sellerId, symbol, quantity, price) => {
    let seller = await TraderModel.findOne({ _id: sellerId });

    // Find the index of the stock in investments array
    const index = seller.investments.findIndex(investment => investment.symbol === symbol);

    if (index !== -1) {
        // Stock already exists in investments, update quantity
        const investment = seller.investments[index];
        investment.quantity -= quantity;
        // If quantity becomes zero, remove the investment from array
        if (investment.quantity === 0) {
            seller.investments.splice(index, 1);
        }


    }
    else {
        return;
    }

    seller.funds += quantity * price;

    // Save the updated seller document
    await seller.save();
};



app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find(); // Retrieve all posts from the database
        res.status(200).json(posts); // Send the posts as a JSON response
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/register', async (req, res) => {
    // console.log(req.body);
    if (req.body.password !== req.body.confirmPassword) {
        const error = {
            errorType: 'ValidationError',
            errorMessage: 'Passwords do not match'
        };
        return res.status(400).json(error);
    }

    // Check if email, phone number, account number, and PAN number already exist
    const existingTrader = await TraderModel.findOne({
        $or: [
            { email: req.body.email },
            { phoneNumber: req.body.phoneNumber },
            { accountNumber: req.body.accountNumber },
            { panNumber: req.body.panNumber }
        ]
    });

    if (existingTrader) {
        const error = {
            errorType: 'ValidationError',
            errorMessage: 'Trader with one of the provided details already exists'
        };
        return res.status(400).json(error);
    }

    const otp = generateOTP();
    const email = req.body.email;


    await OTP.create({ email, otp });

    sendOTP(email, otp);
    const response = {
        type: 'OTP',
        data: req.body
    }
    res.send(response);

});

app.post('/addPost', async (req, res) => {
    try {
        const formData = req.body.formData; // Destructure the request body
        console.log('Form data:', formData);
        // Create a new post instance
        await Post.create({
            title: formData.title,
            content: formData.content,
            image: formData.image,
            stockName: formData.stockName,
            userId: formData.userId,
        });

        res.status(200).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/comments', async (req, res) => {
    try {
        // Fetch all comments from the database
        const allComments = await Comment.find();

        // Initialize an object to store comments categorized by post IDs
        const commentsByPost = {};

        // Categorize comments by post IDs
        allComments.forEach(comment => {
            const postId = comment.postId; // Convert postId to string for consistency
            if (!commentsByPost[postId]) {
                commentsByPost[postId] = [];
            }
            commentsByPost[postId].push(comment);
        });

        res.json(commentsByPost); // Send the object of objects as a JSON response
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/deletePost/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        // Find the post by ID and delete it
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/deleteComment/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        // Find the post by ID and delete it
        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/addComment/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const content = req.body.content;

        // Create a new comment
        const newComment = new Comment({
            content: content,
            postId: postId, // Assign postId to the comment
            userId: req.body.userId,
            // You may also assign other fields like userId if needed
        });

        // Save the comment to the database
        await newComment.save();

        res.status(200).json(newComment); // Send a 201 status code with the newly created comment
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.post('/addToWatchlist', async (req, res) => {
    try {
        const symbol = req.body.symbol;
        const userId = req.body.userId;

        const trader = await TraderModel.findById(userId);

        if (!trader) {
            return res.status(404).send("Trader not found");
        }

        for (let i = 0; i < trader.watchlist.length; i++) {
            if (trader.watchlist[i]['symbol'] == symbol) {
                return res.status(400).send("Stock already exists in watchlist");
            }
        }

        trader.watchlist.push({ symbol: symbol });
        await trader.save();

        return res.status(200).json({ message: "Stock added to watchlist successfully" });
    }
    catch (error) {
        console.error("Error adding stock to watchlist:", error);
        return res.status(500).send("Internal Server Error");
    }
});



app.post('/login', async (req, res) => {
    // console.log(req.body);

    // const randomStock = await Stock.findOne({ symbol: 'RELIANCE.NS' });

    // if (randomStock.lastTradedOn != Date.now()) {
    //     //clear the daily prices array of all the stocks
    //     await Stock.updateMany({}, {
    //         $set: {
    //             dailyPrices: []
    //         }
    //     });
    // }

    console.log("Request login with email: ", req.body.email);

    const trader = await TraderModel.findOne({
        email: req.body.email
    });

    if (trader) {
        const compare = await comparePassword(req.body.password, trader.password);

        const token = await trader.generateAuthToken();
        // console.log("Token", token);

        if (!compare) {
            res.json({ result: "Wrong password" });
        }
        else {
            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true
            });
            res.send({ result: 'Success', token: token });
        }


    }
    else {
        res.json({ result: "User not found" });
    }
});

app.post('/verifyOTP', async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    try {
        // Check if the provided OTP matches the stored OTP for the user
        const otpRecord = await OTP.findOne({ email, otp });
        if (otpRecord) {
            // Clear the OTP after successful verification
            await OTP.deleteOne({ email, otp });
            TraderModel.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                accountNumber: req.body.accountNumber,
                panNumber: req.body.panNumber,
                address: req.body.address,
                phoneNumber: req.body.phoneNumber,
                funds: 0,
                watchlist: [],
                investments: [],
                tokens: []
            })
                .then((traders) => {
                    res.send('Success');
                })
                .catch((err) => {
                    res.json(err);
                });

        }
        else {
            res.status(401).send('Invalid OTP');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.put('/updateDeposit', async (req, res) => {
    try {
        const token = req.cookies.jwtoken;
        const verifyToken = jwt.verify(token, "THISISSECRETKEYFORTRADERJSJSONWEBTOKENAUTHENTICATION");
        const trader = await TraderModel.findOne({ _id: verifyToken._id, "tokens.token": token });
        if (!trader) {
            res.send("unsuccessful");
        }
        else {
            // Update the funds attribute
            trader.funds += req.body.deposit; // Replace newFundsValue with the new value you want to set

            // Save the updated trader object back to the database

            const updatedTrader = await trader.save();
            res.send(updatedTrader);
        }
    }
    catch (error) {
        res.send("unsuccessful");
    }
})

app.put('/updateWithdraw', async (req, res) => {
    try {
        const token = req.body.jwtoken;
        const verifyToken = jwt.verify(token, "THISISSECRETKEYFORTRADERJSJSONWEBTOKENAUTHENTICATION");
        const trader = await TraderModel.findOne({ _id: verifyToken._id, "tokens.token": token });
        if (!trader) {
            res.send("unsuccessful");
        }
        else {
            // Update the funds attribute
            if (trader.funds - req.body.withdraw < 0) {
                res.send('unsuccessful');
            }
            else {
                trader.funds -= req.body.withdraw; // Replace newFundsValue with the new value you want to set

                // Save the updated trader object back to the database

                const updatedTrader = await trader.save();
                res.send(updatedTrader);
            }
        }
    }
    catch (error) {
        res.send("unsuccessful");
    }
})

app.get('/news', async (req, res) => {
    try {
        // console.log('Fetching news from newsapi.org');
        const apiKey = '5ba48d6cf4794f01991b0114521a6cb0';
        const response = await axios.get(`https://newsapi.org/v2/everything?q=stock&q=NSE&q=BSE&sortBy=publishedAt&apiKey=${apiKey}`);
        if (response.data.articles.length === 0 || response.status !== 200) {
            return res.status(404).json({ error: 'No news found' });
        }
        // console.log('got response from news api');
        res.status(200).json(response.data.articles);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Error fetching news. Please try again later.' });
    }
});


app.post('/verifyLogin', async (req, res) => {
    // console.log("Inside Dashboard");
    try {
        const token = req.body.jwtoken;
        const verifyToken = jwt.verify(token, "THISISSECRETKEYFORTRADERJSJSONWEBTOKENAUTHENTICATION");
        const trader = await TraderModel.findOne({ _id: verifyToken._id, "tokens.token": token });
        if (!trader) {
            res.send("User not found");
        }
        // console.log(trader);
        res.send(trader);
    } catch (e) {
        res.send("No User Signed In");

    }
});

app.post('/cancelOrder', async (req, res) => {
    try {
        const stock_symbol = req.body.symbol;
        const orderId = req.body.orderId;
        const orderType = req.body.orderType;
        console.log('Inside cancel order', stock_symbol, orderId, orderType)
        const stock = await Stock.findOne({ symbol: stock_symbol });
        if (!stock) {
            res.send('fail')
        }
        if (orderType == 'Market Buy') {
            for (let i = 0; i < stock.marketBuyOrderQueue.length; i++) {
                if (stock.marketBuyOrderQueue[i]._id == orderId) {
                    await Stock.findByIdAndUpdate(stock._id, {
                        $pull: {
                            marketBuyOrderQueue: { _id: stock.marketBuyOrderQueue[i]._id }
                        }
                    })
                    res.send('success')
                }
            }
        }
        else if (orderType == 'Market Sell') {
            for (let i = 0; i < stock.marketSellOrderQueue.length; i++) {
                if (stock.marketSellOrderQueue[i]._id == orderId) {
                    await Stock.findByIdAndUpdate(stock._id, {
                        $pull: {
                            marketSellOrderQueue: { _id: stock.marketSellOrderQueue[i]._id }
                        }
                    })
                    res.send('success')
                }
            }
        }
        else if (orderType == 'Limit Buy') {
            for (let i = 0; i < stock.limitBuyOrderQueue.length; i++) {
                if (stock.limitBuyOrderQueue[i]._id == orderId) {
                    await Stock.findByIdAndUpdate(stock._id, {
                        $pull: {
                            limitBuyOrderQueue: { _id: stock.limitBuyOrderQueue[i]._id }
                        }
                    })
                    res.send('success');
                }
            }
        }
        else if (orderType == 'Limit Sell') {
            console.log('Inside Limit Sell');
            for (let i = 0; i < stock.limitSellOrderQueue.length; i++) {
                console.log('ith and orderid - ', stock.limitSellOrderQueue[i]['_id'], orderId)
                if (stock.limitSellOrderQueue[i]['_id'] == orderId) {
                    await Stock.findByIdAndUpdate(stock._id, {
                        $pull: {
                            limitSellOrderQueue: { _id: stock.limitSellOrderQueue[i]._id }
                        }
                    });
                    res.send('success');
                }
            }
        }
        else {
            res.send('fail')
        }
        console.log('I am here outside');

    } catch (error) {
        console.log(error);
        res.send('fail')
    }
})

app.post('/placeOrder', async (req, res) => {

    try {
        const symbol = req.body.symbol;
        const orderData = req.body.orderData;
        const userId = req.body.userId;
        const orderCategory = req.body.orderCategory;

        // const currentTime = new Date();
        // const currentHour = currentTime.getHours();
        // if (currentHour >= 17 || currentHour < 9) {
        //     return res.status(403).json({ error: 'Orders are only allowed between 9:00 AM and 5:00 PM' });
        // }


        const stock = await Stock.findOne({ symbol: symbol });

        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }






        let updateQuery;
        if (orderData.orderType === 'market') {
            const order = {
                userId: userId,
                quantity: orderData.quantity,
                orderDate: new Date(),
                stopLoss: orderData.stopLoss
            };
            if (orderCategory === "Buy") {

                updateQuery = { $push: { marketBuyOrderQueue: order } };
            } else {
                console.log("Inside sell");
                updateQuery = { $push: { marketSellOrderQueue: order } };
            }
        }
        else {
            const order = {
                userId: userId,
                quantity: orderData.quantity,
                price: orderData.priceLimit,
                orderDate: new Date(),
                stopLoss: orderData.stopLoss
            };

            if (orderCategory === "Buy") {
                updateQuery = { $push: { limitBuyOrderQueue: order } };
            }
            else {
                updateQuery = { $push: { limitSellOrderQueue: order } };
            }
        }

        await Stock.findOneAndUpdate(
            { symbol: symbol },
            updateQuery,
            { new: true }
        );

        // console.log("current", stock.buyOrderPrice);
        // console.log(orderData);



        res.status(200).json({ message: 'Order placed successfully' });






    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

});


app.get('/executeOrder', async (req, res) => {
    try {
        const symbol = req.query.symbol;
        const orderType = req.query.orderType;
        const orderCategory = req.query.orderCategory;

        const execute = executeOrder(symbol, orderType, orderCategory);
    } catch (error) {
        console.log(error)
    }
})

app.get('/checkIfUserHolding', async (req, res) => {
    try {

        if (!req.query.userId || !req.query.symbol) {
            // return res.status(400).json({ err: "Missing required parameters" });
            // console.log("Missing required parameters\n");
        }
        const userId = req.query.userId;
        const stockSymbol = req.query.symbol;

        // console.log("Inside checkIfUserHolding checking", stockSymbol);

        const trader = await TraderModel.findById(userId);

        if (trader) {
            let isHolding = false;
            let quantity = 0;

            for (let i = 0; i < trader.investments.length; i++) {
                if (trader.investments[i].symbol === stockSymbol) {
                    isHolding = true;
                    quantity = trader.investments[i].quantity;
                    break; // Exit the loop once the stock is found
                }
            }

            res.status(200).json({ isHolding, quantity });
        } else {

            res.status(404).json({ err: "User or stock not found" });
        }
    }
    catch {
        res.status(500).send("Internal Server Error");
    }
})

app.get('/getOrderBook', async (req, res) => {

    try {
        const symbol = req.query.symbol; // Get symbol from request parameters
        // console.log("Inside orders", symbol);
        // console.log("Symbol", symbol);


        const stock = await Stock.findOne({ symbol: symbol }); // Find stock with the given symbol

        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        // console.log("Stock found", stock);

        // Filter orders based on the symbol
        const limitBuyOrderQueue = stock.limitBuyOrderQueue;
        const limitSellOrderQueue = stock.limitSellOrderQueue;

        // console.log("Limit Buy Orders", limitBuyOrderQueue);
        // console.log("Limit Sell Orders", limitSellOrderQueue);

        res.status(200).json({
            limitBuyOrderQueue: limitBuyOrderQueue,
            limitSellOrderQueue: limitSellOrderQueue
        }); // Send filtered orders as JSON response
    }
    catch {
        res.status(500).send("Internal Server Error");
    }


});


app.get('/analyseStock', async (req, res) => {
    try {
        console.log("Inside Analyse Stock");
        const stockId = req.query.stockId;

        const stock = await Stock.findOne({ _id: stockId });
        if (!stock) {
            console.log("stock not found");
            return res.status(404).json({ error: 'Stock not found' });
        }

        console.log("Stock found", stock.symbol);

        const data = await yahooFinance.quoteSummary(stock.symbol, { modules: ["incomeStatementHistory", "majorHoldersBreakdown", "industryTrend", "indexTrend"] });

        const responseData = {
            incomeStatements: data.incomeStatementHistory?.incomeStatementHistory || [],
            majorHoldersBreakdown: data.majorHoldersBreakdown || {},
            industryTrend: data.industryTrend || {},
            indexTrend: data.indexTrend || {}
        };

        // console.log("responeData", responseData);


        res.status(200).json({ data: responseData });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/getStockInfo', async (req, res) => {
    try {
        const symbol = req.query.symbol;
        const stock = await Stock.findOne({ symbol: symbol });
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getStockInfoById', async (req, res) => {
    try {
        const id = req.query.stockId;
        const stock = await Stock.findById(id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/getTrader', async (req, res) => {
    try {
        const userId = req.query.userId;
        const trader = await TraderModel.findOne({ _id: userId });
        if (!trader) {
            return res.status(404).json({ message: 'Trader not found' });
        }
        res.status(200).json({
            trader: trader
        });
    } catch (error) {
        console.error('Error fetching trader:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getAllStocks', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.status(200).json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/logout', async (req, res) => {
    try {
        // Clear the token from the user's session
        const token = req.cookies.jwtoken;
        const verifyToken = jwt.verify(token, "THISISSECRETKEYFORTRADERJSJSONWEBTOKENAUTHENTICATION");
        const trader = await TraderModel.findOne({ _id: verifyToken._id, "tokens.token": token });
        trader.tokens = trader.tokens.filter(t => t.token !== token);
        await trader.save();

        res.clearCookie('jwtoken'); // Clear the token cookie
        res.redirect('/login'); // Redirect to login page
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/stockInfo/:symbol', async (req, res) => {

    try {
        const symbol = req.params.symbol;
        const stock = await Stock.findOne({ symbol: symbol });
        // console.log(stock)
        if (!stock) {

            return res.status(404).json({ message: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

})

app.get('/pnl', async (req, res) => {

    try {
        const traderId = req.query.traderId;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;

        console.log("From Date", fromDate);
        console.log("To Date", toDate);

        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);

        // Adjust toDate to include transactions occurring on the entire end date
        toDateObj.setHours(23, 59, 59, 999); // Set to end of day




        const sellTransactions = await Transaction.find({ seller_id: traderId.toString(), transaction_date: { $gte: fromDateObj, $lte: toDateObj } });

        const buyTransactions = await Transaction.find({ buyer_id: traderId.toString(), transaction_date: { $gte: fromDateObj, $lte: toDateObj } });

        let realisedProfit = 0;

        sellTransactions.forEach(transaction => {

            realisedProfit += transaction.sellerGain;
        });

        res.status(200).json({
            buyTransactions: buyTransactions,
            sellTransactions: sellTransactions,
            realisedProfit: realisedProfit
        });

    }
    catch {
        res.status(500).send("Internal Server Error");
    }







})


server.listen(3001, () => {
    console.log('Server is running on port 3001');
});
