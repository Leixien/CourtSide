# CourtSide - Architecture Documentation

## System Overview

CourtSide is a real-time sports social platform built with a modern serverless architecture optimized for free hosting. The system uses Next.js for both frontend and backend, with MongoDB for persistence and Socket.io for real-time communication.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Browser  │  │ Service      │  │ Push            │   │
│  │   (React)  │  │ Worker       │  │ Notifications   │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│         │                │                    │              │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Application (SSR/SSG)            │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   Pages      │  │  API Routes  │  │  Websocket │ │  │
│  │  │  (React)     │  │ (Serverless) │  │   Server   │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      External Services                       │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  MongoDB   │  │  Sports API  │  │  OAuth          │   │
│  │  Atlas     │  │ (API-Football)│  │  Providers      │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Technologies

#### React 18 with Next.js 14
- **App Router**: File-based routing with server components
- **Server-Side Rendering (SSR)**: Initial page loads optimized
- **Static Site Generation (SSG)**: Pre-rendered pages for performance
- **Client Components**: Interactive UI with React hooks

#### State Management
- **Zustand**: Lightweight state management (auth, user preferences)
- **SWR**: Data fetching with caching and revalidation
- **React Hooks**: Local component state

#### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: System preference detection
- **Responsive Design**: Mobile-first approach

### Backend Technologies

#### Next.js API Routes
- **Serverless Functions**: Auto-scaling, pay-per-use
- **Edge Runtime**: Low latency globally
- **TypeScript**: Type-safe API development

#### Database
- **MongoDB Atlas**: Document database (512MB free tier)
- **Mongoose**: ODM with schema validation
- **Connection Pooling**: Optimized for serverless

#### Real-Time Communication
- **Socket.io**: WebSocket with fallback to polling
- **Event-Based**: Pub/sub pattern for scalability
- **Room-Based**: Isolated channels per match

#### Authentication
- **NextAuth.js**: OAuth and credentials authentication
- **JWT**: Stateless session management
- **bcrypt**: Password hashing

### Infrastructure

#### Hosting: Vercel
- **CDN**: Global edge network
- **Serverless Functions**: Auto-scaling API routes
- **Edge Caching**: Static asset optimization
- **Free Tier**: 100GB bandwidth, 100K function calls

#### Database: MongoDB Atlas
- **Free Tier**: 512MB storage
- **Auto-Scaling**: Cluster management
- **Backups**: Daily snapshots
- **Monitoring**: Performance metrics

## Data Flow

### User Authentication Flow

```
User → Login Form → API Route (/api/auth/login)
                          ↓
                    MongoDB Query
                          ↓
                   Verify Password
                          ↓
                   Generate JWT
                          ↓
                   Return Token
                          ↓
        Store in Client (Zustand + LocalStorage)
                          ↓
           Include in API Requests (Header)
```

### Real-Time Chat Flow

```
User → Type Message → Send Button
                          ↓
                   API POST Request
                          ↓
              Store in MongoDB (ChatMessage)
                          ↓
                Emit Socket Event
                          ↓
           Broadcast to Match Room
                          ↓
         All Connected Clients
                          ↓
           Update UI (React State)
```

### Match Update Flow

```
Sports API → Webhook/Poll → Server Function
                                  ↓
                         Update MongoDB (Match)
                                  ↓
                         Socket.io Broadcast
                                  ↓
                    All Clients in Match Room
                                  ↓
                         Update UI (Scores)
```

### Push Notification Flow

```
Player Event → Server Detects → Query Users
                                     ↓
                            Find Subscribers
                                     ↓
                            Web Push API
                                     ↓
                          Service Worker
                                     ↓
                      Browser Notification
                                     ↓
                        User Clicks → Navigate
```

## Database Schema Design

### Collections and Relationships

```
Users (1) ────────────┐
   │                  │
   │ favoriteTeams    │ pushSubscription
   │                  │
   ▼                  ▼
Teams (N)      Notifications
   │
   │ referenced by
   │
   ▼
Matches (N) ──────────┐
   │                  │
   │ matchId          │ matchId
   │                  │
   ▼                  ▼
ChatMessages (N)  PlayerEvents (N)
   │
   │ reactions
   │
   └─► Users (N:M)
```

### Indexing Strategy

#### Performance Indexes
```javascript
// Matches
{ status: 1, startTime: -1 }      // List matches by status
{ sport: 1, status: 1 }            // Filter by sport
{ externalId: 1 }                  // Unique lookup

// ChatMessages
{ matchId: 1, timestamp: -1 }      // Chat pagination
{ matchId: 1, parentMessageId: 1 } // Threaded replies

// Users
{ email: 1 }                       // Login lookup

// PlayerEvents
{ matchId: 1, playerId: 1 }        // Event queries
{ notificationSent: 1 }            // Notification queue
```

