import { IOCDescriptor } from '@next-inversify/core';
import { ContainerModule } from 'inversify';

import { QueryCache } from './query.cache';

export const queryModule: IOCDescriptor = {
  module: new ContainerModule((bind) => {
    bind(QueryCache).toSelf();
  }),
};
