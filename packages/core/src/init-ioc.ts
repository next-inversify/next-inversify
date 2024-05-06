import { ContainerModule, interfaces } from 'inversify';

import { DisposerLike } from './utils/disposable';

export type IOCDescriptor = {
  autoInstantiate?: readonly interfaces.ServiceIdentifier<unknown>[];
  module: ContainerModule;
};

export const initIOC = (
  container: interfaces.Container,
  descriptors: IOCDescriptor[],
  instantiate = true,
): DisposerLike => {
  const modules = descriptors.map(({ module }) => module);

  container.load(...modules);

  if (instantiate) {
    const autoInstantiates = descriptors.map(({ autoInstantiate }) => autoInstantiate).flat(1);

    autoInstantiates.forEach((identifier) => identifier && container.get(identifier));
  }

  return (): void => {
    descriptors.forEach((descriptor) => {
      container.unload(descriptor.module);
    });
  };
};
