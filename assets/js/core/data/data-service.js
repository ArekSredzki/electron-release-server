angular.module('app.core.data.service', [
    'ngSails'
  ])
  .service('DataService', [
    '$sails', '$q', '$log', '$http', 'Notification', 'Upload', 'PubSub',
    'AuthService',
    function(
      $sails, $q, $log, $http, Notification, Upload, PubSub,
      AuthService
    ) {
      var self = this;

      /**
       * Main Data object, containing all of the version objects and their
       * nested assets
       * @type {array}
       */
      self.data = [];

      var UNKNOWN_ERROR_MESSAGE = 'An Unkown Error Occurred.';

      /**
       * A relation between valid platforms & their pretty names
       * @type {Array}
       */
      self.availablePlatforms = {
        windows_64: 'Windows 64 bit',
        windows_32: 'Windows 32 bit',
        osx_64: 'OS X 64 bit',
        linux_64: 'Linux 64 bit',
        linux_32: 'Linux 32 bit'
      };

      self.filetypes = {
        windows_64: ['.exe', '.msi'],
        windows_32: ['.exe', '.msi'],
        osx_64: ['.dmg', '.pkg', '.mas'],
        linux_64: ['.deb', '.gz', '.rpm', '.AppImage'],
        linux_32: ['.deb', '.gz', '.rpm', '.AppImage']
      };

      /**
       * Compare version objects using semantic versioning.
       * Pass to Array.sort for a descending array
       * @param  {Object} v1 Version object one
       * @param  {Object} v2 Version object two
       * @return {-1|0|1}    Whether one is is less than or greater
       */
      self.compareVersion = function(v1, v2) {
        return -compareVersions(v1.name, v2.name);
      };

      /**
       * Sort version data in descending order
       */
      self.sortVersions = function() {
        self.data.sort(self.compareVersion);
      };

      /**
       * Shows an appropriate error notification method for every invalid
       * attribute.
       * @param  {Object} response A response object returned by sails after a
       *                           erroneous blueprint request.
       */
      var showAttributeWarnings = function(response) {
        if (!_.has(response, 'data.invalidAttributes')) {
          return;
        }

        _.forEach(response.data.invalidAttributes,
          function(attribute, attributeName) {
            warningMessage = '';

            _.forEach(attribute, function(attributeError) {
              warningMessage += (attributeError.message || '') + '<br />';
            });

            Notification.warning({
              title: 'Invalid attribute: ' + attributeName,
              message: warningMessage
            });
          });
      };

      /**
       * Shows notifications detailing the various errors described by the
       * response object
       * @param  {Object} response   A response object returned by sails after a
       *                             erroneous request.
       * @param  {String} errorTitle The string to be used as a title for the
       *                             main error notification.
       */
      var showErrors = function(response, errorTitle) {
        if (!response) {
          return Notification.error({
            title: errorTitle,
            message: UNKNOWN_ERROR_MESSAGE
          });
        }

        Notification.error({
          title: errorTitle,
          message: response.summary || UNKNOWN_ERROR_MESSAGE
        });

        showAttributeWarnings(response);
      };

      /**
       * Creates a version using the api.
       * Requires authentication (token is auto-injected).
       * @param  {Object}  version     A object containing all of the parameters
       *                               we would like to create the version with.
       * @return {Promise}             A promise which is resolve/rejected as
       *                               soon as we know the result of the operation
       *                               Contains the response object.
       */
      self.createVersion = function(version) {
        if (!version) {
          throw new Error('A version object is required for creation');
        }

        return $http.post('/api/version', version)
          .then(function(response) {
            Notification.success('Version Created Successfully.');

            return response;
          }, function(response) {

            var errorTitle = 'Unable to Create Version';

            showErrors(response, errorTitle);

            return $q.reject(response);
          });
      };

      /**
       * Updates a version using the api.
       * Requires authentication (token is auto-injected).
       * @param  {Object}  version     A object containing all of the parameters
       *                               we would like to update the version with.
       * @param  {String}  versionName The version's original name (in case we
       *                               are trying to change it)
       * @return {Promise}             A promise which is resolve/rejected as
       *                               soon as we know the result of the operation
       *                               Contains the response object.
       */
      self.updateVersion = function(version, versionName) {
        if (!version) {
          throw new Error('A version object is required for updating');
        }
        if (!versionName) {
          throw new Error('A version name is required for updating');
        }

        return $http.post(
            '/api/version/' + versionName,
            _.omit(version, ['assets'])
          )
          .then(function(response) {
            Notification.success('Version Updated Successfully.');

            return response;
          }, function(response) {
            var errorTitle = 'Unable to Update Version';

            showErrors(response, errorTitle);

            return $q.reject(response);
          });
      };

      /**
       * Deletes a version using the api.
       * Requires authentication (token is auto-injected).
       * @param  {Object}  versionName The name of the version that we would
       *                               like to delete.
       * @return {Promise}             A promise which is resolve/rejected as
       *                               soon as we know the result of the operation
       *                               Contains the response object.
       */
      self.deleteVersion = function(versionName) {
        if (!versionName) {
          throw new Error('A version name is required for deletion');
        }

        return $http.delete('/api/version/' + versionName)
          .then(function success(response) {
            Notification.success('Version Deleted Successfully.');

            return response;
          }, function error(response) {
            var errorTitle = 'Unable to Delete Version';

            showErrors(response, errorTitle);

            return $q.reject(response);
          });
      };

      /**
       * Normalize the version object returned by sails over SocketIO.
       * Note: Sails will not populate related models on update
       * Specifically:
       *  - The channel parameter will sometimes only contain the channel name.
       *  - The assets parameter will not be included if empty.
       * @param  {Object} version Unnormalized version object
       * @return {Object}         Normalized version object
       */
      var normalizeVersion = function(version) {
        if (!version) {
          return;
        }

        if (_.isString(version.channel)) {
          version.channel = {
            name: version.channel
          };
        }

        if (!_.isArrayLike(version.assets)) {
          version.assets = [];
        }

        return version;
      };

      // Process new versions/modified pushed from the server over SocketIO
      $sails.on('version', function(msg) {
        if (!msg) {
          return;
        }

        version = normalizeVersion(msg.data);

        var index;
        var notificationMessage = (version || {}).name || '';

        if (msg.verb === 'created') {

          self.data.unshift(version);
          self.sortVersions();

          $log.log('Sails sent a new version.');

          Notification({
            title: 'New Version Available',
            message: notificationMessage
          });

        } else if (msg.verb === 'updated') {
          Notification({
            title: 'Version Updated',
            message: notificationMessage
          });

          index = _.findIndex(self.data, {
            'name': msg.id // Sails sends back the old id (name) for us
          });

          if (index > -1) {
            if (!version.assets || !version.assets.length) {
              version.assets = self.data[index].assets;
            }
            self.data[index] = version;
          }

          $log.log('Sails updated a version.');
        } else if (msg.verb === 'destroyed') {

          index = _.findIndex(self.data, {
            'name': msg.id
          });

          if (index > -1) {
            self.data.splice(index, 1);
          }

          Notification({
            title: 'Version Deleted',
            message: msg.id
          });

          $log.log('Sails removed a version.');
        }

        PubSub.publish('data-change');
      });

      /**
       * Creates a asset using the api, this handles the file upload, as part of
       * the process.
       * Requires authentication (token is auto-injected).
       * @param  {Object}  asset       A object containing all of the parameters
       *                               we would like to create the asset with.
       * @param  {Object}  versionName The name of the version that we would
       *                               like to add this asset to.
       * @return {Promise}             A promise which is resolve/rejected as
       *                               soon as we know the result of the operation
       *                               Contains the response object.
       */
      self.createAsset = function(asset, versionName) {
        if (!asset) {
          throw new Error('A asset object is required for creation');
        }
        if (!versionName) {
          throw new Error('A version name is required for creation');
        }

        var deferred = $q.defer();

        asset.upload = Upload.upload({
          url: '/api/asset',
          data: _.merge({
            token: AuthService.getToken(),
            version: versionName
          }, asset)
        });

        asset.upload.then(function success(response) {
          // Resolve the promise immediately as we already know it succeeded
          deferred.resolve(response);

          Notification.success({
            message: 'Asset Created Successfully.'
          });
        }, function error(response) {
          // Reject the promise immediately as we already know it failed
          deferred.reject(response);

          var errorTitle = 'Unable to Create Asset';

          showErrors(response, errorTitle);
        }, function progress(evt) {
          // Math.min is to fix IE which reports 200% sometimes
          asset.file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });

        return deferred.promise;
      };

      /**
       * Updates a asset using the api.
       * Requires authentication (token is auto-injected).
       * @param  {Object}  asset A object containing all of the parameters we
       *                         would like to update this asset with.
       *                         Updating the asset's name is not an issue like
       *                         with Versions, because assets are identified in
       *                         the database by their id.
       * @return {Promise}       A promise which is resolve/rejected as soon as
       *                         we know the result of the operation
       *                         Contains the response object.
       */
      self.updateAsset = function(asset) {
        if (!asset) {
          throw new Error('A asset object is required for updating');
        }
        if (!asset.name) {
          throw new Error('The passed asset object must have been submitted to the database in order to be updated');
        }

        return $http.post('/api/asset/' + asset.name, asset)
          .then(function(response) {
            Notification.success('Asset Updated Successfully.');

            return response;
          }, function(response) {
            var errorTitle = 'Unable to Update Asset';

            showErrors(response, errorTitle);

            return $q.reject(response);
          });
      };

      /**
       * Deletes an asset using the api.
       * Requires authentication (token is auto-injected).
       * @param  {Object}  name The name of the asset that we would like to
       *                        delete.
       * @return {Promise}      A promise which is resolve/rejected as soon
       *                        as we know the result of the operation
       *                        Contains the response object.
       */
      self.deleteAsset = function(name) {
        if (!name) {
          throw new Error('A asset name is required for deletion');
        }

        return $http.delete('/api/asset/' + name)
          .then(function success(response) {
            Notification.success('Asset Deleted Successfully.');

            return response;
          }, function error(response) {
            var errorTitle = 'Unable to Delete Asset';

            showErrors(response, errorTitle);

            return $q.reject(response);
          });
      };

      /**
       * Normalize the asset object returned by sails over SocketIO.
       * Note: Sails will not populate related models on update
       * Specifically:
       *  - The version parameter will sometimes only contain the version name.
       * @param  {Object} asset Unnormalized asset object
       * @return {Object}       Normalized asset object
       */
      var normalizeAsset = function(asset) {
        if (!asset) {
          return;
        }

        if (_.isString(asset.version)) {
          asset.version = {
            name: asset.version
          };
        }

        return asset;
      };

      // Process new asset/modified pushed from the server over SocketIO
      $sails.on('asset', function(msg) {
        if (!msg) {
          return;
        }
        $log.log('Asset Received', msg);

        asset = normalizeAsset(msg.data);

        if (!asset && msg.verb !== 'destroyed') {
          $log.log('No asset provided with message. Reloading data.');
          return self.initialize();
        }

        var notificationMessage = (asset || {}).name || '';

        var versionIndex, index;

        if (msg.verb === 'created') {
          versionIndex = _.findIndex(self.data, {
            name: asset.version.name // Sails sends the version
          });

          if (versionIndex === -1) {
            // Our version of the database is out of sync from the remote, re-init
            $log.log('Data out of sync, reloading.');
            return self.initialize();
          }

          self.data[versionIndex].assets.unshift(asset);

          Notification({
            title: 'New Asset Available',
            message: notificationMessage
          });

          $log.log('Sails sent a new asset.');

        } else if (msg.verb === 'updated') {

          versionIndex = _.findIndex(self.data, function(version) {
            index = _.findIndex(version.assets, {
              name: msg.id // Sails sends back the old id for us
            });

            return index !== -1;
          });

          if (versionIndex === -1 || index === -1) {
            // Our version of the database is out of sync from the remote, re-init
            $log.log('Data out of sync, reloading.');
            return self.initialize();
          }

          self.data[versionIndex].assets[index] = asset;

          Notification({
            title: 'Asset Updated',
            message: notificationMessage
          });

          $log.log('Sails updated an asset.');

        } else if (msg.verb === 'destroyed') {

          versionIndex = _.findIndex(self.data, function(version) {
            $log.log('Searching Version:', version);
            index = _.findIndex(version.assets, {
              name: msg.id // Sails sends back the old id for us
            });
            $log.log('result:', index);

            return index !== -1;
          });

          if (versionIndex === -1 || index === -1) {
            // Our version of the database is out of sync from remote, re-init
            $log.log('Data out of sync, reloading.');
            return self.initialize();
          }


          if (index > -1) {
            self.data[versionIndex].assets.splice(index, 1);
          }

          Notification({
            title: 'Asset Deleted',
            message: msg.previous.name || ''
          });

          $log.log('Sails removed an asset.');
        }

        PubSub.publish('data-change');
      });

      /**
       * Retrieve & subscribe to all version, channels & asset data.
       * @return {Promise} Resolved once data has been retrieved
       */
      self.initialize = function() {
        self.currentPage = 0;
        self.loading = true;
        self.hasMore = false;

        return Promise.all([
            // Get the initial set of releases from the server.
            // XXX This will also subscribe us to future changes regarding releases
            $sails.get('/versions/sorted', {
              page: self.currentPage
            }),

            // Get available channels
            $sails.get('/api/channel'),

            // Only sent to watch for asset updates
            $sails.get('/api/asset')
          ])
          .then(function(responses) {
            versions = responses[0];
            channels = responses[1];
            self.data = versions.data.items;
            self.availableChannels = channels.data.map(function(channel) {
              return channel.name;
            });

            self.currentPage++;
            self.hasMore = versions.data.total > self.data.length;
            self.loading = false;
            PubSub.publish('data-change');

            $log.log('Should be subscribed!');
          });
      };

      self.loadMoreVersions = function() {
        if (self.loading) {
          return;
        }

        self.loading = true;

        return $sails.get('/versions/sorted', {
          page: self.currentPage
        })
        .then(function(versions) {
          self.data = self.data.concat(versions.data.items);

          self.currentPage++;
          self.hasMore = versions.data.total > self.data.length;
          self.loading = false;
          PubSub.publish('data-change');
        });
      };

      /**
       * Returns information about the latest release available for a given
       * platform + architecture and channel.
       * @param  {String} platform Target platform (osx, windows, linux)
       * @param  {Array}  archs    Target architectures ('32', '64')
       * @param  {String} channel  Target release channel
       * @return {Object}          Latest release data object
       */
      self.getLatestReleases = function(platform, archs, channel) {
        if (!self.availableChannels) {
          return;
        }

        var channelIndex = self.availableChannels.indexOf(channel);

        if (channelIndex === -1) {
          return;
        }

        var applicableChannels = self.availableChannels.slice(
          0,
          channelIndex + 1
        );

        var versions = _
          .chain(self.data)
          .filter(function(version) {
            var versionChannel = _.get(version, 'channel.name');
            return applicableChannels.indexOf(versionChannel) !== -1;
          })
          .value();

        var latestReleases = {};

        _.forEach(archs, function(arch) {
          var platformName = platform + '_' + arch;

          var filetypes = self.filetypes[platformName];

          if (!filetypes) {
            return;
          }
          _.forEach(versions, function(version) {
            _.forEach(version.assets, function(asset) {
              if (
                asset.platform === platformName &&
                filetypes.includes(asset.filetype)
              ) {
                var matchedAsset = _.clone(asset);
                matchedAsset.version = version.name;
                matchedAsset.notes = version.notes;
                matchedAsset.channel = _.get(version, 'channel.name');
                latestReleases[arch] = matchedAsset;

                return false;
              }
            });

            if (latestReleases[arch]) {
              return false;
            }
          });
        });

        // If no archs matched, return undefined
        if (_.size(latestReleases) === 0) {
          return;
        }

        return latestReleases;
      };
    }
  ]);
