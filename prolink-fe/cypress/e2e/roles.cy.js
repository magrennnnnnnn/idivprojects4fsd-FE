describe("Role-based access", () => {
    const premiumEmail = `premium_${Date.now()}@prolink.com`;
    const standardEmail = `standard_${Date.now()}@prolink.com`;
    const password = "Password123";

    it("allows premium user to request profile improvement advice", () => {
        cy.registerAndLogin(premiumEmail, password, "PREMIUM_USER");

        cy.visit("/profile/create");
        cy.get('input[name="name"]').type("Premium User");
        cy.get('input[name="location"]').type("Eindhoven");
        cy.get('textarea[name="personalDetails"]').type("Premium profile details");
        cy.contains("button", /create|save/i).click();

        cy.visit("/profile");

        cy.contains(/improve|advice|profile improvement/i).click();

        cy.contains(/sent|requested|email|success/i).should("be.visible");
    });

    it("does not allow standard user to request premium advice", () => {
        cy.registerAndLogin(standardEmail, password, "STANDARD_USER");

        cy.visit("/profile/create");
        cy.get('input[name="name"]').type("Standard User");
        cy.get('input[name="location"]').type("Eindhoven");
        cy.get('textarea[name="personalDetails"]').type("Standard profile details");
        cy.contains("button", /create|save/i).click();

        cy.visit("/profile");

        cy.contains(/improve|advice|profile improvement/i).should("not.exist");
    });
});