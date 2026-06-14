import { z } from "zod";

export const CreateProviderSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  type: z.string().min(1),
  apiKey: z.string().trim().optional(),
  webhookSecret: z.string().trim().optional(),
  domain: z.string().trim().optional(),
  region: z.string().trim().optional().default("US"),
  accessKeyId: z.string().trim().optional(),
  secretAccessKey: z.string().trim().optional(),
  serverToken: z.string().trim().optional(),
});

export const UpdateProviderSchema = CreateProviderSchema.partial();

export const CreateAiProviderSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  type: z.string().min(1),
  apiKey: z.string().min(1),
  model: z.string().trim().optional(),
});
