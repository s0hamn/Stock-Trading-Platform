// import React from 'react';
import React from 'react';
import axios from 'axios';

async function cancleOrder(symbol, orderType, order_id){
    console.log("function Order id - ", order_id['order_id'])
    console.log('symbol - ', symbol['symbol'])
    console.log('orderType - ', orderType['orderType'])
    await axios.post('/api/cancelOrder', {symbol: symbol['symbol'], orderType: orderType['orderType'], orderId: order_id['order_id']}).then(res => {
      if(res.data == "fail"){
        alert("canellation failed")
      }
      else{
        alert("Order Cancelled")
      }
    }).catch(error => {console.error('Error fetching stocks:', error);});

}
const OrderCard = ({symbol, quantity, price, date, orderType, order_id }) => {
  // console.log("here - order id - ", order_id)
  return (
    <div className="max-w-md mx-auto bg-white  shadow-md overflow-hidden m-2">
        <div className="md:flex">
            <div className="p-8">
                <p className="mt-2 text-gray-500">{symbol}</p>
                <p className="mt-2 text-gray-500">Quantity - {quantity}</p>
                {orderType == "Limit Buy" || orderType == "Limit Sell" || orderType == "Buy" || orderType == "Sell"? <p className="mt-2 text-gray-500">Price - {price}</p>: null}
                <p className="mt-2 text-gray-500">Date - {date}</p>
                <p className="mt-2 text-gray-500">Type - {orderType}</p>
                <button onClick={() => cancleOrder({symbol}, {orderType}, {order_id})}className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
            </div>
        </div>
    </div>
  );
}

export default OrderCard;