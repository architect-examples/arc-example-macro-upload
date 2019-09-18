exports.handler = async function http() {
  return {
    headers: {'content-type': 'text/html; charset=utf8'},
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Architect</title>
</head>
<body class="padding-32">
</body>
upload success
</html>
`
  }
}
