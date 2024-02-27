const checkAuth = require('#middlewares/check-auth');
const requestValidator = require('#utils/request-validator');
const { createAlbumValidator } = require('#validators/album');
const { create, upload, list, getQR, getDetails } = require('./controller');

const multurUpload = require('multer')();
const multerMiddleware = multurUpload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 5 }
]);

const router = require('express').Router();

router.post(
  '/create',
  checkAuth(),
  requestValidator(createAlbumValidator),
  create
);
router.get('/list', checkAuth(), list);
router.get('/qr/:id', checkAuth(), getQR);
router.get('/:id', checkAuth(), getDetails);
router.post('/upload', checkAuth(), multerMiddleware, upload);

module.exports = router;
