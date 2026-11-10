# Class Calendar Nexus

A modern, full-stack classroom booking and management system designed for academic institutions. It gives students, faculty, and administrators a simple way to discover available rooms, create bookings, manage reservations, and monitor classroom usage in real time.

## Overview

Class Calendar Nexus brings together a React frontend and an Express + MongoDB backend to support the day-to-day management of teaching spaces. The platform is built around a clear workflow:

- authenticate users with secure JWT-based sessions
- check classroom availability before reservation
- create, approve, and manage booking requests
- view personal and admin dashboards
- receive live updates via Socket.IO
- export reports and booking records in PDF/CSV formats

This project is suitable for universities, training centers, and schools that need a reliable digital system for room allocation and scheduling.

## Key Features

- Role-based access for students, faculty, and administrators
- Classroom listing, availability checks, and room management
- Booking creation with date and time validation
- Status tracking for pending, confirmed, cancelled, and rejected reservations
- Personalized user dashboards and booking history
- Admin analytics for booking activity and system usage
- Real-time booking updates using Socket.IO
- PDF and CSV export for reports and records
- Contact form and support workflows
- Responsive interface for desktop and mobile usage

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Shadcn UI, React Router, React Query |
| Backend | Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO |
| Communication | REST API + real-time socket events |
| Utilities | PDF generation, CSV export, email notifications |

## Project Structure

```text
Project/
├── backend/                  # Express API and MongoDB integration
│   ├── middleware/           # route protection and authorization logic
│   ├── models/              # Mongoose schemas for users, classrooms, bookings
│   ├── routes/              # authentication, bookings, classrooms, export endpoints
│   ├── utils/               # email, export, and helper utilities
│   ├── .env                 # backend environment variables
│   ├── server.js            # API entry point
│   └── socket.js            # Socket.IO event handling
├── frontend/                 # Vite + React application
│   ├── src/                 # app pages, components, hooks, services
│   ├── .env                 # frontend environment variables
│   ├── vite.config.ts      # Vite configuration
│   └── package.json
├── Readme.md                # project documentation
└── .gitignore
```

## Prerequisites

Before running the project, ensure you have:

- Node.js 18 or newer
- npm or yarn
- MongoDB running locally or a MongoDB Atlas cluster
- A mail provider configuration for password reset and booking notifications

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Graduation Project\Project"
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` folder with the following variables:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:8080

MONGODB_URI=mongodb://localhost:27017/classroom
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRE=30d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

If you are using MongoDB Atlas, replace `MONGODB_URI` with your connection string.

### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 5. Configure frontend environment variables

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 6. Run the application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend will run at:

```text
http://localhost:8080
```

The backend API will run at:

```text
http://localhost:5000
```

## Application Workflow

### User roles

- Student: browse classrooms, request bookings, view personal bookings
- Faculty: reserve rooms, manage their own reservations
- Admin: manage users, classrooms, bookings, reports, and contact messages

### Booking flow

1. User logs in or creates an account
2. User selects classroom, date, and time slot
3. System checks availability
4. Booking request is created and tracked by status
5. Admin reviews or confirms the request
6. Real-time updates notify affected users

## API Highlights

The backend exposes REST endpoints for authentication, room management, booking processing, export, and contact messaging.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:resetToken`

### Classroom management

- `GET /api/classrooms`
- `GET /api/classrooms/:id`
- `POST /api/classrooms`
- `PUT /api/classrooms/:id`
- `DELETE /api/classrooms/:id`

### Booking management

- `GET /api/bookings`
- `GET /api/bookings/user/:userId`
- `GET /api/bookings/classroom/:classroomId`
- `GET /api/bookings/date/:date`
- `GET /api/bookings/stats`
- `POST /api/bookings/check-availability`
- `POST /api/bookings`
- `PUT /api/bookings/:id/status`
- `PUT /api/bookings/:id/cancel`
- `DELETE /api/bookings/:id`

### Reports and exports

- `GET /api/exports/bookings/pdf`
- `GET /api/exports/bookings/csv`
- `GET /api/exports/user-bookings/pdf/:userId`
- `GET /api/exports/user-bookings/csv/:userId`

## Real-Time Features

Socket.IO is used for live communication between the client and server, including updates such as:

- booking created
- booking updated
- booking deleted
- classroom updated

This provides immediate feedback for users when bookings or room schedules change.

## Deployment Notes

For production deployment:

- set secure environment variables for MongoDB and JWT
- configure a production-ready frontend build
- serve the frontend files via a static host or platform such as Vercel, Netlify, or a reverse proxy
- deploy the backend on a Node-compatible host with MongoDB connectivity
- configure HTTPS and secure email settings before going live

## Future Enhancements

Potential improvements for future versions include:

- recurring bookings and room calendars
- 3rd-party calendar sync (Google Calendar / Microsoft 365)
- more advanced room conflict detection
- multi-campus support and admin roles
- notifications via SMS and push channels
- improved reporting and analytics dashboards

## Summary

Class Calendar Nexus is a practical, production-oriented classroom management solution that streamlines the scheduling process for educational institutions. With a strong frontend experience, secure backend services, and real-time event handling, the project demonstrates a complete full-stack application workflow with meaningful business value.
