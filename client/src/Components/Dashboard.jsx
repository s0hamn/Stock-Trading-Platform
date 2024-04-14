import React, { useEffect } from 'react'
import Navbar from './Navbar'
import StockCard from './StockCard'
import OrderCard from './OrderCard'
import Loader from './Loader'
import axios, { all } from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie';
import { useState } from 'react';
import io from 'socket.io-client';
import Chart from './Chart'
import DailyChart from './DailyChart'
import moment from 'moment';
import WatchListStock from './WatchListStock'
const PROXY_URL = import.meta.env.VITE_PROXY_URL;

function Dashboard() {
    const [trader, setTrader] = useState({})
    const [allStocks, setAllStocks] = useState([{}]);
    const [stocks, setStocks] = useState([]);
    const [orderStatus, setOrderStatus] = useState('pending');
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
    const [allTransactions, setAllTransactions] = useState([]);
    const [chartSymbol, setChartSymbol] = useState('RELIANCE.NS');
    function convertIndexToDateTime(index) {
        // Calculate the total minutes from the start time (9:00 AM) using the index
        const totalMinutes = index * 5;

        // Calculate hours and minutes from total minutes
        const hours = Math.floor(totalMinutes / 60) + 9; // Add 9 hours to account for starting from 9:00 AM
        const minutes = totalMinutes % 60;


        // Format hours and minutes to display leading zeros if necessary
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

        // Return the formatted time string
        // if (minutes % 30 === 0) {
        return `${formattedHours}:${formattedMinutes}`;
        // } else {
        //     return '';
        // }
    }

    function calculateTimestampIndex(date) {
        // Calculate the time in minutes since 9:00 AM
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const totalMinutes = (hours - 9) * 60 + minutes;

        // Calculate the index based on 5-minute intervals
        return Math.floor(totalMinutes / 5);
    }

    // useEffect(() => {
    //     axios.get(`/api/stockInfo/${symbol}`)
    //         .then(response => {

    //         })
    //         .catch(error => {
    //             console.error('Error fetching stock information:', error);
    //         });
    // }, []);

    // // console.log(cookies.get('jwtoken'));


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
        const socket = io(PROXY_URL, { transports: ['websocket', 'polling', 'flashsocket'] });

        socket.emit('allTransactions');
        console.log("requesting transactions");
        // Subscribe to stock updates
        socket.on('transactionsUpdate', updatedTransactions => {
            // Update state with new stock data
            setAllTransactions(updatedTransactions);
            // console.log("Client received transactionsUpdate event:", updatedTransactions);
        });

        // Cleanup: close WebSocket connection
        return () => socket.close();
    }, []);

    useEffect(() => {
        // Establish WebSocket connection
        const socket = io(PROXY_URL, { transports: ['websocket', 'polling', 'flashsocket'] });

        socket.emit('allStocks');

        // Subscribe to stock updates
        socket.on('stockUpdate', updatedStocks => {
            // Update state with new stock data
            setAllStocks(updatedStocks);
            console.log('Client received stockUpdate event:', updatedStocks);
        });

        // Cleanup: close WebSocket connection
        return () => socket.close();
    }, []);


    useEffect(() => {
        // Establish WebSocket connection
        // console.log(trader)
        if (trader.investments) {

            const socket = io(PROXY_URL, { transports: ['websocket', 'polling', 'flashsocket'] });
            // console.log("Trader investments", trader.investments);
            socket.emit('someStocks', trader.investments);
            // Subscribe to stock updates
            socket.on('stockUpdate', updatedStocks => {
                // Update state with new stock data
                // console.log('Client received stockUpdate event:', updatedStocks);
                setStocks(updatedStocks);
                setTraderStocks(trader.investments);
                let total = 0;
                trader.investments.forEach((stock, index) => {
                    total += stock.quantity * stock.avg;
                });
                setTotalInvestment(total);
                setLoader(false);

            });

            // Cleanup: close WebSocket connection
            return () => socket.close();
        }

    }, [trader]);

    useEffect(() => {
        if (trader.watchlist) {
            const socket = io(PROXY_URL, { transports: ['websocket', 'polling', 'flashsocket'] });
            socket.emit('someStocks', trader.watchlist);
            socket.on('stockUpdate', updatedStocks => {
                setWatchlist(updatedStocks);
            });
            return () => socket.close();
        }
    }, [trader])

    // useEffect(() => {
    //     console.log(watchlist);
    // }, [watchlist])

    useEffect(() => {
        let total = 0;
        if (stocks.length > 0) {


            stocks.forEach((stock, index) => {
                total += stock.currentPrice * trader.investments[index].quantity;
                setCurrent(total);

                if (stock.symbol == chartSymbol) {
                    const temp = [];
                    const timestamps = [];
                    const previousClose = stock.previousClose;
                    stock.dailyPrices.forEach((date, index) => {
                        if (timestamps.length === 0 || timestamps[timestamps.length - 1] + 1 !== date.timestamp) {
                            for (let i = timestamps.length ? timestamps[timestamps.length - 1] + 1 : 0; i < date.timestamp; i++) {
                                temp.push({
                                    x: convertIndexToDateTime(i),
                                    y: [previousClose, previousClose, previousClose, previousClose]
                                });
                                timestamps.push(i);
                            }
                        }
                        temp.push({
                            x: convertIndexToDateTime(date.timestamp),
                            y: [date.open, date.high, date.low, date.close]
                        });
                        timestamps.push(date.timestamp);
                    });

                    const currentTimeStamp = calculateTimestampIndex(new Date());
                    for (let i = timestamps[timestamps.length - 1] + 1; i <= currentTimeStamp; i++) {
                        temp.push({
                            x: convertIndexToDateTime(i),
                            y: [temp[temp.length - 1].y[3], temp[temp.length - 1].y[3], temp[temp.length - 1].y[3], temp[temp.length - 1].y[3]]
                        });
                    }
                    console.log(temp);
                    setChartData({
                        companyName: stock.companyName,
                        data: temp
                    });
                }
            })
        }


        console.log(stocks);
    }
        , [stocks, chartSymbol])



    function display(allStocks, allTransactions) {
        return (
            <div className='flex flex-col h-screen' >
                <div className=" flex flex-col w-full pr-4 ">
                    <div className="text-sm font-medium text-center text-gray-500  border-gray-200 dark:text-gray-400 dark:border-gray-700 mb-2">
                        <ul className="flex flex-wrap -mb-px">
                            <button onClick={() => setOrderStatus('pending')} className="me-2 flex-1">
                                <a href="#" className={`inline-block p-4 ${orderStatus == 'pending' ? "text-red-600 border-b-2 border-red-600 rounded-t-lg active dark:text-red-600 dark:border-red-500" : "border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"}`}>Pending</a>
                            </button>
                            <button onClick={() => setOrderStatus('executed')} className="me-2 flex-1">
                                <a href="#" className={`inline-block p-4 ${orderStatus == 'executed' ? "text-lime-600 border-b-2 border-lime-600 rounded-t-lg active dark:text-lime-500 dark:border-lime-500" : "border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"}`} aria-current="page">Executed</a>
                            </button>


                        </ul>
                    </div>

                    <hr />
                </div>
                {/* orderStatus == "pending" ? displayPendingOrders(allStocks) : "No pending orders" */}
                {orderStatus == "pending" ? displayPendingOrders(allStocks) : displayExecutedOrders(allTransactions)}
            </div>)
    }

    function displayExecutedOrders(allTransactions) {
        let result = [];
        let count = 0;
        try {
            for (let i = 0; i < allTransactions.length; i++) {
                const formattedDate = moment(allTransactions[i].transaction_date).format("MMMM D, YYYY");
                let symbol;
                for(let i = 0; i < allStocks.length; i++){
                    if(allStocks[i]._id == allTransactions[i].stock_id){
                        symbol = allStocks[i].symbol;
                        break;
                    }
                }
                if (trader._id == allTransactions[i].buyer_id) {
                    result.push(<div key={count} className='px-2'><OrderCard symbol={symbol} quantity={allTransactions[i].quantity} price={allTransactions[i].price} date={formattedDate} orderType={"Buy"} order_id=''/></div>)
                    count++;
                }
                else if (trader._id == allTransactions[i].seller_id) {
                    result.push(<div key={count} className='px-2'><OrderCard symbol={symbol} quantity={allTransactions[i].quantity} price={allTransactions[i].price} date={formattedDate} orderType={"Sell"} order_id='' /></div>)
                    count++;
                }
            }
            console.log("Count - ", count)
            return result;
        }
        catch (err) {
            console.log(err);
        }
    }


    function displayPendingOrders(allStocks) {
        let result = [];
        let count = 0;
        for (let i = 0; i < allStocks.length; i++) {
            try {
                if (allStocks[i].marketBuyOrderQueue.length != 0) {
                    for (let j = 0; j < allStocks[i].marketBuyOrderQueue.length; j++) {
                        if (trader._id == allStocks[i].marketBuyOrderQueue[j].userId) {
                            const formattedDate = moment(allStocks[i].marketBuyOrderQueue[j].orderDate).format("MMMM D, YYYY");
                            result.push(<div key={count} className='px-2'><OrderCard symbol={allStocks[i].symbol} quantity={allStocks[i].marketBuyOrderQueue[j].quantity} price={100} date={formattedDate} orderType="Market Buy" order_id={allStocks[i].marketBuyOrderQueue[j]._id} /></div>)
                            count++;
                        }
                    }

                }
            }
            catch (err) {
                console.log(err);
            }
            try {
                if (allStocks[i].marketSellOrderQueue.length != 0) {
                    for (let j = 0; j < allStocks[i].marketSellOrderQueue.length; j++) {
                        if (trader._id == allStocks[i].marketSellOrderQueue[j].userId) {
                            const formattedDate = moment(allStocks[i].marketSellOrderQueue[j].orderDate).format("MMMM D, YYYY");
                            result.push(<div key={count} className='px-2'><OrderCard symbol={allStocks[i].symbol} quantity={allStocks[i].marketSellOrderQueue[j].quantity} price={100} date={formattedDate} orderType="Market Sell" order_id={allStocks[i].marketSellOrderQueue[j]._id} /></div>)
                            count++;
                        }
                    }

                }
            }
            catch (err) {
                console.log(err);
            }
            try {
                if (allStocks[i].limitBuyOrderQueue.length != 0) {
                    for (let j = 0; j < allStocks[i].limitBuyOrderQueue.length; j++) {
                        if (trader._id == allStocks[i].limitBuyOrderQueue[j].userId) {
                            const formattedDate = moment(allStocks[i].limitBuyOrderQueue[j].orderDate).format("MMMM D, YYYY");
                            result.push(<div key={count} className='px-2'><OrderCard symbol={allStocks[i].symbol} quantity={allStocks[i].limitBuyOrderQueue[j].quantity} price={allStocks[i].limitBuyOrderQueue[j].price} date={formattedDate} orderType={"Limit Buy"} order_id={allStocks[i].limitBuyOrderQueue[j]._id}/></div>)
                            count++;
                        }
                    }

                }
            }
            catch (err) {
                console.log(err);
            }
            try {
                if (allStocks[i].limitSellOrderQueue.length != 0) {
                    for (let j = 0; j < allStocks[i].limitSellOrderQueue.length; j++) {
                        if (trader._id == allStocks[i].limitSellOrderQueue[j].userId) {
                            const formattedDate = moment(allStocks[i].limitSellOrderQueue[j].orderDate).format("MMMM D, YYYY");
                            // console.log('Order id - ', allStocks[i].limitSellOrderQueue[j]._id)
                            result.push(<div key={count} className='px-2'><OrderCard symbol={allStocks[i].symbol} quantity={allStocks[i].limitSellOrderQueue[j].quantity} price={allStocks[i].limitSellOrderQueue[j].price} date={formattedDate} orderType="Limit Sell" order_id={allStocks[i].limitSellOrderQueue[j]._id} /></div>)
                            count++;
                        }
                    }

                }
            }
            catch (err) {
                console.log(err);
            }
        }
        return result;
    }
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
                    <div className="flex h-5/6">
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
                                            <button onClick={() => setStocksType('orders')} className="me-2 flex-1">
                                                <a href="#" className={`inline-block p-4 ${stocksType == 'orders' ? "text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500" : "border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"}`} aria-current="page">Orders</a>
                                            </button>

                                        </ul>
                                    </div>

                                    <hr />
                                    {stocksType == "investments" ? traderstocks.map((stock, index) => {
                                        const profit = (stock.quantity * (stocks[index].currentPrice - stock.avg)) / (stock.quantity * stock.avg) * 100;
                                        const profitClass = profit > 0 ? 'text-lime-600' : 'text-orange-600';
                                        return (

                                            <div key={index} className='px-2'>
                                                {/* {console.log(trader._id)} */}
                                                <StockCard setChartSymbol={setChartSymbol} stock={stock} index={index} stocks={stocks} profit={profit} profitClass={profitClass} userId={trader._id} />
                                            </div>
                                        )
                                    }) : stocksType == "watchlist" ?

                                        watchlist.map((stock, index) => {
                                            return (
                                                <div key={index} className='px-2'>
                                                    <WatchListStock setChartSymbol={setChartSymbol} stock={stock} userId={trader._id} />
                                                </div>
                                            )
                                        })

                                        : stocksType == "orders" ? display(allStocks, allTransactions)
                                            : "Portfolio is empty"}

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
                                <DailyChart data={chartData} />
                            </div>
                        </div>
                    </div>}



            </div >
        </>
    )
}

export default Dashboard