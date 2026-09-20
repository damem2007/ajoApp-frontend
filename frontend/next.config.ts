import type { NextConfig } from "next";
import { backendOrigin } from "./src/lib/backend-origin";
import { allowedDevOrigins } from "./src/lib/dev-origins";
import { clientSettings } from "./src/lib/client-config";

// Fail during build/startup instead of shipping a client with missing settings.
backendOrigin();
clientSettings();
const config: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: allowedDevOrigins(),
  distDir: process.env.AJO_NEXT_DIST_DIR || ".next",
};
export default config;
