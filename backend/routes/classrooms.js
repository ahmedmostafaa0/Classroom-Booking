
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Classroom = require('../models/Classroom');
const { protect, authorize } = require('../middleware/auth');
const { emitClassroomUpdated } = require('../socket');

/**
 * @route   GET api/classrooms
 * @desc    Get all classrooms
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    res.json(classrooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/classrooms/:id
 * @desc    Get classroom by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    res.json(classroom);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST api/classrooms
 * @desc    Create a classroom
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    body('name').notEmpty().withMessage('Name is required'),
    body('capacity').isNumeric().withMessage('Capacity must be a number'),
    body('building').notEmpty().withMessage('Building is required'),
    body('floor').isNumeric().withMessage('Floor must be a number'),
    body('roomNumber').notEmpty().withMessage('Room number is required')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { name, capacity, building, floor, roomNumber, features, available } = req.body;
      
      // Create new classroom
      const classroom = await Classroom.create({
        name,
        capacity,
        building,
        floor,
        roomNumber,
        features: features || [],
        available: available !== undefined ? available : true
      });
      
      // Notify clients about the new classroom
      emitClassroomUpdated(classroom);
      
      res.status(201).json(classroom);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   PUT api/classrooms/:id
 * @desc    Update a classroom
 * @access  Private/Admin
 */
router.put(
  '/:id',
  [
    protect,
    authorize('admin')
  ],
  async (req, res) => {
    try {
      const { name, capacity, building, floor, roomNumber, features, available } = req.body;
      
      // Find classroom
      let classroom = await Classroom.findById(req.params.id);
      
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      
      // Update fields
      if (name !== undefined) classroom.name = name;
      if (capacity !== undefined) classroom.capacity = capacity;
      if (building !== undefined) classroom.building = building;
      if (floor !== undefined) classroom.floor = floor;
      if (roomNumber !== undefined) classroom.roomNumber = roomNumber;
      if (features !== undefined) classroom.features = features;
      if (available !== undefined) classroom.available = available;
      
      // Save changes
      await classroom.save();
      
      // Notify clients about the updated classroom
      emitClassroomUpdated(classroom);
      
      res.json(classroom);
    } catch (err) {
      console.error(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Classroom not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @route   DELETE api/classrooms/:id
 * @desc    Delete a classroom
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    await classroom.remove();
    
    res.json({ message: 'Classroom deleted' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
