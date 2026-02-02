/**
 * Environment configuration for the seeder
 * 
 * Credential Sources (in order of priority):
 * 1. 1Password CLI - Set USE_1PASSWORD=true and configure OP_* variables
 * 2. Environment variables from .env file
 * 
 * 1Password CLI Setup:
 * - Install: https://developer.1password.com/docs/cli/get-started/
 * - Set USE_1PASSWORD=true in .env
 * - Set OP_ADMIN_USERNAME_REF and OP_ADMIN_PASSWORD_REF to your 1Password secret references
 *   Example: OP_ADMIN_USERNAME_REF="op://vault-name/item-name/username"
 * 
 * Environment variables (.env fallback):
 * - ADMIN_USERNAME: Username for authentication
 * - ADMIN_PASSWORD: Password for authentication
 * 
 * Optional environment variables (have defaults):
 * - API_BASE_URL: The base URL of your backend API
 * - AUTH_CONTEXT: Authentication context
 * - AUTH_PLATFORM: Platform identifier
 * - REQUEST_TIMEOUT: Request timeout in milliseconds
 * - VERBOSE: Enable verbose logging
 * - REJECT_UNAUTHORIZED: SSL certificate validation
 */

import { execSync } from 'child_process';
import type { SeederConfig } from '../types/index.js';

/**
 * Retrieve a secret from 1Password CLI
 * @param reference - 1Password secret reference (e.g., "op://vault/item/field")
 * @returns The secret value
 */
function get1PasswordSecret(reference: string): string {
  try {
    const result = execSync(`op read "${reference}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to retrieve secret from 1Password: ${errorMessage}\nMake sure you're signed in with 'op signin'`);
  }
}

/**
 * Get credentials from 1Password or environment variables
 */
function getCredentials(): { username: string; password: string } {
  const use1Password = process.env.USE_1PASSWORD === 'true';
  
  if (use1Password) {
    console.log('[Config] Using 1Password CLI for credentials');
    
    const usernameRef = process.env.OP_ADMIN_USERNAME_REF;
    const passwordRef = process.env.OP_ADMIN_PASSWORD_REF;
    
    if (!usernameRef || !passwordRef) {
      throw new Error(
        'Missing 1Password references. Please set:\n' +
        '  OP_ADMIN_USERNAME_REF="op://vault-name/item-name/username"\n' +
        '  OP_ADMIN_PASSWORD_REF="op://vault-name/item-name/password"'
      );
    }
    
    try {
      return {
        username: get1PasswordSecret(usernameRef),
        password: get1PasswordSecret(passwordRef)
      };
    } catch (error) {
      console.error('[Config] Failed to retrieve credentials from 1Password');
      throw error;
    }
  }
  
  // Fallback to environment variables
  console.log('[Config] Using environment variables for credentials');
  
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  
  if (!username || !password) {
    throw new Error(
      'Missing required credentials. Either:\n' +
      '1. Enable 1Password: Set USE_1PASSWORD=true and configure OP_* variables\n' +
      '2. Use .env file: Set ADMIN_USERNAME and ADMIN_PASSWORD'
    );
  }
  
  return { username, password };
}

// Get credentials from configured source
const credentials = getCredentials();

const environment: SeederConfig = {
  // Base URL for all API requests
  apiBaseUrl: process.env.API_BASE_URL || 'https://academy.dev.rakoo.com:3000/api',
  
  // Credentials from 1Password or environment variables
  credentials: {
    username: credentials.username,
    password: credentials.password,
    context: process.env.AUTH_CONTEXT || 'admin',
    platform: process.env.AUTH_PLATFORM || 'web'
  },
  
  // Optional configuration with sensible defaults
  timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10), // 30 seconds
  verbose: process.env.VERBOSE === 'true' || false,
  
  // SSL certificate validation (set to false for local development with self-signed certs)
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED !== 'false'
};

export default environment;
