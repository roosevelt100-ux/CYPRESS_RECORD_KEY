const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Netlify Function to return a presigned PUT URL for S3 uploads.
// Requires environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { filename, contentType } = body;
    if(!filename || !contentType) return { statusCode:400, body: JSON.stringify({ error: 'filename and contentType required' }) };

    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET;

    // If AWS not configured, return a mock presigned URL that targets a local mock upload function
    if(!region || !bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY){
      const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\\-_]/g,'_')}`;
      // point to local Netlify function that accepts PUT to simulate S3
      const url = `/.netlify/functions/mock-upload?key=${encodeURIComponent(key)}`;
      return { statusCode:200, body: JSON.stringify({ url, key, mock: true }) };
    }

    const s3 = new S3Client({ region });
    const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\\-_]/g,'_')}`;
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return { statusCode:200, body: JSON.stringify({ url, key }) };
  } catch(err) {
    console.error(err);
    return { statusCode:500, body: JSON.stringify({ error: err.message }) };
  }
};
