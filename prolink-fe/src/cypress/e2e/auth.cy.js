describe("Authentication", () => {
    const uniqueEmail = `testuser_${Date.now()}@prolink.com`;
    const password = "Password123";

    it("registers a new user", () => {
        cy.visit("/");

        cy.get('input[name="email"]').type(uniqueEmail);
        cy.get('input[name="password"]').type(password);

        // Only include this if your register form has role selection
        cy.get('select[name="role"]').select("STANDARD_USER");

        cy.contains("button", /register/i).click();

        cy.contains(/account created|registered|login/i).should("be.visible");
    });

    it("logs in with valid credentials", () => {
        cy.visit("/login");

        cy.get('input[name="email"]').type(uniqueEmail);
        cy.get('input[name="password"]').type(password);

        cy.contains("button", /login/i).click();

        cy.url().should("include", "/feed");
    });

    it("shows an error for invalid login", () => {
        cy.visit("/login");

        cy.get('input[name="email"]').type("wrong@test.com");
        cy.get('input[name="password"]').type("wrongpassword");

        cy.contains("button", /login/i).click();

        cy.contains(/invalid|incorrect|error/i).should("be.visible");
    });
});