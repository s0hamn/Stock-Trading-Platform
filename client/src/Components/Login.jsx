import React, { useState } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
const Login = () => {
    const [form, setForm] = useState({
        username: '',
        password: '',
    });



    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // axios.defaults.withCredentials = true;
    const cookies = new Cookies();


    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/login', {
            email: form.email,
            password: form.password,
        })
            .then((res) => {
                console.log(res);
                if (res.data.result === "Success") {
                    alert("Login Successful");
                    // console.log(res.data.token);
                    // cookies.set('jwtoken', res.data.token, { path: '/' });
                    // console.log(cookies.get('jwtoken'));
                    navigate('/dashboard');
                }
                else {
                    alert(res.data.result);
                }

            })
            .catch((err) => {
                console.log(err);
            });
    };


    return (
        <>
            <div className='flex flex-col h-screen'>
                <Navbar />
                <div className="flex justify-center items-center h-screen bg-gray-200">
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 gap-6 bg-white p-10 rounded-lg shadow-md"
                    >

                        <>
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
                        </>

                        <button
                            type="submit"
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Login
                        </button>
                        <Link to="/register"><p className="text-center text-blue-500 hover:underline">Don't have an account? Register Instead</p></Link>
                    </form>
                </div>
            </div>
        </>

    );
};

export default Login;