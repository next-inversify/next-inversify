import { withReflect } from '@next-inversify/core/src/with-reflect.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => withReflect(config),
};

export default nextConfig;
