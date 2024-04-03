const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const TraderModel = require('./models/Trader');
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

var request = require('request');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);



app.use(cookies());
app.use(cors(
    {
        origin: true,
        credentials: true
    }
));
app.use(express.json());

io.on('connection', socket => {
    console.log('Client connected');


    socket.on('allStocks', () => {
        console.log('Client requested all stocks');
        sendAllStocks(socket);

        setInterval(() => {
            sendAllStocks(socket);
        }, 10000);
    });

    socket.on('someStocks', (investments) => {
        console.log('Client requested some stocks');
        sendStocks(socket, investments);

        setInterval(() => {
            sendStocks(socket, investments);
        }, 10000);
    });

    socket.on('stockChart', async (symbol) => {
        console.log('Client requested stock chart:', symbol);
        sendStockChart(socket, symbol);

        setInterval(() => {
            sendStockChart(socket, symbol);
        }, 10000);

    });

    socket.on('watchlistStocks', async (watchlist) => {
        console.log('Client requested watchlist stocks');
        sendWatchlist(socket, watchlist);

        setInterval(() => {
            sendWatchlist(socket, watchlist);
        }, 10000);
    });

});

async function sendWatchlist(socket, watchlist) {
    const stocks = []
    console.log("Watchlist requested for: ", watchlist)
    try {
        watchlist.forEach(stockid => {
            const stock = Stock.findOne({ _id: stockid });
            console.log(stock);
            stocks.push(stock);
        });
        console.log(stocks);
        socket.emit("watchlistStocks", stocks);
    } catch (error) {
        // console.log("Error", error);
        socket.emit('watchlistStocks', { message: 'Internal server error' });

    }
}

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
        user: 'seprojectsem6stocktrading@gmail.com',
        pass: 'ydecjkbocsmjnpkk',
    },
});



function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
function sendOTP(email, otp) {
    const mailOptions = {
        from: 'seprojectsem6stocktrading@gmail.com', // Your Gmail email address
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


mongoose.connect('mongodb+srv://sohamnaigaonkar:soham123@cluster0.c2rronj.mongodb.net/Database?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => { console.log("connected to the database\n") })
    .catch((err) => { console.log(err); })


async function comparePassword(password, hash) {
    const result = await bcrypt.compareSync(password, hash);
    // console.log("login result brrrrrrrrrrrr", result);
    return result;
}


app.post('/register', async (req, res) => {
    console.log(req.body);
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

app.post('/addToWatchlist', async (req, res) => {
    try {
        const stockId = req.body.stockId;
        const userId = req.body.userId;

        const trader = await TraderModel.findById(userId);

        if (!trader) {
            return res.status(404).send("Trader not found");
        }

        for (let i = 0; i < trader.watchlist.length; i++) {
            if (trader.watchlist[i].equals(stockId)) {
                return res.status(400).send("Stock already exists in watchlist");
            }
        }

        trader.watchlist.push(stockId);
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

    const trader = await TraderModel.findOne({
        email: req.body.email
    });

    if (trader) {
        const compare = await comparePassword(req.body.password, trader.password);

        const token = await trader.generateAuthToken();
        // console.log("Token", token);
        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 1800000),
            httpOnly: true
        });

        if (!compare) {
            res.json({ result: "Wrong password" });
        }
        else {
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
        const token = req.cookies.jwtoken;
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

app.post('/verifyLogin', async (req, res) => {
    // console.log("Inside Dashboard");
    try {
        const token = req.cookies.jwtoken;
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

app.post('/placeOrder', async (req, res) => {

    try {
        const symbol = req.body.symbol;
        const orderData = req.body.orderData;
        const userId = req.body.userId;

        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        if (currentHour >= 17 || currentHour < 9) {
            return res.status(403).json({ error: 'Orders are only allowed between 9:00 AM and 5:00 PM' });
        }


        const stock = await Stock.findOne({ symbol: symbol });

        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }




        const order = {
            userId: userId,
            orderType: orderData.orderType,
            quantity: orderData.quantity,
            priceLimit: orderData.priceLimit,
            orderCategory: orderData.orderCategory,
            orderDate: new Date(),
            stopLoss: orderData.stopLoss
        };

        let updateQuery;
        if (orderData.orderCategory === 'buy') {
            updateQuery = { $push: { buyOrderQueue: order } };
        }
        else {
            updateQuery = { $push: { sellOrderQueue: order } };
        }

        await Stock.findOneAndUpdate(
            { symbol: symbol },
            updateQuery,
            { new: true }
        );

        res.status(200).json({ message: 'Order placed successfully' });






    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

});

app.get('/checkIfUserHolding', async (req, res) => {
    try {

        if (!req.query.userId || !req.query.symbol) {
            // return res.status(400).json({ err: "Missing required parameters" });
            console.log("Missing required parameters\n");
        }
        const userId = req.query.userId;
        const stockSymbol = req.query.symbol;

        console.log("Inside checkIfUserHolding checking", stockSymbol);

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
        console.log("Inside orders", symbol);



        const stock = await Stock.findOne({ symbol: symbol }); // Find stock with the given symbol

        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        // Filter orders based on the symbol
        const buyOrders = stock.buyOrderQueue;
        const sellOrders = stock.sellOrderQueue;


        res.status(200).json({
            buyOrders: buyOrders,
            sellOrders: sellOrders
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

app.get('/getTrader', async (req, res) => {
    try {
        const symbol = req.query.userId;
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


server.listen(3001, () => {
    console.log('Server is running on port 3001');
});