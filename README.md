# SyncChat

A real-time group messaging and chat application built with a modern full-stack architecture using Next.js, Node.js, PostgreSQL, and Redis.

## Project Overview

Sync Chat is a comprehensive real-time messaging platform that enables users to create and manage groups, send messages in real-time, and collaborate with team members. The application supports group chat with admin controls, private messaging, user management, and persistent message history. It is a monorepo project built with Turbo and uses WebSockets for real-time communication and Redis for message queuing and pub/sub patterns.

**Core Features:**
- Real-time group and direct messaging via WebSocket
- Group management with admin controls
- User authentication via Clerk
- Message persistence with PostgreSQL
- Scalable message processing with Redis Pub/Sub
- Responsive UI with Next.js and Tailwind CSS

## Tech Stack

**Frontend:**
- Next.js 15
- React 19
- Redux Toolkit for state management
- Tailwind CSS 4 with PostCSS
- Radix UI components
- Clerk for authentication

**Backend:**
- Node.js with TypeScript
- WebSocket (ws) for real-time communication
- JWT for token-based authentication
- Redis for pub/sub and message queuing
- Prisma ORM

**Database & Data:**
- PostgreSQL
- Prisma Client
- Redis (messaging and pub/sub)

**Build & Tooling:**
- Turbo for monorepo management
- esbuild for bundling
- Nodemon for development
- TypeScript
- ESLint and Prettier

## Project Structure

```
chatapp/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── app/                # Next.js app directory (pages, layouts)
│   │   ├── components/         # React components (chat UI, groups, etc.)
│   │   ├── hooks/              # Custom hooks (WebSocket connection)
│   │   ├── store/              # Redux store and slices (groups, messages, user)
│   │   └── action/             # Server actions (auth, data fetching)
│   ├── backend/                # WebSocket server and real-time logic
│   │   ├── src/
│   │   │   ├── index.ts        # WebSocket server, message handling, routing
│   │   │   ├── PubSubManager.ts # Redis Pub/Sub manager for group subscriptions
│   │   │   └── func.ts         # Database helper functions
│   │   └── dist/               # Compiled output
│   └── msg_worker/             # Background worker for message persistence
│       └── src/
│           └── index.ts        # Redis queue consumer, persists messages to DB
├── packages/
│   ├── prisma/                 # Shared Prisma schema and migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Data models (Users, Groups, Messages, etc.)
│   │   │   └── migrations/     # Database migration history
│   │   └── src/                # Exported Prisma client
│   ├── types/                  # Shared TypeScript types and interfaces
│   │   └── src/
│   │       └── index.ts        # Type definitions for messages, API contracts
│   ├── ui/                     # Shared UI component library (Radix UI wrappers)
│   ├── eslint-config/          # Shared ESLint configuration
│   ├── tailwind-config/        # Shared Tailwind CSS configuration
│   └── typescript-config/      # Shared TypeScript configuration
├── docker-compose.yml          # Docker services (PostgreSQL, Redis)
├── turbo.json                  # Turbo monorepo configuration
├── package.json                # Root package (workspaces, scripts, dependencies)
└── README.md                   # This file
```

### Key Packages:
- **web**: Next.js frontend with Clerk authentication, Redux state management, and real-time WebSocket integration
- **backend**: Node.js WebSocket server handling group messaging, user subscriptions via Redis Pub/Sub, and JWT validation
- **msg_worker**: Background worker consuming message queues from Redis and persisting them to PostgreSQL
- **prisma**: Shared database schema with models for Users, Groups, Memberships, and Messages
- **types**: Centralized TypeScript types for WebSocket message contracts and API interfaces

## Environment Variables Setup

Environment variables are required for the application to run. Each package has its own `.env.example` file that must be copied and configured:

### Step 1: Copy environment files from examples

```bash
cp apps/web/.env.example apps/web/.env
cp apps/backend/.env.example apps/backend/.env
cp packages/prisma/.env.example packages/prisma/.env
```

### Step 2: Configure each `.env` file

**packages/prisma/.env:**
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/postgres
```

**apps/backend/.env:**
```
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/postgres
SECRET_KEY=secret
```

**apps/web/.env:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_key>
CLERK_SECRET_KEY=<your_clerk_secret>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:8080
```

