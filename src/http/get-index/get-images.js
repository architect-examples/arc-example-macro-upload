let aws = require('aws-sdk')

module.exports = async function getImages() {
  let Bucket = process.env.S3_UPLOAD_BUCKET
  let s3 = new aws.S3
  let images = await s3.listObjects({Bucket}).promise()
  let filter = k=> k.Key.startsWith('orig/')
  let map = k=> k.Key.replace('orig/', '')
  return images.Contents.filter(filter).map(map)
}
