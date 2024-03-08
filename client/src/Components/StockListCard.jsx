import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// const StockListCard = () => {
//   const [stockData, setStockData] = useState(null);
//   const [isHolding, setIsHolding] = useState(false);
//   const { symbol } = useParams();
//   console.log("inside the card component")

//   useEffect(() => {
//     const fetchStockData = async () => {
//       try {
//         // headers: {
//           //   Authorization: localStorage.getItem('token'), // Assuming you store the JWT token in localStorage
//           // },
//         const response = await axios.get('http://localhost:3001/getStockInfo', {
//             params: {
//                 symbol: symbol
//             }        
//         });
//         console.log(response.data);
//         console.log("hii inside useeffect")
//         setStockData(response.data);
//         // Check if the current user owns this stock
//         // const userStockResponse = await axios.get('/api/user/stock', {
//         //   params: { symbol },
//         //   headers: {
//         //     Authorization: localStorage.getItem('token'), // Assuming you store the JWT token in localStorage
//         //   },
//         // });
//         // setIsHolding(userStockResponse.data.isHolding);
//       } catch (error) {
//         console.error('Error fetching stock data:', error);
//       }
//     };

//     fetchStockData();
//   }, [symbol]);

//   if (!stockData) {
//     return <div>Loading...</div>;
//   }

//   const { stockSymbol, companyName, sector, currentPrice, marketCap, previousClose, priceHistory, dailyPrices } = stockData;

//   return (
//     <>
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-2xl font-bold mb-2">{companyName}</h2>
//       <p className="text-gray-600 mb-4">Symbol: {symbol}</p>
//       <div className="flex items-center mb-4">
//         <p className={`text-3xl font-bold mr-2 ${currentPrice >= previousClose ? 'text-green-600' : 'text-red-600'}`}>
//           {currentPrice.toFixed(2)} INR
//         </p>
//         <div className={`text-sm font-bold ${currentPrice >= previousClose ? 'text-green-600' : 'text-red-600'}`}>
//           {currentPrice >= previousClose ? '+' : '-'}
//           {Math.abs(currentPrice - previousClose).toFixed(2)} INR
//           ({((currentPrice - previousClose) / previousClose * 100).toFixed(2)}%)
//         </div>
//       </div>
//       <p className={`text-sm ${currentPrice >= previousClose ? 'text-green-600' : 'text-red-600'}`}>
//         {currentPrice >= previousClose ? 'Price Increased' : 'Price Decreased'} since yesterday's last close
//       </p>
//       <p className="text-sm mt-2">{isHolding ? 'Holding' : 'Not Holding'}</p>
//       <p className="text-sm mt-2">Sector: {sector}</p>
//       <p className="text-sm mt-2">Market Cap: {marketCap}</p>
//     </div>
//     </>
//   );
  
// };

const StockListCard = ({ symbol, companyName, sector, currentPrice, marketCap, previousClose }) => {
    const [isHolding, setIsHolding] = useState(false);
  
    // if (!symbol || !companyName || !sector || !currentPrice || !marketCap || !previousClose) {
    //   return <div>Loading...</div>;
    // }
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
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
      </div>
    );
  };
  

export default StockListCard;

