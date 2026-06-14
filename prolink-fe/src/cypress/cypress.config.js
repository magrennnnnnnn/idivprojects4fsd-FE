const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://localhost:5173",
        supportFile: "cypress/support/e2e.js",
        video: false,
        screenshotsFolder: "cypress/screenshots",
        videosFolder: "cypress/videos",
    },
});