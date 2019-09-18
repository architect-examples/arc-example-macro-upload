@app
node-s3-upload

@http
get /
get /success
get /images/:file

@macros
storage

@storage
pics

@aws
bucket begin-east-1
