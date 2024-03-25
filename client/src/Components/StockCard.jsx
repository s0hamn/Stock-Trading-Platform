import React from 'react'

function StockCard({ stock, index, stocks, profit, profitClass }) {
    return (
        <>
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

            <hr />
        </>
    )
}

export default StockCard