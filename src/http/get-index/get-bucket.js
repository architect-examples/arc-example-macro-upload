let aws = require('aws-sdk')

module.exports = async function getBucket() {
  let buckets = await getBuckets()
  return buckets.pics
}

/**
 * @storage macro generates bucket names (per aws cfn best practice)
 * this method returns a map with the names defined in .arc as keys and the generated names as values
 *
 * ```
 * # .arc
 * @storage
 * foo
 * bar
 * ```
 *
 * this method returns something similar to:
 *
 * ```
 * {foo: 'generated-bucket-foo', bar: 'generated-bucket-foo'}
 * ```
 */
async function getBuckets() {
  let bucket = param=> param.Name.split('/')[2] === 'storage'
  let ssm = new aws.SSM
  let Path = `/${process.env.ARC_CLOUDFORMATION}`
  let result = await ssm.getParametersByPath({Path, Recursive:true}).promise()
  return result.Parameters.filter(bucket).reduce((a, b)=> {
    a[b.Name.split('/')[3]] = b.Value
    return a
  }, {})
}
