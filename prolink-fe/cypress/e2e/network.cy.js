const API = "http://localhost:8080";

describe("Network", () => {
    it("shows received requests, sent requests and accepted connections", () => {
        cy.mockCurrentProfile({
            idProfile: 10,
            name: "Cypress User",
            location: "Eindhoven",
            personalDetails: "Testing network."
        });

        cy.intercept("GET", `${API}/connections/received`, {
            statusCode: 200,
            body: [
                {
                    idConnection: 1,
                    requesterProfileId: 20,
                    requesterProfileName: "Jackson Tester",
                    requesterProfileLocation: "Tilburg",
                    receiverProfileId: 10,
                    receiverProfileName: "Cypress User",
                    receiverProfileLocation: "Eindhoven",
                    status: "PENDING"
                }
            ]
        }).as("getReceivedRequests");

        cy.intercept("GET", `${API}/connections/sent`, {
            statusCode: 200,
            body: [
                {
                    idConnection: 2,
                    requesterProfileId: 10,
                    requesterProfileName: "Cypress User",
                    requesterProfileLocation: "Eindhoven",
                    receiverProfileId: 30,
                    receiverProfileName: "Pending User",
                    receiverProfileLocation: "Amsterdam",
                    status: "PENDING"
                }
            ]
        }).as("getSentRequests");

        cy.intercept("GET", `${API}/connections/me`, {
            statusCode: 200,
            body: [
                {
                    idConnection: 3,
                    requesterProfileId: 10,
                    requesterProfileName: "Cypress User",
                    requesterProfileLocation: "Eindhoven",
                    receiverProfileId: 40,
                    receiverProfileName: "Connected User",
                    receiverProfileLocation: "Rotterdam",
                    status: "ACCEPTED"
                }
            ]
        }).as("getConnections");

        cy.visit("/network");

        cy.contains("My Network").should("be.visible");

        cy.contains("Received Requests").should("be.visible");
        cy.contains("Jackson Tester").should("be.visible");
        cy.contains("wants to connect with you.").should("be.visible");

        cy.contains("Sent Requests").should("be.visible");
        cy.contains("Pending User").should("be.visible");
        cy.contains("Your connection request is still pending.").should("be.visible");

        cy.contains("Connections").should("be.visible");
        cy.contains("Connected User").should("be.visible");
        cy.contains("You are connected.").should("be.visible");
    });

    it("accepts a connection request", () => {
        cy.mockCurrentProfile({
            idProfile: 10,
            name: "Cypress User",
            location: "Eindhoven",
            personalDetails: "Testing accept request."
        });

        cy.intercept("GET", `${API}/connections/received`, {
            statusCode: 200,
            body: [
                {
                    idConnection: 1,
                    requesterProfileId: 20,
                    requesterProfileName: "Jackson Tester",
                    requesterProfileLocation: "Tilburg",
                    receiverProfileId: 10,
                    receiverProfileName: "Cypress User",
                    receiverProfileLocation: "Eindhoven",
                    status: "PENDING"
                }
            ]
        }).as("getReceivedRequests");

        cy.intercept("GET", `${API}/connections/sent`, {
            statusCode: 200,
            body: []
        }).as("getSentRequests");

        cy.intercept("GET", `${API}/connections/me`, {
            statusCode: 200,
            body: []
        }).as("getConnections");

        cy.intercept("PUT", `${API}/connections/1/accept`, {
            statusCode: 200,
            body: {
                idConnection: 1,
                status: "ACCEPTED"
            }
        }).as("acceptRequest");

        cy.visit("/network");

        cy.contains("Jackson Tester").should("be.visible");

        cy.contains("button", "Accept").click();

        cy.wait("@acceptRequest");
    });

    it("declines a connection request", () => {
        cy.mockCurrentProfile({
            idProfile: 10,
            name: "Cypress User",
            location: "Eindhoven",
            personalDetails: "Testing decline request."
        });

        cy.intercept("GET", `${API}/connections/received`, {
            statusCode: 200,
            body: [
                {
                    idConnection: 5,
                    requesterProfileId: 25,
                    requesterProfileName: "Decline User",
                    requesterProfileLocation: "Breda",
                    receiverProfileId: 10,
                    receiverProfileName: "Cypress User",
                    receiverProfileLocation: "Eindhoven",
                    status: "PENDING"
                }
            ]
        }).as("getReceivedRequests");

        cy.intercept("GET", `${API}/connections/sent`, {
            statusCode: 200,
            body: []
        }).as("getSentRequests");

        cy.intercept("GET", `${API}/connections/me`, {
            statusCode: 200,
            body: []
        }).as("getConnections");

        cy.intercept("PUT", `${API}/connections/5/decline`, {
            statusCode: 200,
            body: {
                idConnection: 5,
                status: "DECLINED"
            }
        }).as("declineRequest");

        cy.visit("/network");

        cy.contains("Decline User").should("be.visible");

        cy.contains("button", "Decline").click();

        cy.wait("@declineRequest");
    });
});