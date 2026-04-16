import { createContext, useContext, useEffect, useState } from 'react';
import { signIn as apiSignIn, signUp as apiSignUp, getMe, ApiError } from '../lib/api';

interface User {
  id: number;
  email: string;
}

interface AuthContextValue {
  currentUser: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  playAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(({ user }) => setCurrentUser(user))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('authToken');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    const { token, user } = await apiSignIn(email, password);
    localStorage.setItem('authToken', token);
    setCurrentUser(user);
    setIsGuest(false);
  }

  async function signUp(email: string, password: string) {
    const { token, user } = await apiSignUp(email, password);
    localStorage.setItem('authToken', token);
    setCurrentUser(user);
    setIsGuest(false);
  }

  function signOut() {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsGuest(false);
  }

  function playAsGuest() {
    setIsGuest(true);
  }

  return (
    <AuthContext.Provider value={{ currentUser, isGuest, isLoading, signIn, signUp, signOut, playAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
