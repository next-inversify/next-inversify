import { interfaces } from 'inversify';

import { Callback } from './utils';
import { IOCDescriptor } from './ioc.descriptor';

export const initIOC = (
  container: interfaces.Container,
  descriptors: IOCDescriptor[],
  instantiate = true,
): Callback<void> => {
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
