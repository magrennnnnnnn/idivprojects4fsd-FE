import { useState } from "react";

function AddCourseForm({ profileId, onCourseAdded }) {
    const [courseName, setCourseName] = useState("");
    const [startDateCourse, setStartDateCourse] = useState("");
    const [endDateCourse, setEndDateCourse] = useState("");
    const [courseSkills, setCourseSkills] = useState("");
    const [course, setCourse] = useState("Computer_Science");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:8080/course", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profileId,
                    courseName,
                    startDateCourse,
                    endDateCourse,
                    courseSkills,
                    course
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not add course");
            }

            const data = await response.json();

            setMessage("Course added successfully!");
            setCourseName("");
            setStartDateCourse("");
            setEndDateCourse("");
            setCourseSkills("");
            setCourse("Computer_Science");

            if (onCourseAdded) {
                onCourseAdded(data);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="profile-section">
            <h2>Add Course</h2>

            <form onSubmit={handleSubmit} className="register-form">
                <label>Course Name</label>
                <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    required
                />

                <label>Start Date</label>
                <input
                    type="date"
                    value={startDateCourse}
                    onChange={(e) => setStartDateCourse(e.target.value)}
                    required
                />

                <label>End Date</label>
                <input
                    type="date"
                    value={endDateCourse}
                    onChange={(e) => setEndDateCourse(e.target.value)}
                    required
                />

                <label>Course Details / Skills</label>
                <textarea
                    className="profile-textarea"
                    value={courseSkills}
                    onChange={(e) => setCourseSkills(e.target.value)}
                    required
                />

                <label>Course Type</label>
                <select value={course} onChange={(e) => setCourse(e.target.value)}>
                    <option value="Computer_Science">Computer Science</option>
                    <option value="Software_Engineering">Software Engineering</option>
                    <option value="Artificial_Intelligence">Artificial Intelligence</option>
                    <option value="Data_Science">Data Science</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Information_Technology">Information Technology</option>
                    <option value="Business_Administration">Business Administration</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Law_Juris_Doctor">Law / Juris Doctor</option>
                    <option value="Graphic_Design">Graphic Design</option>
                    <option value="Journalism">Journalism</option>
                    <option value="Environmental_Science">Environmental Science</option>
                </select>

                <button type="submit">Add Course</button>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default AddCourseForm;