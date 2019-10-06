angular.module('app.admin.add-flavor-modal', [])
  .controller('AddFlavorModalController', ['$scope', 'DataService', '$uibModalInstance',
    ($scope, DataService, $uibModalInstance) => {
      $scope.flavor = {
        name: ''
      };

      $scope.addFlavor = () => {
        DataService.createFlavor($scope.flavor)
          .then(
            $uibModalInstance.close,
            () => {}
          );
      };

      $scope.closeModal = $uibModalInstance.dismiss;
    }
  ]);
