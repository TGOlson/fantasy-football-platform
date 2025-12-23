import { createContext, useContext, useState, type ReactNode } from 'react';
import { trpc } from '../hooks/trpc';

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  // Fetch current user if token exists
  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery(
    undefined,
    {
      enabled: !!token,
      retry: false,
      // TanStack Query v5: use throwOnError or handle error in component
      throwOnError: false,
    }
  );

  // Derive user from query data
  const user = userData ?? null;
  const isLoading = token ? userLoading : false;

  const login = (newToken: string, _newUser: User) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    // Note: user will be set by the query refetch
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
