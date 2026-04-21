import { useState } from "react";

function AddEducationForm({ profileId, onEducationAdded }) {
    const [institutionName, setInstitutionName] = useState("");
    const [startDateSchool, setStartDateSchool] = useState("");
    const [endDateSchool, setEndDateSchool] = useState("");
    const [onGoingSchool, setOnGoingSchool] = useState(false);
    const [educationalSkills, setEducationalSkills] = useState("");
    const [degree, setDegree] = useState("BACHELOR");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:8080/education", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profileId,
                    institutionName,
                    startDateSchool,
                    endDateSchool: onGoingSchool ? null : endDateSchool,
                    onGoingSchool,
                    educationalSkills,
                    degree
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not add education");
            }

            const data = await response.json();
            setMessage("Education added successfully!");

            setInstitutionName("");
            setStartDateSchool("");
            setEndDateSchool("");
            setOnGoingSchool(false);
            setEducationalSkills("");
            setDegree("BACHELOR");

            if (onEducationAdded) {
                onEducationAdded(data);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="profile-section">
            <h2>Add Education</h2>

            <form onSubmit={handleSubmit} className="register-form">
                <label>Institution</label>
                <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                />

                <label>Start Date</label>
                <input
                    type="date"
                    value={startDateSchool}
                    onChange={(e) => setStartDateSchool(e.target.value)}
                    required
                />

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={onGoingSchool}
                        onChange={(e) => setOnGoingSchool(e.target.checked)}
                    />
                    Ongoing
                </label>

                {!onGoingSchool && (
                    <>
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDateSchool}
                            onChange={(e) => setEndDateSchool(e.target.value)}
                        />
                    </>
                )}

                <label>Details / Skills</label>
                <textarea
                    className="profile-textarea"
                    value={educationalSkills}
                    onChange={(e) => setEducationalSkills(e.target.value)}
                    required
                />

                <label>Degree</label>
                <select value={degree} onChange={(e) => setDegree(e.target.value)}>
                    <option value="HIGH_SCHOOL_DIPLOMA">High School Diploma</option>
                    <option value="BACHELOR">Bachelor</option>
                    <option value="MASTER">Master</option>
                    <option value="PHD">PhD</option>
                </select>

                <button type="submit">Add Education</button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default AddEducationForm;