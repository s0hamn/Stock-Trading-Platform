import React, { useEffect } from 'react'
import Navbar from './Navbar'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {

    const navigate = useNavigate();

    const callDashboard = async () => {
        try {
            const res = await axios.get('http://localhost:3001/dashboard', {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            const data = await res.data();
            console.log(data);

            if (res.status !== 200) {
                throw new Error(res.error);
            }
        }
        catch (err) {
            console.log(err);
            navigate('/login');
        }
    }


    useEffect(() => {
        callDashboard();
    }, [])

    return (
        <>
            <Navbar />

        </>
    )
}

export default Dashboard