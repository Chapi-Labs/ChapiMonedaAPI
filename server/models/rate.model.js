import mongoose from 'mongoose';

/**
 * Rate Schema
 */
const Rate = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  }
});

/**
 * @typedef Rate
 */
export default mongoose.model('Rate', Rate);
