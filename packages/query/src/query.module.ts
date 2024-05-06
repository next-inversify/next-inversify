import { ContainerModule } from 'inversify';

import { IOCDescriptor } from '@next-inversify/core';
import { QueryLoader } from './query.loader';

export const queryModule: IOCDescriptor = {
  module: new ContainerModule((bind) => {
    bind(QueryLoader).toSelf();
  }),
};
