const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const ContactMessage = require('../models/ContactMessage');
const { protect, authorize } = require('../middleware/auth');
const { sendContactNotification } = require('../utils/email');

/**
 * @route   POST api/contact
 * @desc    Submit a new contact message
 * @access  Public
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, subject, message } = req.body;
    
    try {
      // Create new contact message
      const contactMessage = await ContactMessage.create({
        name,
        email,
        subject,
        message,
        status: 'unread'
      });
      
      // Send email notification to admin
      try {
        await sendContactNotification({
          name,
          email,
          subject,
          message
        });
      } catch (error) {
        console.error('Failed to send contact notification email:', error);
        // Continue even if email fails
      }
      
      res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET api/contact
 * @desc    Get all contact messages
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/contact/:id
 * @desc    Get contact message by ID
 * @access  Private/Admin
 */
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/contact/:id/status
 * @desc    Update contact message status
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  [
    protect,
    authorize('admin'),
    body('status').isIn(['unread', 'read', 'replied']).withMessage('Invalid status')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const message = await ContactMessage.findById(req.params.id);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Update status
      message.status = req.body.status;
      await message.save();
      
      res.json(message);
    } catch (err) {
      console.error(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE api/contact/:id
 * @desc    Delete a contact message
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.remove();
    
    res.json({ message: 'Contact message deleted' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
