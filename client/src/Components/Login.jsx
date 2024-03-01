import React, { useState } from 'react';
import Navbar from './Navbar';

const Login = () => {
    const [form, setForm] = useState({
        username: '',
        password: ''
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
                    className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md"
                >
                    <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
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
                   
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </>
    );
};

export default Login;