/**
 * SeederContext - Stores variables across seeder executions
 * 
 * This works similar to Postman's environment variables.
 * Use set() to store values (like bearer tokens) and get() to retrieve them.
 */

class SeederContext {
  constructor() {
    this.variables = {};
  }

  /**
   * Set a variable in the context
   * @param {string} key - Variable name
   * @param {any} value - Variable value
   */
  set(key, value) {
    this.variables[key] = value;
    console.log(`[Context] Set ${key}:`, typeof value === 'string' && value.length > 50 
      ? value.substring(0, 50) + '...' 
      : value
    );
  }

  /**
   * Get a variable from the context
   * @param {string} key - Variable name
   * @returns {any} Variable value or undefined
   */
  get(key) {
    return this.variables[key];
  }

  /**
   * Check if a variable exists in the context
   * @param {string} key - Variable name
   * @returns {boolean}
   */
  has(key) {
    return key in this.variables;
  }

  /**
   * Remove a variable from the context
   * @param {string} key - Variable name
   */
  unset(key) {
    delete this.variables[key];
    console.log(`[Context] Unset ${key}`);
  }

  /**
   * Clear all variables from the context
   */
  clear() {
    this.variables = {};
    console.log('[Context] Cleared all variables');
  }

  /**
   * Get all variables
   * @returns {object}
   */
  getAll() {
    return { ...this.variables };
  }
}

module.exports = SeederContext;
