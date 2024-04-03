import React from 'react'
import { useState } from 'react';
import BuyPopup from './BuyPopup';
function StockCard({ stock, index, stocks, profit, profitClass, userId }) {

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };
    return (
        <>
            <div className='relative' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} >
                <div className={`${isHovered ? "opacity-85" : ""}`}>
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
                    <div className='absolute top-0 right-1/3 w-full flex justify-end'>
                        <button className='mr-2 bg-indigo-500 hover:bg-indigo-700 text-white py-2 px-4 rounded mt-2'>
                            <BuyPopup
                                text="Sell"
                                symbol={stock.symbol}
                                currentPrice={stock.currentPrice}
                                userId={userId}
                            />
                        </button>
                        <button className='bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mt-2'>Analyse</button>
                    </div> : ""}
            </div >

            <hr />
        </>
    )
}

export default StockCard