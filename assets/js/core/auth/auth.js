angular.module('app.core.auth', [
    'app.core.auth.service',
    'app.core.auth.login',
    'app.core.auth.logout',
    'angular-jwt'
  ]).constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  .directive('authToolbar', function() {
    return {
      restrict: 'E',
      templateUrl: '/templates/auth-toolbar.html'
    };
  })
  .config(['$httpProvider', 'jwtInterceptorProvider',
    function($httpProvider, jwtInterceptorProvider) {
      // Please note we're annotating the function so that the $injector works when the file is minified
      jwtInterceptorProvider.tokenGetter = ['AuthService', function(AuthService) {
        return AuthService.getToken();
      }];

      $httpProvider.interceptors.push('jwtInterceptor');
    }
  ])
  .run(['$rootScope', 'AUTH_EVENTS', 'AuthService', 'Notification', '$location',
    function($rootScope, AUTH_EVENTS, AuthService, Notification, $location) {
      $rootScope.$on('$routeChangeStart', function(event, next) {
        // Consider whether to redirect the request if it is unauthorized
        if (
          next.data &&
          next.data.private
        ) {
          if (!AuthService.isAuthenticated()) {
            console.log('Unauthorized request, redirecting...');
            event.preventDefault();
            // User is not logged in
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);

            Notification.error({
              title: 'Unauthorized',
              message: 'Please login'
            });

            // Redirect the user to the login page
            $location.path('/auth/login');
          }
        }
      });
    }
  ]);
