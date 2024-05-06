export const withReflect = (config: any) => {
  const entry = async () => {
    const _entry = await config.entry();

    const mainApp = _entry['main-app'] ?? [];

    return {
      ..._entry,
      'main-app': ['reflect-metadata/lite', ...mainApp],
    };
  };

  return { ...config, entry };
};
