let aws = require('aws-sdk')
let fileType = require('file-type')
let gm = require('gm').subClass({imageMagick: true})

/**
 * receives a create event for raw/888-xxx
 * detects file type and writes orig/888-xxx.png
 * if the file type is png or jpg writes thumb/888-xxx.png
 * deletes raw/888-xxx
 */
exports.handler = async function upload(event) {

  let s3 = new aws.S3
  let MAX_WIDTH = 100
  let MAX_HEIGHT = 100

  return Promise.all(event.Records.map(function created(record) {
    return new Promise(function ugh(resolve, reject) {

      // read the uploaded file
      s3.getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key
      }).promise().then(function read(result) {

        // guess the uploaded filetype and write it to orig/
        let guess = fileType(result.Body)

        // write the orig
        let orig = s3.putObject({
          ContentType: guess.mime,
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key.replace('raw/', 'orig/') + '.' + guess.ext,
          Body: result.Body
        }).promise()

        // cleanup the raw
        let clean = s3.deleteObject({
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key
        }).promise()

        // thumbnail
        let thumbnail = guess.ext === 'jpg' || guess.ext === 'png'
        let thumb = thumbnail? new Promise(function argh(res, rej) {

          gm(result.Body).size(function size(err, size) {
            if (err) rej(err)
            else {
              // Infer the scaling factor to avoid stretching the image unnaturally.
              var scalingFactor = Math.min(MAX_WIDTH / size.width, MAX_HEIGHT / size.height)
              var width  = scalingFactor * size.width
              var height = scalingFactor * size.height

              // Transform the image buffer in memory.
              this.resize(width, height).toBuffer(guess.ext, function resize(err, buffer) {
                if (err) rej(err)
                else {
                  s3.putObject({
                    ContentType: guess.mime,
                    Bucket: record.s3.bucket.name,
                    Key: record.s3.object.key.replace('raw/', 'thumb/') + '.' + guess.ext,
                    Body: buffer
                  }).promise().then(res).catch(rej)
                }
              })
            }
          })

        }) : Promise.resolve()

        return Promise.all([orig, clean, thumb])
      }).catch(reject)
    })
  }))
}
