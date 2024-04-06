import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Navbar from './Navbar'
import Loader from './Loader'
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
const Profile = () => {
    const [trader, setTrader] = useState({});
    const [loader, setLoader] = useState(true)
    const cookies = new Cookies();

    const [pnlData, setPnlData] = useState([]);
    const [isPnlDataPresent, setIsPnlDataPresent] = useState(false);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const navigate = useNavigate();


    useEffect(() => {
        try {
            axios.post('/api/verifyLogin', {
                jwtoken: cookies.get('jwtoken'),
            }).then(res => {
                if (res.data === "No trader Signed In" || res.data === "trader not found") {
                    navigate('/login');
                } else {
                    console.log("hello");
                    setTrader(res.data);
                    setLoader(false)
                }
            })
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, [])

    const generateReport = async () => {

        try {
            const response = await axios.get('/api/pnl', {
                params: {
                    trader: trader,
                    fromDate: fromDate,
                    toDate: toDate
                }
            });
            if (response.status === 200) {

                response.data.buyTransactions.forEach((data) => {
                    axios.get('/api/getStockInfoById',
                        {
                            params:
                            {
                                stockId: data.stock_id
                            }
                        }
                    ).then(res => {
                        data.stock = res.data;
                    }).catch(err => {
                        console.error('Error fetching stock info:', err);
                        setIsPnlDataPresent(false);
                        alert('Error fetching stock info. Please try again later.');
                        setPnlData([]);
                        return;
                    })
                });

                response.data.sellTransactions.forEach((data) => {
                    axios.get('/api/getStockInfoById',
                        {
                            params:
                            {
                                stockId: data.stock_id
                            }
                        }
                    ).then(res => {
                        data.stock = res.data;
                    }).catch(err => {
                        console.error('Error fetching stock info:', err);
                        setIsPnlDataPresent(false);
                        alert('Error fetching stock info. Please try again later.');
                        setPnlData([]);
                        return;
                    })
                });

                setIsPnlDataPresent(true);
                setPnlData(response.data);
            }
            else {
                alert("Error in generating report!");
                setIsPnlDataPresent(false);
                setPnlData([]);
                return;
            }
            setPnlData(response.data);
            setIsPnlDataPresent(true);
        } catch (error) {
            console.error('Error fetching P&L data:', error);
            setIsPnlDataPresent(false);
            alert('Error fetching P&L data. Please try again later.');
        }
    }


    function comparePassword(password, hash) {
        const result = bcrypt.compareSync(password, hash);
        // console.log("login result brrrrrrrrrrrr", result);
        return result;
    }
    const handleDeposit = () => {
        const enteredPassword = prompt('Enter your password to deposit funds: ');
        let depositAmount = prompt('Enter the amount to deposit: ');
        depositAmount = Number(depositAmount);
        let verifyPass = comparePassword(enteredPassword, trader.password);
        if (verifyPass) {
            alert("Password correct");
            try {
                axios.put('/api/updateDeposit', {
                    jwtoken: cookies.get('jwtoken'),
                    deposit: depositAmount
                }).then(res => {
                    if (res.data == "unsuccessful") {
                        alert("unsuccessful");
                    }
                    else {
                        alert("successful");
                        setTrader(res.data);
                    }
                })
            } catch (err) {
                alert('Error');
                // navigate('/login');
            }
        }
        else {
            alert("password wrong");
        }
    };

    const handleWithdraw = () => {
        const enteredPassword = prompt('Enter your password to withdraw funds: ');
        let withdrawAmount = prompt('Enter the amount to withdraw: ');
        withdrawAmount = Number(withdrawAmount);
        let verifyPass = comparePassword(enteredPassword, trader.password);
        if (verifyPass) {
            alert("Password correct");
            try {
                axios.put('/api/updateWithdraw', {
                    jwtoken: cookies.get('jwtoken'),
                    withdraw: withdrawAmount
                }).then(res => {
                    if (res.data == "unsuccessful") {
                        alert("unsuccessful");
                    }
                    else {
                        alert("successful");
                        setTrader(res.data);
                    }
                })
            } catch (err) {
                alert('Error');
                // navigate('/login');
            }
        }
        else {
            alert("password wrong");
        }
    };

    const exportToCSV = (pnlData, fromDate, toDate) => {
        // Combine the headers and rows for buy and sell transactions

        const fromDateFormatted = fromDate.replaceAll('-', '');
        const toDateFormatted = toDate.replaceAll('-', '');

        const buyHeaders = ['Date', 'Stock', 'Price', 'Quantity'];
        const sellHeaders = ['Date', 'Stock', 'Price', 'Quantity', 'Gain'];

        const buyRows = pnlData.buyTransactions.map(transaction => {
            return [transaction.transaction_date, transaction.stock.companyName, transaction.price, transaction.quantity];
        });

        const sellRows = pnlData.sellTransactions.map(transaction => {
            return [transaction.transaction_date, transaction.stock.companyName, transaction.price, transaction.quantity, transaction.sellerGain];
        });

        // Convert data to CSV format
        const csvContent = [
            buyHeaders.join(','), // Buy transactions header
            ...buyRows.map(row => row.join(',')), // Buy transactions rows
            '', // Empty line between tables
            sellHeaders.join(','), // Sell transactions header
            ...sellRows.map(row => row.join(',')), // Sell transactions rows
        ].join('\n');

        // Create a Blob object with the CSV data
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create a temporary anchor element to trigger the download
        const link = document.createElement('a');
        if (link.download !== undefined) {
            // Use the download attribute to specify the filename
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `pnl_report_${fromDateFormatted}_to_${toDateFormatted}.csv`);
            // Trigger the download
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }


    return (
        <>
            <div className="flex flex-col h-full w-full bg-gray-100">
                <div >
                    <Navbar />
                </div>

                {/* <h1 className="text-center text-6xl font-bold mb-4 mt-10">My Profile</h1> */}
                <div className="flex justify-center items-center h-full p-8">
                    {loader ? <Loader /> :
                        <div className="flex bg-white rounded h-full w-full shadow-lg">
                            <div className="flex flex-col w-1/2 h-full p-10">
                                <h6 className="text-center text-xl font-semibold">Personal Information</h6>
                                <form className="p-5">
                                    <div className="my-5 flex justify-between">
                                        <label>Name:</label>
                                        <p>{trader.name}</p>
                                    </div>
                                    <hr />
                                    <div className="my-5 flex justify-between">
                                        <label>Email:</label>
                                        <p>{trader.email}</p>
                                    </div>
                                    <hr />
                                    <div className="my-5 flex justify-between">
                                        <label>Account Number:</label>
                                        <p>{trader.accountNumber}</p>
                                    </div>
                                    <hr />
                                    <div className="my-5 flex justify-between">
                                        <label>PAN Number:</label>
                                        <p>{trader.panNumber}</p>
                                    </div>
                                    <hr />
                                    <div className="my-5 flex justify-between">
                                        <label>Address:</label>
                                        <p>{trader.address}</p>
                                    </div>
                                    <hr />
                                    <div className="my-5 flex justify-between">
                                        <label>Phone Number:</label>
                                        <p>{trader.phoneNumber}</p>
                                    </div>
                                    <hr />
                                    <div className="my-5 flex justify-between">
                                        <label >Available funds</label>
                                        <p>{trader.funds}</p>
                                    </div>
                                    <hr />
                                </form>
                            </div>
                            <div className="w-1/2 h-full p-10">
                                <h2 className="text-center text-xl font-semibold">Available Funds</h2>
                                <div className="flex flex-col p-5">
                                    <div className="my-5 flex justify-between">
                                        <label className="block">Available funds:</label>
                                        <p>{trader.funds}</p>
                                    </div>
                                    <hr />

                                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 my-3 rounded " onClick={handleDeposit}>
                                        Deposit
                                    </button>
                                    <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 my-2 border border-blue-500 hover:border-transparent rounded" onClick={handleWithdraw}>
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        </div>}
                </div>


                <div className="bg-white rounded-lg shadow-md p-8 m-7">
                    <h2 className='text-xl font-semibold  mb-4'>Generate P&amp;L Report</h2>
                    <hr className='pb-4 pt-2' />
                    <div className="flex items-center gap-3">
                        <label className="ml-4">From</label>
                        <input type="date" className="border-2 border-gray-300 rounded-md px-2 py-1 bg-white mr-4" value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />

                        <label className="ml-4">To</label>
                        <input type="date" className="border-2 border-gray-300 rounded-md px-2 py-1 bg-white mr-4"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />


                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4"
                            onClick={() => generateReport()}>
                            Generate
                        </button>

                        {isPnlDataPresent && (
                            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
                                onClick={() => {
                                    exportToCSV(pnlData, fromDate, toDate);
                                    setIsPnlDataPresent(false);
                                    setPnlData([]);
                                }}>
                                Export to CSV
                            </button>
                        )}

                        {isPnlDataPresent && (
                            <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ml-4"
                                onClick={() => {
                                    setIsPnlDataPresent(false);
                                    setPnlData([]);
                                }
                                }>
                                Cancel
                            </button>
                        )}
                    </div>

                    {isPnlDataPresent && (
                        <div className=" mt-8 p-8 h-full">
                            <div className="flex justify-between gap-4 mb-4 pb-4">
                                <div className="w-full">
                                    <div className="text-xl font-semibold mb-2">Realised Profit</div>
                                    <div className="border-b-2 border-gray-300 mb-4"></div>
                                    <h1 className="text-xl">{pnlData.realisedProfit}</h1>
                                </div>
                                <div className="w-full">
                                    <div className="text-xl font-semibold mb-2">Total Buy Transactions</div>
                                    <div className="border-b-2 border-gray-300 mb-4"></div>
                                    <h1 className="text-xl">{pnlData.buyTransactions.length}</h1>
                                </div>

                                <div className="w-full">
                                    <div className="text-xl font-semibold mb-2">Total Sell Transactions</div>
                                    <div className="border-b-2 border-gray-300 mb-4"></div>
                                    <h1 className="text-xl">{pnlData.sellTransactions.length}</h1>
                                </div>

                                <div className="w-full">
                                    <div className="text-xl font-semibold mb-2">Total Charges</div>
                                    <div className="border-b-2 border-gray-300 mb-4"></div>
                                    <h1 className="text-xl">INR. {(pnlData.buyTransactions.length + pnlData.sellTransactions.length) * 20}</h1>
                                </div>

                            </div>
                            <div className="flex justify-between mt-8">
                                <div className="w-full mr-4">
                                    <h3 className="text-lg font-semibold mb-2 text-center">Buy Transactions</h3>
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Date</th>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Stock</th>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Buy Price</th>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pnlData.buyTransactions.map((data, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{data.transaction_date}</td>
                                                    <td className="px-4 py-2">{data.stock.companyName}</td>
                                                    <td className="px-4 py-2">{data.price}</td>
                                                    <td className="px-4 py-2">{data.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="w-full">
                                    <h3 className="text-lg font-semibold mb-2 text-center">Sell Transactions</h3>
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Date</th>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Stock</th>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Sell Price</th>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Quantity</th>
                                                <th className="px-4 py-2 border-b-2 border-gray-400">Gain</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pnlData.sellTransactions.map((data, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">{data.transaction_date}</td>
                                                    <td className="px-4 py-2">{data.stock.companyName}</td>
                                                    <td className="px-4 py-2">{data.price}</td>
                                                    <td className="px-4 py-2">{data.quantity}</td>
                                                    <td className="px-4 py-2">{data.sellerGain}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    )}
                </div>




            </div>
        </>
    );
}

export default Profile;
