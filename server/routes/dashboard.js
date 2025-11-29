const express = require("express");
const dashboardCtrl = require("../controllers/dashboard");
const router = express.Router();

router.route('/').get(dashboardCtrl.dashboard_count);  

module.exports = router;