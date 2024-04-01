import React from "react";
import Popup from 'reactjs-popup';
import { useState, useEffect } from 'react';
import axios from 'axios';



const BuyPopup = ({ symbol, currentPrice , userId }) => {

    const [buyOrderQueue, setBuyOrderQueue] = useState([]);

    const [sellOrderQueue, setSellOrderQueue] = useState([]);

    const [popupOpen, setPopupOpen] = useState(false);

    const [formData, setFormData] = useState({
        orderType: 'market',
        priceLimit: 0,
        stopLoss: 0,
        quantity: 0,
        orderDuration: 'intraday',
        orderCategory: 'buy'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        
        if(formData.quantity <= 0){
            alert("Please enter valid quantity");
            return;
        }
        if(formData.orderType === 'limit' && formData.price <= 0){
            alert("Please enter valid price");
            return;
        }
        if(formData.stopLoss >= currentPrice){
            alert("Please enter valid stop loss");
            return;
        }

        // send order to backend

        axios.post('/api/placeOrder',{
            symbol: symbol,
            orderData: formData,
            userId: userId,
        }).then(res => {
            



        }).catch(err => {
            console.error('Error placing order:', err);
        });


    };



    useEffect(() => {
        let intervalId;

        const fetchOrders = async () => {
            try {
                // Fetch orders from backend API
                const response = await axios.get(`/api/getOrderBook/`, {
                    params: {
                        symbol: symbol
                    }
                });
                if (response.status !== 200) {
                    console.error('Error fetching orders:', response);
                    return;
                }
                const orders = response.data.orders;
                console.log("fetched orders for ", symbol);
                
                // Filter orders into buy and sell queues
                const buyOrders = response.data.buyOrders;
                const sellOrders = response.data.sellOrders;

                // Sort orders by price
                buyOrders.sort((a, b) => b.priceLimit - a.priceLimit);
                sellOrders.sort((a, b) => a.priceLimit - b.priceLimit);

                // Update state with the new order queues
                setBuyOrderQueue(buyOrders);
                setSellOrderQueue(sellOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        const startFetchingOrders = () => {
            intervalId = setInterval(fetchOrders, 1000); // Fetch orders every second
            fetchOrders(); // Fetch orders immediately
        };

        const stopFetchingOrders = () => {
            clearInterval(intervalId);
        };

        if (popupOpen) {
            startFetchingOrders();
        } else {
            stopFetchingOrders();
        }

        return () => {
            stopFetchingOrders();
        };
    }, [popupOpen, symbol]); // Include symbol in the dependency array to re-fetch orders when it changes




    return (
        <Popup trigger={
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
                Buy
            </button>} 
            position="right center"
            open={popupOpen}
            onOpen={() => setPopupOpen(true)}
            onClose={() => setPopupOpen(false)}
        >

            {close => (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50 ">
                    <div className="bg-white p-6 rounded-md w-1/2 h-4/5 overflow-y-scroll">
                        <h3 className="text-xl font-bold mb-4">Buy   {symbol}    {currentPrice.toFixed(2)}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">
                                    Order Type:
                                </label>
                                <div className="flex">
                                    <label className="inlin</div>e-flex items-center mr-4">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="market"
                                            checked={formData.orderType === 'market'}
                                            onChange={handleInputChange}
                                        />
                                        <span className="ml-2">Market Order</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="orderType"
                                            value="limit"
                                            checked={formData.orderType === 'limit'}
                                            onChange={handleInputChange}
                                        />
                                        <span className="ml-2">Limit Order</span>
                                    </label>
                                </div>
                            </div>
                            {formData.orderType === 'limit' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-2" htmlFor="price">
                                            Price:
                                        </label>
                                        <input
                                            type="text"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="Enter price"
                                            className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                        />
                                    </div>

                                </>
                            )}
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2" htmlFor="stopLoss">
                                    Stop Loss:
                                </label>
                                <input
                                    type="text"
                                    id="stopLoss"
                                    name="stopLoss"
                                    value={formData.stopLoss}
                                    onChange={handleInputChange}
                                    placeholder="Enter stop loss"
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2" htmlFor="quantity">
                                    Quantity:
                                </label>
                                <input
                                    type="text"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    placeholder="Enter quantity"
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Order Duration:</label>
                                <div className="flex">
                                    <label className="inline-flex items-center mr-4">
                                        <input
                                            type="radio"
                                            name="orderDuration"
                                            value="intraday"
                                            checked={formData.orderDuration === 'intraday'}
                                            onChange={handleInputChange}
                                        />
                                        <span className="ml-2">Intraday</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="orderDuration"
                                            value="cnc"
                                            checked={formData.orderDuration === 'cnc'}
                                            onChange={handleInputChange}
                                        />
                                        <span className="ml-2">CNC</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-center items-center">
                                <div className="bg-white rounded-md w-1/2 overflow-x-hidden">
                                    <h4 className="font-bold text-xs mb-2 text-center">Buy Order Queue:</h4>
                                    <table className="w-full text-xs text-center">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2">No.</th>
                                                <th className="px-4 py-2 ">Price</th>
                                                <th className="px-4 py-2">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {buyOrderQueue.slice(0, 7).map((order, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{index + 1}</td>
                                                    <td className="px-4 py-2">{order ? order.price : 0}</td>
                                                    <td className="px-4 py-2">{order ? order.quantity : 0}</td>
                                                </tr>
                                            ))}
                                            {/* Padding with zeros if less than 10 orders */}
                                            {Array.from({ length: Math.max(7 - buyOrderQueue.length, 0) }).map((_, index) => (
                                                <tr key={index + buyOrderQueue.length}>
                                                    <td className="px-4 py-2">{buyOrderQueue.length + index + 1}</td>
                                                    <td className="px-4 py-2">0</td>
                                                    <td className="px-4 py-2">0</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan="2" className="px-4 py-2 font-bold">Total Quantity:</td>
                                                <td className="px-4 py-2 font-bold">
                                                    {buyOrderQueue.reduce((acc, curr) => acc + curr.quantity, 0)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-white rounded-md w-1/2 ml-4 overflow-x-hidden">
                                    <h4 className="font-bold text-xs mb-2 text-center">Sell Order Queue:</h4>
                                    <table className="w-full text-xs text-center">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2">No.</th>
                                                <th className="px-4 py-2">Price</th>
                                                <th className="px-4 py-2">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sellOrderQueue.slice(0, 7).map((order, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{index + 1}</td>
                                                    <td className="px-4 py-2">{order ? order.price : 0}</td>
                                                    <td className="px-4 py-2">{order ? order.quantity : 0}</td>
                                                </tr>
                                            ))}
                                            {/* Padding with zeros if less than 10 orders */}
                                            {Array.from({ length: Math.max(7 - sellOrderQueue.length, 0) }).map((_, index) => (
                                                <tr key={index + sellOrderQueue.length}>
                                                    <td className="px-4 py-2">{sellOrderQueue.length + index + 1}</td>
                                                    <td className="px-4 py-2">0</td>
                                                    <td className="px-4 py-2">0</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan="2" className="px-4 py-2 font-bold">Total Quantity:</td>
                                                <td className="px-4 py-2 font-bold">
                                                    {sellOrderQueue.reduce((acc, curr) => acc + curr.quantity, 0)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>



                            <div className="flex justify-center gap-11 m-4">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                                    onSubmit={handleSubmit}
                                >
                                    Place
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => {
                                        close(); // Close the popup
                                        // setIsHovered(false); // Set isHovered to false
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>


            )}


        </Popup>
    )
};

export default BuyPopup;