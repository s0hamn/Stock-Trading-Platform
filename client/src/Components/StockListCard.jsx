import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const StockListCard = ({ id, symbol, companyName, sector, currentPrice, marketCap, previousClose }) => {
  const [isHolding, setIsHolding] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();

  // const handleMouseEnter = () => {
  //   setIsHovered(true);
  // }

  // const handleMouseLeave = () => {
  //   setIsHovered(false);
  // }

  const handleButtonClick = (stockId) => {
    navigate(`/viewstock/${stockId}`);
  }

  return (

    <div className={`bg-white rounded-lg shadow-md p-6 ${isHovered ? 'scale-105' : ''} transition-transform duration-300 ease-in-out m-6`}
      onMouseEnter={() => {
        setIsHovered(true);
        console.log('Mouse entered');
      }} // Set isHovered to true on mouse enter
      onMouseLeave={() => {
        setIsHovered(false);
        console.log('Mouse left');
      }} // Set isHovered to false on mouse leave
    >
      <h2 className="text-2xl font-bold mb-2">{companyName}</h2>
      <p className="text-gray-600 mb-4">Symbol: {symbol}</p>
      <div className="flex items-center mb-4">
        <p className={`text-3xl font-bold mr-2 ${currentPrice >= previousClose ? 'text-green-600' : 'text-red-600'}`}>
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
      <p className="text-sm mt-2">{isHolding ? 'Holding' : 'Not Holding'}</p>
      <p className="text-sm mt-2">Sector: {sector}</p>
      <p className="text-sm mt-2">Market Cap: {marketCap}</p>

      {(
        <div className={`flex justify-center ${isHovered ? '' : 'hidden'}`}>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
            onClick={() => handleButtonClick(id)}
          >
            Actions
          </button>
        </div>
      )}


    </div>


  );

};


export default StockListCard;

