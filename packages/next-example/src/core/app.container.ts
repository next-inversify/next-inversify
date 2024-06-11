import { Container } from 'inversify';

import { getContainer, initIOC } from '../../../core/src';
import { queryModule } from '@next-inversify/query/query.module';

export const appContainer = getContainer(() => {
  const container = new Container({
    defaultScope: 'Singleton',
    skipBaseClassChecks: true,
  });

  initIOC(container, [queryModule]);

  return container;
});
