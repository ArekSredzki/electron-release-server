angular.module('app.admin.add-version-modal', [])
  .controller('AddVersionModalController', ['$scope', '$http', 'DataService', 'Notification', '$uibModalInstance', 'PubSub',
    function($scope, $http, DataService, Notification, $uibModalInstance, PubSub) {
      $scope.availableChannels = DataService.availableChannels;

      $scope.version = {
        name: '',
        notes: '',
        channel: {
          name: DataService.availableChannels[0]
        }
      };

      $scope.addVersion = function() {
        DataService.createVersion($scope.version)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };

      // Watch for changes to data content and update local data accordingly.
      var uid1 = PubSub.subscribe('data-change', function() {
        $scope.availableChannels = DataService.availableChannels;

        $scope.version = {
          name: '',
          notes: '',
          channel: {
            name: DataService.availableChannels[0]
          }
        };
      });

      $scope.$on('$destroy', function() {
        PubSub.unsubscribe(uid1);
      });
    }
  ]);
