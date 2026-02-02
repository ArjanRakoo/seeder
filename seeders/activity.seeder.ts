/**
 * Activity Seeder - Creates sample activities
 * 
 * This seeder creates activities using the authenticated admin session.
 * Activities are created with random titles and minimal required fields.
 */

import type { SeederFunction } from '../types/index.js';

const activitySeeder: SeederFunction = async (httpClient, context) => {
  console.log('\n[Activity Seeder] Starting activity creation...');
  
  // Sample activities to seed with random titles
  const activities = [
    {
      title: 'Introduction to TypeScript',
      description: 'Learn the basics of TypeScript programming',
      supplier: 'Rakoo Learning'
    },
    {
      title: 'Advanced React Patterns',
      description: 'Master advanced React development patterns',
      supplier: 'Rakoo Learning'
    },
    {
      title: 'Database Design Fundamentals',
      description: 'Learn how to design efficient database schemas',
      supplier: 'Rakoo Learning'
    }
  ];
  
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
          status: 0, // Draft status
          baseLanguage: 'nl', // Dutch as base language
          enabledLanguages: ['nl'], // Only Dutch enabled
          durationLimited: false,
          system: 'LEARN', // Learn system
          type: 'CLASSIC', // Classic activity type
          image: {
            type: 'NULL' // No image
          },
          source: {
            type: 'INTERNAL' // Internal source
          }
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
