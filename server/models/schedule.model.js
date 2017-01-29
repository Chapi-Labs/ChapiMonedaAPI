import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * User Schema
 */
const ScheduleSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  repeat: {
    type: String,
    required: true
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
ScheduleSchema.method({
});

/**
 * Statics
 */
ScheduleSchema.statics = {
  /**
   * Get scheule
   * @param {ObjectId} id - The objectId of schedule.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((schedule) => {
        if (schedule) {
          return schedule;
        }
        const err = new APIError('No such schedule exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },


/**
 * @typedef User
 */
export default mongoose.model('Schedule', ScheduleSchema);
