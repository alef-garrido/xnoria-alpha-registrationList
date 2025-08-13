# Overview

This is a full-stack web application built with React, Express, and PostgreSQL that implements a role-based user management system with invitation-based registration. The application features an admin dashboard for managing users and invitation codes, along with email/password authentication.

The system operates on an invitation-only model where administrators can generate invitation codes that new users must provide during registration. Once registered, users are directed to role-specific dashboards (admin or regular user).

## Authentication Credentials

**Demo Admin Account:**
- Email: admin@example.com
- Password: admin123

**Test Invitation Code:** INV-R7QC0CO0K (valid for new user registration)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with **React 18** using TypeScript and follows a modern component-based architecture:

- **Routing**: Uses `wouter` for client-side routing with role-based route protection
- **State Management**: Leverages `@tanstack/react-query` for server state management and caching
- **UI Framework**: Built with `shadcn/ui` components on top of Radix UI primitives
- **Styling**: Uses Tailwind CSS with a custom design system supporting light/dark themes
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The application structure separates concerns into pages (landing, register, admin-dashboard, user-dashboard), reusable components, and utility functions. Authentication state is managed globally through React Query with automatic token handling.

## Backend Architecture

The backend follows a **RESTful API** design using Express.js with TypeScript:

- **Framework**: Express.js with middleware for JSON parsing, CORS, and session management
- **Authentication**: Implements Replit OAuth with Passport.js for secure authentication
- **Session Management**: Uses PostgreSQL session store with express-session
- **API Structure**: Organized into logical route groups (auth, admin, user operations)
- **Middleware**: Custom authentication and authorization middleware for role-based access control

The server implements a clear separation between authentication logic, route handlers, and business logic through dedicated modules.

## Data Storage

**Database**: PostgreSQL with Drizzle ORM for type-safe database operations

**Schema Design**:
- `users` table: Stores user profiles with role-based access (admin/user)
- `sessions` table: Required for Replit Auth session persistence
- `invitation_codes` table: Manages invitation system with usage tracking

The database uses UUID primary keys and includes proper indexing for session management. Foreign key relationships maintain data integrity between users and invitation codes.

## Authentication & Authorization

**Authentication Strategy**: Email/Password authentication with bcrypt hashing
- Manual user registration with invitation codes required
- Session-based authentication with PostgreSQL session storage
- Secure password hashing using bcrypt with salt rounds of 12
- Session cookies with proper security settings

**Authorization Model**: Role-based access control (RBAC)
- Two primary roles: `admin` and `user`
- Route-level protection with middleware validation
- Frontend route guards based on authentication state and user roles
- Admin users can generate invitation codes for new user registration
- Admin users can promote/demote other users' roles (except cannot demote themselves)
- Role changes are tracked with updated timestamps

## External Dependencies

**Core Dependencies**:
- `@neondatabase/serverless`: PostgreSQL connection pooling optimized for serverless environments
- `drizzle-orm`: Type-safe ORM with PostgreSQL dialect for database operations
- `@tanstack/react-query`: Server state management with caching and synchronization
- `@radix-ui/*`: Headless UI component library for accessible interface elements

**Authentication Services**:
- Replit OAuth system for user authentication and identity management
- OpenID Connect protocol implementation through `openid-client`

**Development Tools**:
- Vite for fast development builds and hot module replacement
- TypeScript for type safety across the entire application stack
- ESBuild for production server bundling

**UI & Styling**:
- Tailwind CSS for utility-first styling approach
- shadcn/ui component system for consistent design patterns
- Lucide React for iconography

The application is designed to be deployed on Replit with automatic environment provisioning for the PostgreSQL database through the `DATABASE_URL` environment variable.