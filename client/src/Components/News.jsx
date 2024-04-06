import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Loader from './Loader';
import Preloader from './Preloader';

const News = () => {
    const [news, setNews] = useState([]);
    const [isNewsPresent, setIsNewsPresent] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Replace 'YOUR_API_KEY' with your actual News API key
                const apiKey = '5ba48d6cf4794f01991b0114521a6cb0';
                const response = await axios.get(`https://newsapi.org/v2/everything?q=stock&from=2024-03-06&sortBy=publishedAt&apiKey=${apiKey}`);
                setNews(response.data.articles);
                setIsNewsPresent(true);
            } catch (error) {
                console.error('Error fetching news:', error);
                setIsNewsPresent(false);
                alert('Error fetching news. Please try again later.');
            }
        };

        fetchNews();
    }, []);

    return (
        <>
            <Navbar />
            {isNewsPresent ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1 gap-9 mt-4 ml-20 mr-20">
                {news.map((article, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {article.urlToImage && (
                            <img src={article.urlToImage} alt={article.title} className="w-full h-60 object-cover rounded-t-lg" />
                        )}
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{article.title}</h2>
                            <p className="text-gray-700">{article.description}</p>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 inline-block">Read more</a>
                        </div>
                    </div>

                ))}
            </div>) : (
                <Loader />
            )}


        </>
    );

};

export default News;
