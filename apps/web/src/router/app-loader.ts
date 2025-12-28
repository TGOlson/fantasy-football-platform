import { graphqlClient } from '@/lib/graphql-client';
import { MyLeaguesDocument } from '@/gql/graphql';

/**
 * Loader for app layout routes.
 * Fetches the user's leagues list for the league selector.
 */
export async function appLoader() {
  const data = await graphqlClient.request(MyLeaguesDocument);
  return { leagues: data.myLeagues };
}
