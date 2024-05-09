import { withReflect } from '@next-inversify/core/src/with-reflect.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = withReflect({
  webpack: (config) => withReflect(config),
});

export default nextConfig;
