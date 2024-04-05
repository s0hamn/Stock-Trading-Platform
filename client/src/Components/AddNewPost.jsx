import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AddNewPost = ({ userId, showPopup, setShowPopup }) => {

    const stockNames = [
        'Tata Steel Ltd.',
        'Reliance Industries Ltd',
        'HDFC Bank Ltd',
        'Tata Consultancy Services',
        'Infosys Limited',
        'State Bank of India',
        'ICICI Bank Limited',
        'Hindustan Unilever Limited',
        'Sun Pharmaceutical Industries Limited',
        'Larsen & Toubro Limited',
        'Axis Bank Limited',
        'Mahindra & Mahindra Limited',
        'ITC Limited',
        'Kotak Mahindra Bank Limited',
        'Bharti Airtel Limited',
        'Maruti Suzuki India Limited',
        'Wipro Limited',
        'Bajaj Finance Limited',
        'Asian Paints Limited',
        'NTPC Limited'
    ];

    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        stockName: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setNewPost(prevState => ({
            ...prevState,
            [name]: value
        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = {};
            formData.title = newPost.title;
            formData.content = newPost.content;
            formData.stockName = newPost.stockName;
            formData.userId = userId;

            console.log('form data:', formData);

            await axios.post('/api/addPost', {
                formData
            }).then(response => {
                if (response.status === 200) {
                    console.log('New post added:', response.data);
                    alert('New post added successfully');
                    setNewPost({
                        title: '',
                        content: '',
                        stockName: ''
                    });
                    setShowPopup(false);
                }
                else {
                    alert('Error adding new post');
                    console.error('Error adding new post');
                    setNewPost({
                        title: '',
                        content: '',
                        stockName: ''
                    });
                }

            }).catch(error => {
                alert('Error adding new post');
                console.error('Error adding new post:', error);
                setNewPost({
                    title: '',
                    content: '',
                    stockName: ''
                });
            });

        } catch (error) {
            console.error('Error adding new post:', error);
        }
    };

    return (
        <div className="fixed z-10 top-0 left-0 right-0 bottom-0 bg-gray-100 bg-opacity-75 backdrop-filter backdrop-blur-sm flex justify-center items-center">
            <div className=" bg-white fixed z-10 inset-0 h-3/4 m-auto w-2/3">
                <div className="flex items-center justify-center  p-4 gap-4">
                    <form onSubmit={handleSubmit} >
                        <h2 className="text-2xl font-semibold mb-4">Add New Post</h2>
                        <input
                            type="text"
                            name="title"
                            value={newPost.title}
                            onChange={handleChange}
                            placeholder="Title"
                            className="border border-gray-300 rounded-md w-full px-4 py-2 mb-4"
                            required
                        />
                        <textarea
                            name="content"
                            value={newPost.content}
                            onChange={handleChange}
                            placeholder="Write your post here..."
                            className="border border-gray-300 rounded-md w-full px-4 py-2 mb-4"
                            rows="5"
                            required
                        ></textarea>
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-md mr-4"
                            value={newPost.stockName}
                            onChange={handleChange}
                            name='stockName'
                        >
                            {/* <option value="">-- Filter by Company --</option> */}
                            {stockNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                            ))}
                        </select>




                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-2"
                        >
                            Submit Post
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewPost;
