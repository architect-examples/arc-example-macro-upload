let form = require('./form')
let getBucket = require('./get-bucket')
let getImages = require('./get-images')

exports.handler = async function http(req) {
  let html
  try {

    let bucket = await getBucket()
    let redirect = `https://${req.headers.Host}/staging/success`
    let upload = await form({bucket, redirect})
    let images = await getImages({bucket})

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
