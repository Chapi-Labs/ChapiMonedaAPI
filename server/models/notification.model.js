import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * notification Schema
 */
const NotificationSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  bank: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'The value of path {PATH} ({VALUE}) is not a valid email address.'] // eslint-disable-line
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
NotificationSchema.method({
});

/**
 * Statics
 */
NotificationSchema.statics = {
  /**
   * Get notification
   * @param {ObjectId} id - The objectId of notification.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        const err = new APIError('No such notification exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  getByEmail(email) {
    return this.findOne({ email })
      .exec()
      .then((notification) => {
        if (notification) {
          return notification;
        }
        return undefined;
      });
  },
  getByAmountAndTypeAndBank(bank, amount, type) {
    return this.find({
      amount: { $gte: amount },
      type,
      bank
    })
    .exec()
    .then((notification) => {
      if (notification) {
        return notification;
      }
      // const err = new APIError('No such notification with user id', httpStatus.NOT_FOUND);
      return [];
    });
  },
  /**
   * List notifications in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

/**
 * @typedef User
 */
export default mongoose.model('notification', NotificationSchema);
