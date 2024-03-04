import React, { useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Login = () => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        otp: '',
        showOTPField: false,
    });

    

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // axios.defaults.withCredentials = true;

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/login', {
            email: form.email,
            password: form.password,
        })
            .then((res) => {
                console.log(res);
                if (res.data === "OTP") {
                    setForm({ ...form, showOTPField: true });
                } else if (res.data === "Success") {
                    alert("Login Successful");
                    navigate('/');
                } else {
                    alert(res.data);
                }
    
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleOTPSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/verifyOTP', {
            email: form.email,
            otp: form.otp,
        })
        .then((res) => {
            console.log(res);
            if (res.data === "Success") {
                alert("OTP Verified. Login Successful");
                navigate('/');
            } else {
                alert("Invalid OTP");
            }
        })
        .catch((err) => {
            console.error('Error:', err);
        });
    };


    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen bg-gray-200">
                <form
                    onSubmit={!form.showOTPField ? handleSubmit : handleOTPSubmit}
                    className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md"
                >
                    {form.showOTPField && (
                        <h1 className="text-2xl font-semibold mb-4 text-center">Enter OTP</h1>
                    )}
                    {!form.showOTPField && (
                        <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
                    )}

                    <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
                    { !form.showOTPField && (<input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />)}

                    { !form.showOTPField && (<input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />)}

                    {form.showOTPField && (
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded"
                        />
                    )}


                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {!form.showOTPField ? "Login" : "Submit OTP"}
                    </button>
                    <Link to="/register"><p className="text-center text-blue-500 hover:underline">Don't have an account? Register Instead</p></Link>
                </form>
            </div>
        </>
    );
};

export default Login;