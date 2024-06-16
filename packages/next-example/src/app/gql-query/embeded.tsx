import { GetLaunches } from '@/core/api/get-launches.gql.generated';
import { useGqlQuery } from '@next-inversify/gql/use-gql-query';
import { observer } from 'mobx-react-lite';

export const EmbededQuery = observer(() => {
  const launchesQuery = useGqlQuery(GetLaunches);

  return (
    <div className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl rounded-xl border bg-gray-200 p-4">
      <div className="flex gap-2 items-center mb-2">
        <div className="text-md">Embeded query</div>
        <button
          className="rounded-md bg-sky-600 py-1 px-3 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
          onClick={() => launchesQuery.fetch()}
        >
          refetch
        </button>
      </div>
      <div>Launches</div>
      <ul>
        {launchesQuery.data.launches.map((launch) => (
          <li key={launch.id}>
            <div className="text-sm">{launch.mission_name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
});
