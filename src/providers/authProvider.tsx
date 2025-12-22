import type {
  Admin,
  AuthContextType,
  SignInCredentialsType,
} from "@/lib/authType";
import { useEffect, useMemo, useState } from "react";
import { signIn as signInApi } from "@/services/authService";
import AuthContext from "@/context/authContext";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const token = typeof window !== "undefined"
      ? sessionStorage.getItem("JWT")
      : null;
    return token ? { accessToken: token } : null;
  });  
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = sessionStorage.getItem("JWT");
      if (token) {
        const a: Admin = { accessToken: token };
        setAdmin(a);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const signIn = async (credentials: SignInCredentialsType): Promise<void> => {
    setLoading(true);
    try {
      const response = await signInApi(credentials);
      const a: Admin = { accessToken: response.accessToken };
      setAdmin(a);
      sessionStorage.setItem("JWT", response.accessToken);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = (): void => {
    setAdmin(null);
    sessionStorage.removeItem("JWT");
  };

  const contextValue: AuthContextType = useMemo(
    () => ({
      admin,
      isAuthenticated: !!admin,
      loading,
      signIn,
      signOut,
    }),
    [admin, loading],
  );
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
