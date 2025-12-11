export type Admin = {
  accessToken: string;
};

export type SignInCredentialsType = {
  username: string;
  passcode: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (credentials: SignInCredentialsType) => Promise<void>;
  signOut: () => void;
};
