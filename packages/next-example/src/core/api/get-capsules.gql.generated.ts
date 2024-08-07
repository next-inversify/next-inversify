import { Request } from '@next-inversify/gql/query-types';
import gql from 'graphql-tag';

export type GetCapsulesQueryVariables = Record<string, never>;

export type GetCapsulesQuery = {
  __typename?: 'Query';
  capsules: {
    id: string;
    landings?: number | null;
    original_launch?: Date | null;
    reuse_count: number;
    status: string;
    type: string;
  }[];
};

export const GetCapsulesDocument = gql`
  query GetCapsules {
    capsules {
      id
      landings
      original_launch
      reuse_count
      status
      type
    }
  }
`;

export function GetCapsules<R extends GetCapsulesQuery, V extends GetCapsulesQueryVariables>(
  request: Request<R, V>,
  variables: V,
  headers?: HeadersInit,
) {
  return request(GetCapsulesDocument, variables, headers);
}
