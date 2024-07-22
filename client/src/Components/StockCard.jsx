import React from 'react'
import { useState } from 'react';
import BuyPopup from './BuyPopup';
import axios from 'axios';
import Modal from 'react-modal';
import Preloader from './Preloader';


function StockCard({ stock, index, stocks, profit, profitClass, userId, setChartSymbol }) {

    const [isHovered, setIsHovered] = useState(false);

    const [analyseStockData, setAnalyseStockData] = useState(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const analyseStock = (stockId, userId) => {
        console.log("inside analyse stock event\n")
        axios.get(process.env.VITE_PROXY_URL + '/analyseStock', {
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

    return (
        <>
            <div onClick={() => { setChartSymbol(stock.symbol) }} className={` relative cursor-pointer`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} >
                <div >
                    <div className={`flex justify-between text-xs mb-2 mt-3`}>
                        <p className='text-slate-400'>Qty. <span className='text-black mr-2'>{stock.quantity}</span>
                            Avg. <span className='text-black'>{stock.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                        <p className={`${profitClass}`}>{profit > 0 ? "+" : ""}{profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</p>
                    </div>

                    <div className="flex justify-between">
                        <h3>{stocks[index].symbol}</h3>
                        <p className={`${profitClass}`}>{profit > 0 ? "+" : ""}{(stock.quantity * (stocks[index].currentPrice - stock.avg)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>

                    <div className="flex justify-between text-xs mb-3 mt-2" >
                        <p className='text-slate-400'>Invested <span className='text-black'>{(stock.quantity * stock.avg).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                        <p className='text-slate-400'>LTP. <span className='text-black'>{(stocks[index].currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> <span>({profit > 0 ? "+" : ""}{((stocks[index].currentPrice - stock.avg) / stock.avg).toLocaleString(undefined, { maximumFractionDigits: 2 })}%)</span></p>
                    </div>
                </div>

                {isHovered ?
                    <div className='absolute top-0 right-1/3 w-full flex justify-end gap-2'>

                        <BuyPopup
                            orderCategory="Sell"
                            symbol={stocks[index].symbol}
                            currentPrice={stocks[index].currentPrice}
                            userId={userId}
                        />

                        <button
                            id="analyseButton"
                            className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mt-2"
                            position="right center"
                            onClick={() => {
                                setModalIsOpen(true);
                                analyseStock(stocks[index]._id, userId);
                            }}

                        >
                            Analyse
                        </button>


                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={() => {
                                setModalIsOpen(false);
                                setIsHovered(false);
                            }}
                            contentLabel="Analyse Stock Modal"
                        >

                            {analyseStockData ? (
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
                            )
                                : (
                                    <Preloader />
                                )
                            }



                        </Modal>
                    </div> : ""}
            </div >

            <hr />
        </>
    )
}

export default StockCard