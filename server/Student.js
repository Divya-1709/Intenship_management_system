const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: { type: String, required: true },
  universityId: { type: String, required: true },
  currentYear: { type: Number, required: true }, // e.g., 1, 2, 3, 4
  cgpa: { type: Number, required: true },
  skills: [{ type: String }],
  resumeUrl: { type: String },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Middleware to update isProfileComplete before saving
studentSchema.pre('save', function(next) {
  // Check if critical fields are present
  if (this.fullName && this.universityId && this.currentYear && this.cgpa) {
    this.isProfileComplete = true;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);