const express = require('express');
const router = express.Router();
router.use(require('./partyRoutes'));
router.use(require('./voterRoutes'));
router.use(require('./candidateRoutes'));

module.exports = router;