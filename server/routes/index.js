const express = require("express");
const router = express.Router();
const adminLoginRoutes = require('./admin-login');
//const dashboard_stats = require('.');
const forgotPasswordRoutes = require('./forgot-password');
const projectMeta = require('./projectMeta');
const couresRoutes = require('./courses');


router.get('/health-check', (req, res) => res.send('OK'));
router.use('/admin-login', adminLoginRoutes);
//router.use('/dashboard' , dashboard_stats);

router.use('/forgot-password', forgotPasswordRoutes);
router.use('/projectmeta' , projectMeta);
router.use('/courses' , couresRoutes);
module.exports = router;
