import Notification from '../models/notification.model';

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  Notification.get(id)
    .then((notification) => {
      req.notification = notification; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get notification
 * @returns {notification}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new notification
 * @property {string} req.body.amount - The username of user.
 * @property {string} req.body.email - The id of the user
 * @property {string} req.body.bank - The integer of the bank
 * @property {string} req.body.type - The integer of the bank
 * @returns {Notification}
 */
function create(req, res, next) {
  Notification
    .getByEmail(req.body.email)
    .then((notification) => {
      if (notification !== null && notification !== undefined) {
        update(req, res, next, notification);
        res.json('updated');
      }
    });
  const notif = new Notification({
    amount: parseFloat(req.body.amount),
    bank: req.body.bank,
    type: req.body.type,
    email: req.body.email
  });

  notif.save()
    .then(res.json('saved'))
    .catch(e => next(e));
}

function searchNotificationByUser(req, res, next) {
  Notification
    .getByUser(req.body.user)
    .then((notification) => {
      res.json(notification);
    }).catch(e => next(e));
}

/**
 * Update existing notification
 * @property {string} req.body.username - The username of user.
 * @property {double} req.body.email - The email of user.
 * @returns {User}
 */
function update(req, res, next, notif) {
  const notification = notif;
  notification.amount = parseFloat(req.body.amount);
  notification.bank = req.body.bank;
  notification.email = req.body.email;
  notification.type = req.body.type;

  notification.save()
    .then(notifSaved => res.json(notifSaved))
    .catch(e => next(e));
}

/**
 * Get notification list.
 * @property {number} req.query.skip - Number of notifications to be skipped.
 * @property {number} req.query.limit - Limit number of notifications to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Notification.list({ limit, skip })
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const notification = req.notification;
  notification.remove()
    .then(deletedNotification => res.json(deletedNotification))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove, searchNotificationByUser };
