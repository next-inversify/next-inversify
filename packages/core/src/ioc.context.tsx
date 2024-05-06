import { Container } from 'inversify';
import { PropsWithChildren, createContext, useContext, useState } from 'react';

import { IOCDescriptor } from './init-ioc';
import { getIOCBag } from './ioc';

type IOCProviderState = {
  container: Container;
  IOCBag: number[];
  IOCTimers: Map<number, NodeJS.Timeout>;
  loadDescriptors: (descriptors: IOCDescriptor[]) => void;
  unloadDescriptors: (descriptors: IOCDescriptor[]) => void;
  unloadDescriptor: (descriptor: IOCDescriptor) => void;
};

const IOCContext = createContext<IOCProviderState | null>(null);

type IOCProviderProps = PropsWithChildren<{
  container: Container;
}>;

export const IOCProvider = (props: IOCProviderProps) => {
  const { children, container } = props;

  const [IOCBag] = useState<number[]>(getIOCBag);

  const [state] = useState(() => {
    const IOCTimers = new Map<number, NodeJS.Timeout>();

    const loadDescriptors = (descriptors: IOCDescriptor[]) => {
      for (const descriptor of descriptors) {
        if (!IOCBag.includes(descriptor.module.id)) {
          IOCBag.push(descriptor.module.id);
          container.load(descriptor.module);
          descriptor.autoInstantiate?.forEach((identifier) => {
            container.get(identifier);
          });
        }
      }
    };

    const unloadDescriptors = (descriptors: IOCDescriptor[]) => {
      descriptors.forEach((descriptor) => {
        const timer = setTimeout(() => {
          unloadDescriptor(descriptor);
        }, 500);

        IOCTimers.set(descriptor.module.id, timer);
      });
    };

    const unloadDescriptor = (descriptor: IOCDescriptor) => {
      IOCTimers.delete(descriptor.module.id);
      if (IOCBag.includes(descriptor.module.id)) {
        container.unload(descriptor.module);
        const idx = IOCBag.findIndex((id) => id === descriptor.module.id);
        if (idx !== -1) {
          IOCBag.splice(idx, 1);
        }
      }
    };

    return { IOCBag, IOCTimers, loadDescriptors, unloadDescriptors, unloadDescriptor, container };
  });

  return <IOCContext.Provider value={state}>{children}</IOCContext.Provider>;
};

export const useIOCContext = () => {
  return useContext(IOCContext) as IOCProviderState;
};
