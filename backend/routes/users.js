const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/users/:id
 * @desc    Update user profile
 * @access  Private (own profile) or Admin
 */
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is updating their own profile or is an admin
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fields that can be updated
    const { name, avatar } = req.body;
    
    // Update fields if provided
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT api/users/:id/role
 * @desc    Update user role
 * @access  Private/Admin
 */
router.put(
  '/:id/role',
  [
    protect,
    authorize('admin'),
    body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      user.role = req.body.role;
      await user.save();
      
      res.json(user);
    } catch (err) {
      console.error(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE api/users/:id
 * @desc    Delete a user
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await user.remove();
    
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
