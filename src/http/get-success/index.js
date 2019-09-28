exports.handler = async function http(req) {
  console.log(JSON.stringify(req, null, 2))
  return {
    statusCode: 302,
    headers: {
      location: '/staging?uploaded'
    }
  }
}
