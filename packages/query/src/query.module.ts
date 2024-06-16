import { IOCDescriptor } from '@next-inversify/core';
import { ContainerModule } from 'inversify';

import { QueryStore } from './query.store';

export const queryModule: IOCDescriptor = {
  module: new ContainerModule((bind) => {
    bind(QueryStore).toSelf();
  }),
};
