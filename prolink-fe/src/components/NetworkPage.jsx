import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function NetworkPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [connections, setConnections] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        void loadNetworkPage();
    }, []);

    const loadNetworkPage = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const loadedProfile = await loadMyProfile();

            if (!loadedProfile) {
                return;
            }

            await Promise.all([
                loadReceivedRequests(),
                loadSentRequests(),
                loadConnections()
            ]);
        } catch (err) {
            setError(err.message || "Could not load network");
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

    const loadReceivedRequests = async () => {
        const response = await fetch("http://localhost:8080/connections/received", {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            navigate("/login");
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load received requests");
        }

        const data = await response.json();
        setReceivedRequests(data);
    };

    const loadSentRequests = async () => {
        const response = await fetch("http://localhost:8080/connections/sent", {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            navigate("/login");
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load sent requests");
        }

        const data = await response.json();
        setSentRequests(data);
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
            throw new Error("Could not load connections");
        }

        const data = await response.json();
        setConnections(data);
    };

    const acceptRequest = async (connectionId) => {
        setError("");
        setMessage("");

        try {
            const response = await fetch(`http://localhost:8080/connections/${connectionId}/accept`, {
                method: "PUT",
                credentials: "include"
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Could not accept request");
            }

            setMessage("Connection request accepted");
            await loadNetworkPage();
        } catch (err) {
            setError(err.message || "Could not accept request");
        }
    };

    const declineRequest = async (connectionId) => {
        setError("");
        setMessage("");

        try {
            const response = await fetch(`http://localhost:8080/connections/${connectionId}/decline`, {
                method: "PUT",
                credentials: "include"
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Could not decline request");
            }

            setMessage("Connection request declined");
            await loadNetworkPage();
        } catch (err) {
            setError(err.message || "Could not decline request");
        }
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

                <Link to="/network" className="nav-item active">
                    <span>☍</span>
                    Network
                </Link>

                <Link to="/profile" className="nav-item">
                    <span>♙</span>
                    Profile
                </Link>
            </nav>

            <main className="feed-shell">
                {loading && <p className="feed-status-message">Loading network...</p>}
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <section className="post-composer-card">
                    <h1>My Network</h1>
                    <p>Manage your connection requests and connections.</p>
                </section>

                <section className="feed-posts">
                    <article className="feed-post-card">
                        <div className="feed-post-content">
                            <h2>Received Requests</h2>

                            {receivedRequests.length === 0 ? (
                                <p>No pending received requests.</p>
                            ) : (
                                receivedRequests.map((request) => (
                                    <div key={request.idConnection} className="entry-card">
                                        <h3>Profile #{request.requesterProfileId}</h3>
                                        <p>wants to connect with you.</p>

                                        <button
                                            type="button"
                                            className="edit-button"
                                            onClick={() => acceptRequest(request.idConnection)}
                                        >
                                            Accept
                                        </button>

                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={() => declineRequest(request.idConnection)}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </article>

                    <article className="feed-post-card">
                        <div className="feed-post-content">
                            <h2>Sent Requests</h2>

                            {sentRequests.length === 0 ? (
                                <p>No pending sent requests.</p>
                            ) : (
                                sentRequests.map((request) => (
                                    <div key={request.idConnection} className="entry-card">
                                        <h3>Profile #{request.receiverProfileId}</h3>
                                        <p>Your connection request is still pending.</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </article>

                    <article className="feed-post-card">
                        <div className="feed-post-content">
                            <h2>Connections</h2>

                            {connections.length === 0 ? (
                                <p>You do not have accepted connections yet.</p>
                            ) : (
                                connections.map((connection) => (
                                    <div key={connection.idConnection} className="entry-card">
                                        <h3>Profile #{getOtherProfileId(connection)}</h3>
                                        <p>You are connected.</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </article>
                </section>
            </main>
        </div>
    );
}

export default NetworkPage;