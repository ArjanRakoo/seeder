/**
 * HTTP Client - Wrapper around axios with callback support
 * 
 * This client automatically injects bearer tokens and supports
 * Postman-like callbacks to execute code after requests complete.
 */

import axios, { type AxiosInstance, type AxiosResponse, type AxiosRequestConfig } from 'axios';
import https from 'https';
import type { SeederContext, SeederCallback, SeederConfig, HttpClient as IHttpClient } from '../types/index.js';

class HttpClient implements IHttpClient {
  private context: SeederContext;
  private config: SeederConfig;
  private client: AxiosInstance;

  constructor(baseURL: string, context: SeederContext, config: SeederConfig) {
    this.context = context;
    this.config = config;
    
    // Create HTTPS agent with SSL configuration
    const httpsAgent = new https.Agent({
      rejectUnauthorized: config.rejectUnauthorized
    });
    
    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: httpsAgent
    });

    // Request interceptor to inject bearer token
    this.client.interceptors.request.use(
      (requestConfig) => {
        const token = this.context.get('bearerToken');
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        return requestConfig;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.verbose) {
          console.log(`[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`[HTTP Error] ${error.config.method?.toUpperCase()} ${error.config.url} - ${error.response.status}`);
          console.error('[HTTP Error] Response:', error.response.data);
        } else {
          console.error('[HTTP Error]', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Execute a callback function after the request completes
   * @private
   */
  private _executeCallback(response: AxiosResponse, callback?: SeederCallback | null): void {
    if (callback && typeof callback === 'function') {
      try {
        callback(response, this.context);
      } catch (error) {
        console.error('[HTTP] Callback error:', error);
      }
    }
  }

  /**
   * Make a GET request
   * @param url - Endpoint URL
   * @param config - Axios config options
   * @param callback - Callback function (response, context) => {}
   */
  async get(url: string, config: AxiosRequestConfig = {}, callback: SeederCallback | null = null): Promise<AxiosResponse> {
    const response = await this.client.get(url, config);
    this._executeCallback(response, callback);
    return response;
  }

  /**
   * Make a POST request
   * @param url - Endpoint URL
   * @param data - Request body
   * @param callbackOrConfig - Callback function or axios config
   * @param callback - Callback function if config was provided
   */
  async post(url: string, data: any = {}, callbackOrConfig: SeederCallback | AxiosRequestConfig | null = null, callback: SeederCallback | null = null): Promise<AxiosResponse> {
    let config: AxiosRequestConfig = {};
    let finalCallback: SeederCallback | null = null;

    // Handle overloaded parameters
    if (typeof callbackOrConfig === 'function') {
      finalCallback = callbackOrConfig;
    } else if (callbackOrConfig && typeof callbackOrConfig === 'object') {
      config = callbackOrConfig;
      finalCallback = callback;
    }

    const response = await this.client.post(url, data, config);
    this._executeCallback(response, finalCallback);
    return response;
  }

  /**
   * Make a PUT request
   * @param url - Endpoint URL
   * @param data - Request body
   * @param callbackOrConfig - Callback function or axios config
   * @param callback - Callback function if config was provided
   */
  async put(url: string, data: any = {}, callbackOrConfig: SeederCallback | AxiosRequestConfig | null = null, callback: SeederCallback | null = null): Promise<AxiosResponse> {
    let config: AxiosRequestConfig = {};
    let finalCallback: SeederCallback | null = null;

    if (typeof callbackOrConfig === 'function') {
      finalCallback = callbackOrConfig;
    } else if (callbackOrConfig && typeof callbackOrConfig === 'object') {
      config = callbackOrConfig;
      finalCallback = callback;
    }

    const response = await this.client.put(url, data, config);
    this._executeCallback(response, finalCallback);
    return response;
  }

  /**
   * Make a PATCH request
   * @param url - Endpoint URL
   * @param data - Request body
   * @param callbackOrConfig - Callback function or axios config
   * @param callback - Callback function if config was provided
   */
  async patch(url: string, data: any = {}, callbackOrConfig: SeederCallback | AxiosRequestConfig | null = null, callback: SeederCallback | null = null): Promise<AxiosResponse> {
    let config: AxiosRequestConfig = {};
    let finalCallback: SeederCallback | null = null;

    if (typeof callbackOrConfig === 'function') {
      finalCallback = callbackOrConfig;
    } else if (callbackOrConfig && typeof callbackOrConfig === 'object') {
      config = callbackOrConfig;
      finalCallback = callback;
    }

    const response = await this.client.patch(url, data, config);
    this._executeCallback(response, finalCallback);
    return response;
  }

  /**
   * Make a DELETE request
   * @param url - Endpoint URL
   * @param config - Axios config options
   * @param callback - Callback function (response, context) => {}
   */
  async delete(url: string, config: AxiosRequestConfig = {}, callback: SeederCallback | null = null): Promise<AxiosResponse> {
    const response = await this.client.delete(url, config);
    this._executeCallback(response, callback);
    return response;
  }
}

export default HttpClient;
