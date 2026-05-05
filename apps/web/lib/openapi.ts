export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Senlo Public API",
    version: "1.0.0",
    description: "API for triggering emails and managing templates.",
  },
  servers: [
    {
      url: "/api",
      description: "Default API Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {},
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/triggered": {
      post: {
        summary: "Trigger an email",
        tags: ["Emails"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id", "to"],
                properties: {
                  id: { type: "number", description: "Trigger ID" },
                  to: { type: "string", format: "email" },
                  data: { type: "object", description: "Merge tags data" },
                  locale: { type: "string", description: "Target locale (e.g. en, ru)" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email queued successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
