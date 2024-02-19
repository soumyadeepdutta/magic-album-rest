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
      image.name = album + `_${index}th.` + image.name.split('.').pop();
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
  return array.map(item => process.env.AWS_URL + item);
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
  }
  await uploadToS3({name: `${req.params.id}.txt`, data: JSON.stringify(data)})
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
  }
  return res.send(successResponse(data))
}