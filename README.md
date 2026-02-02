# Database Seeder

A modular database seeding framework that uses your backend API endpoints instead of direct database connections. Works like Postman with support for callbacks to store variables (like bearer tokens) across seeder executions.

Built with **TypeScript** for type safety and better developer experience.

## Features

- **Postman-like Callbacks**: Execute code after API requests to store tokens, IDs, and other data
- **Automatic Token Management**: Bearer tokens are automatically injected into authenticated requests
- **Modular Architecture**: Separate seeders for different entities
- **TypeScript**: Full type safety with interfaces and type definitions
- **Environment Configuration**: Easy configuration via environment variables
- **Sequential Execution**: Seeders run in order with proper authentication flow

## Project Structure

```
seeder/
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── types/
│   └── index.ts                # Type definitions
├── config/
│   └── environment.ts          # API configuration
├── lib/
│   ├── http-client.ts          # HTTP client with callback support
│   └── seeder-context.ts       # Variable storage (like Postman environment)
├── seeders/
│   ├── domain.seeder.ts        # Domain/client ID (runs first)
│   ├── auth.seeder.ts          # Authentication (runs second)
│   └── users.seeder.ts         # Example entity seeder
└── index.ts                     # Main orchestrator
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure your API settings in `config/environment.ts` or use environment variables:

```bash
export API_BASE_URL=https://ictivity.test.rakoo.com/api
export ADMIN_USERNAME=arjan+3@rakoo.com
export ADMIN_PASSWORD=your-password
export AUTH_CONTEXT=admin
export AUTH_PLATFORM=web
```

## Usage

Run the seeder:

```bash
npm run seed
```

With verbose mode:

```bash
VERBOSE=true npm run seed
```

Or during development with watch mode:

```bash
npm run dev
```

Build to JavaScript (optional):

```bash
npm run build
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

1. Create a new file in `seeders/` (e.g., `products.seeder.ts`):

```typescript
import type { SeederFunction } from "../types/index.js";

const productsSeeder: SeederFunction = async (httpClient, context) => {
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

export default productsSeeder;
```

2. Import and add it to the seeders list in `index.ts`:

```typescript
import productsSeeder from "./seeders/products.seeder.js";

const seeders = [
  { name: "Domain", fn: domainSeeder },
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

Edit `config/environment.ts` or set environment variables:

| Variable          | Default                               | Description             |
| ----------------- | ------------------------------------- | ----------------------- |
| `API_BASE_URL`    | `https://ictivity.test.rakoo.com/api` | Backend API base URL    |
| `ADMIN_USERNAME`  | `arjan+3@rakoo.com`                   | Login username          |
| `ADMIN_PASSWORD`  | `AZB_nej!dze1xdb2evg`                 | Login password          |
| `AUTH_CONTEXT`    | `admin`                               | Authentication context  |
| `AUTH_PLATFORM`   | `web`                                 | Platform identifier     |
| `REQUEST_TIMEOUT` | `30000`                               | Request timeout in ms   |
| `VERBOSE`         | `false`                               | Enable detailed logging |

## TypeScript Benefits

This seeder uses TypeScript for:

- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better autocomplete in your IDE
- **Interfaces**: Clear contracts for data structures
- **Refactoring**: Safer code changes with type checking

Example type definitions:

```typescript
interface SeederFunction {
  (httpClient: HttpClient, context: SeederContext): Promise<void>;
}

interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
```

## Customizing the Auth Seeder

The `auth.seeder.ts` uses your specific authentication format:

```typescript
const authRequest: AuthRequest = {
  clientId: clientId, // From domain seeder
  context: "admin",
  password: config.credentials.password,
  platform: "web",
  username: config.credentials.username,
};

await httpClient.post("/authenticate", authRequest, (response, context) => {
  // Extract bearer token from Authorization header
  const token = response.headers.authorization.replace("Bearer ", "");
  context.set("bearerToken", token);
});
```

## Error Handling

Seeders will stop execution if any seeder fails. To continue on error:

```typescript
try {
  await httpClient.post("/users", userData);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error("Error:", errorMessage);
  // Don't re-throw to continue with other records
}
```

## Development

The project uses `tsx` for TypeScript execution without a build step:

- **Development**: `npm run dev` - Watch mode with auto-restart
- **Run**: `npm run seed` - Execute the seeder
- **Build**: `npm run build` - Compile to JavaScript (optional)

## License

ISC
