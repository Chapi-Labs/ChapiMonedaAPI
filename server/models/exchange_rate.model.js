import mongoose from 'mongoose';

/**
 * ExchangeRate Schema
 */
const ExchangeRate = new mongoose.Schema({
  bank: {
    type: String,
    required: true
  },
  rates: [{
    rateType: { type: String },
    value: { type: Number }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


/**
 * @typedef ExchangeRate
 */
export default mongoose.model('ExchangeRate', ExchangeRate);
