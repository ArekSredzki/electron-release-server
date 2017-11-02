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
      $scope.hasMoreVersions = DataService.hasMore;

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

      // Get selected channel from route or set to default (stable)
      self.channel = $routeParams.channel || self.setChannelParams(
        self.availableChannels[0]
      );

      self.latestReleases = null;
      self.downloadUrl = null;

      self.getLatestReleases = function() {
        self.setChannelParams(self.channel);
        self.latestReleases = DataService.getLatestReleases(
          self.platform,
          self.archs,
          self.channel
        );
        self.versions = DataService.data;
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        self.getLatestReleases();
        self.availableChannels = DataService.availableChannels;
        $scope.hasMoreVersions = DataService.hasMore;
      });

      // Update knowledge of the latest available versions.
      self.getLatestReleases();

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

      $scope.loadMoreVersions = function () {
        DataService.loadMoreVersions();
      };
    }
  ]);
