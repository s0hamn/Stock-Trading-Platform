import React, { useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Login = () => {
    const [form, setForm] = useState({
        username: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/login', {
            email: form.email,
            password: form.password
        })
            .then((res) => {
                console.log(res);
                if (res.data === "Success") {
                    navigate('/');
                }
                else {
                    alert(res.data);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen bg-gray-200">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md"
                >
                    <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
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

                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                    <Link to="/register"><p className="text-center text-blue-500 hover:underline">Don't have an account? Register Instead</p></Link>
                </form>
            </div>
        </>
    );
};

export default Login;