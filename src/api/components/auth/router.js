const checkAuth = require('#middlewares/check-auth');
const requestValidator = require('#utils/request-validator');
const { loginValidator } = require('#validators/auth');
const { login, me, updatePassword } = require('./controller');

const router = require('express').Router();

// MSAL
router.post('/login', requestValidator(loginValidator), login);
// router.post('/update', updatePassword);

router.get('/profile', checkAuth(), me);

module.exports = router;
