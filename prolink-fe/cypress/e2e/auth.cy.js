const API = "http://localhost:8080";

describe("Authentication", () => {
    it("registers a new user", () => {
        const email = `cypress_${Date.now()}@prolink.test`;
        const password = "Password123";

        cy.intercept("POST", `${API}/auth/register`, (req) => {
            expect(req.body.email).to.eq(email);
            expect(req.body.password).to.eq(password);
            expect(req.body.roles).to.eq("STANDARD_USER");

            req.reply({
                statusCode: 200,
                body: {
                    id: 1,
                    email,
                    roles: "STANDARD_USER"
                }
            });
        }).as("registerUser");

        cy.visit("/");

        cy.contains("Create your account").should("be.visible");

        cy.fillAuthForm(email, password);

        cy.get("select").select("STANDARD_USER");

        cy.contains("button", "Register").click();

        cy.wait("@registerUser");

        cy.contains(`User created successfully: ${email}`).should("be.visible");
    });

    it("shows an error when registration fails", () => {
        cy.intercept("POST", `${API}/auth/register`, {
            statusCode: 409,
            body: "Email already exists"
        }).as("registerFailure");

        cy.visit("/");

        cy.fillAuthForm("existing@prolink.test", "Password123");

        cy.contains("button", "Register").click();

        cy.wait("@registerFailure");

        cy.contains("Email already exists").should("be.visible");
    });

    it("logs in and redirects to feed when the user already has a profile", () => {
        const email = "user@prolink.test";
        const password = "Password123";

        cy.intercept("POST", `${API}/auth/login`, {
            statusCode: 200,
            body: {
                id: 1,
                email,
                roles: "STANDARD_USER"
            }
        }).as("loginUser");

        cy.mockFeedPage({
            profile: {
                idProfile: 10,
                name: "Cypress User",
                location: "Eindhoven",
                personalDetails: "Existing user profile."
            },
            posts: []
        });

        cy.visit("/login");

        cy.contains("Login to your account").should("be.visible");

        cy.fillAuthForm(email, password);

        cy.contains("button", "Login").click();

        cy.wait("@loginUser");

        cy.url().should("include", "/feed");

        cy.contains("No posts yet").should("be.visible");
    });

    it("logs in and redirects to create profile when the user has no profile", () => {
        const email = "newuser@prolink.test";
        const password = "Password123";

        cy.intercept("POST", `${API}/auth/login`, {
            statusCode: 200,
            body: {
                id: 2,
                email,
                roles: "STANDARD_USER"
            }
        }).as("loginUser");

        cy.intercept("GET", `${API}/profiles/me`, {
            statusCode: 404,
            body: "Profile not found"
        }).as("profileNotFound");

        cy.visit("/login");

        cy.fillAuthForm(email, password);

        cy.contains("button", "Login").click();

        cy.wait("@loginUser");
        cy.wait("@profileNotFound");

        cy.url().should("include", "/profile/create");

        cy.contains("Create Profile").should("be.visible");
    });
});