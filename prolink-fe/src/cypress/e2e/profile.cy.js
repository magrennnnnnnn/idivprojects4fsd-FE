describe("Edit profile", () => {
    const email = `editprofile_${Date.now()}@prolink.com`;
    const password = "Password123";

    beforeEach(() => {
        cy.registerAndLogin(email, password);

        cy.visit("/profile/create");
        cy.get('input[name="name"]').type("Old Name");
        cy.get('input[name="location"]').type("Old Location");
        cy.get('textarea[name="personalDetails"]').type("Old details");
        cy.contains("button", /create|save/i).click();
    });

    it("updates profile information", () => {
        cy.visit("/profile");

        cy.contains(/edit/i).click();

        cy.get('input[name="name"]').clear().type("Updated Name");
        cy.get('input[name="location"]').clear().type("Eindhoven");
        cy.get('textarea[name="personalDetails"]')
            .clear()
            .type("Updated profile details.");

        cy.contains("button", /save|update/i).click();

        cy.contains("Updated Name").should("be.visible");
        cy.contains("Eindhoven").should("be.visible");
        cy.contains("Updated profile details.").should("be.visible");
    });
});