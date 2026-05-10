import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function PostHistoryPage() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingPostData, setEditingPostData] = useState({
        postTitle: "",
        postText: ""
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        void fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("http://localhost:8080/posts/me", {
                method: "GET",
                credentials: "include"
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (response.status === 404) {
                navigate("/profile/create");
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not load posts history");
            }

            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startEditPost = (post) => {
        setEditingPostId(post.idPost);
        setEditingPostData({
            postTitle: post.postTitle || "",
            postText: post.postText || ""
        });
        setMessage("");
        setError("");
    };

    const cancelEditPost = () => {
        setEditingPostId(null);
        setEditingPostData({
            postTitle: "",
            postText: ""
        });
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!editingPostData.postTitle.trim()) {
            setError("Post title is required");
            return;
        }

        if (!editingPostData.postText.trim()) {
            setError("Post text is required");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/posts/${editingPostId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postTitle: editingPostData.postTitle,
                    postText: editingPostData.postText
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not update post");
            }

            setEditingPostId(null);
            setEditingPostData({
                postTitle: "",
                postText: ""
            });

            setMessage("Post updated successfully!");
            await fetchMyPosts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePost = async (postId) => {
        const shouldDelete = window.confirm("Are you sure you want to delete this post?");

        if (!shouldDelete) {
            return;
        }

        setMessage("");
        setError("");

        try {
            const response = await fetch(`http://localhost:8080/posts/${postId}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not delete post");
            }

            setMessage("Post deleted successfully!");
            await fetchMyPosts();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "";
        }

        return new Date(value).toLocaleString();
    };

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <div>
                        <h1 className="profile-name">Posts History</h1>
                        <p className="profile-location">View, edit, and delete your past posts.</p>
                    </div>

                    <Link to="/profile" className="edit-button link-button">
                        Back to Profile
                    </Link>
                </div>

                {loading ? (
                    <p className="subtitle">Loading your posts...</p>
                ) : (
                    <div className="profile-section">
                        {posts.length === 0 ? (
                            <p>You have not created any posts yet.</p>
                        ) : (
                            posts.map((post) => (
                                <div key={post.idPost} className="entry-card post-history-card">
                                    {editingPostId === post.idPost ? (
                                        <form onSubmit={handleUpdatePost} className="register-form">
                                            <label>Post Title</label>
                                            <input
                                                type="text"
                                                value={editingPostData.postTitle}
                                                onChange={(e) =>
                                                    setEditingPostData({
                                                        ...editingPostData,
                                                        postTitle: e.target.value
                                                    })
                                                }
                                                maxLength={200}
                                                required
                                            />

                                            <label>Post Text</label>
                                            <textarea
                                                className="profile-textarea"
                                                value={editingPostData.postText}
                                                onChange={(e) =>
                                                    setEditingPostData({
                                                        ...editingPostData,
                                                        postText: e.target.value
                                                    })
                                                }
                                                maxLength={10000}
                                                required
                                            />

                                            <button type="submit">Save Post</button>

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                onClick={cancelEditPost}
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="post-history-header">
                                                <div>
                                                    <h3>{post.postTitle}</h3>
                                                    <p className="post-history-date">
                                                        Created: {formatDate(post.createdAt)}
                                                    </p>

                                                    {post.updatedAt && post.updatedAt !== post.createdAt && (
                                                        <p className="post-history-date">
                                                            Updated: {formatDate(post.updatedAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="post-history-text">{post.postText}</p>

                                            <div className="post-history-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => startEditPost(post)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="danger-button"
                                                    onClick={() => handleDeletePost(post.idPost)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default PostHistoryPage;