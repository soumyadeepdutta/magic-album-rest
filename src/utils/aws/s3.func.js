const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand
} = require('@aws-sdk/client-s3');
const { config } = require('./s3.config');

const S3 = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  }
});

exports.uploadToS3 = function (file) {
  return new Promise((resolve, reject) => {
    try {
      const command = new PutObjectCommand({
        Bucket: config.AWS_BUCKET_NAME,
        Key: file.name,
        Body: file.data
      });

      S3.send(command)
        .then((event) => {
          resolve(event);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
};

exports.downloadFromS3 = function (filename) {
  return new Promise(async (resolve, reject) => {
    const getObjectCommand = new GetObjectCommand({
      Bucket: config.AWS_BUCKET_NAME,
      Key: filename
    });

    try {
      const response = await S3.send(getObjectCommand);

      /* ----------- one way ------------------
        // Store all of data chunks returned from the response data stream
        // into an array then use Array#join() to use the returned contents as a String
        let responseDataChunks = [];
        // Handle an error while streaming the response body
        response.Body.once("error", (err) => reject(err));
        // Attach a 'data' listener to add the chunks of data to our array
        // Each chunk is a Buffer instance
        response.Body.on("data", (chunk) => responseDataChunks.push(chunk));
        // Once the stream has no more data, join the chunks into a string and return the string
        response.Body.once("end", () => resolve(responseDataChunks.join("")));
        */

      /* ------ another way ------------ */
      resolve(response.Body);
    } catch (err) {
      // Handle the error or throw
      return reject(err);
    }
  });
};
