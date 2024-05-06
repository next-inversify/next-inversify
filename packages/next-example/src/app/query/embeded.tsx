import { useService } from '@next-inversify/core';
import { QueryLoader } from '@next-inversify/query/query.loader';

export const EmbededQuery = () => {
  const { querySuspense } = useService(QueryLoader);

  const { data } = querySuspense({
    fetcher: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return fetch('https://catfact.ninja/fact').then((res) => res.json());
    },
    key: 'fact-embeded',
  });

  return <div>{data.fact}</div>;
};
