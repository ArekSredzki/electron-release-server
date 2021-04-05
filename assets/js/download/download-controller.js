angular.module('app.releases', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/releases/:channel?/:flavor?', {
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
        self.archs = ['64', 'arm64'];
      } else {
        self.archs = ['32', '64'];
      }

      self.setRouteParams = (channel, flavor) => {
        $route.updateParams({
          channel,
          flavor
        });
      };

      self.availablePlatforms = DataService.availablePlatforms;
      self.filetypes = DataService.filetypes;
      self.availableChannels = DataService.availableChannels;
      self.availableFlavors = DataService.availableFlavors;

      // Get selected channel from route or set to default (stable)
      self.channel = $routeParams.channel || (self.availableChannels && self.availableChannels[0]) || 'stable';

      // Get selected flavor from route or set to default (default)
      self.flavor = $routeParams.flavor || 'default';

      self.latestReleases = null;
      self.downloadUrl = null;

      self.getLatestReleases = function() {
        self.setRouteParams(
          self.channel,
          self.flavor
        );
        self.latestReleases = DataService.getLatestReleases(
          self.platform,
          self.archs,
          self.channel,
          self.flavor
        );
        self.versions = DataService.data
          .filter(DataService.checkAvailability)
          .filter(version => version.flavor.name === self.flavor);
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        self.getLatestReleases();
        self.availableChannels = DataService.availableChannels;
        self.availableFlavors = DataService.availableFlavors;
        $scope.hasMoreVersions = DataService.hasMore;
      });

      // Update knowledge of the latest available versions.
      self.getLatestReleases();

      self.download = function(asset, versionName, flavorName) {
        if (!asset) {
          return;
        }

        const { flavor, version, platform, name } = asset;

        self.downloadUrl =
          `/download/flavor/${flavorName || flavor}/${versionName || version}/${platform}/${name}`;
      };

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });

      $scope.loadMoreVersions = function () {
        DataService.loadMoreVersions();
      };
    }
  ]);
