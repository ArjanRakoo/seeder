/**
 * Activities List Seeder - Fetch all activities from the system
 * 
 * Uses the /v2/activities/search endpoint to retrieve a list of all activities.
 * Stores the activities in context for selection in the interactive menu.
 */

import type { SeederFunction, Activity } from '../types/index.js';

const activitiesListSeeder: SeederFunction = async (httpClient, context) => {
  console.log('\n[Activities List] Fetching activities...');
  
  try {
    // Use the search endpoint with empty criteria to get all activities
    const searchRequest = {
      criteria: []
    };
    
    // Make authenticated POST request to search for activities
    await httpClient.post(
      '/v2/activities/search?page=0&size=100&sortBy=title',
      searchRequest,
      (response, context) => {
        const activitiesPage = response.data;
        const activityResponses = activitiesPage.content || [];
        
        // Extract the nested 'activity' object from each ActivityResponse
        const activities: Activity[] = activityResponses.map((ar: any) => ar.activity);
        
        console.log(`\n[Activities List] Found ${activities.length} activit${activities.length === 1 ? 'y' : 'ies'}`);
        
        // Store activities in context
        context.set('activitiesList', activities);
        context.set('activitiesCount', activities.length);
      }
    );
    
    if (!context.has('activitiesList')) {
      throw new Error('Failed to extract activities from response');
    }
    
    console.log('[Activities List] ✓ Successfully retrieved activities');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Activities List] ✗ Error fetching activities:', errorMessage);
    throw error;
  }
};

export default activitiesListSeeder;
