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
                    <div className="flex bg-white rounded h-full w-full shadow-lg">
                        <div className="flex flex-col w-1/2 h-full p-10">
                            <h6 className="text-center text-xl font-semibold">Personal Information</h6>
                            <form className="p-5">
                                <div className="my-5 flex justify-between">
                                    <label>Name:</label>
                                    <p>{user.name}</p>
                                </div>
                                <hr />
                                <div className="my-5 flex justify-between">
                                    <label>Email:</label>
                                    <p>{user.email}</p>
                                </div>
                                <hr />
                                <div className="my-5 flex justify-between">
                                    <label>Account Number:</label>
                                    <p>{user.accountNumber}</p>
                                </div>
                                <hr />
                                <div className="my-5 flex justify-between">
                                    <label>PAN Number:</label>
                                    <p>{user.panNumber}</p>
                                </div>
                                <hr />
                                <div className="my-5 flex justify-between">
                                    <label>Address:</label>
                                    <p>{user.address}</p>
                                </div>
                                <hr />
                                <div className="my-5 flex justify-between">
                                    <label>Phone Number:</label>
                                    <p>{user.phoneNumber}</p>
                                </div>
                                <hr />
                                <div className="my-5 flex justify-between">
                                    <label >Available funds</label>
                                    <p>{user.funds}</p>
                                </div>
                                <hr />
                            </form>
                        </div>
                        <div className="w-1/2 h-full p-10">
                            <h2 className="text-center text-xl font-semibold">Available Funds</h2>
                            <div className="flex flex-col p-5">
                                <div className="my-5 flex justify-between">
                                    <label className="block">Available funds:</label>
                                    <p>{user.funds}</p>
                                </div>
                                <hr />

                                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 my-3 rounded " onClick={handleDeposit}>
                                    Deposit
                                </button>
                                <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 my-2 border border-blue-500 hover:border-transparent rounded" onClick={handleWithdraw}>
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
