import React, { useEffect } from 'react'
import Navbar from './Navbar'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie';
import { useState } from 'react';

function Dashboard() {
    const [trader, setTrader] = useState({})

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

        setStocks([
            {
                name: "Apple",
                change: 2.5,
                changePercent: 0.5,
                currentPrice: 150
            },
            {
                name: "Tesla",
                change: 5.5,
                changePercent: 0.7,
                currentPrice: 600
            },
            {
                name: "Microsoft",
                change: 1.5,
                changePercent: 0.3,
                currentPrice: 300
            }
        ])
    }, [])

    const [stocks, setStocks] = useState([]);



    return (
        <>
            <Navbar />
            <div className="flex">
                <div className="w-1/3 p-4">
                    <h2 className="text-lg font-bold mb-4">Watchlist</h2>
                    <ul className="w-full space-y-4">
                        {stocks.map((stock, index) => (
                            <li key={index} className="flex w-full justify-between border p-2 rounded shadow">
                                <h3 className="w-1/4 font-bold">{stock.name}</h3>
                                <p>{stock.change}</p>
                                <p>{stock.changePercent}</p>
                                <p style={{ color: stock.change >= 0 ? 'green' : 'red' }}>{stock.currentPrice}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-2/3 p-4">
                    {/* Other section goes here */}
                </div>
            </div>
        </>
    )
}

export default Dashboard