import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


function MessagesPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        void loadMessagesPage();
    }, []);

    const loadMessagesPage = async () => {
        setLoading(true);
        setError("");

        try {
            const loadedProfile = await loadMyProfile();

            if (!loadedProfile) {
                return;
            }

            await loadConnections();
        } catch (err) {
            setError(err.message || "Could not load messages page");
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

    const loadConnections = async () => {
        const response = await fetch("http://localhost:8080/connections/me", {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            navigate("/login");
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load your connections");
        }

        const data = await response.json();
        setConnections(data);
    };

    const getOtherProfileId = (connection) => {
        if (!profile) {
            return "";
        }

        if (connection.requesterProfileId === profile.idProfile) {
            return connection.receiverProfileId;
        }

        return connection.requesterProfileId;
    };

    const getOtherProfileName = (connection) => {
        if (!profile) {
            return "";
        }

        if (connection.requesterProfileId === profile.idProfile) {
            return connection.receiverProfileName;
        }

        return connection.requesterProfileName;
    };

    const getOtherProfileLocation = (connection) => {
        if (!profile) {
            return "";
        }

        if (connection.requesterProfileId === profile.idProfile) {
            return connection.receiverProfileLocation;
        }

        return connection.requesterProfileLocation;
    };

    const getInitial = (name) => {
        if (!name || name.trim().length === 0) {
            return "U";
        }

        return name.trim().charAt(0).toUpperCase();
    };


    const filteredConnections = connections.filter((connection) => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return true;
        }

        return (
            getOtherProfileName(connection)?.toLowerCase().includes(search) ||
            getOtherProfileLocation(connection)?.toLowerCase().includes(search)
        );
    });

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
                        placeholder="Search connections"
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
                <Link to="/feed" className="nav-item">
                    <span>⌂</span>
                    Feed
                </Link>

                <Link to="/network" className="nav-item">
                    <span>☍</span>
                    Network
                </Link>

                <Link to="/messages" className="nav-item active">
                    <span>✉</span>
                    Messages
                </Link>

                <Link to="/profile" className="nav-item">
                    <span>♙</span>
                    Profile
                </Link>
            </nav>

            <main className="feed-shell">
                {loading && <p className="feed-status-message">Loading messages...</p>}
                {error && <p className="error-message">{error}</p>}

                <section className="post-composer-card">
                    <h1>Messages</h1>
                    <p>Choose one of your connections to start chatting.</p>
                </section>

                <section className="feed-posts">
                    {filteredConnections.length === 0 ? (
                        <div className="empty-feed-card">
                            <h2>No connections yet</h2>
                            <p>You need accepted connections before you can send messages.</p>
                        </div>
                    ) : (
                        filteredConnections.map((connection) => (
                            <article key={connection.idConnection} className="feed-post-card">
                                <div className="feed-post-header">
                                    <div className="post-author-avatar">
                                        {getInitial(getOtherProfileName(connection))}
                                    </div>

                                    <div className="post-author-info">
                                        <h3>{getOtherProfileName(connection)}</h3>
                                        <p>{getOtherProfileLocation(connection)}</p>
                                    </div>

                                    <Link
                                        to={`/chat/${getOtherProfileId(connection)}`}
                                        className="post-submit-button"
                                    >
                                        Chat
                                    </Link>
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

export default MessagesPage;