let form = require('./form')
let getImages = require('./get-images')

exports.handler = async function http(req) {
  let html
  try {

    let bucket = process.env.S3_UPLOAD_BUCKET
    let redirect = `https://${req.headers.Host}/staging/success`
    let upload = form({bucket, redirect})
    let images = await getImages({bucket})
    let filter = k=> k.Key.startsWith('orig/')
    let map = k=> k.Key.replace('orig/', '')
    let img = images.Contents.filter(filter).map(map)
    let link = l=> `<a href=/staging/images/${l}><img src=/staging/images/${l}?thumb></a>`

    html = `
      <!doctype html>
      <html lang=en>
      <head>
        <meta name=viewport content=width=device-width,initial-scale=1>
        <title>upload to s3</title>
      </head>
      <body>

      <h1>upload</h1> 
      ${upload}

      <h1>images</h1> 
      ${img.map(link).join('\n')}

      <hr>
      <pre>${JSON.stringify(images, null, 2)}</pre>
      </body>
      </html>
    `
  }
  catch(err) {
    html = `
      <h1>Error: ${err.message}</h1>
      <pre>${err.stack}</pre>
    `
  }
  return {
    headers: {'content-type': 'text/html; charset=utf8'},
    body: html
  }
}
