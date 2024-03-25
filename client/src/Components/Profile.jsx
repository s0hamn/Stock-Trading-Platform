import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
const Profile = () => {
    const [user, setUser] = useState({});
    const cookies = new Cookies();

    const navigate = useNavigate();


    useEffect(() => {
        try {
            axios.post('/api/verifyLogin', {
                jwtoken: cookies.get('jwtoken'),
            }).then(res => {
                if (res.data === "No User Signed In" || res.data === "User not found") {
                    navigate('/login');
                } else {
                    console.log("hello");
                    setUser(res.data);
                }
            })
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, [])


    function comparePassword(password, hash) {
        const result = bcrypt.compareSync(password, hash);
        // console.log("login result brrrrrrrrrrrr", result);
        return result;
    }
    const handleDeposit = () => {
        const enteredPassword = prompt('Enter your password to deposit funds: ');
        let depositAmount = prompt('Enter the amount to deposit: ');
        depositAmount = Number(depositAmount);
        let verifyPass = comparePassword(enteredPassword, user.password);
        if (verifyPass) {
            alert("Password correct");
            try {
                axios.put('/api/updateDeposit', {
                    jwtoken: cookies.get('jwtoken'),
                    deposit: depositAmount
                }).then(res => {
                    if (res.data == "unsuccessful") {
                        alert("unsuccessful");
                    }
                    else {
                        alert("successful");
                        setUser(res.data);
                    }
                })
            } catch (err) {
                alert('Error');
                // navigate('/login');
            }
        }
        else {
            alert("password wrong");
        }
    };

    const handleWithdraw = () => {
        const enteredPassword = prompt('Enter your password to withdraw funds: ');
        let withdrawAmount = prompt('Enter the amount to withdraw: ');
        withdrawAmount = Number(withdrawAmount);
        let verifyPass = comparePassword(enteredPassword, user.password);
        if (verifyPass) {
            alert("Password correct");
            try {
                axios.put('/api/updateWithdraw', {
                    jwtoken: cookies.get('jwtoken'),
                    withdraw: withdrawAmount
                }).then(res => {
                    if (res.data == "unsuccessful") {
                        alert("unsuccessful");
                    }
                    else {
                        alert("successful");
                        setUser(res.data);
                    }
                })
            } catch (err) {
                alert('Error');
                // navigate('/login');
            }
        }
        else {
            alert("password wrong");
        }
    };
    return (
        <>
            <div className="flex flex-col h-screen">
                <div >
                    <Navbar />
                </div>

                {/* <h1 className="text-center text-6xl font-bold mb-4 mt-10">My Profile</h1> */}
                <div className="flex justify-center items-center h-full p-8">
                    <div className=" bg-white rounded h-full w-full shadow-lg">
                        <div className="flex flex-col w-1/2 h-full">
                            {/* <h2 className="text-center text-4xl font-bold">Personal Information</h2> */}
                            <hr />
                            <form className="p-5">
                                <div className="mb-4 flex justify-between">
                                    <label>Name:</label>
                                    <p>{user.name}</p>
                                </div>
                                <div className="mb-4">
                                    <label>Email:</label>
                                    <p>{user.email}</p>
                                </div>
                                <div className="mb-4">
                                    <label>Account Number:</label>
                                    <p>{user.accountNumber}</p>
                                </div>
                                <div className="mb-4">
                                    <label>PAN Number:</label>
                                    <p>{user.panNumber}</p>
                                </div>
                                <div className="mb-4">
                                    <label>Address:</label>
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
                        <div className="w-1/2">
                            {/* <h2 className="text-center text-4xl font-bold">Available Funds</h2>
                        <hr />
                        <div className="flex p-5">
                            <div className="mb-4 ml-4 mr-40">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Available funds:</label>
                                <p>{user.funds}</p>
                            </div>
                            <button className="border-2 border-gray-300 px-2 py-1 rounded-lg mr-10" onClick={handleDeposit}>Deposit</button>
                            <button className="border-2 border-gray-300 p-2 rounded-lg" onClick={handleWithdraw}>Withdraw</button>
                        </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
