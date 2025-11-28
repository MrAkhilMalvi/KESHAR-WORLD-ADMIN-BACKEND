const pgClient = require('../../config/db');

//  Return the project meta data
async function projectMeta (req , res , next){
    try {

        const result = await pgClient.query('SELECT * FROM admin_frontend_projectmeta()');

        res.send({success : true , data : result.rows});
        
    } catch (error) {
        next(error);
    }
}

module.exports = projectMeta;