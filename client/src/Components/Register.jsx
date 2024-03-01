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
        accountNumber: '',
        panNumber: '',
        address: '',
        phoneNumber: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
        axios.post('http://localhost:3001/register', {
            name: form.name,
            email: form.email,
            password: form.password,
            accountNumber: form.accountNumber,
            panNumber: form.panNumber,
            address: form.address,
            phoneNumber: form.phoneNumber
        })
            .then((res) => {
                console.log(res);
                navigate('/login');
            })
            .catch((err) => {
                console.log(err);
            });

    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md w-1/2"
                >
                    <h1 className="text-2xl font-semibold mb-4 text-center">Register</h1>

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
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Register
                    </button>
                    <Link to="/login"><p className="text-center text-blue-500 hover:underline">Already have an account? Login Instead</p></Link>

                </form>
            </div>
        </>
    );
};

export default Register;