angular.module('app.admin.version-table', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/admin', {
        templateUrl: 'js/admin/version-table/version-table.html',
        controller: 'AdminVersionTableController',
        data: {
          private: true
        }
      });
  }])
  .controller('AdminVersionTableController', ['$scope', 'Notification', 'DataService','$uibModal', 'PubSub',
    function($scope, Notification, DataService, $uibModal, PubSub) {
      $scope.flavor = 'all';
      $scope.showAllFlavors = true;
      $scope.availableFlavors = DataService.availableFlavors && ['all', ...DataService.availableFlavors];

      $scope.versions = DataService.data;
      $scope.hasMoreVersions = DataService.hasMore;

      $scope.filterVersionsByFlavor = () => {
        $scope.showAllFlavors = $scope.flavor === 'all';
        $scope.versions = $scope.showAllFlavors
          ? DataService.data
          : DataService.data.filter(version => version.flavor.name === $scope.flavor);
      };

      $scope.openEditModal = version => {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'js/admin/edit-version-modal/edit-version-modal.html',
          controller: 'EditVersionModalController',
          resolve: {
            version: () => version
          }
        });

        modalInstance.result.then(function() {}, function() {});
      };

      $scope.openAddVersionModal = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'js/admin/add-version-modal/add-version-modal.html',
          controller: 'AddVersionModalController'
        });

        modalInstance.result.then(function() {}, function() {});
      };

      $scope.openAddFlavorModal = () => {
        const modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'js/admin/add-flavor-modal/add-flavor-modal.html',
          controller: 'AddFlavorModalController'
        });

        modalInstance.result.then(() => {}, () => {});
      };

      $scope.loadMoreVersions = function () {
        DataService.loadMoreVersions();
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        $scope.filterVersionsByFlavor();
        $scope.hasMoreVersions = DataService.hasMore;
        $scope.availableFlavors = DataService.availableFlavors && ['all', ...DataService.availableFlavors];
      });

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
