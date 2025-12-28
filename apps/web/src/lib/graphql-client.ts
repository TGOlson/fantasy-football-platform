import { GraphQLClient } from 'graphql-request';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

const GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql';

// Wrapper to automatically inject auth token
class AuthGraphQLClient {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(GRAPHQL_ENDPOINT);
  }

  async request<
    TResult,
    TVariables extends Record<string, unknown> = Record<string, never>,
  >(
    document: TypedDocumentNode<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never>
      ? [variables?: TVariables]
      : [variables: TVariables]
  ): Promise<TResult> {
    const token = localStorage.getItem('auth_token');

    // Set auth header before request
    if (token) {
      this.client.setHeader('Authorization', `Bearer ${token}`);
    } else {
      this.client.setHeader('Authorization', '');
    }

    // GraphQLClient.request has complex conditional overloads that are difficult
    // to satisfy with our rest parameter. Type assertion is safe here because
    // we're just passing through the exact same types.
    // @ts-expect-error - Complex conditional types from graphql-request don't align with rest parameters
    return this.client.request(document, variables);
  }
}

export const graphqlClient = new AuthGraphQLClient();
