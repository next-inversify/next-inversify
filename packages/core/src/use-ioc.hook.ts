import { useEffect } from 'react';

import { useIOCContext } from './ioc.context';
import { IOCDescriptor } from './ioc';

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
