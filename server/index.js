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

});


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
            console.log('No investments');
            socket.emit('stockUpdate', stocks);

            return;
        }

        for (let i = 0; i < investments.length; i++) {
            console.log(investments[i].symbol);
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



app.post('/login', async (req, res) => {
    // console.log(req.body);

    const trader = await TraderModel.findOne({
        email: req.body.email
    });

    if (trader) {
        const compare = await comparePassword(req.body.password, trader.password);

        const token = await trader.generateAuthToken();
        console.log("Token", token);
        res.cookie("jwtoken", token, {
            expires: new Date(Date.now() + 300000),
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

app.get('/getAllStocks', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.status(200).json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




server.listen(3001, () => {
    console.log('Server is running on port 3001');
});