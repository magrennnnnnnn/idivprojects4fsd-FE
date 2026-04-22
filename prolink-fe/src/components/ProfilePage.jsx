import { useEffect, useState } from "react";

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

    const [editingWorkId, setEditingWorkId] = useState(null);
    const [editingEducationId, setEditingEducationId] = useState(null);
    const [editingCourseId, setEditingCourseId] = useState(null);

    const [editingWorkData, setEditingWorkData] = useState({
        workInstitutionName: "",
        startDateWork: "",
        endDateWork: "",
        onGoingWork: false,
        workSkills: "",
        work: "Software_Development",
        workLocation: "Remote",
        workScheduleType: "Full_Time"
    });

    const [editingEducationData, setEditingEducationData] = useState({
        institutionName: "",
        startDateSchool: "",
        endDateSchool: "",
        onGoingSchool: false,
        educationalSkills: "",
        degree: "BACHELOR"
    });

    const [editingCourseData, setEditingCourseData] = useState({
        courseName: "",
        startDateCourse: "",
        endDateCourse: "",
        courseSkills: "",
        course: "Computer_Science"
    });

    const [newWork, setNewWork] = useState({
        workInstitutionName: "",
        startDateWork: "",
        endDateWork: "",
        onGoingWork: false,
        workSkills: "",
        work: "Software_Development",
        workLocation: "Remote",
        workScheduleType: "Full_Time"
    });

    const [newEducation, setNewEducation] = useState({
        institutionName: "",
        startDateSchool: "",
        endDateSchool: "",
        onGoingSchool: false,
        educationalSkills: "",
        degree: "BACHELOR"
    });

    const [newCourse, setNewCourse] = useState({
        courseName: "",
        startDateCourse: "",
        endDateCourse: "",
        courseSkills: "",
        course: "Computer_Science"
    });

    useEffect(() => {
        void fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setError("");

            const profileResponse = await fetch("http://localhost:8080/profiles/me", {
                method: "GET",
                credentials: "include"
            });

            if (!profileResponse.ok) {
                throw new Error("Could not load profile");
            }

            const profileData = await profileResponse.json();

            setProfile(profileData);
            setName(profileData.name || "");
            setLocation(profileData.location || "");
            setPersonalDetails(profileData.personalDetails || "");

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
                setWorkList(await workResponse.json());
            } else {
                setWorkList([]);
            }

            if (educationResponse.ok) {
                setEducationList(await educationResponse.json());
            } else {
                setEducationList([]);
            }

            if (courseResponse.ok) {
                setCourseList(await courseResponse.json());
            } else {
                setCourseList([]);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleProfileUpdate = async (e) => {
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
                throw new Error(errorText || "Could not update profile");
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

    const handleAddWork = async (e) => {
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
                    profileId: profile.idProfile,
                    workInstitutionName: newWork.workInstitutionName,
                    startDateWork: newWork.startDateWork,
                    endDateWork: newWork.onGoingWork ? null : newWork.endDateWork,
                    onGoingWork: newWork.onGoingWork,
                    workSkills: newWork.workSkills,
                    work: newWork.work,
                    workLocation: newWork.workLocation,
                    workScheduleType: newWork.workScheduleType
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not add work");
            }

            setNewWork({
                workInstitutionName: "",
                startDateWork: "",
                endDateWork: "",
                onGoingWork: false,
                workSkills: "",
                work: "Software_Development",
                workLocation: "Remote",
                workScheduleType: "Full_Time"
            });

            setMessage("Work added successfully!");
            await fetchAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddEducation = async (e) => {
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
                    profileId: profile.idProfile,
                    institutionName: newEducation.institutionName,
                    startDateSchool: newEducation.startDateSchool,
                    endDateSchool: newEducation.onGoingSchool ? null : newEducation.endDateSchool,
                    onGoingSchool: newEducation.onGoingSchool,
                    educationalSkills: newEducation.educationalSkills,
                    degree: newEducation.degree
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not add education");
            }

            setNewEducation({
                institutionName: "",
                startDateSchool: "",
                endDateSchool: "",
                onGoingSchool: false,
                educationalSkills: "",
                degree: "BACHELOR"
            });

            setMessage("Education added successfully!");
            await fetchAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddCourse = async (e) => {
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
                    profileId: profile.idProfile,
                    courseName: newCourse.courseName,
                    startDateCourse: newCourse.startDateCourse,
                    endDateCourse: newCourse.endDateCourse,
                    courseSkills: newCourse.courseSkills,
                    course: newCourse.course
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not add course");
            }

            setNewCourse({
                courseName: "",
                startDateCourse: "",
                endDateCourse: "",
                courseSkills: "",
                course: "Computer_Science"
            });

            setMessage("Course added successfully!");
            await fetchAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    const startEditWork = (work) => {
        setEditingWorkId(work.idProfileWork);
        setEditingWorkData({
            workInstitutionName: work.workInstitutionName || "",
            startDateWork: work.startDateWork || "",
            endDateWork: work.endDateWork || "",
            onGoingWork: work.onGoingWork || false,
            workSkills: work.workSkills || "",
            work: work.work || "Software_Development",
            workLocation: work.workLocation || "Remote",
            workScheduleType: work.workScheduleType || "Full_Time"
        });
    };

    const startEditEducation = (education) => {
        setEditingEducationId(education.idProfileEducation);
        setEditingEducationData({
            institutionName: education.institutionName || "",
            startDateSchool: education.startDateSchool || "",
            endDateSchool: education.endDateSchool || "",
            onGoingSchool: education.onGoingSchool || false,
            educationalSkills: education.educationalSkills || "",
            degree: education.degree || "BACHELOR"
        });
    };

    const startEditCourse = (course) => {
        setEditingCourseId(course.idProfileCourse);
        setEditingCourseData({
            courseName: course.courseName || "",
            startDateCourse: course.startDateCourse || "",
            endDateCourse: course.endDateCourse || "",
            courseSkills: course.courseSkills || "",
            course: course.course || "Computer_Science"
        });
    };

    const handleUpdateWork = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch(`http://localhost:8080/work/${editingWorkId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    workInstitutionName: editingWorkData.workInstitutionName,
                    startDateWork: editingWorkData.startDateWork,
                    endDateWork: editingWorkData.onGoingWork ? null : editingWorkData.endDateWork,
                    onGoingWork: editingWorkData.onGoingWork,
                    workSkills: editingWorkData.workSkills,
                    work: editingWorkData.work,
                    workLocation: editingWorkData.workLocation,
                    workScheduleType: editingWorkData.workScheduleType
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not update work");
            }

            setEditingWorkId(null);
            setMessage("Work updated successfully!");
            await fetchAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateEducation = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch(`http://localhost:8080/education/${editingEducationId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    institutionName: editingEducationData.institutionName,
                    startDateSchool: editingEducationData.startDateSchool,
                    endDateSchool: editingEducationData.onGoingSchool ? null : editingEducationData.endDateSchool,
                    onGoingSchool: editingEducationData.onGoingSchool,
                    educationalSkills: editingEducationData.educationalSkills,
                    degree: editingEducationData.degree
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not update education");
            }

            setEditingEducationId(null);
            setMessage("Education updated successfully!");
            await fetchAllData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch(`http://localhost:8080/course/${editingCourseId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    courseName: editingCourseData.courseName,
                    startDateCourse: editingCourseData.startDateCourse,
                    endDateCourse: editingCourseData.endDateCourse,
                    courseSkills: editingCourseData.courseSkills,
                    course: editingCourseData.course
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Could not update course");
            }

            setEditingCourseId(null);
            setMessage("Course updated successfully!");
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
                                        {editingWorkId === work.idProfileWork ? (
                                            <form onSubmit={handleUpdateWork} className="register-form">
                                                <label>Institution / Company</label>
                                                <input
                                                    type="text"
                                                    value={editingWorkData.workInstitutionName}
                                                    onChange={(e) => setEditingWorkData({ ...editingWorkData, workInstitutionName: e.target.value })}
                                                    required
                                                />

                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editingWorkData.startDateWork}
                                                    onChange={(e) => setEditingWorkData({ ...editingWorkData, startDateWork: e.target.value })}
                                                    required
                                                />

                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingWorkData.onGoingWork}
                                                        onChange={(e) => setEditingWorkData({ ...editingWorkData, onGoingWork: e.target.checked })}
                                                    />
                                                    Ongoing
                                                </label>

                                                {!editingWorkData.onGoingWork && (
                                                    <>
                                                        <label>End Date</label>
                                                        <input
                                                            type="date"
                                                            value={editingWorkData.endDateWork}
                                                            onChange={(e) => setEditingWorkData({ ...editingWorkData, endDateWork: e.target.value })}
                                                        />
                                                    </>
                                                )}

                                                <label>Skills / Details</label>
                                                <textarea
                                                    className="profile-textarea"
                                                    value={editingWorkData.workSkills}
                                                    onChange={(e) => setEditingWorkData({ ...editingWorkData, workSkills: e.target.value })}
                                                    required
                                                />

                                                <label>Work Type</label>
                                                <select
                                                    value={editingWorkData.work}
                                                    onChange={(e) => setEditingWorkData({ ...editingWorkData, work: e.target.value })}
                                                >
                                                    <option value="Artificial_Intelligence">Artificial Intelligence</option>
                                                    <option value="Software_Development">Software Development</option>
                                                    <option value="Cybersecurity">Cybersecurity</option>
                                                    <option value="Cloud_Computing">Cloud Computing</option>
                                                    <option value="Data_Science">Data Science</option>
                                                </select>

                                                <label>Work Location</label>
                                                <select
                                                    value={editingWorkData.workLocation}
                                                    onChange={(e) => setEditingWorkData({ ...editingWorkData, workLocation: e.target.value })}
                                                >
                                                    <option value="On_site">On site</option>
                                                    <option value="Remote">Remote</option>
                                                    <option value="Hybrid">Hybrid</option>
                                                </select>

                                                <label>Schedule</label>
                                                <select
                                                    value={editingWorkData.workScheduleType}
                                                    onChange={(e) => setEditingWorkData({ ...editingWorkData, workScheduleType: e.target.value })}
                                                >
                                                    <option value="Full_Time">Full Time</option>
                                                    <option value="Part_Time">Part Time</option>
                                                    <option value="Internship">Internship</option>
                                                </select>

                                                <button type="submit">Save Work</button>
                                                <button type="button" className="cancel-button" onClick={() => setEditingWorkId(null)}>
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <h3>{work.workInstitutionName}</h3>
                                                <p>{work.work}</p>
                                                <p>{work.workLocation} • {work.workScheduleType}</p>
                                                <p>{work.startDateWork} - {work.onGoingWork ? "Present" : work.endDateWork}</p>
                                                <p>{work.workSkills}</p>
                                                <button className="edit-button" onClick={() => startEditWork(work)}>
                                                    Edit
                                                </button>
                                            </>
                                        )}
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
                                        {editingEducationId === education.idProfileEducation ? (
                                            <form onSubmit={handleUpdateEducation} className="register-form">
                                                <label>Institution</label>
                                                <input
                                                    type="text"
                                                    value={editingEducationData.institutionName}
                                                    onChange={(e) => setEditingEducationData({ ...editingEducationData, institutionName: e.target.value })}
                                                    required
                                                />

                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editingEducationData.startDateSchool}
                                                    onChange={(e) => setEditingEducationData({ ...editingEducationData, startDateSchool: e.target.value })}
                                                    required
                                                />

                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingEducationData.onGoingSchool}
                                                        onChange={(e) => setEditingEducationData({ ...editingEducationData, onGoingSchool: e.target.checked })}
                                                    />
                                                    Ongoing
                                                </label>

                                                {!editingEducationData.onGoingSchool && (
                                                    <>
                                                        <label>End Date</label>
                                                        <input
                                                            type="date"
                                                            value={editingEducationData.endDateSchool}
                                                            onChange={(e) => setEditingEducationData({ ...editingEducationData, endDateSchool: e.target.value })}
                                                        />
                                                    </>
                                                )}

                                                <label>Details / Skills</label>
                                                <textarea
                                                    className="profile-textarea"
                                                    value={editingEducationData.educationalSkills}
                                                    onChange={(e) => setEditingEducationData({ ...editingEducationData, educationalSkills: e.target.value })}
                                                    required
                                                />

                                                <label>Degree</label>
                                                <select
                                                    value={editingEducationData.degree}
                                                    onChange={(e) => setEditingEducationData({ ...editingEducationData, degree: e.target.value })}
                                                >
                                                    <option value="HIGH_SCHOOL_DIPLOMA">High School Diploma</option>
                                                    <option value="BACHELOR">Bachelor</option>
                                                    <option value="MASTER">Master</option>
                                                    <option value="PHD">PhD</option>
                                                </select>

                                                <button type="submit">Save Education</button>
                                                <button type="button" className="cancel-button" onClick={() => setEditingEducationId(null)}>
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <h3>{education.institutionName}</h3>
                                                <p>{education.degree}</p>
                                                <p>{education.startDateSchool} - {education.onGoingSchool ? "Present" : education.endDateSchool}</p>
                                                <p>{education.educationalSkills}</p>
                                                <button className="edit-button" onClick={() => startEditEducation(education)}>
                                                    Edit
                                                </button>
                                            </>
                                        )}
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
                                        {editingCourseId === course.idProfileCourse ? (
                                            <form onSubmit={handleUpdateCourse} className="register-form">
                                                <label>Course Name</label>
                                                <input
                                                    type="text"
                                                    value={editingCourseData.courseName}
                                                    onChange={(e) => setEditingCourseData({ ...editingCourseData, courseName: e.target.value })}
                                                    required
                                                />

                                                <label>Start Date</label>
                                                <input
                                                    type="date"
                                                    value={editingCourseData.startDateCourse}
                                                    onChange={(e) => setEditingCourseData({ ...editingCourseData, startDateCourse: e.target.value })}
                                                    required
                                                />

                                                <label>End Date</label>
                                                <input
                                                    type="date"
                                                    value={editingCourseData.endDateCourse}
                                                    onChange={(e) => setEditingCourseData({ ...editingCourseData, endDateCourse: e.target.value })}
                                                    required
                                                />

                                                <label>Course Details / Skills</label>
                                                <textarea
                                                    className="profile-textarea"
                                                    value={editingCourseData.courseSkills}
                                                    onChange={(e) => setEditingCourseData({ ...editingCourseData, courseSkills: e.target.value })}
                                                    required
                                                />

                                                <label>Course Type</label>
                                                <select
                                                    value={editingCourseData.course}
                                                    onChange={(e) => setEditingCourseData({ ...editingCourseData, course: e.target.value })}
                                                >
                                                    <option value="Computer_Science">Computer Science</option>
                                                    <option value="Software_Engineering">Software Engineering</option>
                                                    <option value="Artificial_Intelligence">Artificial Intelligence</option>
                                                    <option value="Data_Science">Data Science</option>
                                                    <option value="Cybersecurity">Cybersecurity</option>
                                                    <option value="Information_Technology">Information Technology</option>
                                                </select>

                                                <button type="submit">Save Course</button>
                                                <button type="button" className="cancel-button" onClick={() => setEditingCourseId(null)}>
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <h3>{course.courseName}</h3>
                                                <p>{course.course}</p>
                                                <p>{course.startDateCourse} - {course.endDateCourse}</p>
                                                <p>{course.courseSkills}</p>
                                                <button className="edit-button" onClick={() => startEditCourse(course)}>
                                                    Edit
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="profile-name">Edit Profile</h1>

                        <form onSubmit={handleProfileUpdate} className="register-form">
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

                        <div className="profile-section">
                            <h2>Add Work Experience</h2>
                            <form onSubmit={handleAddWork} className="register-form">
                                <label>Institution / Company</label>
                                <input
                                    type="text"
                                    value={newWork.workInstitutionName}
                                    onChange={(e) => setNewWork({ ...newWork, workInstitutionName: e.target.value })}
                                    required
                                />

                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={newWork.startDateWork}
                                    onChange={(e) => setNewWork({ ...newWork, startDateWork: e.target.value })}
                                    required
                                />

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={newWork.onGoingWork}
                                        onChange={(e) => setNewWork({ ...newWork, onGoingWork: e.target.checked })}
                                    />
                                    Ongoing
                                </label>

                                {!newWork.onGoingWork && (
                                    <>
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            value={newWork.endDateWork}
                                            onChange={(e) => setNewWork({ ...newWork, endDateWork: e.target.value })}
                                        />
                                    </>
                                )}

                                <label>Skills / Details</label>
                                <textarea
                                    className="profile-textarea"
                                    value={newWork.workSkills}
                                    onChange={(e) => setNewWork({ ...newWork, workSkills: e.target.value })}
                                    required
                                />

                                <label>Work Type</label>
                                <select
                                    value={newWork.work}
                                    onChange={(e) => setNewWork({ ...newWork, work: e.target.value })}
                                >
                                    <option value="Artificial_Intelligence">Artificial Intelligence</option>
                                    <option value="Software_Development">Software Development</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="Cloud_Computing">Cloud Computing</option>
                                    <option value="Data_Science">Data Science</option>
                                </select>

                                <label>Work Location</label>
                                <select
                                    value={newWork.workLocation}
                                    onChange={(e) => setNewWork({ ...newWork, workLocation: e.target.value })}
                                >
                                    <option value="On_site">On site</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>

                                <label>Schedule</label>
                                <select
                                    value={newWork.workScheduleType}
                                    onChange={(e) => setNewWork({ ...newWork, workScheduleType: e.target.value })}
                                >
                                    <option value="Full_Time">Full Time</option>
                                    <option value="Part_Time">Part Time</option>
                                    <option value="Internship">Internship</option>
                                </select>

                                <button type="submit">Add Work</button>
                            </form>
                        </div>

                        <div className="profile-section">
                            <h2>Add Education</h2>
                            <form onSubmit={handleAddEducation} className="register-form">
                                <label>Institution</label>
                                <input
                                    type="text"
                                    value={newEducation.institutionName}
                                    onChange={(e) => setNewEducation({ ...newEducation, institutionName: e.target.value })}
                                    required
                                />

                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={newEducation.startDateSchool}
                                    onChange={(e) => setNewEducation({ ...newEducation, startDateSchool: e.target.value })}
                                    required
                                />

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={newEducation.onGoingSchool}
                                        onChange={(e) => setNewEducation({ ...newEducation, onGoingSchool: e.target.checked })}
                                    />
                                    Ongoing
                                </label>

                                {!newEducation.onGoingSchool && (
                                    <>
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            value={newEducation.endDateSchool}
                                            onChange={(e) => setNewEducation({ ...newEducation, endDateSchool: e.target.value })}
                                        />
                                    </>
                                )}

                                <label>Details / Skills</label>
                                <textarea
                                    className="profile-textarea"
                                    value={newEducation.educationalSkills}
                                    onChange={(e) => setNewEducation({ ...newEducation, educationalSkills: e.target.value })}
                                    required
                                />

                                <label>Degree</label>
                                <select
                                    value={newEducation.degree}
                                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                >
                                    <option value="HIGH_SCHOOL_DIPLOMA">High School Diploma</option>
                                    <option value="BACHELOR">Bachelor</option>
                                    <option value="MASTER">Master</option>
                                    <option value="PHD">PhD</option>
                                </select>

                                <button type="submit">Add Education</button>
                            </form>
                        </div>

                        <div className="profile-section">
                            <h2>Add Course</h2>
                            <form onSubmit={handleAddCourse} className="register-form">
                                <label>Course Name</label>
                                <input
                                    type="text"
                                    value={newCourse.courseName}
                                    onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                                    required
                                />

                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={newCourse.startDateCourse}
                                    onChange={(e) => setNewCourse({ ...newCourse, startDateCourse: e.target.value })}
                                    required
                                />

                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={newCourse.endDateCourse}
                                    onChange={(e) => setNewCourse({ ...newCourse, endDateCourse: e.target.value })}
                                    required
                                />

                                <label>Course Details / Skills</label>
                                <textarea
                                    className="profile-textarea"
                                    value={newCourse.courseSkills}
                                    onChange={(e) => setNewCourse({ ...newCourse, courseSkills: e.target.value })}
                                    required
                                />

                                <label>Course Type</label>
                                <select
                                    value={newCourse.course}
                                    onChange={(e) => setNewCourse({ ...newCourse, course: e.target.value })}
                                >
                                    <option value="Computer_Science">Computer Science</option>
                                    <option value="Software_Engineering">Software Engineering</option>
                                    <option value="Artificial_Intelligence">Artificial Intelligence</option>
                                    <option value="Data_Science">Data Science</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="Information_Technology">Information Technology</option>
                                </select>

                                <button type="submit">Add Course</button>
                            </form>
                        </div>
                    </>
                )}

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default ProfilePage;