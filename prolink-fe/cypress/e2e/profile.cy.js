const API = "http://localhost:8080";

describe("Profile", () => {
    it("creates a profile and redirects to feed", () => {
        const createdProfile = {
            idProfile: 10,
            name: "Cypress Profile",
            location: "Tilburg",
            personalDetails: "Profile created during Cypress E2E test."
        };

        cy.intercept("POST", `${API}/profiles`, (req) => {
            expect(req.body.name).to.eq(createdProfile.name);
            expect(req.body.location).to.eq(createdProfile.location);
            expect(req.body.personalDetails).to.eq(createdProfile.personalDetails);

            req.reply({
                statusCode: 200,
                body: createdProfile
            });
        }).as("createProfile");

        cy.mockFeedPage({
            profile: createdProfile,
            posts: []
        });

        cy.visit("/profile/create");

        cy.get('input[placeholder="Enter your full name"]').type(createdProfile.name);
        cy.get('input[placeholder="Enter your location"]').type(createdProfile.location);
        cy.get('textarea[placeholder="Write something about yourself"]').type(
            createdProfile.personalDetails
        );

        cy.contains("button", "Create Profile").click();

        cy.wait("@createProfile");

        cy.url().should("include", "/feed");
    });

    it("loads the profile page with work, education and courses sections", () => {
        cy.mockProfilePage({
            profile: {
                idProfile: 10,
                name: "Cypress User",
                location: "Eindhoven",
                personalDetails: "This is my ProLink profile."
            },
            work: [],
            education: [],
            courses: []
        });

        cy.visit("/profile");

        cy.contains("Cypress User").should("be.visible");
        cy.contains("Eindhoven").should("be.visible");
        cy.contains("This is my ProLink profile.").should("be.visible");

        cy.contains("Work Experience").should("be.visible");
        cy.contains("Education").should("be.visible");
        cy.contains("Courses").should("be.visible");
    });

    it("requests a profile improvement email", () => {
        cy.mockProfilePage({
            profile: {
                idProfile: 10,
                name: "Premium Cypress User",
                location: "Eindhoven",
                personalDetails: "Premium profile used for testing."
            }
        });

        cy.intercept("POST", `${API}/profiles/me/improvement-email`, {
            statusCode: 200,
            body: "Profile improvement email requested successfully"
        }).as("requestImprovementEmail");

        cy.visit("/profile");

        cy.contains("button", "Request profile improvement email").click();

        cy.wait("@requestImprovementEmail");

        cy.contains("Profile improvement email requested successfully").should("be.visible");
    });
});