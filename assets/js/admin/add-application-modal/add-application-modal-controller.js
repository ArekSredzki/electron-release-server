angular.module('app.admin.add-application-modal', ['slugifier'])
  .controller('AddApplicationModalController', ['$scope', '$http', 'DataService', 'Notification', '$uibModalInstance', 'Slug',
      function($scope, $http, DataService, Notification, $uibModalInstance, Slug) {
      $scope.DataService = DataService;

      $scope.application = {
        name: '',
        description: '',
        image: '/images/logo.svg'
      };

      $scope.addApplication = function() {
        $scope.application.name = Slug.slugify($scope.application.description);

        DataService.createApp($scope.application)
          .then(function success(response) {
            $uibModalInstance.close();
          }, function error(response) {});
      };

      $scope.closeModal = function() {
        $uibModalInstance.dismiss();
      };
    }
  ]);
