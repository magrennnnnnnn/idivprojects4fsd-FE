describe("Connections", () => {
    const userA = `usera_${Date.now()}@prolink.com`;
    const userB = `userb_${Date.now()}@prolink.com`;
    const password = "Password123";

    it("sends and accepts a connection request", () => {
        // Register user A
        cy.registerAndLogin(userA, password);

        cy.visit("/profile/create");
        cy.get('input[name="name"]').type("User A");
        cy.get('input[name="location"]').type("Eindhoven");
        cy.get('textarea[name="personalDetails"]').type("Profile A");
        cy.contains("button", /create|save/i).click();

        cy.clearCookies();

        // Register user B
        cy.registerAndLogin(userB, password);

        cy.visit("/profile/create");
        cy.get('input[name="name"]').type("User B");
        cy.get('input[name="location"]').type("Tilburg");
        cy.get('textarea[name="personalDetails"]').type("Profile B");
        cy.contains("button", /create|save/i).click();

        // User B searches/opens network page and connects to User A
        cy.visit("/network");

        cy.contains("User A").should("be.visible");
        cy.contains("User A")
            .parent()
            .contains(/connect/i)
            .click();

        cy.contains(/pending|request sent/i).should("be.visible");

        cy.clearCookies();

        // User A logs in and accepts
        cy.visit("/login");
        cy.get('input[name="email"]').type(userA);
        cy.get('input[name="password"]').type(password);
        cy.contains("button", /login/i).click();

        cy.visit("/network");

        cy.contains("User B").should("be.visible");
        cy.contains("User B")
            .parent()
            .contains(/accept/i)
            .click();

        cy.contains(/connected|accepted/i).should("be.visible");
    });
});