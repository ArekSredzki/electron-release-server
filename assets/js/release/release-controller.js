angular.module('app.releases', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/releases/:channel?', {
        templateUrl: 'js/release/release.html',
        controller: 'DownloadController as vm'
      })
      .when('/:application/releases/:channel?', {
        templateUrl: 'js/release/release.html',
        controller: 'DownloadController as vm'
      });
  }])
  .controller('DownloadController', [
    '$scope', '$routeParams', '$route', '$location', 'PubSub', 'deviceDetector',
    'DataService',
    function(
      $scope, $routeParams, $route, $location, PubSub, deviceDetector, DataService
    ) {
      var self = this;
      self.showAllVersions = false;

      self.platform = deviceDetector.os;
      if (self.platform === 'mac') {
        self.platform = 'osx';
        self.archs = ['64'];
      } else {
        self.archs = ['32', '64'];
      }

      self.setChannelParams = function(channel) {
        $route.updateParams({
          channel: channel
        });

        return channel;
      };

      self.availablePlatforms = DataService.availablePlatforms;
      self.filetypes = DataService.filetypes;
      self.availableChannels = DataService.availableChannels;

      self.getApplication = function() {
        if ('application' in $routeParams) {
          self.application = _.find(DataService.data, {
            'name': $routeParams.application
          });
        } else {
          self.application = DataService.data[0];
        }

        if (!self.application) {
          $location.path('/');
        }
      };

      self.getApplication();

      // Get selected channel from route or set to default (stable)
      self.channel = $routeParams.channel || self.setChannelParams(
        self.availableChannels[0]
      );

      self.latestReleases = null;
      self.downloadUrl = null;

      self.getLatestReleases = function() {
        self.setChannelParams(self.channel);
        self.latestReleases = DataService.getLatestReleases(
          self.application.name,
          self.platform,
          self.archs,
          self.channel
        );
        self.versions = self.application.versions;
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        if (!self.application) {
          self.getApplication();
        }
        // $scope.$apply(function() {
        if (self.application) {
          self.getLatestReleases();
        }
        // });
      });

      // Update knowledge of the latest available versions.
      if (self.application) {
        self.getLatestReleases();
      }

      self.download = function(asset, versionName) {
        if (!asset) {
          return;
        }

        self.downloadUrl = '/' + self.application.name + '/download/' + (asset.version || versionName) +
          '/' + asset.platform + '/' + asset.name;
        $console.log(self.downloadUrl);
      };

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
