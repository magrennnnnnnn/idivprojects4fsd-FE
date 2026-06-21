import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ViewProfilePage() {
    const navigate = useNavigate();
    const { profileId } = useParams();

    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadProfile();
    }, [profileId]);

    const hasRole = (user, role) => {
        if (!user || !user.roles) {
            return false;
        }

        if (Array.isArray(user.roles)) {
            return user.roles.includes(role);
        }

        return user.roles === role;
    };

    const isCurrentUserCompany = () => {
        return hasRole(currentUser, "COMPANY");
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

    const loadProfile = async () => {
        setLoading(true);
        setError("");

        try {
            await loadCurrentUser();

            const profileResponse = await fetch(`http://localhost:8080/profiles/${profileId}`, {
                method: "GET",
                credentials: "include"
            });

            if (profileResponse.status === 401) {
                navigate("/login");
                return;
            }

            if (!profileResponse.ok) {
                throw new Error("Could not load profile");
            }

            const profileData = await profileResponse.json();
            setProfile(profileData);

            const postsResponse = await fetch(`http://localhost:8080/posts/profile/${profileId}`, {
                method: "GET",
                credentials: "include"
            });

            if (postsResponse.ok) {
                setPosts(await postsResponse.json());
            } else {
                setPosts([]);
            }
        } catch (err) {
            setError(err.message || "Could not load profile");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return "";
        return new Date(value).toLocaleString();
    };

    const getInitial = (name) => {
        if (!name || name.trim().length === 0) return "U";
        return name.trim().charAt(0).toUpperCase();
    };

    const hasValidImageUrl = (imageUrl) => {
        if (!imageUrl) return false;

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

    const isViewedCompanyProfile = () => {
        if (profile?.role === "COMPANY" || profile?.roles === "COMPANY") {
            return true;
        }

        return posts.some((post) => post.authorRole === "COMPANY");
    };

    return (
        <div className="feed-page">
            <header className="prolink-topbar">
                <Link to="/feed" className="prolink-logo">
                    ProLink
                </Link>

                <div className="prolink-search">
                    <span>⌕</span>
                    <input type="text" placeholder="Search" disabled />
                </div>

                <div className="topbar-actions">
                    <Link to="/profile" className="small-avatar avatar-link">
                        U
                    </Link>
                </div>
            </header>

            <nav className="prolink-nav simple-nav">
                <Link to="/feed" className="nav-item">
                    <span>⌂</span>
                    Feed
                </Link>

                {!isCurrentUserCompany() && (
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
                {loading && <p className="feed-status-message">Loading profile...</p>}
                {error && <p className="error-message">{error}</p>}

                {profile && (
                    <>
                        <section className="post-composer-card">
                            <div className="feed-post-header">
                                <div className="post-author-avatar">
                                    {getInitial(profile.name)}
                                </div>

                                <div className="post-author-info">
                                    {isViewedCompanyProfile() && (
                                        <span className="company-badge">Company account</span>
                                    )}

                                    <h3>{profile.name}</h3>
                                    <p>{profile.location}</p>

                                    {profile.personalDetails && (
                                        <span>{profile.personalDetails}</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="feed-posts">
                            {posts.length === 0 ? (
                                <div className="empty-feed-card">
                                    <h2>No posts yet</h2>
                                    <p>This profile has not posted anything yet.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <article key={post.idPost} className="feed-post-card">
                                        <div className="feed-post-content">
                                            <h2>{post.postTitle}</h2>

                                            {post.postText && <p>{post.postText}</p>}

                                            <span>{formatDate(post.createdAt)}</span>

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
                                    </article>
                                ))
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default ViewProfilePage;