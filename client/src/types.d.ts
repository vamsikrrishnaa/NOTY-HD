export {};

declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE: string;
      GOOGLE_CLIENT_ID: string;
    };
    google?: any;
  }
}
