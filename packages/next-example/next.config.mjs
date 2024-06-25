import { withReflect } from '@next-inversify/core/src/with-reflect.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => withReflect(config),
};

export default nextConfig;
