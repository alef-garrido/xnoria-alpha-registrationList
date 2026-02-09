# Xnoria Alpha - Registration List

A full-stack authentication and user registration system with admin dashboard, built with Express, React, TypeScript, and PostgreSQL.

## Features

- **User Authentication**: Secure login/logout with bcrypt password hashing and session management
- **User Registration**: Invitation-based user registration with code validation
- **Admin Dashboard**: Manage users, generate invitation codes, and view statistics
- **User Dashboard**: View personal account information
- **Role-Based Access Control**: Support for admin and user roles
- **Session Management**: Secure session handling with PostgreSQL store

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn/ui
- **Backend**: Express, TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **Package Manager**: pnpm (monorepo)
- **Auth**: bcrypt, express-session
- **Testing**: Vitest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- pnpm 8+ (or install with `npm install -g pnpm`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd xnoria-alpha-registrationList
```

2. Install dependencies with pnpm:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your configuration (this file is at the root directory):
```env
DATABASE_URL=postgres://user:password@localhost:5432/authfortress
PORT=5000
SESSION_SECRET=your-long-random-secret-key
GEMINI_APUI_KEY=your-api-key-if-needed
```

**Note:** The `.env` file is also copied to `server/` for package-level development.

4. Run database migrations:
```bash
pnpm db:push
```

5. Start the development servers:
```bash
pnpm dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Available Scripts

### Root workspace commands
- `pnpm dev` - Start both frontend and backend in parallel
- `pnpm build` - Build both packages for production
- `pnpm test` - Run tests across all packages
- `pnpm coverage` - Generate test coverage reports
- `pnpm check` - Run TypeScript type checking

### Package-specific commands
- `pnpm --filter client dev` - Start only frontend dev server
- `pnpm --filter server dev` - Start only backend dev server
- `pnpm --filter client build` - Build frontend for production
- `pnpm --filter server build` - Build backend for production

### Database commands
- `pnpm db:push` - Apply database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management

## Project Structure

```
├── client/                 # React frontend package
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   └── __tests__/     # Component tests
│   ├── package.json
│   └── tsconfig.json
├── server/                # Express backend package
│   ├── routes.ts          # API routes
│   ├── auth.ts            # Authentication middleware
│   ├── storage.ts         # Database operations
│   ├── index.ts           # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── shared/                # Shared types and schemas package
│   ├── schema.ts          # Zod schemas and types
│   ├── package.json
│   └── tsconfig.json
├── migrations/            # Database migrations
├── pnpm-workspace.yaml    # pnpm monorepo configuration
├── tsconfig.json          # Root TypeScript configuration
└── .env.example           # Environment variables template
```

## Monorepo Structure

This project uses **pnpm workspaces** to manage three interconnected packages:

- **client**: React frontend application
- **server**: Express backend application  
- **shared**: Shared TypeScript types and Zod schemas

All packages share dependencies and can reference each other using workspace imports (e.g., `import { schema } from "shared"`).

### Benefits of pnpm monorepo:
- 🔗 Workspace symlinks for local package references
- 📦 Reduced disk usage with hardlink store
- ⚡ Faster installs and CI/CD
- 🎯 Cleaner dependency management per package

## API Routes

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout current user
- `POST /api/auth/register` - Register new user with invitation code
- `GET /api/auth/user` - Get current user info (protected)

### Admin
- `GET /api/admin/invitations` - List invitation codes created by admin (admin only)
- `POST /api/admin/invitations` - Generate new invitation code (admin only)
- `DELETE /api/admin/invitations/:id` - Revoke invitation code (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)

## Default Admin User

For local development, an admin user is automatically seeded:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## Database Schema

### Users Table
- `id`: UUID (primary key)
- `email`: String (unique)
- `password`: String (hashed)
- `firstName`: String
- `lastName`: String
- `role`: String ('admin' or 'user')
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Invitation Codes Table
- `id`: UUID (primary key)
- `code`: String (unique)
- `isUsed`: Boolean
- `usedBy`: UUID (foreign key to users)
- `createdBy`: UUID (foreign key to users)
- `createdAt`: Timestamp
- `usedAt`: Timestamp

### Sessions Table
- Auto-managed by express-session

## Development

### Database Management

View/manage database with Drizzle Studio:
```bash
pnpm db:studio
```

Create a new migration:
```bash
pnpm --filter server db:generate
```

### Running Tests

```bash
pnpm test
```

Test a specific package:
```bash
pnpm --filter client test
pnpm --filter server test
```

### Building for Production

```bash
pnpm build
```

Then run the production server:
```bash
pnpm start
```

## Troubleshooting

### Database Connection Issues
Ensure PostgreSQL is running and `DATABASE_URL` is correctly configured in `.env`.

### API Proxy Errors
The Vite dev server proxies `/api` requests to `http://localhost:5000`. Ensure both servers are running:
- Frontend: `pnpm --filter client dev`
- Backend: `pnpm --filter server dev`

Or simply use: `pnpm dev` to run both in parallel.

### Session Issues
Clear browser cookies and try logging in again. Session data is stored in PostgreSQL.

### Missing Dependencies
If you see module errors, ensure you've run `pnpm install` and that both `node_modules` directories exist:
- Root: `node_modules/`
- Package-specific: `client/node_modules/`, `server/node_modules/`, `shared/node_modules/`

### Frontend Shows 404
Ensure the Vite dev server is running on `http://localhost:5173`. Check that:
1. You've run `pnpm install`
2. The `.env` file exists in the root directory
3. No TypeScript errors in `client/src/`

### Accessing the Application

1. **Login Page**: Navigate to `http://localhost:5173/`
   - Use the default admin credentials: `admin@example.com` / `admin123`
   - Or register with a valid invitation code

2. **Admin Dashboard**: Available at `/admin` for users with admin role
   - Generate and manage invitation codes
   - View user statistics
   - Manage user roles

3. **User Dashboard**: Available at `/user` for all authenticated users
   - View personal account information

## Security Notes

- Always use a strong `SESSION_SECRET` in production
- Enable HTTPS in production (`cookie.secure: true` in auth.ts)
- Use environment variables for sensitive data (never commit `.env`)
- Regularly rotate session secrets
- Validate invitation codes are single-use only

## License
MIT

## Credits
Created by Armando Garrido (alef lemat) - [GitHub](https://github.com/alef-garrido)