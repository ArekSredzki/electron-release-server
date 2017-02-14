angular.module('app.admin.edit-application-modal', [])
  .controller('EditApplicationModalController', ['$scope', '$http', 'DataService', 'Notification', '$uibModalInstance', 'application',
      function($scope, $http, DataService, Notification, $uibModalInstance, application) {
      $scope.DataService = DataService;

      $scope.application = _.cloneDeep(application);

      $scope.acceptEdit = function() {
        DataService.updateApp($scope.application, application.name)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.deleteApplication = function() {
        DataService.deleteApp(application.name)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
