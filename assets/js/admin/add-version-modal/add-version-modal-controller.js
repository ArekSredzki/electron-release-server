angular.module('app.admin.add-version-modal', [])
  .controller('AddVersionModalController', ['$scope', '$http', 'DataService', 'Notification', '$uibModalInstance',
    function($scope, $http, DataService, Notification, $uibModalInstance) {
      $scope.DataService = DataService;

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
    }
  ]);
