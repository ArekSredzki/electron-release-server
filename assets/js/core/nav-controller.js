angular.module('app.core.nav', [])
  .controller('NavController', ['$scope', 'Session', function($scope, Session) {
    $scope.Session = Session;
    $scope.shouldHideNavMobile = true;
    $scope.toggleNavMobile = function() {
      $scope.shouldHideNavMobile = !$scope.shouldHideNavMobile;
    };
    $scope.hideNavMobile = function() {
      $scope.shouldHideNavMobile = true;
    };
  }]);
