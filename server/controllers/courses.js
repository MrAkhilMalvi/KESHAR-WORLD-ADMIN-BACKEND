const pgClient = require('../../config/db');

async function add_course(req, res, next) {

    try {
        const {
            title,
            price,
            description,
            is_free,
            instructor,
            original_price,
            badge, category,
            thumbnail_url
        } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_insert_course($1,$2,$3,$4,$5,$6,$7,$8,$9)',[title, price, description, is_free, instructor, original_price, badge, category,thumbnail_url]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function add_course_modules(req, res, next) {

    try {
        const {
            course_id,
            module_title,
            position
        } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_insert_modules($1,$2,$3)',[course_id, module_title, position]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function add_videos(req, res, next) {

    try {
        const {
            module_id,
            video_title,
            video_url,
            duration,
            description,
            position
        } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_insert_videos($1,$2,$3,$4,$5,$6)',[module_id, video_title, video_url, duration,description, position]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function update_course(req, res, next) {

    try {
        const {
            coures_id,
            title,
            price,
            description,
            is_free,
            instructor,
            original_price,
            badge, category,
            thumbnail_url
        } = req.body;
        
        const result = await pgClient.query('SELECT * FROM admin_courses_updation_course($1,$2,$3,$4,$5,$6,$7,$8,$9)',[coures_id,title, price, description, is_free, instructor, original_price, badge, category,thumbnail_url]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function update_course_modules(req, res, next) {

    try {
        const {
            modules_id,
            module_title,
            position
        } = req.body;


        const result = await pgClient.query('SELECT * FROM admin_courses_update_module($1,$2,$3)',[modules_id, module_title, position]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function update_videos(req, res, next) {

    try {
        const {
            video_id,
            video_title,
            video_url,
            duration,
            description,
            position
        } = req.body;
        

        const result = await pgClient.query('SELECT * FROM admin_courses_insert_videos($1,$2,$3,$4,$5,$6)',[video_id, video_title, video_url, duration,description, position]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function select_all_courses(req, res, next) {

    try {
      
        const result = await pgClient.query('SELECT * FROM admin_courses_select_all()',[]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function get_modules_by_course(req, res, next) {

    try {
        const { couses_id } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_get_modules_by_course($1)',[couses_id]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function get_videos_by_module(req, res, next) {

    try {
        const { module_id } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_get_videos_by_module($1)',[module_id]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    add_course: add_course,
    add_course_modules : add_course_modules,
    add_videos : add_videos ,
    update_course : update_course,
    update_course_modules : update_course_modules,
    update_videos : update_videos,
    select_all_courses : select_all_courses,
    get_modules_by_course : get_modules_by_course,
    get_videos_by_module : get_videos_by_module

}