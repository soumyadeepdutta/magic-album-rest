const { BadRequestError, NotFoundError } = require('#errors');
const models = require('#models');
const successResponse = require('#response');
const {
  uploadToS3,
  deleteFileFroms3,
  downloadFromS3,
  getFromS3
} = require('#utils/aws/s3.func');
const qrcode = require('#utils/qrcode');

/** @type {import("express").RequestHandler} */
exports.create = async (req, res) => {
  const isAlbumExist = await models.album.findOne({
    where: { name: req.body.name }
  });
  if (isAlbumExist !== null) throw new BadRequestError('Name already exist!');

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
  if (!req.body.albumId) throw new BadRequestError('album id is required');
  if (!req.body.albumName) throw new BadRequestError('album name is required');
  const images = req.files.images;
  const videos = req.files.videos;
  const albumId = req.body.albumId;
  const albumName = req.body.albumName.replace(/\s/g, '');

  const imageSize = images.reduce((acc, cur) => {
      return (acc += cur.size);
    }, 0),
    vidSize = videos.reduce((acc, cur) => {
      return (acc += cur.size);
    }, 0);

  const totalSize = imageSize + vidSize;

  // Upload images to S3
  const uploadedImages = await Promise.all(
    images.map(async (image, index) => {
      image.originalname =
        albumName + `_${index}.` + image.originalname.split('.').pop();
      await uploadToS3(image);
      return image.originalname;
    })
  );

  // Upload videos to S3
  const uploadedVideos = await Promise.all(
    videos.map(async (video, index) => {
      video.originalname =
        albumName + `_${index}.` + video.originalname.split('.').pop();
      await uploadToS3(video);
      return video.originalname;
    })
  );

  await models.album.update(
    {
      images: uploadedImages,
      videos: uploadedVideos,
      size: totalSize
    },
    { where: { id: albumId } }
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
    attributes: ['images', 'videos', 'size'],
    where: { id: req.params.id },
    raw: true,
    nest: true
  });
  if (!album) throw new BadRequestError('Invalid album id');
  const data = {
    images: addUrlPrefix(album.images),
    videos: addUrlPrefix(album.videos),
    totalSize: album.size
  };

  await uploadToS3({
    originalname: `${req.params.id}.txt`,
    buffer: JSON.stringify(data)
  });
  const qrbase64 = await qrcode(
   `https://api.magicalbum.in/api/album/qr-data/${req.params.id}`
  );
  return res.send(successResponse({ data: qrbase64 }));
};

/** @type {import("express").RequestHandler} */
exports.getFileFromQRUrl = async (req, res) => {
  const fileId = req.params.id;

  if (
    req.headers['x-unity-request'] ||
    req.headers['user-agent'].includes('Unity')
  ) {
    // return res.send(process.env.AWS_URL + `${fileId}.txt`);
    const album = await models.album.findOne({
      attributes: ['images', 'videos', 'size'],
      where: { id: req.params.id },
      raw: true,
      nest: true
    });
    if (!album) throw new BadRequestError('Invalid album id');
    const data = {
      images: addUrlPrefix(album.images),
      videos: addUrlPrefix(album.videos),
      totalSize: album.size
    };
    return res.send(data);

  } else {
    return res.redirect(
      'https://magicalbum.s3.ap-south-1.amazonaws.com/index.html'
    );
  }
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

/** @type {import("express").RequestHandler} */
exports.deleteAlbum = async (req, res) => {
  const album = await models.album.findOne({
    where: { id: req.params.id },
    raw: true,
    nest: true
  });
  if (!album) throw new BadRequestError('Invalid album id');

  const images = album.images,
    videos = album.videos;

  // delete images
  await Promise.all(
    images.map(async (image) => {
      await deleteFileFroms3(image);
    })
  );

  // delete videos
  await Promise.all(
    videos.map(async (video) => {
      await deleteFileFroms3(video);
    })
  );

  await models.album.destroy({
    where: {
      id: req.params.id
    }
  });

  return res.send(successResponse('Deleted'));
};
