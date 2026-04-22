import { useEffect, useState } from "react";
import AddWorkForm from "./AddWorkForm";
import AddEducationForm from "./AddEducationForm";
import AddCourseForm from "./AddCourseForm";

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [workList, setWorkList] = useState([]);
    const [educationList, setEducationList] = useState([]);
    const [courseList, setCourseList] = useState([]);
    const [editMode, setEditMode] = useState(false);

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [personalDetails, setPersonalDetails] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        void fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const profileResponse = await fetch("http://localhost:8080/profiles/me", {
                method: "GET",
                credentials: "include"
            });

            if (!profileResponse.ok) {
                throw new Error("Could not load profile");
            }

            const profileData = await profileResponse.json();

            setProfile(profileData);
            setName(profileData.name);
            setLocation(profileData.location);
            setPersonalDetails(profileData.personalDetails);

            const profileId = profileData.idProfile;

            const [workResponse, educationResponse, courseResponse] = await Promise.all([
                fetch(`http://localhost:8080/work/profile/${profileId}`, {
                    method: "GET",
                    credentials: "include"
                }),
                fetch(`http://localhost:8080/education/profile/${profileId}`, {
                    method: "GET",
                    credentials: "include"
                }),
                fetch(`http://localhost:8080/course/profile/${profileId}`, {
                    method: "GET",
                    credentials: "include"
                })
            ]);

            if (workResponse.ok) {
                const workData = await workResponse.json();
                setWorkList(workData);
            }

            if (educationResponse.ok) {
                const educationData = await educationResponse.json();
                setEducationList(educationData);
            }

            if (courseResponse.ok) {
                const courseData = await courseResponse.json();
                setCourseList(courseData);
            }
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

            await fetchAllData();
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

                        <div className="profile-section">
                            <h2>Work Experience</h2>
                            {workList.length === 0 ? (
                                <p>No work experience added yet.</p>
                            ) : (
                                workList.map((work) => (
                                    <div key={work.idProfileWork} className="entry-card">
                                        <h3>{work.workInstitutionName}</h3>
                                        <p>{work.work}</p>
                                        <p>{work.workLocation} • {work.workScheduleType}</p>
                                        <p>{work.startDateWork} - {work.onGoingWork ? "Present" : work.endDateWork}</p>
                                        <p>{work.workSkills}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="profile-section">
                            <h2>Education</h2>
                            {educationList.length === 0 ? (
                                <p>No education added yet.</p>
                            ) : (
                                educationList.map((education) => (
                                    <div key={education.idProfileEducation} className="entry-card">
                                        <h3>{education.institutionName}</h3>
                                        <p>{education.degree}</p>
                                        <p>{education.startDateSchool} - {education.onGoingSchool ? "Present" : education.endDateSchool}</p>
                                        <p>{education.educationalSkills}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="profile-section">
                            <h2>Courses</h2>
                            {courseList.length === 0 ? (
                                <p>No courses added yet.</p>
                            ) : (
                                courseList.map((course) => (
                                    <div key={course.idProfileCourse} className="entry-card">
                                        <h3>{course.courseName}</h3>
                                        <p>{course.course}</p>
                                        <p>{course.startDateCourse} - {course.endDateCourse}</p>
                                        <p>{course.courseSkills}</p>
                                    </div>
                                ))
                            )}
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

                        <AddWorkForm profileId={profile.idProfile} onWorkAdded={fetchAllData} />
                        <AddEducationForm profileId={profile.idProfile} onEducationAdded={fetchAllData} />
                        <AddCourseForm profileId={profile.idProfile} onCourseAdded={fetchAllData} />
                    </>
                )}

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default ProfilePage;