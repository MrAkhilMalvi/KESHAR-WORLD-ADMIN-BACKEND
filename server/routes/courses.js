const express = require("express");
const coursesCtrl = require("../controllers/courses");
const router = express.Router();
const auth = require("../helpers/auth");

router.route('/add').get(auth.verifyToken, coursesCtrl.add_course);
router.route('/add/modules').get(auth.verifyToken,coursesCtrl.add_course_modules);
router.route('/add/videos').get(auth.verifyToken ,coursesCtrl.add_videos);  
router.route('/update').get(auth.verifyToken, coursesCtrl.update_course);
router.route('/update/modules').get(auth.verifyToken,coursesCtrl.update_course_modules);
router.route('/update/videos').get(auth.verifyToken ,coursesCtrl.update_videos);  
router.route('/get/all_courses').get(auth.verifyToken, coursesCtrl.select_all_courses);
router.route('/get/modules').get(auth.verifyToken,coursesCtrl.get_modules_by_course);
router.route('/get/videos').get(auth.verifyToken ,coursesCtrl.get_videos_by_module);  

module.exports = router;