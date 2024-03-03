const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TraderModel = require('./models/Trader');
const bcrypt = require('bcrypt');
const app = express();
app.use(cors());
app.use(express.json());

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

    TraderModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        accountNumber: req.body.accountNumber,
        panNumber: req.body.panNumber,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber
    })
        .then((traders) => {
            res.json(traders);
        })
        .catch((err) => {
            res.json(err);
        });

});

app.post('/login', async (req, res) => {
    console.log(req.body);
    TraderModel.findOne({
        email: req.body.email
    })
        .then(async (traders) => {
            if (traders) {
                const compare = await comparePassword(req.body.password, traders.password)
                if (compare) {
                    console.log("Login successful");
                    res.json("Success");

                }
                else {
                    res.json("Wrong password");
                }
            }
            else {
                res.json("User not found");
            }

        })
        .catch((err) => {
            res.json(err);
        });
});



app.listen(3001, () => {
    console.log('Server is running on port 3001');
});