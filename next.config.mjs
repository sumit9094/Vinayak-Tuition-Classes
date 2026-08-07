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
  env: {
    OVERRIDE_REACT_PDF_RECONCILER_REACT_VERSION: '18.2.0',
  },
  outputFileTracingIncludes: {
    '/api/fees/receipt/[paymentId]': ['./public/**/*', './src/fonts/**/*'],
  },
};

export default withPWA(nextConfig);
