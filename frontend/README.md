# Class Calendar Nexus

A comprehensive classroom booking and management system with real-time updates.

## Features

- User authentication and role-based access control
- Classroom booking and management
- Real-time updates via Socket.IO
- Admin dashboard with statistics and reporting
- Export functionality for bookings (CSV, PDF)
- Responsive design for all devices

## Technology Stack

### Frontend
- React with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS with Shadcn UI components
- React Query for data fetching and caching
- Socket.IO client for real-time updates
- React Router for navigation
- React Hook Form for form handling
- Zod for validation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time communication
- PDF and CSV export functionality
- Email notifications

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/class-calendar-nexus.git
cd class-calendar-nexus
```

2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit the .env file with your MongoDB URI, JWT secret, and other settings

# Frontend
cp .env.example .env
# Edit the .env file with your API URL
```

4. Start the development servers
```bash
# Use the provided script to start both servers
chmod +x start-dev.sh
./start-dev.sh

# Or start them separately
# Backend
cd backend
npm run dev

# Frontend
cd ..
npm run dev
```

## Production Deployment

### Backend
1. Set up environment variables for production
2. Install PM2 or similar process manager
3. Start the server with PM2
```bash
pm2 start backend/server.js --name class-calendar-api
```

### Frontend
1. Build the frontend
```bash
npm run build
```
2. Deploy the contents of the `dist` folder to your web server

## Project Structure

```
class-calendar-nexus/
├── backend/                # Backend code
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── server.js           # Express server
│   └── socket.js           # Socket.IO setup
├── public/                 # Public assets
├── src/                    # Frontend code
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── types/              # TypeScript types
├── .env                    # Environment variables
└── vite.config.ts          # Vite configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
