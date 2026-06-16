const API = "http://localhost:8080";

describe("Posts and feed", () => {
    it("loads the feed and displays existing posts", () => {
        cy.mockFeedPage({
            profile: {
                idProfile: 10,
                name: "Cypress User",
                location: "Eindhoven",
                personalDetails: "Testing feed."
            },
            posts: [
                {
                    idPost: 1,
                    postTitle: "Existing Cypress Post",
                    postText: "This post came from the mocked backend.",
                    idProfile: 10,
                    profileName: "Cypress User",
                    profileLocation: "Eindhoven",
                    createdAt: "2026-06-14T12:00:00"
                }
            ]
        });

        cy.visit("/feed");

        cy.contains("Existing Cypress Post").should("be.visible");
        cy.contains("This post came from the mocked backend.").should("be.visible");
        cy.contains("Cypress User").should("be.visible");
    });

    it("creates a text post", () => {
        const profile = {
            idProfile: 10,
            name: "Cypress User",
            location: "Eindhoven",
            personalDetails: "Testing posts."
        };

        let posts = [];

        cy.mockCurrentProfile(profile);
        cy.mockEmptyNetwork();

        cy.intercept("GET", `${API}/posts`, (req) => {
            req.reply({
                statusCode: 200,
                body: posts
            });
        }).as("getPosts");

        cy.intercept("POST", `${API}/posts`, (req) => {
            posts = [
                {
                    idPost: 100,
                    postTitle: "Cypress Text Post",
                    postText: "This post was created by Cypress.",
                    idProfile: profile.idProfile,
                    profileName: profile.name,
                    profileLocation: profile.location,
                    createdAt: "2026-06-14T12:00:00"
                }
            ];

            req.reply({
                statusCode: 200,
                body: posts[0]
            });
        }).as("createPost");

        cy.visit("/feed");

        cy.get('input[placeholder="Give your post a title"]').type("Cypress Text Post");
        cy.get('textarea[placeholder="Start a post..."]').type(
            "This post was created by Cypress."
        );

        cy.contains("button", "Post").click();

        cy.wait("@createPost");

        cy.contains("Post created successfully").should("be.visible");
        cy.contains("Cypress Text Post").should("be.visible");
        cy.contains("This post was created by Cypress.").should("be.visible");
    });

    it("keeps the post button disabled when only the title is filled", () => {
        cy.mockFeedPage({
            profile: {
                idProfile: 10,
                name: "Cypress User",
                location: "Eindhoven",
                personalDetails: "Testing validation."
            },
            posts: []
        });

        cy.visit("/feed");

        cy.get('input[placeholder="Give your post a title"]').type("Title without content");

        cy.contains("button", "Post").should("be.disabled");
    });

    it("sends a connection request from another user's post", () => {
        cy.mockFeedPage({
            profile: {
                idProfile: 10,
                name: "Cypress User",
                location: "Eindhoven",
                personalDetails: "Testing connections from feed."
            },
            posts: [
                {
                    idPost: 2,
                    postTitle: "Post from another user",
                    postText: "You should be able to connect with this user.",
                    idProfile: 20,
                    profileName: "Other User",
                    profileLocation: "Tilburg",
                    createdAt: "2026-06-14T12:00:00"
                }
            ]
        });

        cy.intercept("POST", `${API}/connections`, (req) => {
            expect(req.body.receiverProfileId).to.eq(20);

            req.reply({
                statusCode: 200,
                body: {
                    idConnection: 200,
                    requesterProfileId: 10,
                    receiverProfileId: 20,
                    status: "PENDING"
                }
            });
        }).as("sendConnectionRequest");

        cy.visit("/feed");

        cy.contains("Post from another user").should("be.visible");

        cy.contains("button", "Connect").click();

        cy.wait("@sendConnectionRequest");

        cy.contains("Connection request sent").should("be.visible");
    });
});