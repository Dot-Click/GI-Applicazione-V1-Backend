import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "GI-Costruzioni API Documentation",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local server",
      },
    ],
  };
  
  
  const options = {
    swaggerDefinition,
    apis: ["./src/routes/*.js", "./index.js"],
  };
  
  const swaggerSpec = swaggerJSDoc(options);
  
  const swaggerDocs = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger docs available at http://localhost:4000/api-docs");
  };

export default swaggerDocs
