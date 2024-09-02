// import React from 'react';
import React from 'react';
import axios from 'axios';

async function cancleOrder(symbol, orderType, order_id) {
  console.log("function Order id - ", order_id['order_id'])
  console.log('symbol - ', symbol['symbol'])
  console.log('orderType - ', orderType['orderType'])
  await axios.post('' + import.meta.env.VITE_PROXY_URL + '/cancelOrder', { symbol: symbol['symbol'], orderType: orderType['orderType'], orderId: order_id['order_id'] }).then(res => {
    if (res.data == "fail") {
      alert("canellation failed")
    }
    else {
      alert("Order Cancelled")
    }
  }).catch(error => { console.error('Error fetching stocks:', error); });

}
const OrderCard = ({ symbol, quantity, price, date, orderType, order_id }) => {
  // console.log("here - order id - ", order_id)
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden m-4">
  <div className="md:flex items-center">
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <p className={`text-2xl font-semibold ${orderType.includes("Buy") ? "text-green-500" : "text-red-500"}`}>
          {symbol}
        </p>
        <p className="text-gray-500 text-sm">{date}</p>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-700">Quantity</p>
          <p className="text-xl font-medium">{quantity}</p>
        </div>
        {(orderType === "Limit Buy" || orderType === "Limit Sell" || orderType === "Buy" || orderType === "Sell") && (
          <div>
            <p className="text-gray-700">Price</p>
            <p className="text-xl font-medium">{price}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-700">Type</p>
        <p className="text-lg font-medium">{orderType}</p>
      </div>
      {order_id !== "" && (
        <div className="flex justify-end">
          <button
            onClick={() => cancelOrder(order_id)}
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  </div>
</div>


  );
}

export default OrderCard;