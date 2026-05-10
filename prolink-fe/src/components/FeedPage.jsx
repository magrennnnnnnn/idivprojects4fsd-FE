import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function FeedPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    const [postTitle, setPostTitle] = useState("");
    const [postText, setPostText] = useState("");

    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        void loadFeedPage();
    }, []);

    const loadFeedPage = async () => {
        setLoading(true);
        setError("");

        try {
            const loadedProfile = await loadMyProfile();
            await loadPosts(loadedProfile);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const loadMyProfile = async () => {
        const response = await fetch("http://localhost:8080/profiles/me", {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            navigate("/login");
            return null;
        }

        if (response.status === 404) {
            navigate("/profile/create");
            return null;
        }

        if (!response.ok) {
            throw new Error("Could not load your profile");
        }

        const data = await response.json();
        setProfile(data);
        return data;
    };

    const loadPosts = async (loadedProfile) => {
        const response = await fetch("http://localhost:8080/posts", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            setPosts([]);
            return;
        }

        const data = await response.json();

        const normalizedPosts = data.map((post) => ({
            ...post,
            authorName: getAuthorName(post, loadedProfile),
            authorLocation: getAuthorLocation(post, loadedProfile)
        }));

        setPosts(normalizedPosts);
    };

    const getAuthorName = (post, loadedProfile) => {
        if (post.profileName) {
            return post.profileName;
        }

        if (loadedProfile && post.idProfile === loadedProfile.idProfile) {
            return loadedProfile.name;
        }

        return "ProLink User";
    };

    const getAuthorLocation = (post, loadedProfile) => {
        if (post.profileLocation) {
            return post.profileLocation;
        }

        if (loadedProfile && post.idProfile === loadedProfile.idProfile) {
            return loadedProfile.location;
        }

        return "ProLink member";
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

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
                    postTitle: postTitle.trim(),
                    postText: postText.trim()
                })
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
                const text = await response.text();
                throw new Error(text || "Could not create post");
            }

            setPostTitle("");
            setPostText("");
            setMessage("Post created successfully");

            await loadPosts(profile);
        } catch (err) {
            setError(err.message || "Could not create post");
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

    const getInitial = (name) => {
        if (!name || name.trim().length === 0) {
            return "U";
        }

        return name.trim().charAt(0).toUpperCase();
    };

    return (
        <div className="feed-page">
            <header className="prolink-topbar">
                <Link to="/feed" className="prolink-logo">
                    ProLink
                </Link>

                <div className="prolink-search">
                    <span>⌕</span>
                    <input type="text" placeholder="Search" />
                </div>

                <div className="topbar-actions">
                    <span className="notification-dot">●</span>

                    <Link to="/profile" className="small-avatar avatar-link">
                        {getInitial(profile?.name)}
                    </Link>
                </div>
            </header>

            <nav className="prolink-nav simple-nav">
                <Link to="/feed" className="nav-item active">
                    <span>⌂</span>
                    Feed
                </Link>

                <Link to="/profile" className="nav-item">
                    <span>♙</span>
                    Profile
                </Link>
            </nav>

            <main className="feed-shell">
                {loading && <p className="feed-status-message">Loading feed...</p>}
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <section className="post-composer-card">
                    <form onSubmit={handleCreatePost}>
                        <div className="composer-main">
                            <Link to="/profile" className="composer-avatar avatar-link">
                                {getInitial(profile?.name)}
                            </Link>

                            <div className="composer-inputs">
                                <input
                                    className="composer-title"
                                    type="text"
                                    placeholder="Give your post a title"
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

                        <div className="composer-footer composer-footer-clean">
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

                <section className="feed-posts">
                    {posts.length === 0 ? (
                        <div className="empty-feed-card">
                            <h2>No posts yet</h2>
                            <p>Create the first post on ProLink.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <article key={post.idPost} className="feed-post-card">
                                <div className="feed-post-header">
                                    <div className="post-author-avatar">
                                        {getInitial(post.authorName)}
                                    </div>

                                    <div className="post-author-info">
                                        <h3>{post.authorName}</h3>
                                        <p>{post.authorLocation}</p>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>

                                    <button className="post-more-button" type="button">
                                        •••
                                    </button>
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