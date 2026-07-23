import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  // Avoid upload attempts unless CI provides SENTRY_AUTH_TOKEN.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
