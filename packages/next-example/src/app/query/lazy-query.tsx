import { Query } from '@next-inversify/query/src/query';
import { useQuery } from '@next-inversify/query/use-query';
import { observer } from 'mobx-react-lite';

export const EmbededLazyQuery = observer(() => {
  const catfactQuery = useQuery({
    key: ['fact-embeded-lazy'],
    fn: () => fetch('https://catfact.ninja/fact').then<{ fact: string }>((res) => res.json()),
    lazy: true,
  });

  return (
    <div className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl rounded-xl border bg-gray-200 p-4">
      <div className="flex gap-2 items-center mb-2">
        <div className="text-md">Embeded query</div>
        <button
          className="rounded-md bg-sky-600 py-1 px-3 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
          onClick={() => catfactQuery.fetch()}
        >
          refetch
        </button>
      </div>
      <div className="text-sm mt-2">{catfactQuery.data?.fact}</div>
      <div className="text-sm mt-2">
        <pre>{JSON.stringify(Query.dehydrate(catfactQuery), null, 2)}</pre>
      </div>
    </div>
  );
});
