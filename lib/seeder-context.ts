/**
 * SeederContext - Stores variables across seeder executions
 * 
 * This works similar to Postman's environment variables.
 * Use set() to store values (like bearer tokens) and get() to retrieve them.
 */

import type { SeederContext as ISeederContext } from '../types/index.js';

class SeederContext implements ISeederContext {
  private variables: Record<string, any>;

  constructor() {
    this.variables = {};
  }

  /**
   * Set a variable in the context
   * @param key - Variable name
   * @param value - Variable value
   */
  set(key: string, value: any): void {
    this.variables[key] = value;
    
    // Skip logging for arrays (like usersList) to avoid cluttering console
    if (Array.isArray(value)) {
      console.log(`[Context] Set ${key}: [Array with ${value.length} item(s)]`);
    } else {
      console.log(`[Context] Set ${key}:`, typeof value === 'string' && value.length > 50 
        ? value.substring(0, 50) + '...' 
        : value
      );
    }
  }

  /**
   * Get a variable from the context
   * @param key - Variable name
   * @returns Variable value or undefined
   */
  get(key: string): any {
    return this.variables[key];
  }

  /**
   * Check if a variable exists in the context
   * @param key - Variable name
   * @returns True if key exists
   */
  has(key: string): boolean {
    return key in this.variables;
  }

  /**
   * Remove a variable from the context
   * @param key - Variable name
   */
  unset(key: string): void {
    delete this.variables[key];
    console.log(`[Context] Unset ${key}`);
  }

  /**
   * Clear all variables from the context
   */
  clear(): void {
    this.variables = {};
    console.log('[Context] Cleared all variables');
  }

  /**
   * Get all variables
   * @returns Object containing all variables
   */
  getAll(): Record<string, any> {
    return { ...this.variables };
  }
}

export default SeederContext;
