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
        const socket = io('http://localhost:3001');

        // Subscribe to stock updates
        socket.on('stockUpdate', updatedStocks => {
            // Update state with new stock data
            setStocks(updatedStocks);
        });

        // Cleanup: close WebSocket connection
        return () => socket.close();
    }, []);



    useEffect(() => {
        // Fetch stocks from backend
        axios.get('http://localhost:3001/getAllStocks')
            .then(res => {
                setStocks(res.data);
                setFilteredStocks(res.data); // Initially display all stocks
            })
            .catch(error => {
                console.error('Error fetching stocks:', error);
            });

        // Verify login
        try {
            axios.post('http://localhost:3001/verifyLogin', {
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

    return (
        <div>
            <Navbar trader={trader} />
            <div className="flex justify-center mt-4">
                <div className="max-w-xl w-full">
                    {/* Filters */}
                    <div className="flex space-x-4 mb-4">
                        <select
                            value={marketCapFilter}
                            onChange={e => setMarketCapFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1"
                        >
                            <option value="">All Market Caps</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                        </select>
                        <select
                            value={sectorFilter}
                            onChange={e => setSectorFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1"
                        >
                            <option value="">All Sectors</option>
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            {/* Add other sectors */}
                        </select>
                    </div>
                    {/* Stock List */}
                    {filteredStocks.map(stock => (
                        <StockListCard
                            symbol={stock.symbol}
                            companyName={stock.companyName}
                            sector={stock.sector}
                            currentPrice={stock.currentPrice}
                            marketCap={stock.marketCap}
                            previousClose={stock.previousClose}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ListOfStocks;
