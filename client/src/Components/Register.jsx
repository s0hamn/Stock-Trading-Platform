import React, { useState } from 'react';
import Navbar from './Navbar';

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        accountNumber: '',
        panNumber: '',
        address: '',
        phoneNumber: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen bg-gray-200">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md w-1/2"
                >
                    <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="text"
                        name="accountNumber"
                        placeholder="Account Number"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="text"
                        name="panNumber"
                        placeholder="PAN Number"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Register
                    </button>
                </form>
            </div>
        </>
    );
};

export default Register;