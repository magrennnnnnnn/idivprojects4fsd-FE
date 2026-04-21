import { useEffect, useState } from "react";
import AddWorkForm from "./AddWorkForm";
import AddEducationForm from "./AddEducationForm";
import AddCourseForm from "./AddCourseForm";

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [personalDetails, setPersonalDetails] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        void fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch("http://localhost:8080/profiles/me", {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Could not load profile");
            }

            const data = await response.json();
            setProfile(data);
            setName(data.name);
            setLocation(data.location);
            setPersonalDetails(data.personalDetails);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:8080/profiles/me", {
                method: "PUT",
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
                throw new Error(errorText || "Update failed");
            }

            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setEditMode(false);
            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.message);
        }
    };

    if (!profile) {
        return (
            <div className="register-page">
                <div className="register-card">
                    <p className="subtitle">Loading profile...</p>
                    {error && <p className="error-message">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                {!editMode ? (
                    <>
                        <div className="profile-header">
                            <h1 className="profile-name">{profile.name}</h1>
                            <button className="edit-button" onClick={() => setEditMode(true)}>
                                Edit Profile
                            </button>
                        </div>

                        <p className="profile-location">{profile.location}</p>

                        <div className="profile-section">
                            <h2>About</h2>
                            <p>{profile.personalDetails}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="profile-name">Edit Profile</h1>

                        <form onSubmit={handleUpdate} className="register-form">
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <label>Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />

                            <label>Personal Details</label>
                            <textarea
                                className="profile-textarea"
                                value={personalDetails}
                                onChange={(e) => setPersonalDetails(e.target.value)}
                                required
                            />

                            <button type="submit">Save Changes</button>
                        </form>

                        <button className="cancel-button" onClick={() => setEditMode(false)}>
                            Cancel
                        </button>
                    </>
                )}

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <AddWorkForm profileId={profile.idProfile} />
                <AddEducationForm profileId={profile.idProfile} />
                <AddCourseForm profileId={profile.idProfile} />
            </div>
        </div>
    );
}

export default ProfilePage;