exports.handler = async function http(req) {
  // give the background lambda a sec to write the thumb..
  await new Promise(function delay(resolve) {
    console.log(JSON.stringify(req, null, 2))
    setTimeout(resolve, 2000)
  })
  return {
    statusCode: 302,
    headers: {
      location: '/staging?uploaded'
    }
  }
}
