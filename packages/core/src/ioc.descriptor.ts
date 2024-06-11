import { ContainerModule, interfaces } from 'inversify';

export type IOCDescriptor = {
  autoInstantiate?: readonly interfaces.ServiceIdentifier<unknown>[];
  module: ContainerModule;
};
