let aws = require('aws-sdk')

/**
 * render an image from the upload bucket
 */
exports.handler = async function http(req) {

  let s3 = new aws.S3
  let Bucket = process.env.S3_UPLOAD_BUCKET
  let thumb = req.queryStringParameters? req.queryStringParameters.hasOwnProperty('thumb') || false : false
  let Key = `${thumb? 'thumb' : 'orig'}/${req.pathParameters.file}`
  let result = await s3.getObject({Bucket, Key}).promise()

  return {
    headers: {
      'content-type': result.ContentType
    },
    isBase64Encoded: true,
    body: result.Body.toString('base64')
  }
}
