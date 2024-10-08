import React from 'react';
import LogoImage from '../media/logo.svg';
import { FaRegChartBar } from "react-icons/fa";
import Logo from '../media/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import profileImg from '../media/profilewhite-removebg-preview.png';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';

const Navbar = () => {

    const [trader, setTrader] = useState(false);
    const cookies = new Cookies();

    useEffect(() => {
        try {
            axios.post('' + import.meta.env.VITE_PROXY_URL + '/verifyLogin', {
                jwtoken: cookies.get('jwtoken'),
            }).then(res => {
                if (res.data == "No User Signed In" || res.data == "User not found") {
                    setTrader(false);
                }
                else {
                    setTrader(res.data);
                }
            })
        }
        catch (err) {
            console.log(err);
            setTrader(false);
        }


    }, [])

    const navigate = useNavigate();
    const handleProfileClick = () => {
        console.log('profile');
        navigate('/profile');
    }
    const handleLogout = () => {
        try {
            console.log('i m client');
            axios.get('' + import.meta.env.VITE_PROXY_URL + '/logout', { withCredentials: true });
            navigate('/login');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };
    return (
        <nav className=" flex items-center justify-between flex-wrap bg-indigo-500  pt-6 pb-6 pl-36 pr-36 sticky top-0">
            <div className="flex items-center flex-shrink-0 text-white">
                <img src={Logo} alt="logo" className='h-10 w-10' />
            </div>
            <div className="block lg:hidden">
                <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
                    <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
                </button>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto mr-6">
                <div className="text-sm lg:flex-grow flex justify-end items-center">
                    {trader &&
                        <>
                            <Link to="/dashboard" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4" >Dashboard</Link>
                            <Link to="/stocks" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4" >Stocks</Link>
                            <Link to="/discussionForum" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4" >Discussion</Link>
                        </>
                    }

                    <Link to="/news" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4" >News</Link>


                    {trader ? (<button className="bg-transparent hover:bg-white text-slate-200 font-semibold hover:text-indigo-500 py-2 px-4 border border-white hover:border-transparent rounded-sm" onClick={handleLogout}>
                        Logout
                    </button>) : (<Link to="/login" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4" >Login</Link>)}


                </div>
            </div>
            {trader &&
                <div className="profile cursor-pointer" onClick={handleProfileClick}>
                    <img src={profileImg} alt="profile" className='h-10 w-10' />
                </div>}


        </nav>
    );
};

export default Navbar;