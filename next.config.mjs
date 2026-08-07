import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  workboxOptions: {
    swSrc: "worker/sw.ts",
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/pdfkit/js/data/**/*', './public/**/*'],
  },
};

export default withPWA(nextConfig);
