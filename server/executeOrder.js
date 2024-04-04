const { Stock } = require('./models');

export default async function executeOrder(stockId){
    
    try{
        const stock = await Stock.findbyId(stockId);

        if(!stock){
            return;
        }

        const buyOrders = await stock.buyOrderQueue;
        const sellOrders = await stock.sellOrderQueue;

        if(buyOrders.length === 0 || sellOrders.length === 0){
            return;
        }

        buyOrders.sort((a, b) => {
            // First, compare by price in descending order
            if (a.priceLimit > b.priceLimit) return -1;
            if (a.priceLimit < b.priceLimit) return 1;
            // If prices are equal, compare by orderDate in ascending order
            return a.orderDate - b.orderDate;
        });
        
        // Sort sell orders
        sellOrders.sort((a, b) => {
            // First, compare by price in ascending order
            if (a.priceLimit < b.priceLimit) return -1;
            if (a.priceLimit > b.priceLimit) return 1;
            // If prices are equal, compare by orderDate in ascending order
            return a.orderDate - b.orderDate;
        });

        
        
        
    }
    catch(err){
        console.log(err);
    }
    


    
}