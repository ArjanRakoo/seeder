/**
 * CLI Session Manager
 * 
 * Maintains application state throughout the interactive session.
 * Keeps context (tokens, IDs) alive between actions.
 */

import SeederContext from '../lib/seeder-context.js';
import HttpClient from '../lib/http-client.js';
import type { SeederConfig } from '../types/index.js';

export class CliSession {
  private context: SeederContext;
  private httpClient: HttpClient;
  private config: SeederConfig;

  constructor(config: SeederConfig) {
    this.config = config;
    this.context = new SeederContext();
    this.httpClient = new HttpClient(config.apiBaseUrl, this.context, config);
  }

  /**
   * Check if the session is authenticated
   */
  isAuthenticated(): boolean {
    return this.context.has('bearerToken') && this.context.has('clientId');
  }

  /**
   * Get the HTTP client
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Get the context
   */
  getContext(): SeederContext {
    return this.context;
  }

  /**
   * Get configuration
   */
  getConfig(): SeederConfig {
    return this.config;
  }

  /**
   * Display session status
   */
  displayStatus(): void {
    console.log('\n' + '─'.repeat(60));
    console.log('Session Status:');
    console.log(`  Authenticated: ${this.isAuthenticated() ? '✓ Yes' : '✗ No'}`);
    
    if (this.isAuthenticated()) {
      console.log(`  Client ID: ${this.context.get('clientId')}`);
      const token = this.context.get('bearerToken');
      console.log(`  Bearer Token: ${token ? token.substring(0, 20) + '...' : 'N/A'}`);
    }
    
    console.log('─'.repeat(60) + '\n');
  }

  /**
   * Clear the session context
   */
  clear(): void {
    this.context.clear();
    console.log('Session context cleared.');
  }
}
