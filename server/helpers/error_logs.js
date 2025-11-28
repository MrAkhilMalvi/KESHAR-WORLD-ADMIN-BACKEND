const APIError = require('../../config/APIError');
const pgClient = require('../../config/db');

function url_manager(url) {
    const urls = {
        
            // Admin Login
            '/api/admin-login/': 'LOGINADMIN',
            '/api/admin-login/verifyOTP': 'LOGINVERIFYADMIN',
            '/api/admin-login/resendOTP': 'LOGINRESENDOTP',
    
            // Audit Queries
            '/api/audit-queries/': 'AUDITQUERIES',
            '/api/audit-queries/subject/per/student/count': 'SUBJECTWISESTUDENTCOUNT',
            '/api/audit-queries/date/wise/student/count': 'DATEWISESTUDENTCOUNT',
            '/api/audit-queries/change/mobile/email/school': 'CHANGESCHOOLCONTACT',
            '/api/audit-queries/change/email/mobile/school/not/school': 'CHANGECONTACTNOSCHOOL',
            '/api/audit-queries/district/wise/data': 'DISTRICTWISEDATA',
        
            // Candidate APIs
            '/api/candidate/': 'CANDIDATEHOME',
            '/api/candidate/hold': 'HOLDCANDIDATE',
            '/api/candidate/detail': 'CANDIDATEDETAIL',
            '/api/candidate/update/detail': 'UPDATECANDIDATEDETAIL',
            '/api/candidate/delete': 'DELETECANDIDATE',
        
            // Dashboard Stats
            '/api/dashboard_stats/stats': 'DASHBOARDSTATS',
        
            // Exam APIs
            '/api/exam/update': 'UPDATEEXAM',
            '/api/exam/instruction': 'EXAMEINSTRUCTION',
        
            // Forgot Password
            '/api/forgot-password/': 'FORGOTPASSWORD',
            '/api/forgot-password/verifyOTP': 'VERIFYFORGOTOTP',
            '/api/forgot-password/resendOTP': 'RESENDFORGOTOTP',
            '/api/forgot-password/setPassword': 'SETNEWPASSWORD',
        
            // Project Meta
            '/api/projectMeta/': 'PROJECTMETA',
        
            // School APIs
            '/api/school/search': 'SCHOOLSEARCH',
            '/api/school/update': 'UPDATESCHOOLDETAILS',
            '/api/school/details': 'SCHOOLDETAILS',
            '/api/school/delete': 'DELETESCHOOL'
        
    }

    const cleanUrl = url.split('?')[0]; // remove query params if any
    return urls[cleanUrl] || 'UnknownAPIURL'; // fallback if not found
}

async function error_logs_response(req, filepath, data, user) {
    try {
        const type = 'ERROR';
        const method = req.method || 'No method found in req.method';
        const fullurl = `${req.baseUrl}${req.url}`;
        const url = fullurl;
        const req_body = req.body || null;
        const req_query = req.query || null;
        const req_params = req.params || null;
        const user_ip = req.ip || 'No Ip found from req.ip';
        const user_footprint = req.headers['user-agent'];
        console.log(fullurl);
        
        const url_type = url_manager(fullurl);
        console.log(url_type);

        if (url_type) {
           const result = await pgClient.query(
                "SELECT * FROM insert_error_log_admin($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)", 
                [type, method, url, req_body, req_query, req_params, user_ip, user_footprint, user, data, filepath, url_type]
            );
            console.log('data',result);
        } 

        return

    } catch (error) {
        return new APIError('Response is not generated beacause there might be the db error or reqest data are not properly destructuring')
    }
};

module.exports = { error_logs_response: error_logs_response}

