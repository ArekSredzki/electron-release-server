angular.module('app.releases', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/releases/:channel?', {
        templateUrl: 'js/download/download.html',
        controller: 'DownloadController as vm'
      });
  }])
  .controller('DownloadController', [
    '$scope', '$routeParams', '$route', 'PubSub', 'deviceDetector',
    'DataService',
    function(
      $scope, $routeParams, $route, PubSub, deviceDetector, DataService
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
      self.installerFiletypes = DataService.installerFiletypes;
      self.availableChannels = DataService.availableChannels;

      // Get selected channel from route or set to default (stable)
      self.channel = $routeParams.channel || self.setChannelParams(
        self.availableChannels[0]
      );

      self.latestReleases = null;
      self.downloadUrl = null;
      self.versions = [];

      self.getLatestReleases = function() {
        self.setChannelParams(self.channel);
        self.latestReleases = DataService.getLatestReleases(
          self.platform,
          self.archs,
          self.channel
        );
      };

      // Get version assets organized by their platforms.
      self.getVersionsByPlatform = function() {
        self.versions = DataService.getVersionsByPlatform();
      }

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        self.getLatestReleases();
        self.getVersionsByPlatform();
      });

      // Update knowledge of the latest available versions.
      self.getLatestReleases();
      self.getVersionsByPlatform();

      self.download = function(asset, versionName) {
        if (!asset) {
          return;
        }

        self.downloadUrl = '/download/' + (asset.version || versionName) +
          '/' + asset.platform + '/' + asset.name;
      };

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
