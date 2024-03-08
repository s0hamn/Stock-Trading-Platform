import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Navbar from './Navbar'
// import { navigate } from '@reach/router';

const Profile = () => {
    const [user, setUser] = useState({});
    const cookies = new Cookies();

    useEffect(() => {
        try {
            axios.post('http://localhost:3001/dashboard', {
                jwtoken: cookies.get('jwtoken'),
            }).then(res => {
                if (res.data === "No User Signed In" || res.data === "User not found") {
                    navigate('/login');
                } else {
                    setUser(res.data);
                }
            })
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, [])

    return (
        <>
        <Navbar />
            <div className="flex flex-col justify-center items-center h-screen bg-gray-200 mt-4 mb-4">
                <h1 className="text-center text-6xl font-bold mb-4 mt-10">My Profile</h1>
                <div className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md w-4/5 mx-auto">
                    <h2 className="text-center text-4xl font-bold">Personal Information</h2>
                    <hr />
                    <form className="p-5">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                            <p>{user.name}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                            <p>{user.email}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Account Number:</label>
                            <p>{user.accountNumber}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">PAN Number:</label>
                            <p>{user.panNumber}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                            <p>{user.address}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
                            <p>{user.phoneNumber}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Available funds</label>
                            <p>{user.funds}</p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Profile;