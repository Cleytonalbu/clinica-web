import { createContext } from "react";
import type { User } from "../services/auth";

export type AuthContextData = {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => void;
};

export const AuthContext =
  createContext({} as AuthContextData);
  