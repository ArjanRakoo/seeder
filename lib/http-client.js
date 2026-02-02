/**
 * HTTP Client - Wrapper around axios with callback support
 * 
 * This client automatically injects bearer tokens and supports
 * Postman-like callbacks to execute code after requests complete.
 */

import axios from 'axios';

class HttpClient {
  constructor(baseURL, context, config = {}) {
    this.context = context;
    this.config = config;
    
    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
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
          console.log(`[HTTP] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`[HTTP Error] ${error.config.method.toUpperCase()} ${error.config.url} - ${error.response.status}`);
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
  _executeCallback(response, callback) {
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
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config options
   * @param {function} callback - Callback function (response, context) => {}
   */
  async get(url, config = {}, callback = null) {
    const response = await this.client.get(url, config);
    this._executeCallback(response, callback);
    return response;
  }

  /**
   * Make a POST request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {function|object} callbackOrConfig - Callback function or axios config
   * @param {function} callback - Callback function if config was provided
   */
  async post(url, data = {}, callbackOrConfig = null, callback = null) {
    let config = {};
    let finalCallback = null;

    // Handle overloaded parameters
    if (typeof callbackOrConfig === 'function') {
      finalCallback = callbackOrConfig;
    } else if (typeof callbackOrConfig === 'object') {
      config = callbackOrConfig;
      finalCallback = callback;
    }

    const response = await this.client.post(url, data, config);
    this._executeCallback(response, finalCallback);
    return response;
  }

  /**
   * Make a PUT request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {function|object} callbackOrConfig - Callback function or axios config
   * @param {function} callback - Callback function if config was provided
   */
  async put(url, data = {}, callbackOrConfig = null, callback = null) {
    let config = {};
    let finalCallback = null;

    if (typeof callbackOrConfig === 'function') {
      finalCallback = callbackOrConfig;
    } else if (typeof callbackOrConfig === 'object') {
      config = callbackOrConfig;
      finalCallback = callback;
    }

    const response = await this.client.put(url, data, config);
    this._executeCallback(response, finalCallback);
    return response;
  }

  /**
   * Make a PATCH request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request body
   * @param {function|object} callbackOrConfig - Callback function or axios config
   * @param {function} callback - Callback function if config was provided
   */
  async patch(url, data = {}, callbackOrConfig = null, callback = null) {
    let config = {};
    let finalCallback = null;

    if (typeof callbackOrConfig === 'function') {
      finalCallback = callbackOrConfig;
    } else if (typeof callbackOrConfig === 'object') {
      config = callbackOrConfig;
      finalCallback = callback;
    }

    const response = await this.client.patch(url, data, config);
    this._executeCallback(response, finalCallback);
    return response;
  }

  /**
   * Make a DELETE request
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config options
   * @param {function} callback - Callback function (response, context) => {}
   */
  async delete(url, config = {}, callback = null) {
    const response = await this.client.delete(url, config);
    this._executeCallback(response, callback);
    return response;
  }
}

export default HttpClient;
