const AWS = require('aws-sdk');

const uploadToS3 = (data, filename) => {
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    const BUCKET_NAME = process.env.BUCKET_NAME;

    // Initialize S3 client
    const s3 = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET
    });

    // Define S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading to S3:', err);
                reject(err);
            } else {
                console.log('Upload successful:', data.Location);
                resolve(data.Location);
            }
        });
    });
};

module.exports = {
    uploadToS3
};