import { Request } from '@next-inversify/gql/query-types';
import gql from 'graphql-tag';

export type GetCompanyQueryVariables = Record<string, never>;

export type GetCompanyQuery = {
  __typename?: 'Query';
  company: {
    name: string;
    founded: string;
    founder: string;
  };
};

export const GetCompanyDocument = gql`
  query GetCompany {
    company {
      name
      founded
      founder
    }
  }
`;

export function GetCompany<R extends GetCompanyQuery, V extends GetCompanyQueryVariables>(
  request: Request<R, V>,
  variables: V,
  headers?: HeadersInit,
) {
  return request(GetCompanyDocument, variables, headers);
}
