let aws = require('aws-sdk')

module.exports = function getImages({bucket}) {
  let s3 = new aws.S3
  return s3.listObjects({Bucket: bucket}).promise()
}
