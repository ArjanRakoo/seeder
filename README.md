# Database Seeder

A modular database seeding framework that uses your backend API endpoints instead of direct database connections. Works like Postman with support for callbacks to store variables (like bearer tokens) across seeder executions.

## Features

- **Postman-like Callbacks**: Execute code after API requests to store tokens, IDs, and other data
- **Automatic Token Management**: Bearer tokens are automatically injected into authenticated requests
- **Modular Architecture**: Separate seeders for different entities
- **Environment Configuration**: Easy configuration via environment variables
- **Sequential Execution**: Seeders run in order with proper authentication flow

## Project Structure

```
seeder/
├── package.json                 # Dependencies and scripts
├── config/
│   └── environment.js          # API configuration
├── lib/
│   ├── http-client.js          # HTTP client with callback support
│   └── seeder-context.js       # Variable storage (like Postman environment)
├── seeders/
│   ├── auth.seeder.js          # Authentication (runs first)
│   └── users.seeder.js         # Example entity seeder
└── index.js                     # Main orchestrator
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure your API settings in `config/environment.js` or use environment variables:

```bash
export API_BASE_URL=http://localhost:3000/api
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=admin123
```

## Usage

Run the seeder:

```bash
npm run seed
```

Or directly:

```bash
node index.js
```

Enable verbose logging:

```bash
VERBOSE=true npm run seed
```

## How It Works

### 1. Authentication Flow

The `auth.seeder.js` runs first and:

- Calls your login endpoint
- Extracts the bearer token from the response
- Stores it in the context using a callback

```javascript
await httpClient.post(
  "/auth/login",
  { username: "admin", password: "admin123" },
  (response, context) => {
    // Store token from response
    context.set("bearerToken", response.data.token);
  }
);
```

### 2. Subsequent Seeders

Other seeders automatically use the stored token:

```javascript
await httpClient.post("/users", userData, (response, context) => {
  // Store created user ID for later use
  context.set("userId", response.data.id);
});
```

### 3. Context Variables

The context works like Postman's environment variables:

```javascript
// Set a variable
context.set('bearerToken', 'abc123');

// Get a variable
const token = context.get('bearerToken');

// Check if exists
if (context.has('bearerToken')) { ... }
```

## Creating New Seeders

1. Create a new file in `seeders/` (e.g., `products.seeder.js`):

```javascript
module.exports = async function productsSeeder(httpClient, context) {
  console.log("\n[Products Seeder] Starting...");

  const products = [
    { name: "Product 1", price: 99.99 },
    { name: "Product 2", price: 149.99 },
  ];

  for (const product of products) {
    await httpClient.post("/products", product, (response, context) => {
      console.log(`Created: ${response.data.name}`);
      context.set(`product_${product.name}_id`, response.data.id);
    });
  }
};
```

2. Import and add it to the seeders list in `index.js`:

```javascript
const productsSeeder = require("./seeders/products.seeder");

const seeders = [
  { name: "Auth", fn: authSeeder },
  { name: "Users", fn: usersSeeder },
  { name: "Products", fn: productsSeeder }, // Add here
];
```

## HTTP Client Methods

All methods support callbacks:

```javascript
// GET request
await httpClient.get("/users", {}, (response, context) => {
  context.set("userCount", response.data.length);
});

// POST request
await httpClient.post("/users", userData, (response, context) => {
  context.set("userId", response.data.id);
});

// PUT request
await httpClient.put("/users/123", userData, (response, context) => {
  // callback logic
});

// PATCH request
await httpClient.patch(
  "/users/123",
  { status: "active" },
  (response, context) => {
    // callback logic
  }
);

// DELETE request
await httpClient.delete("/users/123", {}, (response, context) => {
  // callback logic
});
```

## Configuration

Edit `config/environment.js` or set environment variables:

| Variable          | Default                     | Description             |
| ----------------- | --------------------------- | ----------------------- |
| `API_BASE_URL`    | `http://localhost:3000/api` | Backend API base URL    |
| `ADMIN_USERNAME`  | `admin`                     | Login username          |
| `ADMIN_PASSWORD`  | `admin123`                  | Login password          |
| `REQUEST_TIMEOUT` | `30000`                     | Request timeout in ms   |
| `VERBOSE`         | `false`                     | Enable detailed logging |

## Customizing the Auth Seeder

The `auth.seeder.js` includes multiple patterns for extracting tokens. Adjust based on your API:

```javascript
// Token in response body
if (response.data.token) {
  context.set("bearerToken", response.data.token);
}

// Token in Authorization header
if (response.headers.authorization) {
  const token = response.headers.authorization.replace("Bearer ", "");
  context.set("bearerToken", token);
}

// Different key name
if (response.data.access_token) {
  context.set("bearerToken", response.data.access_token);
}
```

## Error Handling

Seeders will stop execution if any seeder fails. To continue on error:

```javascript
try {
  await httpClient.post("/users", userData);
} catch (error) {
  console.error("Error:", error.message);
  // Don't re-throw to continue with other records
}
```

## License

ISC
