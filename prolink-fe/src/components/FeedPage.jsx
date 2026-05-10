import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function FeedPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    const [postTitle, setPostTitle] = useState("");
    const [postText, setPostText] = useState("");

    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        void fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError("");

            const profileResponse = await fetch("http://localhost:8080/profiles/me", {
                method: "GET",
                credentials: "include"
            });

            if (profileResponse.status === 401) {
                navigate("/login");
                return;
            }

            if (profileResponse.status === 404) {
                navigate("/profile/create");
                return;
            }

            if (!profileResponse.ok) {
                throw new Error("Could not load your profile");
            }

            const profileData = await profileResponse.json();
            setProfile(profileData);

            await fetchPosts();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        const postsResponse = await fetch("http://localhost:8080/posts", {
            method: "GET",
            credentials: "include"
        });

        if (!postsResponse.ok) {
            setPosts([]);
            return;
        }

        const postsData = await postsResponse.json();
        setPosts(postsData);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!postTitle.trim()) {
            setError("Post title is required");
            return;
        }

        if (!postText.trim()) {
            setError("Post text is required");
            return;
        }

        try {
            setPosting(true);

            const response = await fetch("http://localhost:8080/posts", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postTitle,
                    postText
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not create post");
            }

            setPostTitle("");
            setPostText("");
            setMessage("Post created successfully!");
            await fetchPosts();
        } catch (err) {
            setError(err.message);
        } finally {
            setPosting(false);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "";
        }

        return new Date(value).toLocaleString();
    };

    if (loading) {
        return (
            <div className="feed-page">
                <div className="feed-shell">
                    <p className="subtitle">Loading feed...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="feed-page">
            <header className="prolink-topbar">
                <Link to="/feed" className="prolink-logo">ProLink</Link>

                <div className="prolink-search">
                    <span>⌕</span>
                    <input type="text" placeholder="Search" />
                </div>

                <div className="topbar-actions">
                    <span className="notification-dot">●</span>
                    <div className="small-avatar">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                </div>
            </header>

            <nav className="prolink-nav">
                <Link to="/feed" className="nav-item active">
                    <span>⌂</span>
                    Feed
                </Link>

                <span className="nav-item">
                    <span>♙</span>
                    Network
                </span>

                <span className="nav-item">
                    <span>▣</span>
                    Jobs
                </span>

                <span className="nav-item">
                    <span>☏</span>
                    Messages
                </span>

                <Link to="/profile" className="nav-item">
                    <span>♙</span>
                    Profile
                </Link>
            </nav>

            <main className="feed-shell">
                <section className="post-composer-card">
                    <form onSubmit={handleCreatePost}>
                        <div className="composer-main">
                            <div className="composer-avatar">
                                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                            </div>

                            <div className="composer-inputs">
                                <input
                                    className="composer-title"
                                    type="text"
                                    placeholder="Post title"
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    maxLength={200}
                                />

                                <textarea
                                    className="composer-textarea"
                                    placeholder="Start a post..."
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    maxLength={10000}
                                />
                            </div>
                        </div>

                        <div className="composer-footer">
                            <div className="composer-tools">
                                <button type="button">▧ Photo</button>
                                <button type="button">▣ Video</button>
                                <button type="button">▤ File</button>
                            </div>

                            <button
                                type="submit"
                                className="post-submit-button"
                                disabled={posting || !postTitle.trim() || !postText.trim()}
                            >
                                {posting ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </form>
                </section>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <section className="feed-posts">
                    {posts.length === 0 ? (
                        <div className="empty-feed-card">
                            <h2>No posts yet</h2>
                            <p>Be the first person to post on ProLink.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <article key={post.idPost} className="feed-post-card">
                                <div className="feed-post-header">
                                    <div className="post-author-avatar">
                                        P
                                    </div>

                                    <div>
                                        <h3>ProLink User</h3>
                                        <p>Profile #{post.idProfile}</p>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>

                                    <button className="post-more-button">•••</button>
                                </div>

                                <div className="feed-post-content">
                                    <h2>{post.postTitle}</h2>
                                    <p>{post.postText}</p>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

export default FeedPage;