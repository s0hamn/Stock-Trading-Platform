import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
const ApexChart = () => {
    const [data, setData] = useState({
        companyName: "",
        data: []
    });
    const [chartData, setChartData] = useState({
        series: [{
            data: data.data
        }],
        options: {
            chart: {
                type: 'candlestick',
                height: 350
            },
            title: {
                text: data["companyName"],
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
        }
    });


    useEffect(() => {
        axios.get('/api/stockInfo/HDFCBANK.BSE')
            .then(response => {
                // Handle successful response
                const temp = []

                response.data.previousHistory.forEach(date => {
                    temp.push({
                        x: date["date"],
                        y: [date["open"], date["high"], date["low"], date["close"]]
                    })
                })

                setData(
                    {
                        companyName: response.data.companyName,
                        data: temp
                    }
                );
                // response.data.
            })
            .catch(error => {
                // Handle error
                console.error('Error fetching stock information:', error);
            });
    }, [])

    useEffect(() => {

        setChartData(
            {
                series: [{
                    data: data.data
                }],
                options: {
                    chart: {
                        type: 'candlestick',
                        height: 350
                    },
                    title: {
                        text: data["companyName"],
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
                }
            }
        )

    }, [data])



    return (
        <div>
            <div id="chart">
                <ReactApexChart options={chartData.options} series={chartData.series} type="candlestick" height={350} />
            </div>
            <div id="html-dist"></div>
        </div>
    );
};

export default ApexChart;
