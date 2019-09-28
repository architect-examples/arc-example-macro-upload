let form = require('@architect/macro-upload/form')
let getImages = require('./get-images')

exports.handler = async function http(req) {
  let html
  try {

    let redirect = `https://${req.headers.Host}/staging/success`
    let upload = form({redirect})
    let images = await getImages()
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
      ${images.map(link).join('\n')}
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
