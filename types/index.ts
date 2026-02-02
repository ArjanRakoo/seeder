import type { AxiosResponse } from 'axios';

export interface SeederConfig {
  apiBaseUrl: string;
  credentials: {
    username: string;
    password: string;
    context: string;
    platform: string;
  };
  timeout: number;
  verbose: boolean;
  rejectUnauthorized: boolean;
}

export interface SeederContext {
  set(key: string, value: any): void;
  get(key: string): any;
  has(key: string): boolean;
  unset(key: string): void;
  clear(): void;
  getAll(): Record<string, any>;
}

export type SeederCallback = (
  response: AxiosResponse,
  context: SeederContext
) => void;

export interface HttpClient {
  get(url: string, config?: any, callback?: SeederCallback | null): Promise<AxiosResponse>;
  post(url: string, data?: any, callbackOrConfig?: SeederCallback | any | null, callback?: SeederCallback | null): Promise<AxiosResponse>;
  put(url: string, data?: any, callbackOrConfig?: SeederCallback | any | null, callback?: SeederCallback | null): Promise<AxiosResponse>;
  patch(url: string, data?: any, callbackOrConfig?: SeederCallback | any | null, callback?: SeederCallback | null): Promise<AxiosResponse>;
  delete(url: string, config?: any, callback?: SeederCallback | null): Promise<AxiosResponse>;
}

export type SeederFunction = (
  httpClient: HttpClient,
  context: SeederContext
) => Promise<void>;

export interface SeederDefinition {
  name: string;
  fn: SeederFunction;
}

export interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthRequest {
  clientId: string;
  context: string;
  password: string;
  platform: string;
  username: string;
}
