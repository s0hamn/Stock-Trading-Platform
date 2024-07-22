import React, { useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        accountNumber: '',
        panNumber: '',
        address: '',
        phoneNumber: '',
        otp: '',
        showOTPField: false,
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
        axios.post(process.env.VITE_PROXY_URL + '/register', {
            name: form.name,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            accountNumber: form.accountNumber,
            panNumber: form.panNumber,
            address: form.address,
            phoneNumber: form.phoneNumber
        })
            .then((res) => {
                console.log(res);
                if (res.data.type === 'OTP') {
                    setForm({ ...form, showOTPField: true });
                }
                else if (res.data.error) {
                    alert(res.data.error.errorMessage);
                }
            })
            .catch((err) => {
                console.log(err);
                alert(err.response.data.errorMessage || 'Registration failed');
            });

    };

    const handleOTPSubmit = (e) => {
        e.preventDefault();
        axios.post(process.env.VITE_PROXY_URL + '/verifyOTP', {
            name: form.name,
            email: form.email,
            password: form.password,
            confirmPassword: form.confirmPassword,
            accountNumber: form.accountNumber,
            panNumber: form.panNumber,
            address: form.address,
            phoneNumber: form.phoneNumber,
            otp: form.otp,
        })
            .then((res) => {
                console.log(res);
                if (res.data === "Success") {
                    alert("OTP Verified. Registration Successful");
                    setForm({ ...form, showOTPField: false });
                    navigate('/login');
                } else {
                    alert("Invalid OTP");
                }
            })
            .catch((err) => {
                console.error('Error:', err);
                alert(err);
            });
    };




    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-120 bg-gray-100 p-12 ">
                <form
                    onSubmit={!form.showOTPField ? handleSubmit : handleOTPSubmit}
                    className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md w-1/2"
                >
                    {!form.showOTPField ? (
                        <>
                            <h1 className="text-2xl font-semibold mb-4 text-center">Register</h1>

                            {error && <p className="text-red-500 text-center m-10">{error}</p>}
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />

                            <input
                                type="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />

                            <input
                                type="text"
                                name="accountNumber"
                                placeholder="Account Number"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />
                            <input
                                type="text"
                                name="panNumber"
                                placeholder="PAN Number"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                                required
                            />

                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-semibold mb-4 text-center">Enter OTP</h1>
                            <input
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                onChange={handleChange}
                                className="p-2 border border-gray-300 rounded"
                            />
                        </>
                    )
                    }
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {!form.showOTPField ? "Register" : "Submit OTP"}
                    </button>
                    <Link to="/login"><p className="text-center text-blue-500 hover:underline">Already have an account? Login Instead</p></Link>
                </form>
            </div>
        </>
    );
};

export default Register;