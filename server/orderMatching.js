const { Order } = require('./models');
const { Stock } = require('./models');


export default async function orderMatching(){
    while(1){

        const stocks = await Stock.find();

        for(let stock of stocks){
            const buyOrders = await Order.find({stockId: stock._id, orderCategory: 'buy'}).sort({priceLimit: -1, orderDate: 1});
            const sellOrders = await Order.find({stockId: stock._id, orderCategory: 'sell'}).sort({priceLimit: 1, orderDate: 1});

            
        }


    }
}