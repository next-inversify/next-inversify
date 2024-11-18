import { Container } from 'inversify';
import { getIOCBag } from './ioc-container';
import { IOCDescriptor } from './ioc.descriptor';

export const createIOCState = (container: Container) => {
  const IOCBag = getIOCBag();
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
};
