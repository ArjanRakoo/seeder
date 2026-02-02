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
  getAll(): Record<string, any>;
  clear(): void;
}

export interface HttpClient {
  get(url: string, params?: Record<string, any>, callback?: SeederCallback): Promise<AxiosResponse>;
  post(url: string, data: any, callback?: SeederCallback): Promise<AxiosResponse>;
}

export type SeederFunction = (httpClient: HttpClient, context: SeederContext) => Promise<void>;

export interface SeederDefinition {
  name: string;
  fn: SeederFunction;
}

export type SeederCallback = (response: AxiosResponse, context: SeederContext) => void;

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthRequest {
  clientId: string;
  context: string;
  password: string;
  platform: string;
  username: string;
}
