const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { format, parse, isValid } = require('date-fns');

const Booking = require('../models/Booking');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const { protect, authorize } = require('../middleware/auth');
const { sendBookingConfirmation, sendStatusUpdate } = require('../utils/email');
const { emitBookingCreated, emitBookingUpdated, emitBookingDeleted } = require('../socket');


/**
 * @route   GET api/bookings
 * @desc    Get all bookings
 * @access  Private/Admin
 */
router.get('/', protect, async (req, res) => {
  try {
    let bookings;
    
    // If admin, return all bookings
    // Otherwise, return only user's bookings
    if (req.user.role === 'admin') {
      bookings = await Booking.find();
    } else {
      bookings = await Booking.find({ userId: req.user.id });
    }
    
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/bookings/user/:userId
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Check if user is admin or requesting their own bookings
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const bookings = await Booking.find({ userId: req.params.userId });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/bookings/classroom/:classroomId
 * @desc    Get classroom bookings
 * @access  Public
 */
router.get('/classroom/:classroomId', async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      classroomId: req.params.classroomId,
      status: { $nin: ['cancelled', 'rejected'] }
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * @route   GET api/bookings/date/:date
 * @desc    Get bookings for a specific date
 * @access  Private
 */
router.get('/date/:date', protect, async (req, res) => {
  try {
    // Validate date format
    const dateParam = req.params.date;
    const date = parse(dateParam, 'yyyy-MM-dd', new Date());
    
    if (!isValid(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    let bookings;
    // If admin, return all bookings for the date
    // Otherwise, return only user's bookings for the date
    if (req.user.role === 'admin') {
      bookings = await Booking.find({ date: formattedDate });
    } else {
      bookings = await Booking.find({ 
        userId: req.user.id,
        date: formattedDate
      });
    }
    
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/bookings/stats
 * @desc    Get booking statistics
 * @access  Private/Admin
 */
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const pending = await Booking.countDocuments({ status: 'pending' });
    const rejected = await Booking.countDocuments({ status: 'rejected' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });
    
    res.json({
      total,
      confirmed,
      pending,
      rejected,
      cancelled
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is admin or the booking owner
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/bookings/check-availability
 * @desc    Check classroom availability
 * @access  Public
 */
router.post(
  '/check-availability',
  [
    body('classroomId').notEmpty().withMessage('Classroom ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { classroomId, date, startTime, endTime } = req.body;
    
    try {
      // Check if classroom exists
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      
      // Check if classroom is available for booking
      if (!classroom.available) {
        return res.json({ available: false, message: 'This classroom is not available for booking' });
      }
      
      // Check for conflicts
      const conflicts = await Booking.find({
        classroomId,
        date,
        status: { $nin: ['cancelled', 'rejected'] },
        $or: [
          // Booking starts during an existing booking
          { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
          // Booking ends during an existing booking
          { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
          // Booking fully contains an existing booking
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
        ]
      });
      
      if (conflicts.length > 0) {
        return res.json({ available: false, message: 'This classroom is already booked for the selected time' });
      }
      
      return res.json({ available: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST api/bookings
 * @desc    Create a booking
 * @access  Private
 */
router.post(
  '/',
  [
    protect,
    body('classroomId').notEmpty().withMessage('Classroom ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('purpose').notEmpty().withMessage('Purpose is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { classroomId, date, startTime, endTime, purpose } = req.body;
    
    try {
      // Check if classroom exists
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      
      // Check if classroom is available for booking
      if (!classroom.available) {
        return res.status(400).json({ message: 'This classroom is not available for booking' });
      }
      
      // Check for conflicts
      const conflicts = await Booking.find({
        classroomId,
        date,
        status: { $nin: ['cancelled', 'rejected'] },
        $or: [
          // Booking starts during an existing booking
          { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
          // Booking ends during an existing booking
          { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
          // Booking fully contains an existing booking
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
        ]
      });
      
      if (conflicts.length > 0) {
        return res.status(400).json({ message: 'This classroom is already booked for the selected time' });
      }
      
      // Create new booking
      const booking = await Booking.create({
        userId: req.user.id,
        userName: req.user.name,
        classroomId,
        classroomName: classroom.name,
        date,
        startTime,
        endTime,
        purpose,
        status: 'pending'
      });
      
      // Send email notification
      try {
        await sendBookingConfirmation(req.user, booking, classroom);
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // Continue with booking creation even if email fails
      }
      
      // Emit socket event
      emitBookingCreated(booking);
      
      res.status(201).json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  [
    protect,
    authorize('admin'),
    body('status').isIn(['pending', 'confirmed', 'rejected', 'cancelled']).withMessage('Invalid status')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const booking = await Booking.findById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Update status
      booking.status = req.body.status;
      await booking.save();
      
      // Get user and classroom for email
      const user = await User.findById(booking.userId);
      const classroom = await Classroom.findById(booking.classroomId);
      
      // Send status update email
      if (user && classroom) {
        try {
          await sendStatusUpdate(user, booking, classroom);
        } catch (error) {
          console.error('Failed to send status update email:', error);
          // Continue with status update even if email fails
        }
      }
      
      // Emit socket event
      emitBookingUpdated(booking);
      
      // Return success with reload flag for auto-refresh
      res.json({
        booking,
        shouldReload: true
      });
    } catch (err) {
      console.error(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT api/bookings/:id/cancel
 * @desc    Cancel user's own booking
 * @access  Private
 */
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      return res.status(400).json({ message: 'This booking is already cancelled or rejected' });
    }
    
    // Update status
    booking.status = 'cancelled';
    await booking.save();
    
    // Get user and classroom for email if admin is cancelling
    if (req.user.role === 'admin') {
      const user = await User.findById(booking.userId);
      const classroom = await Classroom.findById(booking.classroomId);
      
      // Send status update email
      if (user && classroom) {
        try {
          await sendStatusUpdate(user, booking, classroom);
        } catch (error) {
          console.error('Failed to send status update email:', error);
          // Continue with cancellation even if email fails
        }
      }
    }
    
    // Emit socket event
    emitBookingUpdated(booking);
    
    // Return success with reload flag for auto-refresh
    res.json({
      booking,
      shouldReload: true
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE api/bookings/:id
 * @desc    Delete a booking
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Store booking data for socket event
    const deletedBooking = { ...booking.toObject() };
    
    // Delete booking
    await booking.deleteOne();
    
    // Emit socket event
    emitBookingDeleted(deletedBooking);
    
    // Return success with reload flag for auto-refresh
    res.json({ 
      message: 'Booking deleted',
      shouldReload: true
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
