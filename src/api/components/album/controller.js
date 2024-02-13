const { BadRequestError } = require('#errors');
const models = require('#models');
const successResponse = require('#response');
const { uploadToS3 } = require('#utils/aws/s3.func');

/** @type {import("express").RequestHandler} */
exports.create = async (req, res) => {
  const user = await models.users.findByPk(req.authUser.id, {
    attributes: {
      exclude: ['password']
    }
  });
  return res.send(successResponse(user));
};

/** @type {import("express").RequestHandler} */
exports.upload = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new BadRequestError('No files were uploaded');
    }

    const images = req.files.images;
    const videos = req.files.videos;

    // Upload images to S3
    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        // await uploadToS3(image);
        return image.name;
      })
    );

    // Upload videos to S3
    const uploadedVideos = await Promise.all(
      videos.map(async (video) => {
        // await uploadToS3(video);
        return video.name;
      })
    );

    return res.status(200).json({ uploadedImages, uploadedVideos });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
