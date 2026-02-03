/**
 * Global application constants and environment configuration.
 */

export const IS_DEMO_MODE = 
  process.env.IS_DEMO_MODE === "true" || 
  process.env.NEXT_PUBLIC_IS_DEMO_MODE === "true";

export const ALLOW_REGISTRATION = 
  process.env.ALLOW_REGISTRATION !== "false" && 
  process.env.NEXT_PUBLIC_ALLOW_REGISTRATION !== "false";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
