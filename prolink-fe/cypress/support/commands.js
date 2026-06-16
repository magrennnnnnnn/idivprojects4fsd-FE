const API = "http://localhost:8080";

Cypress.Commands.add("mockCurrentProfile", (profile = {}) => {
    const defaultProfile = {
        idProfile: 10,
        name: "Cypress User",
        location: "Eindhoven",
        personalDetails: "This profile is used for Cypress testing."
    };

    cy.intercept("GET", `${API}/profiles/me`, {
        statusCode: 200,
        body: {
            ...defaultProfile,
            ...profile
        }
    }).as("getMyProfile");
});

Cypress.Commands.add("mockEmptyNetwork", () => {
    cy.intercept("GET", `${API}/connections/me`, {
        statusCode: 200,
        body: []
    }).as("getConnections");

    cy.intercept("GET", `${API}/connections/sent`, {
        statusCode: 200,
        body: []
    }).as("getSentRequests");

    cy.intercept("GET", `${API}/connections/received`, {
        statusCode: 200,
        body: []
    }).as("getReceivedRequests");
});

Cypress.Commands.add("mockFeedPage", ({ profile, posts = [] } = {}) => {
    cy.mockCurrentProfile(profile);
    cy.mockEmptyNetwork();

    cy.intercept("GET", `${API}/posts`, {
        statusCode: 200,
        body: posts
    }).as("getPosts");
});

Cypress.Commands.add("mockProfilePage", ({ profile, work = [], education = [], courses = [] } = {}) => {
    const usedProfile = {
        idProfile: 10,
        name: "Cypress User",
        location: "Eindhoven",
        personalDetails: "This profile is used for Cypress testing.",
        ...profile
    };

    cy.mockCurrentProfile(usedProfile);

    cy.intercept("GET", `${API}/work/profile/${usedProfile.idProfile}`, {
        statusCode: 200,
        body: work
    }).as("getWork");

    cy.intercept("GET", `${API}/education/profile/${usedProfile.idProfile}`, {
        statusCode: 200,
        body: education
    }).as("getEducation");

    cy.intercept("GET", `${API}/course/profile/${usedProfile.idProfile}`, {
        statusCode: 200,
        body: courses
    }).as("getCourses");
});

Cypress.Commands.add("fillAuthForm", (email, password) => {
    cy.get('input[placeholder="Enter your email"]').clear().type(email);
    cy.get('input[placeholder="Enter your password"]').clear().type(password);
});