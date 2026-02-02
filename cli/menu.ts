/**
 * CLI Menu System
 * 
 * Interactive menu using Inquirer.js for user interaction.
 */

import inquirer from 'inquirer';

export type MenuAction = 'auth' | 'create_activity' | 'view_status' | 'exit';

interface MenuChoice {
  name: string;
  value: MenuAction;
  disabled?: boolean | string;
}

/**
 * Display the main menu and get user selection
 */
export async function showMainMenu(isAuthenticated: boolean): Promise<MenuAction> {
  const choices: MenuChoice[] = [
    { 
      name: '🔐 Authenticate (Get Client ID + Login)', 
      value: 'auth' 
    },
    { 
      name: '📝 Create Activities', 
      value: 'create_activity',
      disabled: !isAuthenticated ? 'Requires authentication' : false
    },
    { 
      name: '📊 View Session Status', 
      value: 'view_status' 
    },
    { 
      name: '🚪 Exit', 
      value: 'exit' 
    }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices,
      loop: false
    }
  ]);

  return answer.action;
}

/**
 * Display welcome banner
 */
export function displayWelcome(apiBaseUrl: string): void {
  console.clear();
  console.log('\n' + '═'.repeat(60));
  console.log('  Database Seeder - Interactive CLI');
  console.log('═'.repeat(60));
  console.log(`  API: ${apiBaseUrl}`);
  console.log('═'.repeat(60) + '\n');
}

/**
 * Display action header
 */
export function displayActionHeader(actionName: string): void {
  console.log('\n' + '─'.repeat(60));
  console.log(`  ${actionName}`);
  console.log('─'.repeat(60));
}

/**
 * Prompt for confirmation
 */
export async function confirmAction(message: string): Promise<boolean> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: true
    }
  ]);

  return answer.confirmed;
}

/**
 * Display goodbye message
 */
export function displayGoodbye(): void {
  console.log('\n' + '═'.repeat(60));
  console.log('  Thank you for using Database Seeder!');
  console.log('═'.repeat(60) + '\n');
}
