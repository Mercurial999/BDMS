import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "../lib/storage";
import { getPermissions } from "../services/authService";

import type { AuthUser } from "../types/auth.types";

import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setAuthToken] = useState<string | null>(() => getToken());

  const [user, setUser] = useState<AuthUser | null>(() =>
    getStoredUser<AuthUser>(),
  );
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    let isCurrent = true;

    if (!token) {
      setPermissions([]);
      return () => {
        isCurrent = false;
      };
    }

    setPermissions([]);

    void getPermissions()
      .then((nextPermissions) => {
        if (isCurrent) {
          setPermissions(nextPermissions);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setPermissions([]);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [token]);

  function login(newToken: string, newUser: AuthUser): void {
    setToken(newToken);
    setStoredUser(newUser);

    setAuthToken(newToken);
    setUser(newUser);
  }

  function logout(): void {
    clearAuthStorage();

    setAuthToken(null);
    setUser(null);
    setPermissions([]);
  }

  const isAuthenticated = Boolean(token);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      logout,
      permissions,
      hasPermission: (permission: string) => permissions.includes(permission),
    }),
    [user, token, isAuthenticated, permissions],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
