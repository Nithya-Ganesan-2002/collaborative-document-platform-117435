# Supabase Integration

## Setup

The backend uses Supabase for authentication and user/document management.

### Environment Variables

Create a `.env` file in the root of the `express_backend` folder with:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
```
**Never check `.env` into git (it should be listed in `.gitignore`).**

On deployment, ensure the following environment variables are present in your hosting environment:
- `SUPABASE_URL`
- `SUPABASE_KEY`

### Usage

- All Supabase API calls are performed via `src/services/supabaseService.js`, which initializes a client using the environment variables.
- The service strictly avoids hardcoding or reading config from anywhere except environment variables.
- Auth API (`src/controllers/auth.js`) supports:
  - **POST /auth/register**: Register new user (`email`, `password`)
  - **POST /auth/login**: Authenticate user
  - **POST /auth/logout**: Logout (requires Bearer token as header)

### Notes

- Do not hardcode credentials.
- Use only via the service abstraction for consistent error handling and security.
- If these variables are missing, the backend will refuse to start.
