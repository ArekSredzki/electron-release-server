angular.module('app.core.auth.logout', [
  ])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/auth/logout', {
        templateUrl: 'js/core/auth/logout/logout.html',
        controller: 'LogoutController',
        data: {
          private: false
        }
      });
  }])
  .controller('LogoutController', ['Notification', 'AuthService', '$location',
    function(Notification, AuthService, $location) {
      AuthService.logout();

      Notification.success({
        message: 'Logout Successful'
      });

      $location.path('/auth/login');
    }
  ]);
