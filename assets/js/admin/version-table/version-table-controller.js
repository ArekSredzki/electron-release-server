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
      $scope.versions = DataService.data;
      $scope.hasMoreVersions = DataService.hasMore;

      $scope.openEditModal = function(version, versionName) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'js/admin/edit-version-modal/edit-version-modal.html',
          controller: 'EditVersionModalController',
          resolve: {
            version: function() {
              return version;
            }
          }
        });

        modalInstance.result.then(function() {}, function() {});
      };

      $scope.openAddModal = function() {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'js/admin/add-version-modal/add-version-modal.html',
          controller: 'AddVersionModalController'
        });

        modalInstance.result.then(function() {}, function() {});
      };

      $scope.loadMoreVersions = function () {
        DataService.loadMoreVersions();
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        $scope.versions = DataService.data;
        $scope.hasMoreVersions = DataService.hasMore;
      });

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
