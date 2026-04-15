import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateProfileForm() {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [personalDetails, setPersonalDetails] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleCreateProfile = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:8080/profiles", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    location,
                    personalDetails
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Profile creation failed");
            }

            await response.json();

            setMessage("Profile created successfully!");
            navigate("/profile");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h1 className="title">Create Profile</h1>
                <p className="subtitle">Build your ProLink presence</p>

                <form onSubmit={handleCreateProfile} className="register-form">
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label>Location</label>
                    <input
                        type="text"
                        placeholder="Enter your location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />

                    <label>Personal Details</label>
                    <textarea
                        className="profile-textarea"
                        placeholder="Write something about yourself"
                        value={personalDetails}
                        onChange={(e) => setPersonalDetails(e.target.value)}
                        required
                    />

                    <button type="submit">Create Profile</button>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default CreateProfileForm;