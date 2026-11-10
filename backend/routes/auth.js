const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendPasswordResetEmail, sendPasswordChangeConfirmation } = require('../utils/email');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-default-secret-key', {
    expiresIn: '30d'
  });
};

/**
 * @route   POST api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'faculty']).withMessage('Role must be student or faculty')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password, role } = req.body;
    
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create new user
      user = await User.create({
        name,
        email,
        password,
        role
      });
      
      // Generate token
      const token = generateToken(user._id);
      
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST api/auth/login
 * @desc    Login user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      
      // Check if user exists
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = generateToken(user._id);
      
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   GET api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    // Get user data
    const user = await User.findById(req.user.id);
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/auth/forgot-password
 * @desc    Forgot password - generate and email reset token
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please include a valid email')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        // Don't reveal that the user doesn't exist for security
        return res.status(200).json({ 
          message: 'If your email is registered, you will receive a password reset link' 
        });
      }

      // Generate reset token
      const resetToken = user.getResetPasswordToken();

      // Save the updated user with reset token and expiry
      await user.save({ validateBeforeSave: false });

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

      // Send email
      const emailSent = await sendPasswordResetEmail(user, resetUrl);

      if (!emailSent) {
        // If email fails, clear the reset token and expiry
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
        return res.status(500).json({ message: 'Email could not be sent' });
      }

      res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   POST api/auth/reset-password/:resetToken
 * @desc    Reset password using token
 * @access  Public
 */
router.post(
  '/reset-password/:resetToken',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get hashed token
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

      // Find user with matching token and valid expiry
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Set new password
      user.password = req.body.password;
      
      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      
      // Save user with new password
      await user.save();

      // Send confirmation email
      await sendPasswordChangeConfirmation(user);

      res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT api/auth/change-password
 * @desc    Change password for logged in user
 * @access  Private
 */
router.put(
  '/change-password',
  [
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get user with password
      const user = await User.findById(req.user.id).select('+password');

      // Check if current password matches
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Set new password
      user.password = req.body.newPassword;
      await user.save();

      // Send confirmation email
      await sendPasswordChangeConfirmation(user);

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
