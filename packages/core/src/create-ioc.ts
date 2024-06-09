import { IOCDescriptor } from '.';

export const createIOC = ({ module, autoInstantiate }: IOCDescriptor): IOCDescriptor => {
  return { module, autoInstantiate };
};
