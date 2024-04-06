// import React from 'react';
import React from 'react';

const OrderCard = ({symbol, quantity, price, date, orderType }) => {
  return (
    <div className="max-w-md mx-auto bg-white  shadow-md overflow-hidden m-2">
        <div className="md:flex">
            <div className="p-8">
                <p className="mt-2 text-gray-500">{symbol}</p>
                <p className="mt-2 text-gray-500">Quantity - {quantity}</p>
                {orderType == "Limit Buy" || orderType == "Limit Sell" || orderType == "Buy" || orderType == "Sell"? <p className="mt-2 text-gray-500">Price - {price}</p>: null}
                <p className="mt-2 text-gray-500">Date - {date}</p>
                <p className="mt-2 text-gray-500">Type - {orderType}</p>
            </div>
        </div>
    </div>
  );
}

export default OrderCard;