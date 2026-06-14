describe("Chat messages", () => {
    const userA = `chat_a_${Date.now()}@prolink.com`;
    const userB = `chat_b_${Date.now()}@prolink.com`;
    const password = "Password123";

    it("allows connected users to send a chat message", () => {
        // This assumes users are already created and connected.
        // For portfolio/demo, you can prepare test users manually in the database.

        cy.visit("/login");
        cy.get('input[name="email"]').type(userA);
        cy.get('input[name="password"]').type(password);
        cy.contains("button", /login/i).click();

        cy.visit("/messages");

        cy.contains("User B").click();

        cy.get('input[name="messageText"], textarea[name="messageText"]')
            .type("Hello from Cypress!");

        cy.contains("button", /send/i).click();

        cy.contains("Hello from Cypress!").should("be.visible");
    });
});