/**
 * CLI Action Handlers
 * 
 * Wraps existing seeders to work within the interactive CLI.
 * Each action uses the persistent session context.
 */

import inquirer from 'inquirer';
import type { CliSession } from './session.js';
import domainSeeder from '../seeders/domain.seeder.js';
import authSeeder from '../seeders/auth.seeder.js';
import activitySeeder from '../seeders/activity/activity.seeder.js';
import { displayActionHeader } from './menu.js';

/**
 * Authenticate action - Runs domain + auth seeders
 */
export async function authenticateAction(session: CliSession): Promise<boolean> {
  displayActionHeader('Authentication');
  
  try {
    const httpClient = session.getHttpClient();
    const context = session.getContext();
    
    // Run domain seeder to get client ID
    await domainSeeder(httpClient, context);
    
    // Run auth seeder to login
    await authSeeder(httpClient, context);
    
    console.log('\n✓ Authentication completed successfully!');
    return true;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n✗ Authentication failed:', errorMessage);
    return false;
  }
}

/**
 * Create activities action
 */
export async function createActivitiesAction(session: CliSession): Promise<boolean> {
  displayActionHeader('Create Activities');
  
  try {
    const httpClient = session.getHttpClient();
    const context = session.getContext();
    
    await activitySeeder(httpClient, context);
    
    console.log('\n✓ Activities created successfully!');
    return true;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n✗ Failed to create activities:', errorMessage);
    return false;
  }
}

/**
 * View session status action
 */
export async function viewStatusAction(session: CliSession): Promise<void> {
  displayActionHeader('Session Status');
  session.displayStatus();
  
  // Use Inquirer to pause instead of raw stdin listener
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...',
      prefix: ''
    }
  ]);
}

/**
 * Handle action execution
 */
export async function handleAction(action: string, session: CliSession): Promise<void> {
  switch (action) {
    case 'auth':
      await authenticateAction(session);
      break;
      
    case 'create_activity':
      await createActivitiesAction(session);
      break;
      
    case 'view_status':
      await viewStatusAction(session);
      break;
      
    default:
      console.log('Unknown action:', action);
  }
  
  // Small pause before returning to menu
  await new Promise(resolve => setTimeout(resolve, 1000));
}
