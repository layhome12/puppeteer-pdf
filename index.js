import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import MainController from "./src/controllers/mainController.js";
import swaggerConfig from "./src/config/swagger.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

// -- swagger init
const swaggerSpec = swaggerJsdoc(swaggerConfig);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) =>
  res.json({
    message: "Welcome to Puppeteer PDF v1.0",
    documentationUrl: "/docs",
  })
);

// -- routing
app.get("/preview/pdf", MainController.preview);
app.post("/generate/pdf", MainController.pdf);
app.post("/generate/bulk/pdf", MainController.pdfBulk);

// -- handler 404
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
