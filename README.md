# CourtSide - Free Sports Social Platform

A completely free web/app platform for live sports with real-time chat, emoji reactions, and personalized push notifications. Built with Next.js 14, MongoDB, and Socket.io, optimized for free hosting on Vercel.

## Features

- **User Authentication**: Free email/social login (Google, GitHub) with NextAuth.js
- **Live Scores**: Real-time match updates with fast WebSocket technology
- **Live Chat**: Match-specific discussion rooms with threaded comments
- **Emoji Reactions**: React to messages with emoji counters
- **Push Notifications**: Free browser notifications for player events
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **100% Free**: No costs for users or hosting (free tier services)

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Socket.io Client** for real-time updates

### Backend
- **Next.js API Routes** (serverless functions)
- **MongoDB** with Mongoose ODM
- **NextAuth.js** for authentication
- **Socket.io** for WebSocket connections
- **Web Push** for notifications

### Hosting (100% Free)
- **Frontend**: Vercel (Free tier)
- **Database**: MongoDB Atlas (Free 512MB cluster)
- **File Storage**: Vercel Edge Network
- **CDN**: Vercel Edge Network

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free)
- Vercel account (free, for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/courtside.git
cd courtside
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NEXTAUTH_SECRET`: Random secret (generate with `openssl rand -base64 32`)
- `JWT_SECRET`: Another random secret

4. **Generate VAPID keys for push notifications**
```bash
npx web-push generate-vapid-keys
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide to Vercel and MongoDB Atlas (100% free).

## Project Structure

```
courtside/
├── app/                      # Next.js 14 app directory
│   ├── api/                 # API routes (serverless functions)
│   ├── matches/            # Match pages
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/             # React components
├── models/                # MongoDB schemas
├── lib/                  # Utilities
├── server/               # Server utilities
├── store/               # State management
└── hooks/              # Custom React hooks
```

## License

MIT License - see LICENSE file for details.

---

**CourtSide** - Bringing fans together, one match at a time. 🏆
