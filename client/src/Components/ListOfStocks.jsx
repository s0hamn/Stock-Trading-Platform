import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import StockListCard from './StockListCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import io from 'socket.io-client';


const ListOfStocks = () => {
    const [trader, setTrader] = useState({});
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [marketCapFilter, setMarketCapFilter] = useState('');
    const [sectorFilter, setSectorFilter] = useState('');
    const navigate = useNavigate();
    const cookies = new Cookies();

    useEffect(() => {
        // Establish WebSocket connection
        const socket = io('http://localhost:3001', { transports: ['websocket', 'polling', 'flashsocket'] });

        socket.emit('allStocks');

        // Subscribe to stock updates
        socket.on('stockUpdate', updatedStocks => {
            // Update state with new stock data
            setStocks(updatedStocks);
            console.log('Client received stockUpdate event:', updatedStocks);
        });

        // Cleanup: close WebSocket connection
        return () => socket.close();
    }, []);



    useEffect(() => {
        // Fetch stocks from backend
        axios.get('/api/getAllStocks')
            .then(res => {
                setStocks(res.data);
                setFilteredStocks(res.data); // Initially display all stocks
            })
            .catch(error => {
                console.error('Error fetching stocks:', error);
            });

        // Verify login
        try {
            axios.post('/api/verifyLogin', {
                jwtoken: cookies.get('jwtoken'),
            }).then(res => {
                if (res.data === "No User Signed In" || res.data === "User not found") {
                    navigate('/login');
                } else {
                    setTrader(res.data);
                }
            })
        } catch (err) {
            console.error('Error verifying login:', err);
            navigate('/login');
        }
    }, []);

    // Filter stocks based on market cap and sector
    useEffect(() => {
        let filteredStocks = stocks;

        if (marketCapFilter !== '') {
            filteredStocks = filteredStocks.filter(stock => stock.marketCap === marketCapFilter);
        }

        if (sectorFilter !== '') {
            filteredStocks = filteredStocks.filter(stock => stock.sector === sectorFilter);
        }

        setFilteredStocks(filteredStocks);
    }, [stocks, marketCapFilter, sectorFilter]);

    // Function to handle mouse enter and leave for a specific card


    return (
        <div>
            <Navbar trader={trader} />
            <div className="flex justify-center mt-0">
                <div className="w-full">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg shadow-lg mb-8 flex items-start align-middle">
                        <h2 className="text-lg font-semibold ml-4 mr-12">Filters</h2>
                        <div className="flex justify-center space-x-4 ml-14">
                            <select
                                value={marketCapFilter}
                                onChange={e => setMarketCapFilter(e.target.value)}
                                className="w-52 h-9 border border-gray-300 rounded-md px-2 py-1 bg-white gap-2 mr-4"
                            >
                                <option value="">All Market Caps</option>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                            </select>
                            <select
                                value={sectorFilter}
                                onChange={e => setSectorFilter(e.target.value)}
                                className="w-52 h-9 border border-gray-300 rounded-md px-2 py-1 bg-white "
                            >
                                <option value="">All Sectors</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                {/* Add other sectors */}
                            </select>
                        </div>
                    </div>

                    {/* Stock List */}
                    <div className="w-full flex justify-center">
                        <div className="w-5/6 grid grid-cols-3 ">
                            {filteredStocks.map((stock) => (
                                
                                    <StockListCard
                                        key={stock._id}
                                        id={stock._id}
                                        symbol={stock.symbol}
                                        companyName={stock.companyName}
                                        sector={stock.sector}
                                        currentPrice={stock.currentPrice}
                                        marketCap={stock.marketCap}
                                        previousClose={stock.previousClose}
                                        userId={trader._id}
                                    />
                                
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default ListOfStocks;
