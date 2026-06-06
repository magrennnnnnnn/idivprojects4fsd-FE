import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function FeedPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    const [postTitle, setPostTitle] = useState("");
    const [postText, setPostText] = useState("");
    const [postImage, setPostImage] = useState(null);

    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [connections, setConnections] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    useEffect(() => {
        void loadFeedPage();
    }, []);

    const loadFeedPage = async () => {
        setLoading(true);
        setError("");

        try {
            const loadedProfile = await loadMyProfile();

            if (!loadedProfile) {
                return;
            }

            await Promise.all([
                loadPosts(loadedProfile),
                loadNetworkState()
            ]);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const loadNetworkState = async () => {
        try {
            const [connectionsResponse, sentResponse, receivedResponse] = await Promise.all([
                fetch("http://localhost:8080/connections/me", {
                    method: "GET",
                    credentials: "include"
                }),
                fetch("http://localhost:8080/connections/sent", {
                    method: "GET",
                    credentials: "include"
                }),
                fetch("http://localhost:8080/connections/received", {
                    method: "GET",
                    credentials: "include"
                })
            ]);

            if (connectionsResponse.ok) {
                setConnections(await connectionsResponse.json());
            }

            if (sentResponse.ok) {
                setSentRequests(await sentResponse.json());
            }

            if (receivedResponse.ok) {
                setReceivedRequests(await receivedResponse.json());
            }
        } catch (err) {
            console.error("Could not load network state", err);
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
        if (post.authorName) {
            return post.authorName;
        }

        if (post.profileName) {
            return post.profileName;
        }

        if (loadedProfile && post.idProfile === loadedProfile.idProfile) {
            return loadedProfile.name;
        }

        return "ProLink User";
    };

    const getAuthorLocation = (post, loadedProfile) => {
        if (post.authorLocation) {
            return post.authorLocation;
        }

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

        const hasText = postText.trim().length > 0;
        const hasImage = postImage !== null;

        if (!hasText && !hasImage) {
            setError("Please add text or an image to your post");
            return;
        }

        try {
            setPosting(true);

            const formData = new FormData();
            formData.append("postTitle", postTitle.trim());
            formData.append("postText", postText.trim());

            if (postImage) {
                formData.append("image", postImage);
            }

            const response = await fetch("http://localhost:8080/posts", {
                method: "POST",
                credentials: "include",
                body: formData
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
            setPostImage(null);
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

    const sendConnectionRequest = async (receiverProfileId) => {
        setError("");
        setMessage("");

        if (!receiverProfileId) {
            setError("Profile id was not found");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/connections", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    receiverProfileId: receiverProfileId
                })
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Could not send connection request");
            }

            setMessage("Connection request sent");
            await loadNetworkState();
        } catch (err) {
            setError(err.message || "Could not send connection request");
        }
    };

    const isAlreadyConnected = (profileId) => {
        return connections.some((connection) =>
            connection.requesterProfileId === profileId ||
            connection.receiverProfileId === profileId
        );
    };

    const hasSentPendingRequest = (profileId) => {
        return sentRequests.some((request) =>
            request.receiverProfileId === profileId
        );
    };

    const hasReceivedPendingRequest = (profileId) => {
        return receivedRequests.some((request) =>
            request.requesterProfileId === profileId
        );
    };

    const shouldShowConnectButton = (postProfileId) => {
        if (!profile || !postProfileId) {
            return false;
        }

        if (postProfileId === profile.idProfile) {
            return false;
        }

        if (isAlreadyConnected(postProfileId)) {
            return false;
        }

        if (hasSentPendingRequest(postProfileId)) {
            return false;
        }

        if (hasReceivedPendingRequest(postProfileId)) {
            return false;
        }

        return true;
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

                <Link to="/network" className="nav-item">
                    <span>☍</span>
                    Network
                </Link>

                <Link to="/messages" className="nav-item">
                    <span>✉</span>
                    Messages
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

                                <input
                                    className="composer-file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPostImage(e.target.files[0])}
                                />

                                {postImage && (
                                    <p className="selected-file-name">
                                        Selected image: {postImage.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="composer-footer composer-footer-clean">
                            <button
                                type="submit"
                                className="post-submit-button"
                                disabled={posting || !postTitle.trim() || (!postText.trim() && !postImage)}
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

                                    {post.postText && (
                                        <p>{post.postText}</p>
                                    )}

                                    {post.imageUrl && (
                                        <img
                                            src={`http://localhost:8080${post.imageUrl}`}
                                            alt="Post"
                                            className="post-image"
                                        />
                                    )}
                                </div>

                                {shouldShowConnectButton(post.idProfile) && (
                                    <button
                                        type="button"
                                        className="post-submit-button"
                                        onClick={() => sendConnectionRequest(post.idProfile)}
                                    >
                                        Connect
                                    </button>
                                )}
                            </article>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

export default FeedPage;