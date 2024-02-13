const { BadRequestError } = require('#errors');
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
    }
  });
  return res.send(successResponse(albums));
};

/** @type {import("express").RequestHandler} */
exports.upload = async (req, res) => {
  if (
    !req.files?.images ||
    !req.files?.videos ||
    Object.keys(req.files?.images).length !==
      Object.keys(req.files?.videos).length
  ) {
    throw new BadRequestError(
      'Same number of images and videos are required (minimum 2 pairs)'
    );
  }
  if (!req.body.albumId) throw new BadRequestError('albumId is required');
  const images = req.files.images;
  const videos = req.files.videos;
  const album = req.body.albumId;

  // Upload images to S3
  const uploadedImages = await Promise.all(
    images.map(async (image, index) => {
      image.name = album + `${index}th.` + image.name.split('.').pop();
      await uploadToS3(image);
      return image.name;
    })
  );

  // Upload videos to S3
  const uploadedVideos = await Promise.all(
    videos.map(async (video, index) => {
      video.name = album + `_${index}th.` + video.name.split('.').pop();
      await uploadToS3(video);
      return video.name;
    })
  );

  return res.send(successResponse({ uploadedImages, uploadedVideos }));
};

/** @type {import("express").RequestHandler} */
exports.getQR = async (req, res) => {
  const album = await models.album.findOne({
    attributes: ['images', 'videos'],
    where: { id: req.params.id }
  });
  if (!album) throw new BadRequestError('Invalid album id');
  const qrbase64 = await qrcode(album);
  return res.send(successResponse(qrbase64));
};
