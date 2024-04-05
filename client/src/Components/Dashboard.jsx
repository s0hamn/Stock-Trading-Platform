import React, { useEffect } from 'react'
import Navbar from './Navbar'
import StockCard from './StockCard'
import Loader from './Loader'
import axios, { all } from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie';
import { useState } from 'react';
import io from 'socket.io-client';
import Chart from './Chart'

function Dashboard() {
    const [trader, setTrader] = useState({})

    const [stocks, setStocks] = useState([]);
    const [traderstocks, setTraderStocks] = useState([]);
    const [loader, setLoader] = useState(true)
    // const [isMounted, setIsMounted] = useState(false);
    const [stocksType, setStocksType] = useState('investments');
    const [watchlist, setWatchlist] = useState([]);
    const [totalInvestment, setTotalInvestment] = useState(0);
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();
    const cookies = new Cookies();
    const [chartData, setChartData] = useState({
        companyName: "",
        data: []
    });


    // console.log(cookies.get('jwtoken'));


    useEffect(() => {
        try {
            axios.post('/api/verifyLogin', {
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

        const socket = io('http://localhost:3001', { transports: ['websocket', 'polling', 'flashsocket'] });
        // console.log("Trader investments", trader.investments);
        socket.emit('allStocks');
        // Subscribe to stock updates
        socket.on('stockUpdate', allStocksData => {
            const final = []
            for (let i = 0; i < 100; i++) {
                let opensum = 0;
                let highsum = 0;
                let lowsum = 0;
                let closesum = 0;
                // let volume = 0;
                let date = allStocksData[0].previousHistory[i].date;
                allStocksData.forEach(stock => {
                    opensum += stock.previousHistory[i].open;
                    highsum += stock.previousHistory[i].high;
                    lowsum += stock.previousHistory[i].low;
                    closesum += stock.previousHistory[i].close;
                })

                final.push({
                    x: date,
                    y: [opensum / allStocksData.length, highsum / allStocksData.length, lowsum / allStocksData.length, closesum / allStocksData.length]
                })
            }
            // console.log(final)
            setChartData(final);

        });

        // Cleanup: close WebSocket connection
        return () => socket.close();

    }, []);

    useEffect(() => {
        // Establish WebSocket connection
        // console.log(trader)
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

            });

            // Cleanup: close WebSocket connection
            return () => socket.close();
        }

    }, [trader]);


    // useEffect(() => {
    //     if (trader.watchlist) {
    //         const socket = io('http://localhost:3001', { transports: ['websocket', 'polling', 'flashsocket'] });

    //         socket.emit('watchlistStocks', trader.watchlist);

    //         socket.on("watchlistStocks", watchlistStocks => {
    //             console.log(watchlistStocks);
    //         })

    //         return () => socket.close();

    //     }
    // }, [trader])

    useEffect(() => {
        let total = 0;
        if (stocks.length > 0) {


            stocks.forEach((stock, index) => {
                total += stock.currentPrice * trader.investments[index].quantity;
                setCurrent(total);
            })



        }

        setLoader(false);
    }
        , [stocks])





    return (
        <>
            <div className='flex flex-col h-screen' >
                <div>
                    <Navbar />
                </div>

                {loader ?
                    <div className="h-full flex justify-center items-center">
                        <Loader />
                    </div> :
                    <div className="flex h-full">
                        <div className="flex h-full px-4 py-4 w-1/3 flex-col ">
                            <h2 className="text-lg font-semibold w-full">Portfolio</h2>
                            <div className="h-full w-full overflow-y-scroll">

                                <div className=" flex flex-col w-full pr-4 ">
                                    <div className="text-sm font-medium text-center text-gray-500  border-gray-200 dark:text-gray-400 dark:border-gray-700 mb-2">
                                        <ul className="flex flex-wrap -mb-px">
                                            <button onClick={() => setStocksType('investments')} className="me-2 flex-1">
                                                <a href="#" className={`inline-block p-4 ${stocksType == 'investments' ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" : "border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"}`}>Investments</a>
                                            </button>
                                            <button onClick={() => setStocksType('watchlist')} className="me-2 flex-1">
                                                <a href="#" className={`inline-block p-4 ${stocksType == 'watchlist' ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" : "border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"}`} aria-current="page">Watchlist</a>
                                            </button>

                                        </ul>
                                    </div>

                                    <hr />
                                    {stocksType == "investments" ? traderstocks.map((stock, index) => {
                                        const profit = (stock.quantity * (stocks[index].currentPrice - stock.avg)) / (stock.quantity * stock.avg) * 100;
                                        const profitClass = profit > 0 ? 'text-lime-600' : 'text-orange-600';
                                        return (

                                            <div key={index} className='px-2'>
                                                {console.log(trader._id)}
                                                <StockCard stock={stock} index={index} stocks={stocks} profit={profit} profitClass={profitClass} userId={trader._id} />
                                            </div>
                                        )
                                    }) : "Portfolio is empty"}

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
                            <div className='flex shadow-lg bg-white rounded  flex-col w-full  px-8 py-4 text-lg mb-3 h-1/3 justify-evenly'>
                                <div className='flex text-base w-full justify-between text-slate-400'>
                                    <p>Invested</p>
                                    <p>Current</p>
                                </div>
                                <div className='flex  w-full justify-between'>
                                    <p>{totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                    <p>{current.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                </div>
                                <hr />
                                <div className='flex justify-between'>
                                    <div className='text-slate-400'>P&L</div>
                                    <div className={current - totalInvestment > 0 ? "text-lime-600 flex" : "text-orange-600 flex"}>{current - totalInvestment > 0 ? "+" : ""}{((current - totalInvestment)).toLocaleString(undefined, { maximumFractionDigits: 2 })}


                                        <span className={current - totalInvestment > 0 ? "text-lime-600 bg-lime-200 px-2 py-1 my-auto rounded-full ml-2 text-xs" : "text-orange-600 bg-red-200 px-2 py-1 my-auto rounded-full ml-2 text-xs"}>{current - totalInvestment > 0 ? "+" : ""}{(((current - totalInvestment) / totalInvestment) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%</span></div>
                                </div>
                            </div>


                            <div className='w-full h-2/3 bg-slate-800'>
                                <Chart chartData={chartData} />
                            </div>
                        </div>
                    </div>}



            </div>
        </>
    )
}

export default Dashboard