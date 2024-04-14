import React from 'react'
import Navbar from './Navbar';
import MainImage from '../media/stockmarket.png';
import Card1Image from '../media/card1Image.jpeg';
import Card2Image from '../media/card2Image.png';
import { useNavigate } from 'react-router-dom';
const PROXY_URL = import.meta.env.VITE_PROXY_URL;

// import MainImage3 from '../media/main-page-third.jpeg';




function MainPage() {
    // console.log(PROXY_URL);
    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <>
            <Navbar />
            <div className=' max-w-screen-lg m-auto'>


                {/* Big space for photo */}
                <img src={MainImage} className='h-96 w-100 flex items-center justify-center m-auto  mt-8 mb-8' />

                <div className="flex justify-center mt-8 mb-8">
                    <div className="flex items-center">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full mx-2"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    </div>
                </div>


                {/* Quote related to investing */}
                <div className="text-center mt-8 gap-9 mb-8">
                    <p className="text-3xl font-semibold  p-3">Investing is the art of making money work for you.</p>
                    <p className="text-2xl p-3">The stock market is a device for transferring money from the impatient to the patient.</p>
                </div>

                <div className="flex justify-center mt-8 mb-8">
                    <div className="flex items-center">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full mx-2"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    </div>
                </div>


                {/* Div containing image and text */}
                <div
                    className="flex flex-col m-auto mt-12 mb-12 rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 md:max-w-xl md:flex-row">
                    <img
                        className="h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
                        src={Card1Image}
                        alt="" />
                    <div className="flex flex-col justify-start p-6">
                        <h5
                            className="mb-2 text-xl font-medium text-neutral-800 dark:text-neutral-50">
                            Card title
                        </h5>
                        <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                            The stock market is a financial marketplace where investors buy and sell shares of publicly traded companies, enabling businesses to raise capital and investors to potentially earn returns on their investments through buying low and selling high
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-300">
                            Last updated 3 mins ago
                        </p>
                    </div>
                </div>




                {/* Div containing text and then image */}
                <div
                    className="flex flex-col m-auto mt-24 mb-12 rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 md:max-w-xl md:flex-row">
                    <div className="flex flex-col justify-start p-6">
                        <h5
                            className="mb-2 text-xl font-medium text-neutral-800 dark:text-neutral-50">
                            Card title
                        </h5>
                        <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                            Stock trading involves the buying and selling of shares or equities in publicly traded companies, aiming to profit from fluctuations in their prices over time
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-300">
                            Last updated 3 mins ago
                        </p>
                    </div>
                    <img
                        className="h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
                        src={Card2Image}
                        alt="" />
                </div>

                <div className="flex justify-center">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-4 w-20 h-12" onClick={handleLoginClick}>
                        Login
                    </button>
                </div>





            </div>
            {/* Footer */}
            <footer className="bg-gray-800 text-white py-4 mt-24">
                <div className="container mx-auto flex flex-col md:flex-row md:justify-between">
                    {/* About Section */}
                    <div className="mb-4 md:mb-0 w-56">
                        <h3 className="text-lg font-semibold mb-2">Stock Trading App</h3>
                        <span>A platform for all your trading needs, Empower your investment journey with our stock trading platform. Seamlessly trade stocks, track portfolios, and stay informed with real-time market updates. Experience the convenience of intuitive tools.</span>
                    </div>

                    {/* Links Section */}
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
                        <div>
                            <a href="#" className="block mb-2 hover:text-gray-400">Home</a>
                            <a href="#" className="block mb-2 hover:text-gray-400">About Us</a>
                            <a href="#" className="block mb-2 hover:text-gray-400">Contact Us</a>
                            <a href="#" className="block hover:text-gray-400">Terms of Service</a>
                        </div>
                    </div>

                    {/* Copyright Section */}
                    <div>
                        <p>&copy; 2024 Stock Trading App. All rights reserved.</p>
                        <p>© 2024 StockTrader Inc. All rights reserved.</p>
                        <p>Icons made by John Doe from www.flaticon.com</p>
                        <p>Licensed under the MIT License, https://opensource.org/licenses/MIT</p>
                    </div>
                </div>
            </footer >


        </>
    );
}

export default MainPage;