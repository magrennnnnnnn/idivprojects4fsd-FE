import { useState } from "react";

function AddWorkForm({ profileId, onWorkAdded }) {
    const [workInstitutionName, setWorkInstitutionName] = useState("");
    const [startDateWork, setStartDateWork] = useState("");
    const [endDateWork, setEndDateWork] = useState("");
    const [onGoingWork, setOnGoingWork] = useState(false);
    const [workSkills, setWorkSkills] = useState("");
    const [work, setWork] = useState("Software_Development");
    const [workLocation, setWorkLocation] = useState("Remote");
    const [workScheduleType, setWorkScheduleType] = useState("Full_Time");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:8080/work", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profileId,
                    workInstitutionName,
                    startDateWork,
                    endDateWork: onGoingWork ? null : endDateWork,
                    onGoingWork,
                    workSkills,
                    work,
                    workLocation,
                    workScheduleType
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not add work");
            }

            const data = await response.json();

            setMessage("Work experience added successfully!");
            setWorkInstitutionName("");
            setStartDateWork("");
            setEndDateWork("");
            setOnGoingWork(false);
            setWorkSkills("");
            setWork("Software_Development");
            setWorkLocation("Remote");
            setWorkScheduleType("Full_Time");

            if (onWorkAdded) {
                onWorkAdded(data);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="profile-section">
            <h2>Add Work Experience</h2>

            <form onSubmit={handleSubmit} className="register-form">
                <label>Institution / Company</label>
                <input
                    type="text"
                    value={workInstitutionName}
                    onChange={(e) => setWorkInstitutionName(e.target.value)}
                    required
                />

                <label>Start Date</label>
                <input
                    type="date"
                    value={startDateWork}
                    onChange={(e) => setStartDateWork(e.target.value)}
                    required
                />

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={onGoingWork}
                        onChange={(e) => setOnGoingWork(e.target.checked)}
                    />
                    Ongoing
                </label>

                {!onGoingWork && (
                    <>
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDateWork}
                            onChange={(e) => setEndDateWork(e.target.value)}
                        />
                    </>
                )}

                <label>Skills / Details</label>
                <textarea
                    className="profile-textarea"
                    value={workSkills}
                    onChange={(e) => setWorkSkills(e.target.value)}
                    required
                />

                <label>Work Type</label>
                <select value={work} onChange={(e) => setWork(e.target.value)}>
                    <option value="Artificial_Intelligence">Artificial Intelligence</option>
                    <option value="Software_Development">Software Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud_Computing">Cloud Computing</option>
                    <option value="Data_Science">Data Science</option>
                    <option value="UI_Design">UI Design</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Game_Development">Game Development</option>
                    <option value="IT_Support">IT Support</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human_Resources">Human Resources</option>
                    <option value="Project_Management">Project Management</option>
                    <option value="Journalism">Journalism</option>
                    <option value="Graphic_Design">Graphic Design</option>
                </select>

                <label>Work Location</label>
                <select value={workLocation} onChange={(e) => setWorkLocation(e.target.value)}>
                    <option value="On_site">On site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                </select>

                <label>Schedule</label>
                <select value={workScheduleType} onChange={(e) => setWorkScheduleType(e.target.value)}>
                    <option value="Full_Time">Full Time</option>
                    <option value="Part_Time">Part Time</option>
                    <option value="Internship">Internship</option>
                </select>

                <button type="submit">Add Work</button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default AddWorkForm;