### Important Notes:
- All environment variables in the `.env.example` files should be added to your `.env` file, even if they appear unused
- The `DATABASE_URL` should point to your PostgreSQL instance (see [Docker Setup](#docker-setup) below for running PostgreSQL)
- Clerk keys must be obtained from the Clerk dashboard
- The WebSocket URL defaults to `localhost:8080` for development
- Do not commit `.env` files to version control

## Installation Steps

### Prerequisites:
- Node.js >= 18 (see `engines.node` in package.json)
- npm >= 10.9.0
- PostgreSQL running (see [Docker Setup](#docker-setup))
- Redis running (see [Docker Setup](#docker-setup))

### Step 1: Install dependencies

```bash
npm install
```

This command installs all root dependencies and runs `npm install` in each workspace (apps and packages) due to the workspaces configuration in `package.json`.

### Step 2: Verify installation

```bash
npm run check-types
```

## Running the Project

The project requires multiple terminals as each service runs independently.

### Docker Setup (PostgreSQL & Redis)

Before starting the application, ensure PostgreSQL and Redis are running:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432` (credentials: postgres/mypassword)
- Redis on `localhost:6379`

### Terminal 1: Database Migrations

Run Prisma migrations to set up the database schema:

```bash
cd packages/prisma
npx prisma migrate dev
```

### Terminal 2: Start Backend (WebSocket Server)

```bash
cd apps/backend
npm run dev
```

The WebSocket server listens on `localhost:8080`.

### Terminal 3: Start Message Worker (Background Queue Processor)

```bash
cd apps/msg_worker
npm run dev
```

The worker continuously processes messages from the Redis queue and persists them to the database.

### Terminal 4: Start Frontend (Next.js Web App)

```bash
cd apps/web
npm run dev
```

The frontend runs on `http://localhost:3001`.

### All Terminals Together (Using Turbo)

Alternatively, start all development services from the root directory:

```bash
npm run dev
```

This starts all apps concurrently. Each service will log to the same terminal (use `turbo run dev --filter <app-name>` to run a single app).

## Database Setup

The application uses Prisma ORM with PostgreSQL.

### Schema Location:
[packages/prisma/prisma/schema.prisma](packages/prisma/prisma/schema.prisma)

### Key Models:
- **Users**: User profiles with authentication metadata
- **Groups**: Chat groups with admin and privacy settings
- **Memberships**: User-group relationships
- **Messages**: Chat messages with content, timestamps, and group/author relationships

### Running Migrations:

Initial setup:
```bash
cd packages/prisma
npx prisma migrate dev
```

After schema changes:
```bash
npx prisma migrate dev --name <migration_name>
```

View the database:
```bash
npx prisma studio
```

## Key Features

- **Real-Time Messaging**: Bi-directional WebSocket communication for instant message delivery
- **Group Chat**: Create and manage groups with multiple members
- **Admin Controls**: Group administrators can add/remove users, update group info, and manage settings
- **Private Groups**: Support for private messaging groups
- **User Authentication**: Clerk-based authentication with JWT tokens
- **Message History**: Persistent message storage with pagination support
- **Pub/Sub Architecture**: Redis Pub/Sub for scalable group subscriptions
- **Message Queuing**: Redis queue for asynchronous message persistence
- **User Notifications**: Browser notifications for new messages and group events
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Type Safety**: Full TypeScript implementation with shared types

## Notes / Important Considerations

### Monorepo Structure:
- Uses Turbo for task orchestration and caching
- Shared packages (types, prisma, ui, config) are consumed by apps/web and apps/backend
- Each app has independent build/dev scripts but shares configurations via packages

### Port Configuration:
- Frontend: `localhost:3001` (Next.js)
- Backend WebSocket: `localhost:8080`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Development Workflow:
- Run `npm run dev` from the root to start all services
- Use `turbo run <task>` to run specific tasks across the monorepo
- Use `npm run format` to auto-format code with Prettier
- Use `npm run lint` to check code quality

### Common Issues:
- Ensure PostgreSQL and Redis are running before starting the backend
- WebSocket URL in frontend `.env` must match the backend URL
- Clerk credentials are required for sign-in functionality
- All `.env` files must be present (even if some variables are unused)
- Database migrations must be run before starting the backend service

### Message Flow:
1. User sends message via WebSocket to backend (port 8080)
2. Backend publishes message to Redis Pub/Sub for the group
3. Backend enqueues message to Redis message queue
4. msg_worker consumes from queue and persists to PostgreSQL
5. All subscribed clients receive the message via Redis Pub/Sub

### Environment Synchronization:
- Frontend and backend share the same DATABASE_URL
- Both must have the same SECRET_KEY for JWT validation
- Frontend WebSocket URL must point to the backend server
