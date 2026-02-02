# Database Seeder

A modular database seeding framework that uses your backend API endpoints instead of direct database connections. Works like Postman with support for callbacks to store variables (like bearer tokens) across seeder executions.

Built with **TypeScript** for type safety and better developer experience. Features both an **interactive CLI mode** and a **one-shot automated mode**.

## Features

- **Interactive CLI**: Run commands interactively with persistent session state
- **Session Persistence**: Keep authentication tokens and context between actions
- **Postman-like Callbacks**: Execute code after API requests to store tokens, IDs, and other data
- **Automatic Token Management**: Bearer tokens are automatically injected into authenticated requests
- **Modular Architecture**: Separate seeders for different entities
- **TypeScript**: Full type safety with interfaces and type definitions
- **Environment Configuration**: Easy configuration via environment variables
- **Flexible Execution**: Interactive mode or one-shot automation

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
├── cli/
│   ├── session.ts              # Session management
│   ├── menu.ts                 # Interactive menu
│   └── actions.ts              # Action handlers
├── seeders/
│   ├── domain.seeder.ts        # Domain/client ID (runs first)
│   ├── auth.seeder.ts          # Authentication (runs second)
│   └── activity/               # Activity seeders
│       ├── activity.seeder.ts  # Activity creation logic
│       └── data.ts             # Activity data
├── index.ts                     # Interactive CLI
└── seed.ts                      # One-shot automated mode
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure your API settings in `config/environment.ts` or create a `.env` file:

```bash
API_BASE_URL=http://academy.dev.rakoo.com:3000/api
ADMIN_USERNAME=superadmin@rakoo.com
ADMIN_PASSWORD=your-password
AUTH_CONTEXT=admin
AUTH_PLATFORM=web
REJECT_UNAUTHORIZED=false  # For local dev with self-signed certs
VERBOSE=true
```

## Usage

### Interactive Mode (Recommended)

Start the interactive CLI:

```bash
npm start
```

This will launch an interactive menu where you can:

- **Authenticate** - Get client ID and login (session persists)
- **Create Activities** - Create sample activities (requires auth)
- **View Session Status** - Check authentication state and stored tokens
- **Exit** - Gracefully exit the application

**Key Benefits:**

- Session state (tokens, client ID) persists between actions
- No need to re-authenticate for each operation
- Visual feedback and error handling
- Easy to use for manual testing and development

### One-Shot Mode (Automated)

Run all seeders in sequence and exit (useful for CI/CD):

```bash
npm run seed
```

This will:

1. Authenticate (domain + auth)
2. Create activities
3. Exit

### Development Mode

Run with auto-restart on file changes:

```bash
npm run dev
```

### Build (Optional)

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Interactive CLI Example

```
$ npm start

═══════════════════════════════════════════════════════════
  Database Seeder - Interactive CLI
═══════════════════════════════════════════════════════════
  API: http://academy.dev.rakoo.com:3000/api
═══════════════════════════════════════════════════════════

? What would you like to do?
❯ 🔐 Authenticate (Get Client ID + Login)
  📝 Create Activities (Requires authentication)
  📊 View Session Status
  🚪 Exit

> Authenticate

────────────────────────────────────────────────────────────
  Authentication
────────────────────────────────────────────────────────────

[Domain Seeder] Fetching client ID...
[Context] Set clientId: f10cae5b-5233-38b5-beea-126e8a1fca5a
[Domain Seeder] ✓ Client ID retrieved successfully

[Auth Seeder] Starting authentication...
[Auth Seeder] Using client ID: f10cae5b-5233-38b5-beea-126e8a1fca5a
[HTTP] POST /authenticate - 200
[Context] Set bearerToken: eyJhbGciOiJIUzUxMiJ9...
[Auth Seeder] ✓ Authentication successful

✓ Authentication completed successfully!

? What would you like to do?
  🔐 Authenticate (Get Client ID + Login)
❯ 📝 Create Activities
  📊 View Session Status
  🚪 Exit

> Create Activities

────────────────────────────────────────────────────────────
  Create Activities
────────────────────────────────────────────────────────────

[Activity Seeder] Starting activity creation...
[Activity Seeder] Creating activity: Introduction to TypeScript
[HTTP] POST /v2/activities - 201
[Activity Seeder] ✓ Created activity: Introduction to TypeScript (ID: abc123...)
...

✓ Activities created successfully!
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
