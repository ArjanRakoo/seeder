/**
 * CLI Action Handlers
 * 
 * Wraps existing seeders to work within the interactive CLI.
 * Each action uses the persistent session context.
 */

import inquirer from 'inquirer';
import type { CliSession } from './session.js';
import type { User, Activity } from '../types/index.js';
import domainSeeder from '../seeders/domain.seeder.js';
import authSeeder from '../seeders/auth.seeder.js';
import activitySeeder from '../seeders/activity/activity.seeder.js';
import usersListSeeder from '../seeders/users-list.seeder.js';
import activitiesListSeeder from '../seeders/activities-list.seeder.js';
import userRegistrationsSeeder from '../seeders/user-registrations.seeder.js';
import registerUserActivitySeeder from '../seeders/register-user-activity.seeder.js';
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
 * Get user registrations action - Fetches users, shows selection menu, displays registrations
 */
export async function getUserRegistrationsAction(session: CliSession): Promise<boolean> {
  displayActionHeader('Get User Registrations');
  
  try {
    const httpClient = session.getHttpClient();
    const context = session.getContext();
    
    // Step 1: Fetch all users
    console.log('\nFetching users...');
    await usersListSeeder(httpClient, context);
    
    const users = context.get('usersList') as User[];
    
    if (!users || users.length === 0) {
      console.log('\n✗ No users found in the system.');
      return false;
    }
    
    // Step 2: Show user selection menu
    const userChoices = users.map(user => ({
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email || 'Unknown User',
      value: user.id
    }));
    
    userChoices.push({
      name: '← Back to Main Menu',
      value: 'back'
    });
    
    const { selectedUserId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedUserId',
        message: 'Select a user to view their registrations:',
        choices: userChoices,
        loop: false,
        pageSize: 15
      }
    ]);
    
    // Handle back to main menu
    if (selectedUserId === 'back') {
      console.log('\nReturning to main menu...');
      return false;
    }
    
    // Step 3: Store selected user ID in context
    context.set('selectedUserId', selectedUserId);
    
    // Find the selected user for display
    const selectedUser = users.find(u => u.id === selectedUserId);
    if (selectedUser) {
      console.log(`\nSelected user: ${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || selectedUser.username})`);
    }
    
    // Step 4: Fetch and display registrations for the selected user
    await userRegistrationsSeeder(httpClient, context);
    
    console.log('\n✓ User registrations retrieved successfully!');
    
    // Pause before returning to menu
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...',
        prefix: ''
      }
    ]);
    
    return true;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n✗ Failed to get user registrations:', errorMessage);
    return false;
  }
}

/**
 * Register user for activity action - Fetches users, shows selection menu, 
 * then fetches activities, shows selection menu, and registers the user
 */
export async function registerUserForActivityAction(session: CliSession): Promise<boolean> {
  displayActionHeader('Register User for Activity');
  
  try {
    const httpClient = session.getHttpClient();
    const context = session.getContext();
    
    // Step 1: Fetch all users
    console.log('\nFetching users...');
    await usersListSeeder(httpClient, context);
    
    const users = context.get('usersList') as User[];
    
    if (!users || users.length === 0) {
      console.log('\n✗ No users found in the system.');
      return false;
    }
    
    // Step 2: Show user selection menu
    const userChoices = users.map(user => ({
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email || 'Unknown User',
      value: user.id
    }));
    
    userChoices.push({
      name: '← Back to Main Menu',
      value: 'back'
    });
    
    const { selectedUserId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedUserId',
        message: 'Select a user to register:',
        choices: userChoices,
        loop: false,
        pageSize: 15
      }
    ]);
    
    // Handle back to main menu
    if (selectedUserId === 'back') {
      console.log('\nReturning to main menu...');
      return false;
    }
    
    // Store selected user ID in context
    context.set('selectedUserId', selectedUserId);
    
    // Find the selected user for display
    const selectedUser = users.find(u => u.id === selectedUserId);
    if (selectedUser) {
      console.log(`\nSelected user: ${selectedUser.firstName || ''} ${selectedUser.lastName || ''} (${selectedUser.email || selectedUser.username})`.trim());
    }
    
    // Step 3: Fetch all activities
    console.log('\nFetching activities...');
    await activitiesListSeeder(httpClient, context);
    
    const activities = context.get('activitiesList') as Activity[];
    
    if (!activities || activities.length === 0) {
      console.log('\n✗ No activities found in the system.');
      return false;
    }
    
    // Step 4: Show activity selection menu
    const activityChoices = activities.map(activity => ({
      name: activity.title || 'Untitled Activity',
      value: activity.id
    }));
    
    activityChoices.push({
      name: '← Back to Main Menu',
      value: 'back'
    });
    
    const { selectedActivityId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedActivityId',
        message: 'Select an activity to register for:',
        choices: activityChoices,
        loop: false,
        pageSize: 15
      }
    ]);
    
    // Handle back to main menu
    if (selectedActivityId === 'back') {
      console.log('\nReturning to main menu...');
      return false;
    }
    
    // Store selected activity ID in context
    context.set('selectedActivityId', selectedActivityId);
    
    // Find the selected activity for display
    const selectedActivity = activities.find(a => a.id === selectedActivityId);
    if (selectedActivity) {
      console.log(`\nSelected activity: ${selectedActivity.title}`);
    }
    
    // Step 5: Register the user for the activity
    await registerUserActivitySeeder(httpClient, context);
    
    console.log('\n✓ User successfully registered for activity!');
    
    // Pause before returning to menu
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: 'Press Enter to continue...',
        prefix: ''
      }
    ]);
    
    return true;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n✗ Failed to register user for activity:', errorMessage);
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
      
    case 'get_registrations':
      await getUserRegistrationsAction(session);
      break;
      
    case 'register_user':
      await registerUserForActivityAction(session);
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
