import React, { useEffect, useState, useRef } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import Loader from './Loader';

const ApexChart = ({ data }) => {
    const [chartType, setChartType] = useState('compact');
    const [loader, setLoader] = useState(true);
    const handleChartTypeChange = (type) => {
        setLoader(true);
        setChartType(type);
        console.log(type);
    };
    const filteredData = data.data.slice(-20);
    // const chartOptions = {
    //     candlestick: {
    //         chart: {
    //             type: 'candlestick',
    //             height: 350,
    //         },
    //         title: {
    //             text: data.companyName,
    //             align: 'left',
    //             style: {
    //                 color: "white",
    //                 fontWeight: "200"
    //             }
    //         },
    //         xaxis: {
    //             type: 'category',
    //             labels: {
    //                 style: {
    //                     colors: "white"
    //                 },
    //                 rotate: -45,
    //                 formatter: function (value) {
    //                     return value;
    //                 }
    //             }
    //         },
    //         yaxis: {
    //             labels: {
    //                 style: {
    //                     colors: "white"
    //                 }
    //             },
    //             tooltip: {
    //                 enabled: true
    //             }
    //         }
    //     }
    // };

    const [chartData, setChartData] = useState({
        series: [{
            data: chartType == 'compact' ? data.data.slice(-20) : data.data
        }],
        options: {
            chart: {
                type: 'candlestick',
                height: 350,
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
                type: 'category',
                labels: {
                    style: {
                        colors: "white"
                    },
                    rotate: -45,
                    formatter: function (value) {
                        return value;
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
                }
            }
        }
    });

    useEffect(() => {
        setChartData({
            series: [{
                data: chartType == 'compact' ? data.data.slice(-20) : data.data
            }],
            options: {
                chart: {
                    type: 'candlestick',
                    height: 350,
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
                    type: 'category',
                    labels: {
                        style: {
                            colors: "white"
                        },
                        rotate: -45,
                        formatter: function (value) {
                            return value;
                        }
                    },
                    tooltip: {
                        enabled: true
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
                    }
                }
            }
        });

        setLoader(false);
    }, [data]);

    // const series = [{ data: data.data, color: '#ffffff' }];

    return (
        <div>

            <div>
                <label htmlFor="chartType" style={{ color: 'white' }}>Chart Type: </label>
                <select id="chartType" value={chartType} onChange={(e) => handleChartTypeChange(e.target.value)} style={{ color: 'black' }}>
                    <option value="compact">Compact</option>
                    <option value="enlarged">Enlarged</option>
                </select>
            </div>
            {!loader ? <>
                <div id="chart">
                    <ReactApexChart options={chartData.options} series={chartData.series} type="candlestick" height={350} />
                </div></> : <div className='h-96 flex justify-center items-center' ><Loader /></div>}
        </div>
    );
};

export default ApexChart;
