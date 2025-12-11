import type { AuthContextType } from "@/lib/authType";
import { createContext } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
