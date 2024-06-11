import { Container } from 'inversify';
import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { IOCDescriptor, createIOCState } from './ioc';

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
  state?: IOCProviderState;
}>;

export const IOCProvider = (props: IOCProviderProps) => {
  const { children, container, state } = props;

  const [iocState] = useState(() => state ?? createIOCState(container));

  return <IOCContext.Provider value={iocState}>{children}</IOCContext.Provider>;
};

export const useIOCContext = () => {
  return useContext(IOCContext) as IOCProviderState;
};
