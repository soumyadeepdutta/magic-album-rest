const checkAuth = require('#middlewares/check-auth');
const requestValidator = require('#utils/request-validator');
const { createAlbumValidator } = require('#validators/album');
const { create, upload, list } = require('./controller');

const router = require('express').Router();

router.post(
  '/create',
  checkAuth(),
  requestValidator(createAlbumValidator),
  create
);
router.get('/list', checkAuth(), list);
router.post('/upload', checkAuth(), upload);

module.exports = router;
