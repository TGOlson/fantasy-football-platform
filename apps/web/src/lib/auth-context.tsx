import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { trpc } from './trpc';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user if token exists
  const { data: userData, isLoading: userLoading } = trpc.auth.me.useQuery(
    undefined,
    {
      enabled: !!token,
      retry: false,
      onError: () => {
        // Token is invalid, clear it
        setToken(null);
        localStorage.removeItem('auth_token');
      },
    }
  );

  useEffect(() => {
    if (userData) {
      setUser(userData as User);
    }
    setIsLoading(userLoading);
  }, [userData, userLoading]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
