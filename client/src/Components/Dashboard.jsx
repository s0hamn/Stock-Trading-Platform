import React, { useEffect } from 'react'
import Navbar from './Navbar'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie';
import { useState } from 'react';
import io from 'socket.io-client';

function Dashboard() {
    const [trader, setTrader] = useState({})

    const [stocks, setStocks] = useState([]);
    const [traderstocks, setTraderStocks] = useState([]);
    const [loader, setLoader] = useState(true)
    // const [isMounted, setIsMounted] = useState(false);
    const [totalInvestment, setTotalInvestment] = useState(0);
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const cookies = new Cookies();


    // console.log(cookies.get('jwtoken'));


    useEffect(() => {
        try {
            axios.post('http://localhost:3001/verifyLogin', {
                jwtoken: cookies.get('jwtoken'),
            }).then(res => {
                if (res.data == "No User Signed In") {
                    navigate('/login');
                } else if (res.data == "User not found") {
                    navigate('/login');
                }
                else {
                    setTrader(res.data);
                }
            })
        }
        catch (err) {
            console.log(err);
            navigate('/login');
        }

    }, [])

    useEffect(() => {
        // Establish WebSocket connection
        if (trader.investments) {

            const socket = io('http://localhost:3001', { transports: ['websocket', 'polling', 'flashsocket'] });
            // console.log("Trader investments", trader.investments);
            socket.emit('someStocks', trader.investments);
            // Subscribe to stock updates
            socket.on('stockUpdate', updatedStocks => {
                // Update state with new stock data
                console.log('Client received stockUpdate event:', updatedStocks);
                setStocks(updatedStocks);
                setTraderStocks(trader.investments);
                let total = 0;
                trader.investments.forEach((stock, index) => {
                    total += stock.quantity * stock.avg;
                });
                setTotalInvestment(total);


                // console.log('Client received stockUpdate event:', stocks);
            });

            // Cleanup: close WebSocket connection
            return () => socket.close();
        }

    }, [trader]);

    useEffect(() => {
        let total = 0;
        if (stocks.length > 0) {


            stocks.forEach((stock, index) => {
                total += stock.currentPrice * trader.investments[index].quantity;
                setCurrent(total);
            })

            setLoader(false);

        }
    }
        , [stocks])





    return (
        <>
            <div className='flex flex-col h-screen overflow-hidden' >
                <div className='h-1/6 '>
                    <Navbar />
                </div>

                {loader ? <div className="h-5/6 flex justify-center items-center"><svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg></div> : <div className="flex h-5/6">
                    <div className="flex  h-full px-4 w-1/3 flex-col ">
                        <h2 className="text-lg font-semibold w-full mb-4">Portfolio</h2>
                        <div className="h-full w-full">

                            <div className=" flex flex-col w-full h-full overflow-y-scroll pr-4">

                                {traderstocks.map((stock, index) => {
                                    const profit = (stock.quantity * (stocks[index].currentPrice - stock.avg)) / (stock.quantity * stock.avg) * 100;
                                    const profitClass = profit > 0 ? 'text-lime-600' : 'text-orange-600';
                                    return (
                                        <div key={index} className='px-2'>
                                            <div className={`flex justify-between text-xs mb-1 mt-2`}>
                                                <p className='text-slate-400'>Qty. <span className='text-black mr-2'>{stock.quantity}</span>
                                                    Avg. <span className='text-black'>{stock.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                                                <p className={`${profitClass}`}>{profit > 0 ? "+" : ""}{profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</p>
                                            </div>

                                            <div className="flex justify-between">
                                                <h3>{stocks[index].symbol}</h3>
                                                <p className={`${profitClass}`}>{profit > 0 ? "+" : ""}{(stock.quantity * (stocks[index].currentPrice - stock.avg)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                            </div>

                                            <div className="flex justify-between text-xs mb-2 mt-1" >
                                                <p className='text-slate-400'>Invested <span className='text-black'>{(stock.quantity * stock.avg).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                                                <p className='text-slate-400'>LTP. <span className='text-black'>{(stocks[index].currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> <span>({profit > 0 ? "+" : ""}{((stocks[index].currentPrice - stock.avg) / stock.avg).toLocaleString(undefined, { maximumFractionDigits: 2 })}%)</span></p>
                                            </div>

                                            <hr />
                                        </div>
                                    )
                                })}
                                <div>
                                    <div className="flex justify-between my-4">
                                        <h3 className="w-1/4"></h3>
                                        <p></p>
                                        <p></p>
                                        <p></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-2/3 p-4 flex flex-col h-full">
                        <div className='flex shadow-lg bg-white rounded  flex-col w-full p-8 text-lg mb-6'>
                            <div className='flex   text-base w-full justify-between text-slate-400'>
                                <p>Invested</p>
                                <p>Current</p>
                            </div>
                            <div className='flex my-4 w-full justify-between'>
                                <p>{totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                <p>{current.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            </div>
                            <hr />
                            <div className='flex justify-between mt-4'>
                                <div className='text-slate-400'>P&L</div>
                                <div className={current - totalInvestment > 0 ? "text-lime-600 flex" : "text-orange-600 flex"}>{current - totalInvestment > 0 ? "+" : ""}{((current - totalInvestment)).toLocaleString(undefined, { maximumFractionDigits: 2 })}


                                    <span className={current - totalInvestment > 0 ? "text-lime-600 bg-lime-200 px-2 py-1 my-auto rounded-full ml-2 text-xs" : "text-orange-600 bg-red-200 px-2 py-1 my-auto rounded-full ml-2 text-xs"}>{current - totalInvestment > 0 ? "+" : ""}{(((current - totalInvestment) / totalInvestment) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%</span></div>
                            </div>
                        </div>

                        <hr />

                        <div className='w-full h-full bg-slate-800'>

                        </div>
                    </div>
                </div>}



            </div>
        </>
    )
}

export default Dashboard