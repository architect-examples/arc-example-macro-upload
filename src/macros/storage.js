module.exports = function storage(arc, cfn) {

  // only run if arc.storage is defined
  if (arc.storage) {

    // create an IAM user for uplaoding
    cfn.Resources.Uploader = {
      Type: 'AWS::IAM::User',
      Properties: {}
    }

    // grand it minimal permissions to upload
    cfn.Resources.StorageMacroMinimalPolicy = {
      Type: 'AWS::IAM::Policy',
      Properties: {
        PolicyName: 'StorageMacroPolicy',
        PolicyDocument: {
          Statement: [{
            Effect: 'Allow',
            Action: [
              's3:PutObject',
              's3:PutObjectAcl'
            ],
            Resource: getBuckets()
          }]
        },
        Users: [{Ref: 'Uploader'}],
      }
    }

    // create a secret key for it
    cfn.Resources.Creds = {
      Type: 'AWS::IAM::AccessKey',
      Properties: {
        UserName: {Ref: 'Uploader'}
      }
    }

    // loop thru all lambdas and add the S3_SECRET and S3_KEY
    Object.keys(cfn.Resources).forEach(resource=> {
      let current = cfn.Resources[resource]
      if (current.Type === 'AWS::Serverless::Function' || current.Type === 'AWS::Lambda::Function') {
        current.Properties.Environment.Variables.S3_KEY = {Ref: 'Creds'}
        current.Properties.Environment.Variables.S3_SECRET = {
          'Fn::GetAtt': ['Creds', 'SecretAccessKey']
        }
      }
    })

    // storage buckets are read/writable by lambdas in the stack
    cfn.Resources.StorageMacroPolicy = {
      Type: 'AWS::IAM::Policy',
      DependsOn: 'Role',
      Properties: {
        PolicyName: 'StorageMacroPolicy',
        PolicyDocument: {
          Statement: [{
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject',
              's3:PutObjectAcl',
              's3:ListBucket'
            ],
            Resource: getBuckets()
          }]
        },
        Roles: [
          {Ref: 'Role'},
        ],
      }
    }

    function getBuckets() {
      return arc.storage.map(bucket=> {
        return [{
          'Fn::Sub': [
            'arn:aws:s3:::${bukkit}',
            {bukkit: {'Ref': `${bucket}Bucket`}}
          ]
        },
        {
          'Fn::Sub': [
            'arn:aws:s3:::${bukkit}/*',
            {bukkit: {'Ref': `${bucket}Bucket`}}
          ]
        }]
      }).reduce((a, b)=> a.concat(b))
    }

    // arc.storage is an array of names for our private buckets
    arc.storage.forEach(bucket=> {

      // resource names
      let Bucket = `${bucket}Bucket`
      let BucketParam = `${bucket}Param`

      cfn.Resources[Bucket] = {
        Type: 'AWS::S3::Bucket',
        DeletionPolicy: 'Delete',
        Properties: {
          CorsConfiguration: {
            CorsRules: [{
							AllowedHeaders: [
								'*'
							],
							AllowedMethods: [
								'GET', 'POST'
							],
							AllowedOrigins: [
								'*'
							],
							MaxAge: '3000'
						}]
          }
        }
      }

      // add name to ssm params for runtime discovery
      cfn.Resources[BucketParam] = {
        Type: 'AWS::SSM::Parameter',
        Properties: {
          Type: 'String',
          Name: {
            'Fn::Sub': [
              '/${AWS::StackName}/storage/${bucket}',
              {bucket}
            ]
          },
          Value: {Ref: Bucket}
        }
      }

    // end arc.storage.forEach
    })

    // ensure the ParameterStorePolicy gets added
    cfn.Resources.ParameterStorePolicy = {
      Type: 'AWS::IAM::Policy',
      DependsOn: 'Role',
      Properties: {
        PolicyName: `ArcParameterStorePolicy`,
        PolicyDocument: {
          Statement: [{
            Effect: 'Allow',
            Action: 'ssm:GetParametersByPath',
            Resource: {
              'Fn::Sub': [
                'arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/${AWS::StackName}',
                {}
              ]
            }
          }]
        },
        Roles: [{'Ref': 'Role'}],
      }
    }

  // end if
  }
  return cfn
}
