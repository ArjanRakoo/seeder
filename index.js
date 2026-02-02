/**
 * Database Seeder - Main Entry Point
 * 
 * This orchestrates the seeding process by running seeders in order.
 * The auth seeder runs first to obtain a bearer token, then other seeders follow.
 */

require('dotenv').config();

const SeederContext = require('./lib/seeder-context');
const HttpClient = require('./lib/http-client');
const config = require('./config/environment');

// Import seeders
const authSeeder = require('./seeders/auth.seeder');
const usersSeeder = require('./seeders/users.seeder');

/**
 * Main seeding function
 */
async function seed() {
  console.log('='.repeat(60));
  console.log('Database Seeder Starting');
  console.log('='.repeat(60));
  console.log(`API Base URL: ${config.apiBaseUrl}`);
  console.log(`Verbose Mode: ${config.verbose ? 'ON' : 'OFF'}`);
  console.log('='.repeat(60));
  
  // Initialize context and HTTP client
  const context = new SeederContext();
  const httpClient = new HttpClient(config.apiBaseUrl, context, config);
  
  // Define seeders in execution order
  // Auth seeder must run first to obtain bearer token
  const seeders = [
    { name: 'Auth', fn: authSeeder },
    { name: 'Users', fn: usersSeeder },
    // Add more seeders here as needed
    // { name: 'Products', fn: productsSeeder },
    // { name: 'Orders', fn: ordersSeeder },
  ];
  
  try {
    // Execute seeders in sequence
    for (const seeder of seeders) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Running: ${seeder.name} Seeder`);
      console.log('='.repeat(60));
      
      try {
        await seeder.fn(httpClient, context);
      } catch (error) {
        console.error(`\n[Error] ${seeder.name} Seeder failed:`, error.message);
        
        // Stop the seeding process if a seeder fails
        throw error;
      }
    }
    
    // Success
    console.log('\n' + '='.repeat(60));
    console.log('✓ Database Seeding Completed Successfully');
    console.log('='.repeat(60));
    
    // Optional: Display summary of what was created
    if (config.verbose) {
      console.log('\nContext Summary:');
      const vars = context.getAll();
      Object.keys(vars).forEach(key => {
        if (key !== 'bearerToken') { // Don't display sensitive token
          console.log(`  ${key}:`, vars[key]);
        }
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ Database Seeding Failed');
    console.error('='.repeat(60));
    console.error('\nError Details:', error.message);
    
    if (config.verbose && error.response) {
      console.error('\nAPI Response:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\n[Unhandled Error]', error);
  process.exit(1);
});

// Run the seeder
seed();
