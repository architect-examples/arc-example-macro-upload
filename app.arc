@app
example-s3-upload

@http
get /
get /success
get /images/:file

@macros
architect/macro-upload
