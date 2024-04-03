import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import BuyPopup from './BuyPopup';
import Modal from 'react-modal';

const StockListCard = ({ id, symbol, companyName, sector, currentPrice, marketCap, previousClose, userId }) => {

  const [isHolding, setIsHolding] = useState(false);

  const [quantity, setQuantity] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const [analyseStockData, setAnalyseStockData] = useState(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    // Function to check if the user holds the stock
    const checkUserHoldings = async () => {
      try {
        console.log('Checking user holdings...');
        axios.get('/api/checkIfUserHolding', {
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
        }).catch(err => {
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
    axios.get('/api/analyseStock', {
      params: {
        stockId: stockId,
        userId: userId
      }
    }).then(res => {
      console.log(res);
      if (res.status === 500 || res.status === 404) {
        alert('Error analysing stock, please try again later');
      }
      else {
        console.log("Analyse stock data:", res.data);
        setAnalyseStockData(res.data.data);
      }
    }).catch(err => {
      console.error('Error analysing stock:', err);
    });
  }

  const addToWatchlist = (stockId, userId) => {

    console.log("Adding stock to watchlist with stockId:", stockId, "and userId:", userId);

    axios.post('/api/addToWatchlist', {
      stockId: stockId,
      userId: userId
    }).then(res => {
      console.log(res.data);
      if (res.status === 500 || res.status === 404) {
        alert('Error adding stock to watchlist, please try again later');
      }
      else if (res.status === 400) {
        alert('Stock is already present in your Watchlist');
      }
      else {
        alert('Stock added to watchlist successfully');
      }
    }).catch(err => {
      console.error('Error adding stock to watchlist:', err);
    });
  }



  return (

    <div className={`bg-white rounded-lg shadow-md p-6 ${isHovered ? 'scale-105' : ''} transition-transform duration-300 ease-in-out m-2 h-80`}
      onMouseEnter={() => {
        setIsHovered(true);
        console.log('Mouse entered');
      }} // Set isHovered to true on mouse enter
      onMouseLeave={() => {
        setIsHovered(false);
        console.log('Mouse left');
      }} // Set isHovered to false on mouse leave
    >
      <h2 className="text-xl font-semibold mb-2">{companyName}</h2>
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
      <div className='flex items-center'>
        <p className={`text-sm mt-2 ${isHolding ? 'text-blue-500' : 'text-black'}`}>
          {isHolding ? 'Holding' : 'Not Holding'} {isHolding ? `${quantity}` : ''}
        </p>
        {isHolding && (<svg className='w-4 h-4 ml-2' fill="#3B82F6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19,6.5H16v-1a3,3,0,0,0-3-3H11a3,3,0,0,0-3,3v1H5a3,3,0,0,0-3,3v9a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3v-9A3,3,0,0,0,19,6.5Zm-9-1a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v1H10Zm10,13a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V13.45H7V14.5a1,1,0,0,0,2,0V13.45h6V14.5a1,1,0,0,0,2,0V13.45h3Zm0-7H4V9.5a1,1,0,0,1,1-1H19a1,1,0,0,1,1,1Z" /></svg>)}
      </div>

      <p className="text-sm mt-2">Sector: {sector}</p>
      <p className="text-sm mt-2">Market Cap: {marketCap}</p>


      <div className={`flex justify-center ${isHovered ? '' : 'hidden'} gap-2 mt-2`}>

        <BuyPopup
          symbol={symbol}
          currentPrice={currentPrice}
          userId={userId}
        />




        <button
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded mt-2"
          onClick={() => addToWatchlist(id, userId)}
        >
          Watchlist
        </button>



        <button
          id="analyseButton"
          className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mt-2"
          position="right center"
          onClick={() => {
            setModalIsOpen(true);
            analyseStock(id, userId);
          }}

        >
          Analyse
        </button>


        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Analyse Stock Modal"
        >

          {analyseStockData && (
            <div className="fixed z-10 inset-0 overflow-y-scroll h-5/6 m-auto w-full">
              <div className="flex items-center justify-center  px-4">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-3/4">
                  <div className="p-6">
                    <button
                      onClick={() => setModalIsOpen(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <div className="popup-content">
                      {/* Income Statements */}
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-2">Income Statements</h2>
                        <ul className="space-y-4">
                          {analyseStockData.incomeStatements?.map((incomeStatement, index) => (
                            <li key={index} className="border-b pb-4">
                              <p className="font-medium mb-2">Income Statement {index + 1}:</p>
                              <div className="grid grid-cols-2 gap-x-4 text-sm">
                                <div>
                                  <p className="m-1">End Date: {incomeStatement.endDate}</p>
                                  <p className="m-1">Total Revenue: {incomeStatement.totalRevenue}</p>
                                  <p className="m-1">Cost of Revenue: {incomeStatement.costOfRevenue}</p>
                                  <p className="m-1">Gross Profit: {incomeStatement.grossProfit}</p>
                                  <p className="m-1">Research and Development: {incomeStatement.researchDevelopment}</p>
                                  <p className="m-1">Selling, General and Administrative: {incomeStatement.sellingGeneralAdministrative}</p>
                                </div>
                                <div>
                                  <p className="m-1">Total Operating Expenses: {incomeStatement.totalOperatingExpenses}</p>
                                  <p className="m-1">Operating Income: {incomeStatement.operatingIncome}</p>
                                  <p className="m-1">Total Other Income/Expense Net: {incomeStatement.totalOtherIncomeExpenseNet}</p>
                                  <p className="m-1">EBIT: {incomeStatement.ebit}</p>
                                  <p className="m-1">Interest Expense: {incomeStatement.interestExpense}</p>
                                  <p className="m-1">Income Before Tax: {incomeStatement.incomeBeforeTax}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Major Holders Breakdown */}
                      <div className="mb-8 border-b pb-4">
                        <h2 className="text-lg font-semibold mb-2">Major Holders Breakdown</h2>
                        <div className="space-y-2 text-sm">
                          <p className="m-1">Insiders Percent Held: {analyseStockData.majorHoldersBreakdown?.insidersPercentHeld}</p>
                          <p className="m-1">Institutions Percent Held: {analyseStockData.majorHoldersBreakdown?.institutionsPercentHeld}</p>
                          <p className="m-1">Institutions Float Percent Held: {analyseStockData.majorHoldersBreakdown?.institutionsFloatPercentHeld}</p>
                          <p className="m-1">Institutions Count: {analyseStockData.majorHoldersBreakdown?.institutionsCount}</p>
                        </div>
                      </div>

                      {/* Industry Trend */}
                      <div className="mb-8 border-b pb-4">
                        <h2 className="text-lg font-semibold mb-2">Industry Trend</h2>
                        <div className="space-y-2">
                          <p className="m-1">Symbol: {analyseStockData.industryTrend?.symbol}</p>
                          <p className="m-1">Estimates:</p>
                          <ul className="list-disc list-inside text-sm">
                            {analyseStockData.industryTrend?.estimates?.map((estimate, index) => (
                              <li key={index} className="m-1">Estimate {index + 1}: {estimate}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Index Trend */}
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Index Trend</h2>
                        <div className="space-y-2 text-sm">
                          <p className="m-1">Symbol: {analyseStockData.indexTrend?.symbol}</p>
                          <p className="m-1">PE Ratio: {analyseStockData.indexTrend?.peRatio}</p>
                          <p className="m-1">PEG Ratio: {analyseStockData.indexTrend?.pegRatio}</p>
                          <p className="m-1">Estimates:</p>
                          <ul className="list-disc list-inside">
                            {analyseStockData.indexTrend?.estimates?.map((estimate, index) => (
                              <li key={index} className="m-1">Period: {estimate.period}, Growth: {estimate.growth}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}



        </Modal>



      </div >

    </div >


  );

};


export default StockListCard;

