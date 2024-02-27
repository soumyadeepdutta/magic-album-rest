const { BadRequestError, NotFoundError } = require('#errors');
const models = require('#models');
const successResponse = require('#response');
const { uploadToS3 } = require('#utils/aws/s3.func');
const qrcode = require('#utils/qrcode');

/** @type {import("express").RequestHandler} */
exports.create = async (req, res) => {
  const album = await models.album.create({
    ...req.body,
    user: req.authUser.id
  });
  return res.send(successResponse(album));
};

/** @type {import("express").RequestHandler} */
exports.list = async (req, res) => {
  const albums = await models.album.findAll({
    where: {
      user: req.authUser.id
    },
    raw: true,
    nest: true
  });
  if (!albums) throw new NotFoundError();

  return res.send(
    successResponse(
      albums.map((item) => ({
        ...item,
        images: addUrlPrefix(item.images),
        videos: addUrlPrefix(item.videos)
      }))
    )
  );
};

/** @type {import("express").RequestHandler} */
exports.upload = async (req, res) => {
  // console.log(req.files?.images, 'images');
  // console.log(req.files?.videos, 'videos');
  if (
    !req.files?.images ||
    !req.files?.videos ||
    Object.keys(req.files?.images).length !==
      Object.keys(req.files?.videos).length
  ) {
    throw new BadRequestError(
      'Same number of images and videos are required (minimum 1 pairs)'
    );
  }
  if (!req.body.albumId) throw new BadRequestError('albumId is required');
  const images = req.files.images;
  const videos = req.files.videos;
  const album = req.body.albumId;

  // Upload images to S3
  const uploadedImages = await Promise.all(
    images.map(async (image, index) => {
      image.originalname =
        album + `_${index}th.` + image.originalname.split('.').pop();
      await uploadToS3(image);
      return image.originalname;
    })
  );

  // Upload videos to S3
  const uploadedVideos = await Promise.all(
    videos.map(async (video, index) => {
      video.originalname =
        album + `_${index}th.` + video.originalname.split('.').pop();
      await uploadToS3(video);
      return video.originalname;
    })
  );

  await models.album.update(
    {
      images: uploadedImages,
      videos: uploadedVideos
    },
    { where: { id: album } }
  );

  return res.send(successResponse({ uploadedImages, uploadedVideos }));
};

function addUrlPrefix(array) {
  if (Array.isArray(array) && array instanceof Array)
    return array.map((item) => process.env.AWS_URL + item);
  else return array;
}
/** @type {import("express").RequestHandler} */
exports.getQR = async (req, res) => {
  const album = await models.album.findOne({
    attributes: ['images', 'videos'],
    where: { id: req.params.id },
    raw: true,
    nest: true
  });
  if (!album) throw new BadRequestError('Invalid album id');
  const data = {
    images: addUrlPrefix(album.images),
    videos: addUrlPrefix(album.videos)
  };
  await uploadToS3({
    originalname: `${req.params.id}.txt`,
    buffer: JSON.stringify(data)
  });
  const qrbase64 = await qrcode(process.env.AWS_URL + `${req.params.id}.txt`);
  return res.send(successResponse({ data: qrbase64 }));
};

/** @type {import("express").RequestHandler} */
exports.getDetails = async (req, res) => {
  const album = await models.album.findOne({
    where: { id: req.params.id },
    raw: true,
    nest: true
  });
  if (!album) throw new BadRequestError('Invalid album id');
  const data = {
    ...album,
    images: addUrlPrefix(album.images),
    videos: addUrlPrefix(album.videos)
  };
  return res.send(successResponse(data));
};
