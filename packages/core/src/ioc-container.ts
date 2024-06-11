import 'reflect-metadata/lite';
import { Container } from 'inversify';

import { isServer } from './utils/is-server';

let container: Container;

export const getContainer =
  <P extends any[]>(createContainer: (...params: P) => Container) =>
  (...params: P) => {
    if (isServer) {
      const container = createContainer(...params);

      return container;
    }

    if (!container) {
      container = createContainer(...params);
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
