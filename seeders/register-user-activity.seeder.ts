/**
 * Register User for Activity Seeder
 * 
 * Registers a user for a specific activity using the 
 * /registrations/bulk endpoint (admin endpoint).
 * 
 * Requires selectedUserId and selectedActivityId in context.
 */

import type { SeederFunction } from '../types/index.js';

const registerUserActivitySeeder: SeederFunction = async (httpClient, context) => {
  console.log('\n[Register User] Registering user for activity...');
  
  try {
    // Get userId and activityId from context
    const userId = context.get('selectedUserId') as string;
    const activityId = context.get('selectedActivityId') as string;
    
    if (!userId) {
      throw new Error('No user selected. Please select a user first.');
    }
    
    if (!activityId) {
      throw new Error('No activity selected. Please select an activity first.');
    }
    
    console.log(`[Register User] User ID: ${userId}`);
    console.log(`[Register User] Activity ID: ${activityId}`);
    
    // Prepare bulk registration request
    const bulkRegisterRequest = {
      action: 'REGISTER',
      activityId: activityId,
      userIds: [userId]
    };
    
    // Make authenticated POST request to bulk register users for activity
    await httpClient.post(
      '/registrations/bulk',
      bulkRegisterRequest,
      (response, context) => {
        console.log('\n[Register User] Registration successful!');
        
        // Store registration result in context
        if (response.data) {
          context.set('lastRegistration', response.data);
        }
      }
    );
    
    console.log('\n[Register User] ✓ User successfully registered for activity');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Register User] ✗ Error registering user:', errorMessage);
    throw error;
  }
};

export default registerUserActivitySeeder;
