import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    connectMessageSocket,
    disconnectMessageSocket,
    sendSocketMessage
} from "../websocket/messageSocket";

function ChatPage() {
    const navigate = useNavigate();
    const { profileId } = useParams();

    const receiverProfileId = Number(profileId);

    const [myProfile, setMyProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");

    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        void loadChatPage();

        return () => {
            disconnectMessageSocket();
        };
    }, [profileId]);

    const loadChatPage = async () => {
        setLoading(true);
        setError("");

        try {
            const profile = await loadMyProfile();

            if (!profile) {
                return;
            }

            await loadMessageHistory();

            connectMessageSocket(
                profile.idProfile,
                handleMessageReceived,
                handleSocketError
            );
        } catch (err) {
            setError(err.message || "Could not load chat");
        } finally {
            setLoading(false);
        }
    };

    const loadMessageHistory = async () => {
        const response = await fetch(`http://localhost:8080/messages/${receiverProfileId}`, {
            method: "GET",
            credentials: "include"
        });

        if (response.status === 401) {
            navigate("/login");
            return;
        }

        if (response.status === 403) {
            throw new Error("You can only view messages with your connections");
        }

        if (!response.ok) {
            throw new Error("Could not load message history");
        }

        const data = await response.json();
        setMessages(data);
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
        setMyProfile(data);
        return data;
    };

    const handleMessageReceived = (newMessage) => {
        const belongsToThisChat =
            newMessage.senderProfileId === receiverProfileId ||
            newMessage.receiverProfileId === receiverProfileId;

        if (!belongsToThisChat) {
            return;
        }

        setMessages((currentMessages) => {
            const alreadyExists = currentMessages.some((message) =>
                message.idMessage &&
                newMessage.idMessage &&
                message.idMessage === newMessage.idMessage
            );

            if (alreadyExists) {
                return currentMessages;
            }

            return [...currentMessages, newMessage];
        });
    };

    const handleSocketError = (message) => {
        setError(message);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        setError("");

        if (!messageText.trim()) {
            setError("Message cannot be empty");
            return;
        }

        if (!receiverProfileId) {
            setError("Receiver profile was not found");
            return;
        }

        try {
            setSending(true);

            sendSocketMessage(receiverProfileId, messageText.trim());

            setMessageText("");
        } catch (err) {
            setError(err.message || "Could not send message");
        } finally {
            setSending(false);
        }
    };

    const isMyMessage = (message) => {
        return myProfile && message.senderProfileId === myProfile.idProfile;
    };

    const getOtherProfileName = () => {
        const messageWithOtherUser = messages.find(
            (message) =>
                message.senderProfileId === receiverProfileId ||
                message.receiverProfileId === receiverProfileId
        );

        if (!messageWithOtherUser) {
            return `Profile #${receiverProfileId}`;
        }

        if (messageWithOtherUser.senderProfileId === receiverProfileId) {
            return messageWithOtherUser.senderProfileName;
        }

        return messageWithOtherUser.receiverProfileName;
    };

    const formatDate = (value) => {
        if (!value) {
            return "";
        }

        return new Date(value).toLocaleString();
    };

    return (
        <div className="feed-page">
            <header className="prolink-topbar">
                <Link to="/feed" className="prolink-logo">
                    ProLink
                </Link>

                <div className="topbar-actions">
                    <Link to="/network" className="nav-item">
                        Network
                    </Link>

                    <Link to="/profile" className="small-avatar avatar-link">
                        {myProfile?.name ? myProfile.name.charAt(0).toUpperCase() : "U"}
                    </Link>
                </div>
            </header>

            <main className="feed-shell">
                {loading && <p className="feed-status-message">Loading chat...</p>}
                {error && <p className="error-message">{error}</p>}

                <section className="post-composer-card">
                    <h1>Chat with {getOtherProfileName()}</h1>
                </section>

                <section className="feed-post-card chat-card">
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <p className="feed-status-message">
                                No messages yet. Send the first message.
                            </p>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={`${message.idMessage}-${index}`}
                                    className={
                                        isMyMessage(message)
                                            ? "chat-message chat-message-me"
                                            : "chat-message chat-message-other"
                                    }
                                >
                                    <strong>
                                        {isMyMessage(message)
                                            ? "You"
                                            : message.senderProfileName}
                                    </strong>

                                    <p>{message.messageText}</p>

                                    <span>{formatDate(message.createdAt)}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-form">
                        <input
                            type="text"
                            placeholder="Write a message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            maxLength={2000}
                        />

                        <button
                            type="submit"
                            className="post-submit-button"
                            disabled={sending || !messageText.trim()}
                        >
                            {sending ? "Sending..." : "Send"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default ChatPage;