export default {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Puppeteer PDF",
      version: "1.0.0",
      description: "API to generate PDF from HTML string",
    },
  },
  apis: ["./src/controllers/*.js"],
};
