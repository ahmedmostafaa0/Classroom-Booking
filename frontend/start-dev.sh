#!/bin/bash

# Start backend server
cd backend
echo "Starting backend server..."
npm install
echo "Creating .env file from example..."
cp .env.example .env
# Update the .env file with actual values
sed -i 's/your-secret-key-here/class-calendar-nexus-jwt-secret-key-2025/' .env
echo "Starting server..."
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend development server
echo "Installing frontend dependencies..."
npm install
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "Both servers are running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both servers"

# Wait for user to press Ctrl+C
wait $FRONTEND_PID
# Kill backend when frontend is stopped
kill $BACKEND_PID
