import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    trim: true,
    default: 'General Inquiry'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  repliedAt: {
    type: Date
  },
  replyMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const Contact = mongoose.model('Contact', contactSchema);