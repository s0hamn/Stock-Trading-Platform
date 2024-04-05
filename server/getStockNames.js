const mongoose = require('mongoose');
const Stock = require('./models/Stock'); // Assuming your stock model file path

mongoose.connect('mongodb+srv://sohamnaigaonkar:soham123@cluster0.c2rronj.mongodb.net/Database?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => { console.log("connected to the database\n") })
    .catch((err) => { console.log(err); })
// Function to retrieve all stock names
async function getAllStockNames() {
    try {
        // Find all stocks and project only the companyName field
        const stocks = await Stock.find({}, 'companyName');
        // Extract companyName values from the results
        const stockNames = stocks.map(stock => stock.companyName);
        return stockNames;
    } catch (error) {
        console.error('Error retrieving stock names:', error);
        return [];
    } finally {
        // Close the database connection
        mongoose.disconnect();
    }
}

// Usage example
getAllStockNames()
    .then(stockNames => {
        console.log('Stock Names:', stockNames);
        // You can use stockNames array as needed
    })
    .catch(error => console.error('Error:', error));
