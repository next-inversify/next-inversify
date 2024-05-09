/** @type {import('next').NextConfig} */
export const withReflect = (nextConfig) => ({
  webpack: (config) => {
    const entry = async () => {
      const _entry = await config.entry();

      const mainApp = _entry['main-app'] ?? [];

      return {
        ..._entry,
        'main-app': ['reflect-metadata/lite', ...mainApp],
      };
    };

    return { ...config, entry };
  },
  ...nextConfig,
});
