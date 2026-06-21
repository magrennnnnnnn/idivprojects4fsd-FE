import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


function FeedPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
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
    const [openPostMenuId, setOpenPostMenuId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [followedCompanyIds, setFollowedCompanyIds] = useState([]);

    useEffect(() => {
        void loadFeedPage();
    }, []);

    const hasRole = (user, role) => {
        if (!user || !user.roles) {
            return false;
        }

        if (Array.isArray(user.roles)) {
            return user.roles.includes(role);
        }

        return user.roles === role;
    };

    const loadCurrentUser = async () => {
        const response = await fetch("http://localhost:8080/auth/me", {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            navigate("/login");
            return null;
        }

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        setCurrentUser(data);
        return data;
    };

    const isCompanyAccount = () => {
        return hasRole(currentUser, "COMPANY");
    };

    const loadFeedPage = async () => {
        setLoading(true);
        setError("");

        try {
            const loadedProfile = await loadMyProfile();

            if (!loadedProfile) {
                return;
            }

            await Promise.all([
                loadCurrentUser(),
                loadPosts(loadedProfile),
                loadNetworkState(),
                loadFollowedCompanies()
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

    const filteredPosts = posts.filter((post) => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return true;
        }

        return (
            post.postTitle?.toLowerCase().includes(search) ||
            post.postText?.toLowerCase().includes(search) ||
            post.authorName?.toLowerCase().includes(search) ||
            post.authorLocation?.toLowerCase().includes(search)
        );
    });

    const shouldShowConnectButton = (postProfileId, authorRole) => {
        if (!profile || !postProfileId || !currentUser) {
            return false;
        }

        if (hasRole(currentUser, "COMPANY")) {
            return false;
        }

        if (authorRole === "COMPANY") {
            return false;
        }

        if (Number(postProfileId) === Number(profile.idProfile)) {
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

    const getProfilePath = (profileId) => {
        if (!profileId) {
            return "/feed";
        }

        if (profile && Number(profileId) === Number(profile.idProfile)) {
            return "/profile";
        }

        return `/profiles/${profileId}`;
    };

    const isOwnPost = (post) => {
        return profile && Number(post.idProfile) === Number(profile.idProfile);
    };

    const handleEditPostFromFeed = () => {
        setOpenPostMenuId(null);
        navigate("/profile/posts");
    };

    const handleReportPost = () => {
        setOpenPostMenuId(null);

        window.alert(
            "Your report has been submitted. Someone will analyze this post and it might be deleted within 30 days."
        );
    };

    const hasValidImageUrl = (imageUrl) => {
        if (!imageUrl) {
            return false;
        }

        const cleanUrl = imageUrl.trim();

        return (
            cleanUrl.length > 0 &&
            cleanUrl !== "null" &&
            cleanUrl !== "undefined" &&
            cleanUrl.startsWith("/uploads/")
        );
    };

    const getPostImageSrc = (imageUrl) => {
        return `http://localhost:8080${imageUrl}`;
    };




    const loadFollowedCompanies = async () => {
        const response = await fetch("http://localhost:8080/company-follows/me/company-ids", {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            navigate("/login");
            return;
        }

        if (response.ok) {
            const data = await response.json();
            setFollowedCompanyIds(data);
        }
    };

    const isCompanyPost = (post) => {
        return post.authorRole === "COMPANY";
    };

    const isFollowingCompany = (companyProfileId) => {
        return followedCompanyIds.some((id) => Number(id) === Number(companyProfileId));
    };

    const followCompany = async (companyProfileId) => {
        setError("");
        setMessage("");

        try {
            const response = await fetch(`http://localhost:8080/company-follows/${companyProfileId}`, {
                method: "POST",
                credentials: "include"
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Could not follow company");
            }

            setFollowedCompanyIds((current) => {
                if (current.some((id) => Number(id) === Number(companyProfileId))) {
                    return current;
                }

                return [...current, companyProfileId];
            });

            setMessage("Company followed");
        } catch (err) {
            setError(err.message || "Could not follow company");
        }
    };

    const unfollowCompany = async (companyProfileId) => {
        setError("");
        setMessage("");

        try {
            const response = await fetch(`http://localhost:8080/company-follows/${companyProfileId}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Could not unfollow company");
            }

            setFollowedCompanyIds((current) =>
                current.filter((id) => Number(id) !== Number(companyProfileId))
            );

            setMessage("Company unfollowed");
        } catch (err) {
            setError(err.message || "Could not unfollow company");
        }
    };

    return (
        <div className="feed-page">
            <header className="prolink-topbar">
                <Link to="/feed" className="prolink-logo">
                    ProLink
                </Link>

                <div className="prolink-search">
                    <span>⌕</span>
                    <input
                        type="text"
                        placeholder="Search people or posts"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="topbar-actions">


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

                {currentUser && !isCompanyAccount() && (
                    <>
                        <Link to="/network" className="nav-item">
                            <span>☍</span>
                            Network
                        </Link>

                        <Link to="/messages" className="nav-item">
                            <span>✉</span>
                            Messages
                        </Link>
                    </>
                )}

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
                    {filteredPosts.length === 0 ? (
                        <div className="empty-feed-card">
                            <h2>No posts yet</h2>
                            <p>Create the first post on ProLink.</p>
                        </div>
                    ) : (
                        filteredPosts.map((post) => (
                            <article key={post.idPost} className="feed-post-card">
                                <div className="feed-post-header">
                                    <Link
                                        to={getProfilePath(post.idProfile)}
                                        className="post-author-avatar avatar-link"
                                    >
                                        {getInitial(post.authorName)}
                                    </Link>

                                    <Link
                                        to={getProfilePath(post.idProfile)}
                                        className="post-author-info post-author-click"
                                    >
                                        <h3>{post.authorName}</h3>
                                        <p>{post.authorLocation}</p>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </Link>

                                    <div className="post-menu-wrapper">
                                        <button
                                            className="post-more-button"
                                            type="button"
                                            onClick={() =>
                                                setOpenPostMenuId(openPostMenuId === post.idPost ? null : post.idPost)
                                            }
                                        >
                                            •••
                                        </button>

                                        {openPostMenuId === post.idPost && (
                                            <div className="post-menu">
                                                {isOwnPost(post) ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleEditPostFromFeed}
                                                    >
                                                        Edit post
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleReportPost}
                                                    >
                                                        Report post
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="feed-post-content">
                                    <h2>{post.postTitle}</h2>

                                    {post.postText && (
                                        <p>{post.postText}</p>
                                    )}

                                    {hasValidImageUrl(post.imageUrl) && (
                                        <img
                                            src={getPostImageSrc(post.imageUrl)}
                                            alt="Post"
                                            className="post-image"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="post-action-row">
                                    {shouldShowConnectButton(post.idProfile, post.authorRole) && (
                                        <button
                                            type="button"
                                            className="post-submit-button"
                                            onClick={() => sendConnectionRequest(post.idProfile)}
                                        >
                                            Connect
                                        </button>
                                    )}

                                    {isCompanyPost(post) &&
                                        Number(profile?.idProfile) !== Number(post.idProfile) &&
                                        !hasRole(currentUser, "COMPANY") && (
                                            <button
                                                type="button"
                                                className={
                                                    isFollowingCompany(post.idProfile)
                                                        ? "cancel-button"
                                                        : "post-submit-button"
                                                }
                                                onClick={() =>
                                                    isFollowingCompany(post.idProfile)
                                                        ? unfollowCompany(post.idProfile)
                                                        : followCompany(post.idProfile)
                                                }
                                            >
                                                {isFollowingCompany(post.idProfile) ? "Followed" : "Follow"}
                                            </button>
                                        )}
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