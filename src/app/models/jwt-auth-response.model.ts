export interface JwtAuthResponse {
    accessToken: string;
    tokenType: string;
    userId: number;
    email: string;
    role: string;
  }