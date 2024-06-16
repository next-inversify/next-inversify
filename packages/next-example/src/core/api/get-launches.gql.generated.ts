import { Request } from '@next-inversify/gql/query-types';
import gql from 'graphql-tag';

export type GetLaunchesQueryVariables = Record<string, never>;

export type GetLaunchesQuery = {
  __typename?: 'Query';
  launches: {
    id: string;
    mission_name: string;
  }[];
};

export const GetLaunchesDocument = gql`
  query GetLaunches {
    launches {
      id
      mission_name
    }
  }
`;

export function GetLaunches<R extends GetLaunchesQuery, V extends GetLaunchesQueryVariables>(
  request: Request<R, V>,
  variables: V,
  headers?: HeadersInit,
) {
  return request(GetLaunchesDocument, variables, headers);
}
