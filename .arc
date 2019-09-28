@app
node-s3-upload

@http
get /
get /success
get /images/:file

@macros
upload

@aws
bucket begin-east-1
