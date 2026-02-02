/**
 * Activity Seeder - Creates sample activities
 * 
 * This seeder creates activities using the authenticated admin session.
 * Activities are created with random titles and minimal required fields.
 */

import type { SeederFunction } from '../../types/index.js';
import { activities } from './data.js';

const activitySeeder: SeederFunction = async (httpClient, context) => {
  console.log('\n[Activity Seeder] Starting activity creation...');
  
  try {
    const createdActivities: any[] = [];
    
    for (const activityData of activities) {
      console.log(`[Activity Seeder] Creating activity: ${activityData.title}`);
      
      // Prepare activity request body
      const activityRequest = {
        activity: {
          title: activityData.title,
          description: activityData.description,
          supplier: activityData.supplier,
          status: 1, // Draft status
          baseLanguage: 'DUTCH', 
          enabledLanguages: ['DUTCH'],
          durationLimited: false,
          system: 'NONE', // Learn system
          type: 'MICRO_LEARNING', // Classic activity type
        }
      };
      
      // Make authenticated POST request to create activity
      // The bearer token is automatically injected by the HTTP client
      await httpClient.post(
        '/v2/activities',
        activityRequest,
        (response, context) => {
          // Store created activity data
          const createdActivity = response.data;
          createdActivities.push(createdActivity);
          
          // Optionally store activity IDs for use in other seeders
          if (createdActivity.id) {
            context.set(`activity_${activityData.title.replace(/\s+/g, '_')}_id`, createdActivity.id);
          }
          
          console.log(`[Activity Seeder] ✓ Created activity: ${activityData.title} (ID: ${createdActivity.id})`);
        }
      );
    }
    
    // Store all created activities in context for potential use by other seeders
    context.set('createdActivities', createdActivities);
    
    console.log(`[Activity Seeder] ✓ Successfully created ${createdActivities.length} activities`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activity Seeder] ✗ Error creating activities:', errorMessage);
    
    // Decide whether to throw error (stop seeding) or continue
    // throw error; // Uncomment to stop on error
    console.log('[Activity Seeder] Continuing despite errors...');
  }
};

export default activitySeeder;
