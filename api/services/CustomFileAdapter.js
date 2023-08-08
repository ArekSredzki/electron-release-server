var AWS = require('aws-sdk');
var flaverr = require('flaverr');

/**
 * CustomFileAdapter using revealing module pattern 
 * This was built so that we could handle custom functionality with GCP bucket
 * @returns {Dictionary}
 *         @property {Function} getSignedURL
 *         @property {Function} remove
 */

module.exports = function CustomFileAdapter() {
  return {
    /** getSignedURL
      * Get a url passed back to the frontend instead of feeding direct bytes
      * the reasoning for this is to cut egress costs when downloading an asset from GCP
    */
    getSignedURL: function (fd) {
      const signedUrl = S3Client.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET,
        Key: fd.replace(/^\/+/, ''),// « strip leading slashes
      });
      return signedUrl;
    },

    /** remove
      * We are using GC3 bucket that does not support multipleDeletes
      * multipleDeletes is used by the skipper-s3 package
      * this custom function will use aws-sdk directly so we can delete single assets
    */

    remove: function (fd, done) {
      S3Client
        .deleteObject(removeKeysFromUndefinedValues({
          Bucket: process.env.S3_BUCKET,
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
}();

function removeKeysFromUndefinedValues(dictionary) {
  for (let k in dictionary) {
    if (dictionary[k] === undefined) {
      delete dictionary[k];
    }
  }
  return dictionary;
}

const S3Client = new AWS.S3(removeKeysFromUndefinedValues({
  apiVersion: '2006-03-01',
  region: process.env.S3_REGION || undefined,
  accessKeyId: process.env.S3_API_KEY,
  secretAccessKey: process.env.S3_API_SECRET,
  endpoint: process.env.S3_ENDPOINT || undefined
}));