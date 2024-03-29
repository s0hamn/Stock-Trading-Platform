import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';

const StockListCard = ({ id, symbol, companyName, sector, currentPrice, marketCap, previousClose, userId }) => {
  const [isHolding, setIsHolding] = useState(false);

  const [quantity, setQuantity] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const [buyorderQueue, setBuyOrderQueue] = useState([]);

  const [sellOrderQueue, setSellOrderQueue] = useState([]);

  useEffect(() => {
    // Function to check if the user holds the stock
    const checkUserHoldings = async () => {
      try {
        console.log('Checking user holdings...');
        axios.get('http://localhost:3001/checkIfUserHolding', {
          params: {
            userId: userId,
            symbol: symbol
          }
        }).then(response => {
          if (response.data.err) {
            console.log(response.data.err);
            setIsHolding(false);
          } else {
            if (response.data.isHolding) {
              setQuantity(response.data.quantity);
            }
            setIsHolding(response.data.isHolding);
          }
          setQuantity(response.data.quantity);
        }).catch(err =>{
          console.error('Error checking user holdings:', err);
        });
        // If the user holds the stock, set isHolding state to true
        
      } 
      catch (error) {
        console.error('Error checking user holdings:', error);
      }
    };

    // Call the function to check user holdings when the component mounts
    checkUserHoldings();
  }, []); // Empty dependency array means the effect runs only once when the component mounts




  const navigate = useNavigate();

  // const [orderType, setOrderType] = useState('market');
  const [formData, setFormData] = useState({
    orderType: 'market',
    price: '',
    stopLoss: '',
    quantity: '',
    orderDuration: 'intraday'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // You can add your logic to handle form submission here
  };


  const analyseStock = (stockId, userId) => {
    console.log("inside analyse stock event\n")
    axios.get('http://localhost:3001/analyseStock', {
      params: {
        stockId: stockId,
        userId: userId
      }
    }).then(res => {
      console.log(res.data);
      if (res.data == 'error') {
        alert('Error analysing stock, please try again later');
      }
      else {
        setBuyOrderQueue(res.data.buyOrderQueue);
        setSellOrderQueue(res.data.sellOrderQueue);
      }
    }).catch(err => {
      console.error('Error analysing stock:', err);
    });
  }



  return (

    <div className={`bg-white rounded-lg shadow-md p-6 ${isHovered ? 'scale-105' : ''} transition-transform duration-300 ease-in-out m-2`}
      onMouseEnter={() => {
        setIsHovered(true);
        console.log('Mouse entered');
      }} // Set isHovered to true on mouse enter
      onMouseLeave={() => {
        setIsHovered(false);
        console.log('Mouse left');
      }} // Set isHovered to false on mouse leave
    >
      <h2 className="text-xl font-bold mb-2">{companyName}</h2>
      <p className="text-gray-600 mb-4">Symbol: {symbol}</p>
      <div className="flex items-center mb-4">
        <p className={`text-xl font-bold mr-2 ${currentPrice >= previousClose ? 'text-green-600' : 'text-red-600'}`}>
          {currentPrice.toFixed(2)} INR
        </p>
        <div className={`text-sm font-bold ${currentPrice >= previousClose ? 'text-green-600' : 'text-red-600'}`}>
          {currentPrice >= previousClose ? '+' : '-'}
          {Math.abs(currentPrice - previousClose).toFixed(2)} INR
          ({((currentPrice - previousClose) / previousClose * 100).toFixed(2)}%)
        </div>
      </div>
      <p className={`text-sm ${currentPrice >= previousClose ? 'text-green-600' : 'text-red-600'}`}>
        {currentPrice >= previousClose ? 'Price Increased' : 'Price Decreased'} since yesterday's last close
      </p>
      <p className="text-sm mt-2">{isHolding ? 'Holding' : 'Not Holding'}  {isHolding ? `${quantity}` : ''}</p>
      <p className="text-sm mt-2">Sector: {sector}</p>
      <p className="text-sm mt-2">Market Cap: {marketCap}</p>


      <div className={`flex justify-center ${isHovered ? '' : 'hidden'} gap-2 mt-2`}>


        <Popup trigger={<button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
        >
          Buy
        </button>} position="right center"  >

          {close => (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-md w-1/3">
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
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      Place
                    </button>
                    <button
                      type="button"
                      className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                      onClick={() => {
                        close(); // Close the popup
                        setIsHovered(false); // Set isHovered to false
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


        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
          onClick={() => analyseStock(id, userId)}
        >
          Sell
        </button>


        <Popup trigger={open => (<button
          id="analyseButton"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
          position="right center"
          onClick={() => {
            analyseStock(id, userId);
          }}

        >
          Analyse
        </button>)}>



          {close => (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
              <div className=" bg-white p-6 rounded-md w-1/2">
                <div className="flex">
                  {/* Left side - Buying/Selling order queues and company fundamentals */}
                  <div className="w-1/2 p-4 flex flex-col">
                    {/* Company fundamentals */}
                    <div className="mb-4 ">
                      <h3 className="text-xl font-bold mb-2">Company Fundamentals</h3>
                      {/* Add company fundamentals content here */}
                    </div>
                    {/* Buying/Selling order queues */}
                    <div className=''>
                      <h3 className="text-xl font-bold mb-2 ">Order Queues</h3>
                      {/* Add buying/selling order queues content here */}
                    </div>
                  </div>
                  {/* Right side - Stock graph */}
                  <div className="w-1/2 p-4 ">
                    {/* Stock graph */}
                    <h3 className="text-xl font-bold mb-2">Stock Graph</h3>
                    {/* Add stock graph component or content here */}
                  </div>

                </div>
                <div className='flex justify-center'>
                  <button
                    type="button"
                    className="bg-gray-400 hover:bg-gray-600 text-white font-bold p-3 rounded"
                    onClick={close}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}



        </Popup>


      </div >

    </div >


  );

};


export default StockListCard;

