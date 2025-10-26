# LuaShield - Lua Script Protection Platform

## Overview
LuaShield is an enterprise-grade Lua script protection platform similar to Luarmor. It provides real-time obfuscation with Prometheus-style protection, executor-only access verification, and comprehensive analytics tracking.

**Current State:** ✅ MVP Complete - All features implemented, tested, and ready for deployment

## Recent Changes
- **2025-10-26**: Complete MVP Implementation
  - ✅ Defined complete data schema (Users, Scripts, Executions)
  - ✅ Created all frontend pages: Landing, Login, Register, User Dashboard, Admin Dashboard, 404
  - ✅ Implemented dark-themed UI with professional design following design guidelines
  - ✅ Set up sidebar navigation with Shadcn components
  - ✅ Implemented Lua obfuscation engine with Prometheus-style protection
  - ✅ Added watermarking with comment headers
  - ✅ Created all API endpoints (auth, scripts, raw access, admin)
  - ✅ Implemented HWID/User-Agent verification for executor-only access
  - ✅ Added multi-layer anti-dumping protection
  - ✅ Set up session-based authentication
  - ✅ Created Vercel deployment structure and documentation
  - ✅ Configured in-memory storage with seed data (demo accounts)

## Project Architecture

### Frontend Structure
```
client/src/
├── pages/
│   ├── landing.tsx          # Marketing landing page with hero, features, how-it-works
│   ├── login.tsx            # User authentication with demo account info
│   ├── register.tsx         # User registration
│   ├── user-dashboard.tsx   # User dashboard with script management
│   ├── admin-dashboard.tsx  # Admin panel with system overview
│   └── not-found.tsx        # Professional 404 error page
├── components/
│   ├── app-sidebar.tsx      # Navigation sidebar (user & admin variants)
│   └── ui/                  # Shadcn UI components
├── lib/
│   └── queryClient.ts       # React Query configuration with apiRequest
└── App.tsx                  # Main router and dashboard layouts
```

### Backend Structure
```
server/
├── routes.ts                # API endpoints (auth, scripts, raw, admin)
├── storage.ts               # In-memory data storage with CRUD operations
├── obfuscator.ts            # Lua obfuscation engine with Prometheus-style protection
└── index.ts                 # Express server with session middleware
```

### Data Models
- **Users**: id, username, password, email, role (user/admin), createdAt
- **Scripts**: id, userId, name, originalCode, obfuscatedCode, loaderLink, watermark, size, createdAt
- **Executions**: id, scriptId, hwid, userAgent, ipAddress, executorType, timestamp, success

## Implemented Features

### ✅ Authentication & Authorization
- Session-based authentication with express-session
- Pre-made demo accounts (user/admin roles)
- Protected routes with role-based access control
- Secure password handling

### ✅ Script Protection
- Real-time Lua obfuscation with Prometheus-style protection
- Handles scripts up to 1MB
- Multi-layer watermarking in comment headers
- Unique loader link generation
- Anti-dumping measures (3 layers):
  - Layer 1: Environment verification
  - Layer 2: Runtime integrity checks
  - Layer 3: Cleanup and protection footer

### ✅ Executor-Only Access
- User-Agent verification (blocks browser access)
- Custom header validation (`X-LuaShield-Executor`)
- HWID generation and tracking
- IP address logging
- Executor type detection (Synapse, KRNL, etc.)

### ✅ User Dashboard
- Upload and protect scripts
- View all protected scripts
- Copy loader links to clipboard
- Delete scripts
- Statistics cards (total scripts, executions, size, 24h activity)
- Beautiful empty states and loading indicators

### ✅ Admin Dashboard
- System-wide overview (users, scripts, executions)
- User management table
- All scripts view with user attribution
- Recent executions log with HWID, IP, executor type
- Real-time statistics

### ✅ Execution Tracking
- Automatic tracking when scripts are accessed
- HWID generation for unique identification
- User-Agent and IP logging
- Executor type detection
- Success/failure status
- Timestamp tracking

### ✅ UI/UX
- Professional dark-themed design
- Fully responsive layouts
- Sidebar navigation for dashboards
- Beautiful loading and empty states
- Toast notifications for user feedback
- Error handling with descriptive messages

### ✅ Vercel Deployment
- Pre-build structure (dist/public for frontend, dist/index.js for backend)
- vercel.json configuration
- Deployment documentation
- Build scripts (npm run build)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Scripts (Authenticated)
- `GET /api/scripts` - Get user's scripts
- `POST /api/scripts` - Upload and obfuscate script
- `DELETE /api/scripts/:id` - Delete script
- `GET /api/stats` - Get user dashboard stats

### Raw Links (Executor-Only)
- `GET /api/raw/:loaderLink` - Get obfuscated script (requires HWID/User-Agent verification)
- `POST /api/executions` - Track script execution

### Admin (Admin Role Required)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/scripts` - Get all scripts
- `GET /api/admin/executions` - Get all executions

## Demo Accounts

**User Account:**
- Username: `user`
- Password: `password123`
- Email: `user@example.com`

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing), React Query
- **Backend**: Express.js, Node.js, express-session, memorystore
- **Storage**: In-memory (MemStorage with Map data structures)
- **Obfuscation**: Custom Prometheus-style Lua obfuscator
- **Build**: Vite (frontend), esbuild (backend)

## Security Features
- ✅ Prometheus-style Lua obfuscation
- ✅ Watermarking with user email in comments
- ✅ HWID verification for executor identification
- ✅ User-Agent and custom header validation
- ✅ Multi-layer anti-dumping protection
- ✅ Session-based authentication
- ✅ Browser access blocking for raw scripts
- ✅ IP address logging
- ✅ Execution tracking with analytics

## Development Workflow
1. **Start development**: `npm run dev`
   - Frontend: Vite dev server with HMR (React)
   - Backend: Express server with auto-reload (tsx)
   - Both run on port 5000 via Vite middleware

2. **Build for production**: `npm run build`
   - Frontend → `dist/public/` (static files)
   - Backend → `dist/index.js` (bundled Node.js)

3. **Run production build**: `npm start`
   - Serves from dist/ folder

## Vercel Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy:**
```bash
# 1. Build the project
npm run build

# 2. Deploy to Vercel
vercel --prod
```

## User Preferences
- Dark mode default theme
- Clean, security-focused design
- Information-dense dashboards
- Professional color scheme (blue primary)
- Minimal friction for common actions
- Clear visual hierarchy

## Testing Executor Access

**Valid Request (will succeed):**
```bash
curl -H "User-Agent: Synapse X" \
     -H "X-LuaShield-Executor: LuaShield-Executor-v1" \
     http://localhost:5000/api/raw/YOUR_LOADER_LINK
```

**Invalid Request (will be rejected):**
```bash
curl http://localhost:5000/api/raw/YOUR_LOADER_LINK
# Rejected: Browser-like User-Agent
```

## Future Enhancements
- Persistent database (PostgreSQL)
- Redis session store
- Real-time analytics charts
- Webhook notifications
- API key system for programmatic access
- Advanced obfuscation options
- Rate limiting and DDoS protection
- Script versioning
- Bulk operations
