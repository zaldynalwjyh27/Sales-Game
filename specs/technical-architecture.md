# Technical Architecture of JISR - Sales Simulator

## System Overview

The JISR Sales Simulator is a real-time, multiplayer web application built with Next.js 16.x that simulates sales scenarios. The application enables users to practice sales techniques in a controlled environment with AI-powered clients.

## Architecture Layers

### 1. Presentation Layer (Frontend)
- **Framework**: Next.js 16.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **Direction**: Right-to-left (RTL) for Arabic language support

#### Key Components:
- **Home Page** (`src/app/page.tsx`): Entry point allowing room creation or joining
- **Room Page** (`src/app/room/[id]/page.tsx`): Server component rendering room data
- **Room Client** (`src/app/room/[id]/RoomClient.tsx`): Client-side component handling real-time interactions
- **UI Components** (`src/components/ui/*`): Reusable UI elements (buttons, cards, inputs, etc.)
- **Specialized Components**:
  - `ChatInterface`: Real-time messaging interface
  - `RoleCardDisplay`: Shows role-specific information
  - `HiddenEvaluatorForm`: Evaluation submission form
  - `ResultsRevealModal`: Modal for displaying results

### 2. Application Layer (Business Logic)
- **Server Actions** (`src/server/actions.ts`): Handle all server-side operations
- **State Management**: Zustand for client-side state management
- **Real-time Communication**: Pusher integration for live updates

#### Server Actions:
- `createRoom()`: Creates a new room with a host player
- `joinRoom()`: Adds a new player to an existing room
- `assignRoles()`: Assigns roles (SELLER, CLIENT, EVALUATOR) to players
- `sendMessage()`: Processes and broadcasts messages
- `submitEvaluation()`: Submits evaluation scores
- `revealEvaluations()`: Reveals all evaluations to participants
- `nextRound()`: Resets room for a new round with new scenario

### 3. Integration Layer
- **AI Service** (`src/lib/ai-handler.ts`): Interface to OpenAI API
- **Pusher Service** (`src/lib/pusher-client.ts`, `src/lib/pusher-server.ts`): Real-time communication
- **External APIs**: OpenAI GPT-4o-mini for AI client responses

### 4. Data Layer
- **Database**: SQLite with Prisma ORM
- **Connection**: Direct Prisma integration via `src/lib/prisma.ts`
- **Schema**: Room, Player, Message, and Evaluation models

## Data Flow Architecture

### Room Creation Flow:
1. User enters name → `createRoom()` action
2. Prisma creates room with host player
3. Redirect to room page with player ID

### Joining Flow:
1. User accesses join URL → `joinRoom()` action
2. Prisma creates new player in room
3. Pusher broadcasts "player-joined" event
4. All clients in room receive update

### Game Start Flow:
1. Host clicks "Start" → `assignRoles()` action
2. Roles are assigned to players
3. Random scenario is selected
4. Prisma updates room status to "IN_PROGRESS"
5. Pusher broadcasts "game-started" event

### Message Flow:
1. Player sends message → `sendMessage()` action
2. Message saved to database
3. Pusher broadcasts "new-message" to room
4. If sender is SELLER and no human CLIENT exists → AI responds
5. AI response goes through `handleAIResponse()` → saved to DB → broadcast via Pusher

### Evaluation Flow:
1. EVALUATOR fills form → `submitEvaluation()` action
2. Scores saved to database
3. At host discretion → `revealEvaluations()` reveals all scores
4. Pusher broadcasts "evaluations-revealed" → refresh UI

## Security Considerations

### Authentication & Authorization
- Room access via direct URL with player ID
- Players can only access rooms they belong to
- Server-side validation ensures players exist in rooms

### Rate Limiting
- Not explicitly implemented in current codebase
- Could be added at middleware level

### Input Sanitization
- Messages go directly to database without explicit sanitization
- Relies on Prisma's parameterized queries for SQL injection protection

## Deployment Architecture

### Client-Side
- Static assets served by Next.js runtime
- Client bundles optimized by Next.js build process
- Progressive Web App capabilities (if configured)

### Server-Side
- Next.js App Router server components handle initial data fetching
- Server actions handle mutations
- Environment variables for API keys and database connection

## Performance Considerations

### Frontend Optimizations
- Server components for initial data fetching
- Client components for interactivity
- Pusher for real-time updates (avoids polling)

### Backend Optimizations
- Prisma queries optimized with includes for related data
- Minimal payload sent via Pusher to stay under 10KB limit

## Scalability Notes

### Current Limitations
- SQLite database (not optimal for high-concurrency)
- Single instance deployment model
- Pusher channel limits per account tier

### Potential Improvements
- Migration to PostgreSQL for higher concurrency
- Horizontal scaling with shared session state
- WebSocket pooling for improved real-time performance