#### TTL Indexes (Auto-Cleanup)
```javascript
// ChatMessages: Delete after 7 days
{ createdAt: 1 }, { expireAfterSeconds: 604800 }

// PlayerEvents: Delete after 30 days
{ createdAt: 1 }, { expireAfterSeconds: 2592000 }
```

## API Design

### RESTful Endpoints

```
Authentication
POST   /api/auth/register        Create user account
POST   /api/auth/login           Authenticate user

Matches
GET    /api/matches              List matches (with filters)
GET    /api/matches/[id]         Get match details
GET    /api/matches/[id]/messages Get chat messages
POST   /api/matches/[id]/messages Send chat message

Messages
POST   /api/messages/[id]/react  Add/remove reaction

User
GET    /api/user/preferences     Get user preferences
PUT    /api/user/preferences     Update preferences
POST   /api/user/push-subscription Save push subscription
```

### WebSocket Events

```
Client → Server
- match:join             Join match room
- match:leave            Leave match room
- chat:send              Send chat message
- chat:react             Add reaction

Server → Client
- match:update           Match data changed
- match:score            Score updated
- chat:message           New chat message
- chat:reaction          Reaction added
- player:event           Player event occurred
- viewers:update         Viewer count changed
```

## Security

### Authentication & Authorization

1. **Password Security**
   - bcrypt hashing (10 rounds)
   - Minimum 6 characters
   - No plain text storage

2. **JWT Tokens**
   - 7-day expiration
   - Signed with secret key
   - Included in Authorization header

3. **API Protection**
   - Protected routes check JWT
   - User can only modify own data
   - Rate limiting on Vercel

### Data Validation

1. **Input Validation**
   - Mongoose schema validation
   - Max lengths on strings
   - Email format validation

2. **XSS Prevention**
   - React auto-escapes content
   - No dangerouslySetInnerHTML
   - Sanitize user input

3. **CORS**
   - Configured for same-origin
   - OAuth redirects whitelisted

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Next.js automatic splitting
   - Dynamic imports for heavy components
   - Route-based chunks

2. **Caching**
   - SWR for data fetching
   - Service Worker for assets
   - Browser cache headers

3. **Rendering**
   - Server components for static content
   - Client components for interactivity
   - Lazy loading below fold

### Backend Optimization

1. **Database Queries**
   - Indexes on frequently queried fields
   - Lean queries (no Mongoose overhead)
   - Pagination to limit results
   - Connection pooling

2. **API Routes**
   - Edge caching for static data
   - Gzip compression
   - Minimal dependencies

3. **Real-Time**
   - Room-based broadcasting
   - Disconnect cleanup
   - Reconnection handling

### Free Tier Optimization

1. **Database**
   - TTL indexes for auto-cleanup
   - Stay under 512MB limit
   - Efficient schema design

2. **Bandwidth**
   - Compressed assets
   - Optimized images
   - Minimal API payloads

3. **Function Calls**
   - Cache responses
   - Batch operations
   - Efficient queries

## Scalability Considerations

### Current Architecture Limitations

1. **Serverless Functions**
   - 10-second timeout
   - Cold starts
   - No persistent connections

2. **WebSocket**
   - Limited on Vercel
   - Use external Socket.io server for scale

3. **Database**
   - 512MB limit on free tier
   - Upgrade to paid tier for growth

### Scaling Strategy

1. **Horizontal Scaling**
   - Vercel auto-scales functions
   - Add MongoDB replicas
   - CDN for static assets

2. **Vertical Scaling**
   - Upgrade MongoDB tier
   - Use dedicated WebSocket server
   - Add Redis for caching

3. **Optimization**
   - Implement data archival
   - Add caching layer
   - Optimize queries

## Monitoring & Observability

### Logging

- Vercel function logs
- MongoDB Atlas logs
- Client-side error tracking

### Metrics

- Response times (Vercel Analytics)
- Database performance (Atlas)
- User engagement (custom events)

### Alerting

- Function errors
- Database connection issues
- High latency warnings

## Deployment Pipeline

```
Developer → Git Push → GitHub
                          ↓
                    GitHub Actions
                          ↓
                   Build & Test
                          ↓
                   Deploy to Vercel
                          ↓
                 Production (auto)
```

## Disaster Recovery

### Backup Strategy

1. **Database**
   - MongoDB Atlas daily snapshots
   - Point-in-time recovery
   - 7-day retention

2. **Code**
   - Git version control
   - GitHub as source of truth
   - Tag releases

### Rollback Process

1. **Vercel**: One-click rollback to previous deployment
2. **Database**: Restore from Atlas snapshot
3. **Code**: Revert Git commit and redeploy

## Future Improvements

1. **Performance**
   - Implement Redis caching
   - Add CDN for user uploads
   - Optimize bundle size

2. **Features**
   - Video streaming
   - Advanced analytics
   - Mobile apps

3. **Infrastructure**
   - Dedicated WebSocket server
   - Message queue (Redis/RabbitMQ)
   - Microservices architecture

---

This architecture is designed to be cost-effective, scalable, and maintainable while providing a robust real-time sports social experience.
