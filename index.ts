/**
 * Database Seeder - Interactive CLI
 * 
 * Interactive command-line interface for database seeding operations.
 * Maintains session state (tokens, IDs) throughout the runtime.
 */

import 'dotenv/config';
import config from './config/environment.js';
import { CliSession } from './cli/session.js';
import { showMainMenu, displayWelcome, displayGoodbye } from './cli/menu.js';
import { handleAction } from './cli/actions.js';

/**
 * Main CLI application
 */
async function startCli(): Promise<void> {
  // Initialize session (keeps context alive throughout)
  const session = new CliSession(config);
  
  // Display welcome message
  displayWelcome(config.apiBaseUrl);
  
  // Main interactive loop
  while (true) {
    try {
      // Show menu and get user selection
      const action = await showMainMenu(session.isAuthenticated());
      
      // Handle exit
      if (action === 'exit') {
        displayGoodbye();
        process.exit(0);
      }
      
      // Execute selected action
      await handleAction(action, session);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('\n✗ Error:', errorMessage);
      
      // Continue to menu instead of crashing
      console.log('\nReturning to main menu...\n');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
}

// Handle uncaught errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('\n[Unhandled Error]', error);
  console.log('\nPress Ctrl+C to exit or wait to return to menu...');
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nInterrupted by user.');
  displayGoodbye();
  process.exit(0);
});

// Start the interactive CLI
startCli();
