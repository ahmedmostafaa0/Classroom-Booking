
// Socket.io event handlers
exports.setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Join user-specific room for private notifications
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their private room`);
    });
    
    // Join admin room for admin notifications
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log(`Admin joined admin room`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  
  // Make io accessible throughout the application
  global.io = io;
  
  return io;
};

// Emit booking created event
exports.emitBookingCreated = (booking) => {
  if (!global.io) return;
  
  // Notify admin room
  global.io.to('admin-room').emit('booking-created', booking);
  
  // Notify the specific user
  global.io.to(`user-${booking.userId}`).emit('my-booking-created', booking);
};

// Emit booking updated event
exports.emitBookingUpdated = (booking) => {
  if (!global.io) return;
  
  // Notify admin room
  global.io.to('admin-room').emit('booking-updated', booking);
  
  // Notify the specific user
  global.io.to(`user-${booking.userId}`).emit('my-booking-updated', booking);
};

// Emit booking deleted event
exports.emitBookingDeleted = (booking) => {
  if (!global.io) return;
  
  // Notify admin room
  global.io.to('admin-room').emit('booking-deleted', booking);
  
  // Notify the specific user
  global.io.to(`user-${booking.userId}`).emit('my-booking-deleted', booking);
};

// Emit classroom updated event
exports.emitClassroomUpdated = (classroom) => {
  if (!global.io) return;
  
  // Notify all connected clients
  global.io.emit('classroom-updated', classroom);
};
