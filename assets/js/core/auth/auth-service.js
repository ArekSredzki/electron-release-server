angular.module('app.core.auth.service', [
    'ngStorage'
  ])
  .service('AuthService', ['$rootScope', 'AUTH_EVENTS', '$http', '$localStorage', '$q', 'jwtHelper',
    function($rootScope, AUTH_EVENTS, $http, $localStorage, $q, jwtHelper) {
      var self = this;

      self.getToken = function() {
        return $localStorage.token;
      };

      self.login = function(credentials) {
        var defer = $q.defer();
        $http
          .post('/api/auth/login', credentials)
          .then(function(res) {
            if (!res.data || !_.isString(res.data.token)) {
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
              return defer.reject({
                data: 'Expected a token in server response.'
              });
            }

            var tokenContents = jwtHelper.decodeToken(res.data.token);
            if (!_.isObjectLike(tokenContents)) {
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
              return defer.reject({
                data: 'Invalid token received.'
              });
            }

            $localStorage.token = res.data.token;
            $localStorage.tokenContents = tokenContents;
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            defer.resolve(true);
          }, function(err) {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            defer.reject(err);
          });

        return defer.promise;
      };

      self.isAuthenticated = function() {
        var token = $localStorage.tokenContents;

        return (_.isObjectLike(token) && _.has(token, 'sub'));
      };

      self.logout = function() {
        delete $localStorage.token;
        delete $localStorage.tokenContents;
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
      };
    }
  ]);
