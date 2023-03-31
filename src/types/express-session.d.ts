import 'express-session';

declare module 'express-session' {
  export interface Session {
    clearSession(): Promise<void>; // DO NOT MODIFY THIS!
    username: string;
    isLoggedIn: boolean;
    isPro: boolean;
    isAdmin: boolean;
  }
}
