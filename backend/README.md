
# Classroom Booking System Backend

This is the backend API for the Classroom Booking System application built with Express.js, MongoDB, and Node.js.

## Features

- RESTful API with Express.js
- MongoDB with Mongoose for data persistence
- JWT-based authentication
- Role-based access control (student/faculty, admin)
- Email notifications for booking confirmations
- Real-time updates with Socket.IO
- Export bookings as PDF and CSV

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration values
6. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user & get token
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

### Classrooms

- `GET /api/classrooms` - Get all classrooms
- `GET /api/classrooms/:id` - Get classroom by ID
- `POST /api/classrooms` - Create a classroom (admin only)
- `PUT /api/classrooms/:id` - Update a classroom (admin only)
- `DELETE /api/classrooms/:id` - Delete a classroom (admin only)

### Bookings

- `GET /api/bookings` - Get all bookings (admin) or user bookings
- `GET /api/bookings/user/:userId` - Get user's bookings
- `GET /api/bookings/classroom/:classroomId` - Get classroom bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/date/:date` - Get bookings for a date
- `GET /api/bookings/stats` - Get booking statistics (admin only)
- `POST /api/bookings/check-availability` - Check classroom availability
- `POST /api/bookings` - Create a booking
- `PUT /api/bookings/:id/status` - Update booking status (admin only)
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `DELETE /api/bookings/:id` - Delete a booking (admin only)

### Exports

- `GET /api/export/bookings/pdf` - Export bookings as PDF (admin only)
- `GET /api/export/bookings/csv` - Export bookings as CSV (admin only)
- `GET /api/export/user-bookings/pdf/:userId` - Export user bookings as PDF
- `GET /api/export/user-bookings/csv/:userId` - Export user bookings as CSV

## Real-time Events

Socket.IO is used to provide real-time updates:

- `booking-created` - Emitted when a new booking is created
- `booking-updated` - Emitted when a booking is updated
- `booking-deleted` - Emitted when a booking is deleted
- `classroom-updated` - Emitted when a classroom is updated

## Environment Variables

See `.env.example` for the required environment variables.
