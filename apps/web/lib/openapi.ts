export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Senlo Public API",
    version: "1.0.0",
    description: "API for triggering transactional emails and managing templates.",
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
        summary: "Trigger a transactional email",
        tags: ["Emails"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["campaignId", "to"],
                properties: {
                  campaignId: { type: "number" },
                  to: { type: "string", format: "email" },
                  data: { type: "object", description: "Merge tags data" },
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
