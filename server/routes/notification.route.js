import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import notificationCtrl from '../controllers/notification.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/notification - Get list of notifications */
  .get(notificationCtrl.list)

  /** POST /api/notification - Create new notification */
  .post(notificationCtrl.create);

router.route('/search')
  /** POST /api/notification/seach */
  .post(validate(paramValidation.searchNotification), notificationCtrl.searchNotificationByUser);

export default router;
