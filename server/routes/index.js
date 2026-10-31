const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth, adminOnly, superadminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authCtrl = require('../controllers/authController');
const componentCtrl = require('../controllers/componentController');
const borrowCtrl = require('../controllers/borrowController');
const reviewCtrl = require('../controllers/reviewController');
const messageCtrl = require('../controllers/messageController');
const notifCtrl = require('../controllers/notificationController');
const wishlistCtrl = require('../controllers/wishlistController');
const dashboardCtrl = require('../controllers/dashboardController');
const userCtrl = require('../controllers/userController');

// Auth
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/profile', authMiddleware, authCtrl.getProfile);
router.put('/auth/profile', authMiddleware, upload.single('avatar'), authCtrl.updateProfile);
router.delete('/auth/account', authMiddleware, authCtrl.deleteAccount);

// Categories
router.get('/categories', componentCtrl.getCategories);

// Components
router.get('/components', optionalAuth, componentCtrl.getAll);
router.get('/components/autocomplete', componentCtrl.autocomplete);
router.get('/components/my-listings', authMiddleware, componentCtrl.getMyListings);
router.get('/components/:id', optionalAuth, componentCtrl.getById);
router.post('/components', authMiddleware, upload.array('images', 5), componentCtrl.create);
router.put('/components/:id', authMiddleware, upload.array('images', 5), componentCtrl.update);
router.delete('/components/:id', authMiddleware, componentCtrl.remove);

// Borrow Requests
router.post('/borrow-requests', authMiddleware, borrowCtrl.create);
router.get('/borrow-requests/incoming', authMiddleware, borrowCtrl.getIncoming);
router.get('/borrow-requests/outgoing', authMiddleware, borrowCtrl.getOutgoing);
router.put('/borrow-requests/:id/status', authMiddleware, borrowCtrl.updateStatus);
router.put('/borrow-requests/:id/cancel', authMiddleware, borrowCtrl.cancel);

// Reviews
router.post('/reviews', authMiddleware, reviewCtrl.create);
router.get('/reviews/user/:userId', reviewCtrl.getForUser);

// Messages
router.post('/messages', authMiddleware, messageCtrl.send);
router.get('/messages/conversations', authMiddleware, messageCtrl.getConversations);
router.get('/messages/thread/:userId', authMiddleware, messageCtrl.getThread);
router.delete('/messages/:id', authMiddleware, messageCtrl.remove);

// Notifications
router.get('/notifications', authMiddleware, notifCtrl.getAll);
router.put('/notifications/:id/read', authMiddleware, notifCtrl.markRead);
router.put('/notifications/read-all', authMiddleware, notifCtrl.markAllRead);

// Wishlist
router.post('/wishlist/toggle', authMiddleware, wishlistCtrl.toggle);
router.get('/wishlist', authMiddleware, wishlistCtrl.getAll);
router.get('/wishlist/check/:componentId', authMiddleware, wishlistCtrl.check);
router.delete('/wishlist/:componentId', authMiddleware, wishlistCtrl.remove);

// Dashboard
router.get('/dashboard/stats', dashboardCtrl.getStats);
router.get('/dashboard/user-stats', authMiddleware, dashboardCtrl.getUserStats);
router.get('/dashboard/charts', dashboardCtrl.getChartData);
router.get('/dashboard/recent-activity', dashboardCtrl.getRecentActivity);
router.get('/dashboard/export-history', authMiddleware, dashboardCtrl.exportBorrowHistory);

// Users (public)
router.get('/users/:id', userCtrl.getUser);

// Admin
router.get('/admin/users', authMiddleware, superadminOnly, userCtrl.getAllUsers);
router.put('/admin/users/:id', authMiddleware, superadminOnly, userCtrl.updateUserRole);
router.delete('/admin/users/:id', authMiddleware, superadminOnly, userCtrl.deleteUser);
router.get('/admin/requests', authMiddleware, adminOnly, borrowCtrl.getAll);

module.exports = router;
