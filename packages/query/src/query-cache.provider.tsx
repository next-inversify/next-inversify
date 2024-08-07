/* eslint-disable @typescript-eslint/no-explicit-any */
import { useService } from '@next-inversify/core/context';
import { isServer } from '@next-inversify/core/utils/is-server';
import { useServerInsertedHTML } from 'next/navigation';
import { useId, useRef, useState } from 'react';

import { htmlEscapeJsonString } from './htmlescape';
import { QueryCache } from './query.cache';
import { QueryState } from './query.state';
import { useHydrateCache } from './use-hydrate-cache.hook';

type QueryCacheProviderProps = {
  children?: React.ReactNode;
  cacheData?: Record<string, QueryState>;
};

type PreloadedState = [initialized: boolean, ...data: QueryState[][]];

const unboxCache = (cache: QueryState[]): Record<string, QueryState> => {
  return cache.reduce(
    (acc, query) => {
      acc[query.key] = query;

      return acc;
    },
    {} as Record<string, QueryState>,
  );
};

export const QueryCacheProvider = (props: QueryCacheProviderProps) => {
  useHydrateCache({ data: props.cacheData });

  const queryCache = useService(QueryCache);

  const [flushedKeys] = useState(new Set<string>());

  const id = `__L${useId()}`;
  const idJSON = htmlEscapeJsonString(JSON.stringify(id));

  const count = useRef(0);

  useServerInsertedHTML(() => {
    const cache = queryCache.dehydrate();

    const data: QueryState[] = [];

    for (const key in cache) {
      if (!flushedKeys.has(key) && (cache[key].isLoaded || cache[key].error)) {
        flushedKeys.add(key);

        data.push(cache[key]);
      }
    }

    if (data.length === 0) return null;

    const dataJSON = JSON.stringify(data);

    const html: Array<string | boolean> = [
      count.current === 0 && `window[${idJSON}] = [0];`,
      `window[${idJSON}].push(${htmlEscapeJsonString(dataJSON)});`,
    ].filter(Boolean);

    return (
      <script
        key={count.current++}
        dangerouslySetInnerHTML={{
          __html: html.join(''),
        }}
      />
    );
  });

  if (!isServer) {
    const preloadedState: PreloadedState = (window as any)[id] ?? [0];

    const [initialized, ...data] = preloadedState;

    if (!initialized && data.length > 0) {
      preloadedState[0] = true;

      queryCache.hydrate(unboxCache(data.flat()));

      const push = preloadedState.push.bind(preloadedState);

      preloadedState.push = (...args) => {
        const count = push(...args);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, ...data] = preloadedState;

        queryCache.hydrate(unboxCache(data.flat()));

        return count;
      };
    }
  }

  return props.children || null;
};
