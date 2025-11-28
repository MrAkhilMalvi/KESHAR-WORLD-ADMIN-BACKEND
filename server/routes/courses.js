const express = require("express");
const coursesCtrl = require("../controllers/courses");
const router = express.Router();
const auth = require("../helpers/auth");


router.route('/add').post( coursesCtrl.add_course);
router.route('/add/modules').post(coursesCtrl.add_course_modules);
router.route('/add/videos').post(coursesCtrl.add_videos);  
router.route('/update').post( coursesCtrl.update_course);
router.route('/update/modules').post(coursesCtrl.update_course_modules);
router.route('/update/videos').post(coursesCtrl.update_videos);  
router.route('/get/all_courses').get( coursesCtrl.select_all_courses);
router.route('/get/modules').post(coursesCtrl.get_modules_by_course);
router.route('/get/videos').post(coursesCtrl.get_videos_by_module);  

module.exports = router;