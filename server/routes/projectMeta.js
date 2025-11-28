const projectMeta = require('../controllers/projectMeta');
const express = require('express');
const router = express.Router();

router.get('/' , projectMeta);

module.exports = router;