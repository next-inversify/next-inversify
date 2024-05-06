import 'reflect-metadata/lite';
import { Container } from 'inversify';

import { isServer } from './utils/is-server';

let container: Container;

export const getContainer = (createContainer: () => Container) => () => {
  if (isServer) {
    const container = createContainer();

    return container;
  }

  if (!container) {
    container = createContainer();
  }

  return container;
};

let IOCBag: number[];

export const getIOCBag = () => {
  if (isServer) {
    return [];
  }

  if (!IOCBag) {
    IOCBag = [];
  }

  return IOCBag;
};
