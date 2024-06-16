'use client';

import { appContainer } from '@/core/app.container';
import { IOCProvider } from '@next-inversify/core/context';
import { QueryCacheProvider } from '@next-inversify/query/query-cache.provider';

type ProvidersProps = Readonly<{
  children: React.ReactNode;
}>;

export function Providers(props: ProvidersProps) {
  const container = appContainer();

  return (
    <IOCProvider container={container}>
      <QueryCacheProvider>{props.children}</QueryCacheProvider>
    </IOCProvider>
  );
}
