import React from 'react';
import LogoImage from '../media/logo.svg';
import { FaRegChartBar } from "react-icons/fa";
import Logo from '../media/logo.png';


const Navbar = () => {
    return (
        <nav className="flex items-center justify-between flex-wrap bg-blue-900 p-6 sticky top-0">
            <div className="flex items-center flex-shrink-0 text-white mr-6 ml-12">
                <img src={Logo} alt="logo" className='h-10 w-10' />
            </div>
            <div className="block lg:hidden">
                <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
                    <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
                </button>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto mr-12">
                <div className="text-sm lg:flex-grow flex justify-end">
                    <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                        Option 1
                    </a>
                    <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                        Option 2
                    </a>
                    <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                        Option 3
                    </a>
                    <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
                        Option 4
                    </a>
                </div>
            </div>


        </nav>
    );
};

export default Navbar;