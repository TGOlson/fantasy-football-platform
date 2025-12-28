import { GraphQLClient } from 'graphql-request';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql';

// Wrapper to automatically inject auth token
class AuthGraphQLClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(GRAPHQL_ENDPOINT);
  }

  async request<TResult, TVariables>(
    document: TypedDocumentNode<TResult, TVariables>,
    variables?: TVariables
  ): Promise<TResult> {
    const token = localStorage.getItem('auth_token');

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.client.request(document as any, variables as any, headers);
  }
}

export const graphqlClient = new AuthGraphQLClient();
