let s3 = require('./s3')

/**
 * render an upload form
 *
 * @param {object} params
 * @param {string} params.bucket
 * @param {string} params.redirect
 * @returns {DOMString}
 */
module.exports = async function form({bucket}) {

  //let acl = 'public-read'
  let key = '${filename}'
  let idx = process.env.S3_KEY
  let secret = process.env.S3_SECRET
  let region = process.env.AWS_REGION
  let type = 'image/'

  let config = {
    accessKey: idx,
    secretKey: secret,
    bucket,
    region
  }
  let doc = s3(config, {filename: key, contentType: type})
  let hidden = k=> `<input type=hidden name=${k} value="${doc.params[k]}">`
  return `
  <pre>${JSON.stringify(doc, null, 2)}</pre>
  <pre>${JSON.stringify(Buffer.from(doc.params.policy, 'base64').toString(), null, 2)}</pre>

  <form action=${doc.endpoint} method=post enctype=multipart/form-data>
    ${Object.keys(doc.params).map(hidden).join('')} 
    <!-- do the thing -->
    <input type=file name=file> 
    <input type=submit name=submit value=Upload>
  </form>`
}
