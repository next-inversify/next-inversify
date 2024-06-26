import { useQuery } from '@next-inversify/query/use-query';
import { observer } from 'mobx-react-lite';

export const EmbededQuery = observer(() => {
  const catfactQuery = useQuery({
    key: ['fact-embeded'],
    fn: async () => {
      const result = await fetch('https://catfact.ninja/fact').catch((error) => ({
        ok: false,
        statusText: error.message,
      }));

      if (!result.ok) throw new Error(result.statusText);

      const json: { fact: string } = await (result as Response).json();

      return json;
    },
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
      <div className="text-sm">{catfactQuery.data.fact}</div>
    </div>
  );
});
