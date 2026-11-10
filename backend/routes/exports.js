const express = require('express');
const router = express.Router();
const { format, parse, isValid } = require('date-fns');

const Booking = require('../models/Booking');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const { protect, authorize } = require('../middleware/auth');
const {
  generatePDF,
  generateCSV,
  generateUserDataCSV,
  generateUserDataPDF,
  generateClassroomDataPDF,
  generateClassroomDataCSV,
} = require('../utils/exportUtils');



/**
 * @route   GET api/export/bookings/pdf
 * @desc    Export bookings as PDF
 * @access  Private/Admin
 */
router.get('/bookings/pdf', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, startDate, endDate, classroomId } = req.query;
    const query = {};

    if (status && ['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      query.status = status;
    }

    if (classroomId) {
      query.classroomId = classroomId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const parsedStart = parse(startDate, 'yyyy-MM-dd', new Date());
        if (isValid(parsedStart)) {
          query.date.$gte = format(parsedStart, 'yyyy-MM-dd');
        }
      }
      if (endDate) {
        const parsedEnd = parse(endDate, 'yyyy-MM-dd', new Date());
        if (isValid(parsedEnd)) {
          query.date.$lte = format(parsedEnd, 'yyyy-MM-dd');
        }
      }
    }

    const bookings = await Booking.find(query).sort({ date: 1, startTime: 1 });

    await generatePDF(bookings, res);
    // no need to send additional response; streaming handles it
  } catch (err) {
    console.error('Export bookings PDF error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF report' });
    }
  }
});


/**
 * @route   GET api/export/bookings/csv
 * @desc    Export bookings as CSV
 * @access  Private/Admin
 */
router.get('/bookings/csv', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, startDate, endDate, classroomId } = req.query;
    const query = {};

    if (status && ['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      query.status = status;
    }

    if (classroomId) {
      query.classroomId = classroomId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const parsedStart = parse(startDate, 'yyyy-MM-dd', new Date());
        if (isValid(parsedStart)) {
          query.date.$gte = format(parsedStart, 'yyyy-MM-dd');
        }
      }
      if (endDate) {
        const parsedEnd = parse(endDate, 'yyyy-MM-dd', new Date());
        if (isValid(parsedEnd)) {
          query.date.$lte = format(parsedEnd, 'yyyy-MM-dd');
        }
      }
    }

    const bookings = await Booking.find(query).sort({ date: 1, startTime: 1 });
    generateCSV(bookings, res);
  } catch (err) {
    console.error('Export bookings CSV error:', err);
    res.status(500).json({ message: 'Failed to generate CSV report' });
  }
});

/**
 * @route   GET api/export/user-bookings/pdf/:userId
 * @desc    Export user bookings as PDF
 * @access  Private
 */
router.get('/user-bookings/pdf/:userId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ userId: req.params.userId }).sort({
      date: 1,
      startTime: 1,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=my-bookings.pdf');

    generatePDF(bookings, res);
  } catch (err) {
    console.error('Export user bookings PDF error:', err);
    res.status(500).json({ message: 'Failed to generate PDF report' });
  }
});

/**
 * @route   GET api/export/user-bookings/csv/:userId
 * @desc    Export user bookings as CSV
 * @access  Private
 */
router.get('/user-bookings/csv/:userId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ userId: req.params.userId }).sort({
      date: 1,
      startTime: 1,
    });

    generateCSV(bookings, res);
  } catch (err) {
    console.error('Export user bookings CSV error:', err);
    res.status(500).json({ message: 'Failed to generate CSV report' });
  }
});

/**
 * @route   GET api/export/users/csv
 * @desc    Export users as CSV
 * @access  Private/Admin
 */
router.get('/users/csv', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    generateUserDataCSV(users, res);
  } catch (err) {
    console.error('Export users CSV error:', err);
    res.status(500).json({ message: 'Failed to generate users CSV report' });
  }
});

/**
 * @route   GET api/export/classrooms/csv
 * @desc    Export classrooms as CSV
 * @access  Private/Admin
 */
router.get('/classrooms/csv', protect, authorize('admin'), async (req, res) => {
  try {
    const classrooms = await Classroom.find().sort({ name: 1 });
    generateClassroomDataCSV(classrooms, res);
  } catch (err) {
    console.error('Export classrooms CSV error:', err);
    res.status(500).json({ message: 'Failed to generate classrooms CSV report' });
  }
});



router.post('/data', protect, authorize('admin'), async (req, res) => {
  try {
    const { dataType, fileFormat, fromDate, toDate } = req.body;

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (dataType === 'bookings') {
      const bookings = await Booking.find({
        date: { $gte: start, $lte: end },
      }).populate('user classroom');

      if (fileFormat === 'csv') {
        return generateCSV(bookings, res);
      } else if (fileFormat === 'pdf') {
        return generatePDF(bookings, res);
      }
    }

    if (dataType === 'users') {
      const users = await User.find({
        createdAt: { $gte: start, $lte: end },
      });

      if (fileFormat === 'csv') {
        return generateUserDataCSV(users, res);
      } else if (fileFormat === 'pdf') {
        return generateUserDataPDF(users, res);
      }
    }

    if (dataType === 'classrooms') {
      const classrooms = await Classroom.find({
        createdAt: { $gte: start, $lte: end },
      });

      if (fileFormat === 'csv') {
        return generateClassroomDataCSV(classrooms, res);
      } else if (fileFormat === 'pdf') {
        return generateClassroomDataPDF(classrooms, res);
      }
    }

    return res.status(400).json({ error: 'Invalid data type or format' });
  } catch (error) {
    console.error('Export failed:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});


module.exports = router;
