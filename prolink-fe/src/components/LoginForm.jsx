import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Login failed");
            }

            const data = await response.json();
            setMessage(`Welcome back: ${data.email}`);

            const profileResponse = await fetch("http://localhost:8080/profiles/me", {
                method: "GET",
                credentials: "include"
            });

            if (profileResponse.ok) {
                navigate("/profile");
            } else if (profileResponse.status === 404) {
                navigate("/profile/create");
            } else {
                const errorText = await profileResponse.text();
                throw new Error(errorText || "Could not check profile");
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h1 className="title">ProLink</h1>
                <p className="subtitle">Login to your account</p>

                <form onSubmit={handleLogin} className="register-form">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Login</button>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <p className="redirect-text">
                    Don’t have an account? <Link to="/">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;