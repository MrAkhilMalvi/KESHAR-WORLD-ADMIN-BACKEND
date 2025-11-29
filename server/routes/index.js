const express = require("express");
const router = express.Router();
const adminLoginRoutes = require('./admin-login');
const dashboardRoutes = require('./dashboard');
const forgotPasswordRoutes = require('./forgot-password');
const projectMeta = require('./projectMeta');
const couresRoutes = require('./courses');
const productsRoutes = require('./products');

router.get('/health-check', (req, res) => res.send('OK'));
router.use('/admin-login', adminLoginRoutes);
router.use('/dashboard' , dashboardRoutes);

router.use('/forgot-password', forgotPasswordRoutes);
router.use('/projectmeta' , projectMeta);
router.use('/courses' , couresRoutes);
router.use('/products' , productsRoutes);
module.exports = router;
