import { useEffect } from 'react';

import { IOCDescriptor } from './init-ioc';
import { useIOCContext } from './ioc.context';

export const useIOC = (...descriptors: IOCDescriptor[]): void => {
  const { loadDescriptors, IOCTimers, unloadDescriptors } = useIOCContext();

  loadDescriptors(descriptors);

  useEffect(() => {
    descriptors.forEach(({ module }) => clearTimeout(IOCTimers.get(module.id)));

    return () => {
      unloadDescriptors(descriptors);
    };
  }, []);
};
