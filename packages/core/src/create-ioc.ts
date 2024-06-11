import { IOCDescriptor } from './ioc.descriptor';

export const createIOC = ({ module, autoInstantiate }: IOCDescriptor): IOCDescriptor => {
  return { module, autoInstantiate };
};
