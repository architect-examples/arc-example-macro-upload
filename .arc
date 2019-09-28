@app
node-s3-upload

@http
get /
get /success
get /images/:file

@macros
architect/macro-upload

@aws
bucket begin-east-1
