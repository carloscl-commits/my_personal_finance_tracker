export interface AuthData {
  username: string;
  passwordHash: string;
  isSetup: boolean;
}

export interface SessionData {
  authenticated: boolean;
  loginTimestamp: number;
}

export interface AuthStore {
  initialized: boolean;
  isSetup: boolean;
  isAuthenticated: boolean;
  username: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setupCredentials: (username: string, password: string) => Promise<void>;
  changeCredentials: (currentPassword: string, newUsername: string, newPassword: string) => Promise<boolean>;
}
