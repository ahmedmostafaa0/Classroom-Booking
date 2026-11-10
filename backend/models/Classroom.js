
const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Classroom name is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  building: {
    type: String,
    required: [true, 'Building name is required'],
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  features: {
    type: [String],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for front-end id compatibility
ClassroomSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are included in JSON
ClassroomSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Classroom', ClassroomSchema);
