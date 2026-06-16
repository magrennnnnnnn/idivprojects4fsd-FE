describe("Posts", () => {
    const email = `posts_${Date.now()}@prolink.com`;
    const password = "Password123";

    beforeEach(() => {
        cy.registerAndLogin(email, password);

        cy.visit("/profile/create");
        cy.get('input[name="name"]').type("Post User");
        cy.get('input[name="location"]').type("Eindhoven");
        cy.get('textarea[name="personalDetails"]').type("Testing posts.");
        cy.contains("button", /create|save/i).click();
    });

    it("creates a text post", () => {
        cy.visit("/feed");

        cy.get('input[name="postTitle"]').type("My first ProLink post");
        cy.get('textarea[name="postText"]').type("This is a test post from Cypress.");

        cy.contains("button", /post|create|submit/i).click();

        cy.contains("My first ProLink post").should("be.visible");
        cy.contains("This is a test post from Cypress.").should("be.visible");
    });

    it("does not allow an empty post", () => {
        cy.visit("/feed");

        cy.contains("button", /post|create|submit/i).click();

        cy.contains(/required|add text|title/i).should("be.visible");
    });

    it("creates an image post", () => {
        cy.visit("/feed");

        cy.get('input[name="postTitle"]').type("Image post test");

        cy.get('input[type="file"]').selectFile("cypress/fixtures/post-image.png", {
            force: true,
        });

        cy.contains("button", /post|create|submit/i).click();

        cy.contains("Image post test").should("be.visible");
        cy.get("img").should("exist");
    });

    it("rejects a non-image file", () => {
        cy.visit("/feed");

        cy.get('input[name="postTitle"]').type("Invalid file test");

        cy.writeFile("cypress/fixtures/not-image.txt", "this is not an image");

        cy.get('input[type="file"]').selectFile("cypress/fixtures/not-image.txt", {
            force: true,
        });

        cy.contains("button", /post|create|submit/i).click();

        cy.contains(/only image|invalid file|not an image/i).should("be.visible");
    });

});

