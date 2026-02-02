/**
 * Users Seeder - Example seeder for creating users
 * 
 * This demonstrates how to create a seeder that uses the bearer token
 * from the auth seeder and makes authenticated API calls.
 */

export default async function usersSeeder(httpClient, context) {
  console.log('\n[Users Seeder] Starting users creation...');
  
  // Sample users to seed
  const users = [
    {
      username: 'john.doe',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user'
    },
    {
      username: 'jane.smith',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user'
    },
    {
      username: 'bob.manager',
      email: 'bob.manager@example.com',
      firstName: 'Bob',
      lastName: 'Manager',
      role: 'manager'
    }
  ];
  
  try {
    const createdUsers = [];
    
    for (const user of users) {
      console.log(`[Users Seeder] Creating user: ${user.username}`);
      
      // Make authenticated POST request to create user
      // The bearer token is automatically injected by the HTTP client
      await httpClient.post(
        '/users',
        user,
        (response, context) => {
          // Store created user data
          const createdUser = response.data;
          createdUsers.push(createdUser);
          
          // Optionally store user IDs for use in other seeders
          if (createdUser.id) {
            context.set(`user_${user.username}_id`, createdUser.id);
          }
          
          console.log(`[Users Seeder] ✓ Created user: ${user.username} (ID: ${createdUser.id})`);
        }
      );
    }
    
    // Store all created users in context for potential use by other seeders
    context.set('createdUsers', createdUsers);
    
    console.log(`[Users Seeder] ✓ Successfully created ${createdUsers.length} users`);
    
  } catch (error) {
    console.error('[Users Seeder] ✗ Error creating users:', error.message);
    
    // Decide whether to throw error (stop seeding) or continue
    // throw error; // Uncomment to stop on error
    console.log('[Users Seeder] Continuing despite errors...');
  }
}
