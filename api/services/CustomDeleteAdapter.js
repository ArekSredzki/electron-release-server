var AWS = require('aws-sdk');
var flaverr = require('flaverr');

/** CustomDeleteAdapter
* We are using GC3 bucket that does not support multipleDeletes
* multipleDeletes is used by the skipper-s3 package
* this custom function will use aws-sdk directly so we can delete single assets
* @param  {Dictionary} awsConfig gc3 bucket configurations 
*/

module.exports = function CustomDeleteAdapter(awsConfig) {
  awsConfig = awsConfig || {};
  return {
    remove: function (fd, done) {
      AWSClient(awsConfig)
        .deleteObject(removeKeysFromUndefinedValues({
          Bucket: awsConfig.bucket,
          Key: fd.replace(/^\/+/, '')// « strip leading slashes
        }), (err, result) => {
          if (err) { return done(err); }

          if (result && result['Errors'] && result['Errors'].length > 0) {
            return done(flaverr({ raw: result['Errors'] }, new Error('Failed to remove some file(s) from S3 (see `.raw`)')));
          }

          return done(undefined, result);
        });
    },
  };
};

function removeKeysFromUndefinedValues(dictionary) {
  for (let k in dictionary) {
    if (dictionary[k] === undefined) {
      delete dictionary[k];
    }
  }
  return dictionary;
}

function AWSClient(s3Params) {
  var s3Config = removeKeysFromUndefinedValues({
    apiVersion: '2006-03-01',
    region: s3Params.region,
    accessKeyId: s3Params.key,
    secretAccessKey: s3Params.secret,
    endpoint: s3Params.endpoint
  });
  return new AWS.S3(s3Config);
}

