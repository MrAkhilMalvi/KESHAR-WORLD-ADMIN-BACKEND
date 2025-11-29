const pgClient = require('../../config/db');

async function dashboard_count(req, res, next) {

    try {
      
        const result = await pgClient.query('SELECT * FROM admin_dashboard_count()',[]);

        return res.send({ success: true, data: result.rows })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    dashboard_count: dashboard_count
}