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
            axios.post('http://localhost:3001/dashboard', {
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


    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen bg-gray-200">
                <div className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md">
                    <h1 className="text-center text-2xl font-bold">Welcome {trader.name}</h1>
                    <p className="text-center text-lg">Email: {trader.email}</p>
                    <p className="text-center text-lg">Account Number: {trader.accountNumber}</p>
                    <p className="text-center text-lg">PAN Number: {trader.panNumber}</p>
                    <p className="text-center text-lg">Address: {trader.address}</p>
                    <p className="text-center text-lg">Phone Number: {trader.phoneNumber}</p>
                </div>
            </div>

        </>
    )
}

export default Dashboard