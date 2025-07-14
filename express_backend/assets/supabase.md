# Supabase Integration

## Setup

The backend uses Supabase for authentication and user/document management.

### Environment Variables

Ensure these are set (e.g., via `.env`):

```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
```

### Usage

- All Supabase API calls are performed via `src/services/supabaseService.js`, which initializes a client using the environment variables.
- Auth API (`src/controllers/auth.js`) supports:
  - **POST /auth/register**: Register new user (`email`, `password`)
  - **POST /auth/login**: Authenticate user
  - **POST /auth/logout**: Logout (requires Bearer token as header)

### Notes

- Do not hardcode credentials.
- Use only via the service abstraction for consistent error handling and security.
