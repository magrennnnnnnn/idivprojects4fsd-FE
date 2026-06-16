Cypress.Commands.add("registerAndLogin", (email, password, role = "STANDARD_USER") => {
    cy.visit("/");

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);

    cy.get("body").then(($body) => {
        if ($body.find('select[name="role"]').length > 0) {
            cy.get('select[name="role"]').select(role);
        }
    });

    cy.contains("button", /register/i).click();

    cy.visit("/login");

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.contains("button", /login/i).click();

    cy.url().should("include", "/feed");
});