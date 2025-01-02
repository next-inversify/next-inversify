import { createIOC } from '@next-inversify/core';
import { GqlClient } from '@next-inversify/gql/gql.client';
import { ContainerModule } from 'inversify';

export const apiModule = createIOC({
  module: new ContainerModule((bind) => {
    bind(GqlClient).toDynamicValue(
      () =>
        new GqlClient({
          url: 'https://spacex-production.up.railway.app',
        }),
    );
  }),
});
