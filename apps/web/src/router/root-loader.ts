import { graphqlClient } from '@/lib/graphql-client';
import { MeDocument } from '@/gql/graphql';

/**
 * Root loader - checks authentication state on app load.
 * This runs once when the app starts, providing initial user state.
 */
export async function loader(): Promise<{
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}> {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return { user: null };
  }

  try {
    const { me } = await graphqlClient.request(MeDocument);

    return { user: me };
  } catch (_error) {
    // Token invalid or expired
    localStorage.removeItem('auth_token');
    return { user: null };
  }
}
