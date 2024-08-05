import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Modal from 'react-modal';
import AddNewPost from './AddNewPost';
import Loader from './Loader';
const DiscussionForum = () => {
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

    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [selectedPostIdForShowingComments, setSelectedPostIdForShowingComments] = useState('');
    // const [newPost, setNewPost] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [trader, setTrader] = useState({});
    const [ShowAddCommentModal, setShowAddCommentModal] = useState(false);

    const [IdForAddingComment, setIdForAddingComment] = useState('');
    const [addComment, setAddComment] = useState('');
    const cookies = new Cookies();

    const navigate = useNavigate();

    const [selectedPostId, setSelectedPostId] = useState("");

    const toggleComments = (postId) => {
        setSelectedPostIdForShowingComments(selectedPostIdForShowingComments === postId ? "" : postId);
    };



    useEffect(() => {
        // Verify login
        try {
            axios.post('' + import.meta.env.VITE_PROXY_URL + '/verifyLogin', {
                jwtoken: cookies.get('jwtoken'),
            }).then(res => {
                // console.log(res.data);
                if (res.data === "No User Signed In" || res.data === "User not found") {
                    navigate('/login');
                } else {
                    setTrader(res.data);
                }
            })
        } catch (err) {
            console.error('Error verifying login:', err);
            navigate('/login');
        }
    }, []);


    const fetchPosts = async () => {
        try {
            const response = await axios.get('' + import.meta.env.VITE_PROXY_URL + '/posts');
            setPosts(response.data);
            handleFilter(selectedCompany);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };


    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
        }
    };


    useEffect(() => {
        // Execute fetchPosts and fetchComments initially
        fetchPosts();
        fetchComments();
    }, []);



    // Function to handle post filtering based on company name
    const handleFilter = (companyName) => {
        setSelectedCompany(companyName);
        if (companyName === "") {
            setFilteredPosts(posts); // Reset filter, show all posts
        } else {
            const filtered = posts.filter(post => post.stockName === companyName);
            setFilteredPosts(filtered); // Apply filter based on selected company
        }
    };



    // Function to add a new comment to a post
    const addCommentHandler = async (postId) => {
        if (addComment === '') {
            alert("Comment cannot be empty");
            return;
        }
        try {
            const response = await axios.post(`/api/addComment/${postId}`, { content: addComment, userId: trader._id });
            if (response.status === 200) {
                setShowAddCommentModal(false);
                alert("Comment added successfully");
                fetchComments();
            }
            else {
                alert("Error adding comment");
            }
            setAddComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // Function to delete a post
    const deletePost = async (postId) => {
        try {
            await axios.delete(`/api/deletePost/${postId}`).then(response => {
                if (response.status === 200) {
                    alert("Post deleted successfully");
                }
                else {
                    alert("Error deleting post");
                }
            }).catch(error => {
                alert("Error deleting post, internal error, try again later");
            });
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    // Function to delete a comment
    const deleteComment = async (postId, commentId) => {
        try {
            await axios.delete(`/api/deleteComment/${commentId}`).then(response => {
                if (response.status === 200) {
                    alert("Comment deleted successfully");
                }
                else {
                    alert("Error deleting comment");
                }
            }).catch(error => {
                alert("Error deleting comment, internal error, try again later");
            })

        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <>
            <Navbar />
            {loading ? (
                <Loader />
            ) : (
                <div className="container mb-0 w-full h-full pt-4"> {/* Add padding-top to create space for the fixed filter */}
                    {/* Fixed filter div */}
                    <div className="fixed top-20 left-0 right-0 bg-gray-100 z-10 h-15">
                        <div className="flex justify-center items-center p-6 gap-5">
                            <select
                                className="px-4 py-2 border border-gray-200 rounded-md mr-4"
                                value={selectedCompany}
                                onChange={(e) => handleFilter(e.target.value)}
                            >
                                <option value="">-- Filter by Company --</option>
                                {stockNames.map((name, index) => (
                                    <option key={index} value={name}>{name}</option>
                                ))}
                            </select>
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-300  active:scale-95" onClick={() => handleFilter('')}>Clear Filter</button>

                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-300  active:scale-95" onClick={() => {
                                fetchPosts();
                                fetchComments();
                            }}>Refresh Posts</button>

                        </div>
                    </div>

                    {/* Posts and comments section */}
                    <div className="mt-20 overflow-y-scroll bg-gray-200 pb-16">
                        {filteredPosts.map(post => (
                            <div key={post._id} className="m-12 bg-white shadow-md overflow-y-scroll">

                                <h2 className="text-xl font-bold mb-2 ml-4 p-1">{post.title}</h2>
                                <hr className='p-2' />
                                {/* Left side content */}
                                <div className="flex rounded-lg p-6 mb-4">
                                    <div className="flex-1 mr-4">

                                        <p className="text-gray-600 mb-4 text-lg">{post.content}</p>
                                    </div>

                                    {/* Right side attributes */}
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <p className="text-gray-600 mb-2 text-sm">Related to: {post.stockName}</p>
                                            <p className="text-gray-600 mb-2 text-sm">Posted by: Anonymous {post.userId}</p>
                                        </div>
                                        <p className="text-gray-600 mb-2 text-sm">Posted At: {post.createdAt}</p>
                                    </div>
                                </div>


                                {/* Comments */}


                                {/* Dropdown to toggle comments */}
                                <div className="flex  items-start ml-4">
                                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md m-2 transition-all duration-300  active:scale-95" onClick={() => toggleComments(post._id)}>
                                        {selectedPostIdForShowingComments === post._id ? 'Hide Comments' : 'Show Comments'}
                                    </button>

                                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md m-2 transition-all duration-300  active:scale-95" onClick={() => { setShowAddCommentModal(true); setIdForAddingComment(post._id) }}>Add Comment</button>
                                    {post.userId === trader._id && (
                                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md m-2 transition-all duration-300 active:scale-95" onClick={() => deletePost(post._id)}>Delete Post</button>
                                    )}
                                </div>

                                {selectedPostIdForShowingComments === post._id && comments[post._id] && (
                                    <>
                                        <ul className="ml-4 gap-2">
                                            {comments[post._id].map(comment => (
                                                <li key={comment._id} className="flex border border-gray-200 rounded-md p-2 mb-3 mt-3 bg-gray-100">
                                                    {/* Comment content */}
                                                    <div className="flex-1">
                                                        <p className='text-lg '>{comment.content}</p>
                                                        {trader._id === comment.userId && (
                                                            <button className="bg-red-500 hover:bg-red-600 text-white px-1 py-1 rounded-md" onClick={() => deleteComment(post._id, comment._id)}>Delete</button>
                                                        )}
                                                    </div>
                                                    {/* Comment attributes */}
                                                    <div className="flex flex-col justify-between ml-2 text-sm gap-1">
                                                        <p>Comment by: Anonymous {comment.userId}</p>
                                                        <p>Comment at: {comment.createdAt}</p>
                                                    </div>
                                                </li>

                                            ))}
                                        </ul>


                                    </>
                                )}

                                {ShowAddCommentModal && post._id === IdForAddingComment &&
                                    <div className="flex items-center border border-gray-300 rounded-md p-2 mb-4">
                                        <textarea
                                            value={addComment}
                                            onChange={(e) => setAddComment(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-md p-2 mr-2"
                                            placeholder="Add a comment..."
                                        />
                                        <button
                                            onClick={(e) => addCommentHandler(post._id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-300  active:scale-95"
                                        >
                                            Submit
                                        </button>

                                        <button
                                            onClick={() => setShowAddCommentModal(false)}
                                            className="bg-gray-500 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition-all duration-300  active:scale-95"
                                        >
                                            Cancel
                                        </button>

                                    </div>
                                }

                            </div>
                        ))}
                    </div>


                    {/* Add new post button and modal */}
                    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 z-10 w-full flex justify-center p-3 shadow-md">
                        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md m-auto transition-all duration-300  active:scale-95" onClick={() => setShowPopup(true)}>Add New Post</button>
                        <Modal
                            isOpen={showPopup}
                            onRequestClose={() => setShowPopup(false)}
                            contentLabel="Add New Post Popup"
                            className="modal"
                            overlayClassName="overlay"
                        >
                            <AddNewPost userId={trader._id} showPopup={showPopup} setShowPopup={setShowPopup} />
                        </Modal>
                    </div>
                </div>
            )}
        </>
    );

};

export default DiscussionForum;
