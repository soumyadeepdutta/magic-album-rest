const checkAuth = require('#middlewares/check-auth');
const requestValidator = require('#utils/request-validator');
const { createAlbumValidator } = require('#validators/album');
const {
  create,
  upload,
  list,
  getQR,
  getDetails,
  deleteAlbum
} = require('./controller');

const multurUpload = require('multer')({
  // limits: {
  //   fileSize: 100 * 1024 * 1024
  // } // we can put file size limitation here but for our case it not gonna work
});
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
router.route('/:id').get(checkAuth(), getDetails);
// .delete(checkAuth(), deleteAlbum);
router.post('/upload', checkAuth(), multerMiddleware, upload);

module.exports = router;
