const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TraderModel = require('./models/Trader');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://sohamnaigaonkar:soham123@cluster0.c2rronj.mongodb.net/Database?retryWrites=true&w=majority&appName=Cluster0')
.then(() => { console.log("connected to the database\n")})
.catch((err) => { console.log(err); })


app.post('/register', async (req, res) => {
    console.log(req.body);
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
        email: req.body.email,
        password: req.body.password
    })
        .then((traders) => {
            if (traders) {
                if (traders.password === req.body.password) {
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