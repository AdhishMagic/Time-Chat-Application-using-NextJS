import { useCallback, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { loginAction } from '@/actions/auth/login.action';
import { registerAction } from '@/actions/auth/register.action';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid credentials': 'Email or password is incorrect',
  'User already exists': 'This email is already registered',
  'Unauthorized': 'Please log in to continue',
  'Validation failed': 'Please check your input',
};

const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useChatStore((state) => state.currentUser);
  const setUser = useChatStore((state) => state.setUser);
  const reset = useChatStore((state) => state.reset);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await loginAction(credentials);

        if (!result?.success) {
          throw new Error((result as any)?.error || 'Login failed');
        }

        const userData = (result as any)?.data?.user;
        if (userData) {
          setUser(userData);
        }
        return (result as any)?.data || null;
      } catch (err) {
        const errorMessage = getSafeErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await registerAction(credentials);

        if (!result?.success) {
          throw new Error((result as any)?.error || 'Registration failed');
        }

        const userData = (result as any)?.data?.user;
        if (userData) {
          setUser(userData);
        }
        return (result as any)?.data || null;
      } catch (err) {
        const errorMessage = getSafeErrorMessage(err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const logout = useCallback(() => {
    reset();
    setError(null);
  }, [reset]);

  const isAuthenticated = !!currentUser;

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
