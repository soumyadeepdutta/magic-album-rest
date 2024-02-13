const checkAuth = require('#middlewares/check-auth');
const { create, upload } = require('./controller');

const router = require('express').Router();

router.post('/create', checkAuth(), create);
router.post('/upload', checkAuth(), upload);

module.exports = router;
