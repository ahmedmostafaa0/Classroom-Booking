
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const classroomRoutes = require('./routes/classrooms');
const bookingRoutes = require('./routes/bookings');
const exportRoutes = require('./routes/exports');
const contactRoutes = require('./routes/contact');

// Import socket handlers
const { setupSocketHandlers } = require('./socket');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Set up socket handlers
setupSocketHandlers(io);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/contact', contactRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  // .then(() => {
  //   console.log('Connected to MongoDB');
  //   // Start server
  //   const PORT = process.env.PORT || 5000;
  //   server.listen(PORT, () => {
  //     console.log(`Server running on port ${PORT}`);
  //   });
  // })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

  export default app;