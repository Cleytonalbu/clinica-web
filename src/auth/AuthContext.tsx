import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  authenticateUser,
  clearAuthSession,
  getAuthSession,
  type AuthSession,
  type AuthUser,
} from "./authStorage";

interface LoginResult {
  success: boolean;

  message?: string;
}

interface AuthContextValue {
  user:
    AuthUser |
    null;

  session:
    AuthSession |
    null;

  isAuthenticated:
    boolean;

  login:
    (
      email: string,
      password: string
    ) => LoginResult;

  logout:
    () => void;

  refreshSession:
    () => void;
}

const AuthContext =
  createContext<
    AuthContextValue |
    undefined
  >(
    undefined
  );

interface AuthProviderProps {
  children:
    ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    session,
    setSession,
  ] =
    useState<
      AuthSession |
      null
    >(
      () =>
        getAuthSession()
    );

  const login =
    useCallback(
      (
        email:
          string,

        password:
          string
      ): LoginResult => {
        const result =
          authenticateUser(
            email,
            password
          );

        if (
          !result.success
        ) {
          return {
            success:
              false,

            message:
              result.message,
          };
        }

        setSession(
          result.session
        );

        return {
          success:
            true,
        };
      },
      []
    );

  const logout =
    useCallback(
      () => {
        clearAuthSession();

        setSession(
          null
        );
      },
      []
    );

  const refreshSession =
    useCallback(
      () => {
        setSession(
          getAuthSession()
        );
      },
      []
    );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user:
          session?.user ??
          null,

        session,

        isAuthenticated:
          Boolean(
            session
          ),

        login,

        logout,

        refreshSession,
      }),
      [
        session,
        login,
        logout,
        refreshSession,
      ]
    );

  return (
    <AuthContext.Provider
      value={
        value
      }
    >
      {
        children
      }
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider."
    );
  }

  return context;
}