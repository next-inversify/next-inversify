import { getContainer, initIOC } from '@next-inversify/core';
import { queryModule } from '@next-inversify/query/query.module';
import { Container } from 'inversify';

import { apiModule } from './api/api.module';

export const appContainer = getContainer(() => {
  const container = new Container({
    defaultScope: 'Singleton',
    skipBaseClassChecks: true,
  });

  initIOC(container, [queryModule, apiModule]);

  return container;
});
