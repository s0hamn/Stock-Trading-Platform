import React, { useEffect, useState, useRef } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

const ApexChart = ({ data }) => {
    const [chartType, setChartType] = useState('candlestick');

    const filteredData = data.data.slice(-20);
    var series = [{ data: filteredData, color: '#ffffff' }];
    const handleChartTypeChange = (type) => {
        setChartType(type);
        if (type === 'compact') {
            series = [{ data: filteredData, color: '#ffffff' }];

        } else {
            series = [{ data: data.data, color: '#ffffff' }];
        }
    };
    const chartOptions = {
        candlestick: {
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
    };


    return (
        <div>
            <div>
                <label htmlFor="chartType" style={{ color: 'white' }}>Chart Type: </label>
                <select id="chartType" value={chartType} onChange={(e) => handleChartTypeChange(e.target.value)} style={{ color: 'black' }}>
                    <option value="compact">Compact</option>
                    <option value="enlarged">Enlarged</option>
                </select>
            </div>
            <div id="chart">
                <ReactApexChart options={chartOptions[chartType]} series={series} type="candlestick" height={350} />
            </div>
        </div>
    );
};

export default ApexChart;
