import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ViewProfilePage() {
    const navigate = useNavigate();
    const { profileId } = useParams();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadProfile();
    }, [profileId]);

    const loadProfile = async () => {
        setLoading(true);
        setError("");

        try {
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
                                    <h3>{profile.name}</h3>
                                    <p>{profile.location}</p>
                                    <span>{profile.personalDetails}</span>
                                </div>
                            </div>
                        </section>

                        <section className="feed-posts">
                            {posts.length === 0 ? (
                                <div className="empty-feed-card">
                                    <h2>No posts yet</h2>
                                    <p>This user has not posted anything yet.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <article key={post.idPost} className="feed-post-card">
                                        <div className="feed-post-content">
                                            <h2>{post.postTitle}</h2>

                                            {post.postText && <p>{post.postText}</p>}

                                            <span>{formatDate(post.createdAt)}</span>

                                            {post.imageUrl && (
                                                <img
                                                    src={`http://localhost:8080${post.imageUrl}`}
                                                    alt="Post"
                                                    className="post-image"
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