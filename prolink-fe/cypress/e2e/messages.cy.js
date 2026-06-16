const API = "http://localhost:8080";

describe("Messages", () => {
    it("shows message page with empty connections", () => {
        cy.mockCurrentProfile({
            idProfile: 10,
            name: "Cypress User",
            location: "Eindhoven",
            personalDetails: "Testing messages."
        });

        cy.intercept("GET", `${API}/connections/me`, {
            statusCode: 200,
            body: []
        }).as("getConnections");

        cy.visit("/messages");

        cy.contains("Messages").should("be.visible");
        cy.contains("Choose one of your connections to start chatting.").should("be.visible");
        cy.contains("No connections yet").should("be.visible");
        cy.contains("You need accepted connections before you can send messages.").should("be.visible");
    });

    it("shows accepted connections as chat options", () => {
        cy.mockCurrentProfile({
            idProfile: 10,
            name: "Cypress User",
            location: "Eindhoven",
            personalDetails: "Testing messages."
        });

        cy.intercept("GET", `${API}/connections/me`, {
            statusCode: 200,
            body: [
                {
                    idConnection: 3,
                    requesterProfileId: 10,
                    requesterProfileName: "Cypress User",
                    requesterProfileLocation: "Eindhoven",
                    receiverProfileId: 20,
                    receiverProfileName: "Chat Friend",
                    receiverProfileLocation: "Tilburg",
                    status: "ACCEPTED"
                }
            ]
        }).as("getConnections");

        cy.visit("/messages");

        cy.contains("Messages").should("be.visible");
        cy.contains("Chat Friend").should("be.visible");
        cy.contains("Tilburg").should("be.visible");

        cy.contains("a", "Chat")
            .should("be.visible")
            .and("have.attr", "href", "/chat/20");
    });
});