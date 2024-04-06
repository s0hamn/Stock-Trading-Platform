import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import io from 'socket.io-client';

const ApexChart = ({ symbol }) => {

    const [data, setData] = useState({ companyName: '', data: [] });
    const [chartType, setChartType] = useState('candlestick');

    const handleChartTypeChange = (type) => {
        setChartType(type);
    };

    useEffect(() => {
        axios.get(`/api/stockInfo/${symbol}`)
            .then(response => {
                const temp = [];
                response.data.previousHistory.forEach(date => {
                    temp.push({
                        x: date.date,
                        y: [date.open, date.high, date.low, date.close]
                    });
                });

                console.log(temp);
                setData({
                    companyName: response.data.companyName,
                    data: temp
                });
            })
            .catch(error => {
                console.error('Error fetching stock information:', error);
            });
    }, []);


    // useEffect(() => {
    //     setData(chartData);
    //     console.log(data);
    // }, [chartData]);

    const chartOptions = {
        candlestick: {
            chart: {
                type: 'candlestick',
                height: 350
            },
            title: {
                text: data.companyName,
                align: 'left',
                style: {
                    color: "white",
                    fontWeight: "200"
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: "white"
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "white"
                    }
                },
                tooltip: {
                    enabled: true
                },
            }
        },
        line: {
            chart: {
                type: 'line',
                height: 350,
                tooltip: {
                    enabled: true,
                    y: {
                        formatter: function (val) {
                            return val.toFixed(2); // format y-axis value
                        },
                        style: {
                            color: '#ffffff' // set tooltip text color
                        }
                    }
                }
            },
            title: {
                text: data.companyName,
                align: 'left',
                style: {
                    color: "white",
                    fontWeight: "200"
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: "white"
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "white"
                    }
                },
            }
        }
    };

    const series = [{ data: data.data, color: '#ffffff' }];

    return (
        <div>
            <div>
                <label htmlFor="chartType" style={{ color: 'white' }}>Chart Type: </label>
                <select id="chartType" value={chartType} onChange={(e) => handleChartTypeChange(e.target.value)} style={{ color: 'black' }}>
                    <option value="candlestick">Candlestick Chart</option>
                    <option value="line">Line Chart</option>
                </select>
            </div>
            <div id="chart">
                <ReactApexChart options={chartOptions[chartType]} series={series} type={chartType} height={350} />
            </div>
        </div>
    );
};

export default ApexChart;
