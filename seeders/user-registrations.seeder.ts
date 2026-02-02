/**
 * User Registrations Seeder - View a user's activity registrations
 * 
 * Uses the /api/users/{userId}/registrations endpoint to retrieve
 * activity registrations for a specific user.
 * 
 * Note: This requires a userId to be passed as a parameter.
 */

import type { SeederFunction } from '../types/index.js';

const userRegistrationsSeeder: SeederFunction = async (httpClient, context) => {
  console.log('\n[User Registrations] Fetching activity registrations...');
  
  try {
    // Get userId from context (should be set by the action handler)
    const userId = context.get('selectedUserId') as string;
    
    if (!userId) {
      throw new Error('No user selected. Please select a user first.');
    }
    
    console.log(`[User Registrations] Fetching registrations for user: ${userId}`);
    
    // Make authenticated GET request to get user's registrations
    await httpClient.get(
      `/users/${userId}/registrations`,
      {},
      (response, context) => {
        const registrations = response.data || [];
        
        console.log(`\n[User Registrations] Found ${registrations.length} registration(s):`);
        
        if (registrations.length === 0) {
          console.log('  No registrations found for this user.');
        } else {
          registrations.forEach((reg: any, index: number) => {
            // The title should be in the response already
            const activityTitle = reg.title || reg.activityTitle || reg.activityName || reg.activityId || 'Unknown';
            
            console.log(`\n  ${index + 1}. Activity: ${activityTitle}`);
            if (reg.id || reg.registrationId) console.log(`     Registration ID: ${reg.id || reg.registrationId}`);
            if (reg.status !== undefined) console.log(`     Status: ${reg.status}`);
            if (reg.progress !== undefined) console.log(`     Progress: ${reg.progress}%`);
            if (reg.startDate) console.log(`     Start Date: ${reg.startDate}`);
            if (reg.endDate) console.log(`     End Date: ${reg.endDate}`);
            if (reg.completedAt) console.log(`     Completed At: ${reg.completedAt}`);
          });
        }
        
        // Store registrations in context
        context.set('userRegistrations', registrations);
        context.set('userRegistrationCount', registrations.length);
      }
    );
    
    console.log('\n[User Registrations] ✓ Successfully retrieved registrations');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[User Registrations] ✗ Error fetching registrations:', errorMessage);
    
    // Don't throw - just log the error and continue
    console.log('[User Registrations] Continuing...');
  }
};

export default userRegistrationsSeeder;
