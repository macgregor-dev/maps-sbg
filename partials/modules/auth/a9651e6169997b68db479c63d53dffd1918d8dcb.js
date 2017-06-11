(function(){
  'use strict';

  // Prepare the 'auth' module for subsequent registration of controllers and delegates
  angular.module('ecclesia.auth', [ 'ngMaterial' ])
  .factory("Auth", ["$firebaseAuth",
    function($firebaseAuth) {
      var ref = new Firebase("https://congmap-demo.firebaseio.com");
      return $firebaseAuth(ref);
    }
   ])
  .controller('authCtrl', [
    '$rootScope', '$scope', 'Auth', '$mdSidenav', '$location', '$mdBottomSheet', '$log', '$q', '$firebaseObject', '$firebaseArray','$routeParams', 'mapsService', function($rootScope, $scope, Auth, $mdSidenav, $location, $mdBottomSheet, $log, $q, $firebaseObject, $firebaseArray, $routeParams, mapsService) {
      var self = this;
      $scope.$rootScope = $rootScope;
      $rootScope.showSideNav = false;
      $scope.justRego = false;
      $scope.isPending = false;
      $scope.isMaint = false;
      $scope.fbUsersUrl = "https://congmap-demo.firebaseio.com/users/";
      $scope.$routeParams = $routeParams;
      $scope.isResettingPwd = false;

//      mapsService.isActive(function(isActive){
//        $scope.isMaint = !isActive;
//      });
      // ---------------------------------------------------------------
      // ---------------------------------------------------------------
      $scope.loginUser = function() {
        if ($scope.isPending) {
          $log.info("Login cancelled, already in progress.");
          return;
        }
        $scope.loginFrm.$error.invaliduser = false;
        $scope.isPending = true;
        if ($scope.loginFrm.username.$invalid===true || $scope.loginFrm.pw.$invalid===true ) {
          $scope.isPending = false;
          return;
        }
        Auth.$authWithPassword({email:$scope.email, password:$scope.pwd}).then(function(authData) {
          $scope.isPending = false;
          if (authData.password.isTemporaryPassword) {
            $location.path("/user/update");
          } else {
            $log.debug("Auth ok, redir to:" + $rootScope.getLandingPage());
            $location.path($rootScope.getLandingPage());
          }
        }).catch(function(authErr){
          $scope.isPending = false;
          $log.debug(authErr);
          switch (authErr.code) {
              case "INVALID_USER":
              case "INVALID_EMAIL":
              case "INVALID_PASSWORD":
                $scope.loginFrm.$error.invaliduser = true;
                break;
          }
        });
      };
      // ---------------------------------------------------------------
      $scope.setPwd = function() {
        if ($scope.isPending) {
          $log.info("Password change cancelled, already in progress.");
          return;
        }
        $scope.resetPwdFrm.$error.failchange = false;
        $scope.resetPwdFrm.$error.pwdmismatch = false;
        $scope.isPending = true;
        if ($scope.newpwd != $scope.confpwd) {
          $scope.isPending = false;
          $scope.resetPwdFrm.$error.pwdmismatch = true;
          return;
        }
        Auth.$changePassword({email:Auth.$getAuth().password.email, oldPassword: $scope.oldpwd, newPassword: $scope.newpwd})
        .then(function(){
          $scope.isPending = false;
          $location.path($rootScope.getLandingPage());
        }).catch(function(error){
          $log.error(error);
          $scope.resetPwdFrm.$error.failchange = true;
          $scope.isPending = false;
        });
      };
      // ---------------------------------------------------------------
      // ---------------------------------------------------------------
      /**
      * TODO: validate form, if existing email, captcha
      */
      $scope.registerUser = function() {
        $scope.isPending = true;
        var pw = ''+Math.random();
        var authRef = new Firebase($scope.fbUsersUrl);
        authRef.createUser({email:$scope.email, password:pw}, function(createErr, userInfo) {
          if (createErr) {
            $log.error(createErr);
          } else {
            $log.debug('Creating user...');
            var userRef = new Firebase($scope.fbUsersUrl + userInfo.uid);
            userRef.authWithPassword({email:$scope.email, password: pw}, function(authErr, authData) {
              if (authErr) {
                $log.error(authErr);
              } else {
                userRef.set({email:$scope.email, status:0, id: userInfo.uid}, function(saveErr) {
                  if (saveErr) {
                    $log.error(saveErr);
                  } else {
                    // TODO: add to list of users
                    userRef.unauth();
                    userRef.resetPassword({email:$scope.email}, function(resetErr){
                      if (resetErr) {
                        $log.error(resetErr);
                      } else {
                        $scope.justRego = true;
                        $scope.isPending = false;
                        $scope.$apply();
                        $log.info("Validating email started...");
                      }
                    });
                  }
                });
              }
            });
          }
        });
      };
      // Set form logic based on route
      switch ($routeParams.action) {
          case 'update':
            $scope.isResettingPwd = true;
            $rootScope.showSideNav = true;
            break;
          case 'logout':
            mapsService.clearCache();
            Auth.$unauth();
            $rootScope.partialTitle = '';
            $location.path("/auth/login");
            break;
      }
    } // End of AuthCtrl
  ])
  .service('authService', [
            '$q','$firebaseObject', '$firebaseArray',
   function ($q, $firebaseObject, $firebaseArray ) {
     var self = this;

     self.fbUsersUrl = "https://congmap-demo.firebaseio.com/users/";

     self.roles = {
       user:1,
       updater:2,
       admin:4
     };

     // ---------------------------------------------------------------
     self.loadUser = function() {
       if (!self.userData) {
          self.userData = $firebaseObject(new Firebase(self.fbUsersUrl+self.currentAuth.uid));
       }
       return self.userData;
     };
     // ---------------------------------------------------------------
     self.getUserInfoMin = function() {
      self.userInfoMin = {id:self.currentAuth.uid, name: self.userData.name};
      return self.userInfoMin;
     };
     // ---------------------------------------------------------------
     self.whenUserLoaded = function(cb) {
       self.userData.$loaded().then(function() {
         cb();
        }).catch(function(err) {
         console.error(err);
         $location.path('/auth/logout');
       });
     };
     // ---------------------------------------------------------------
     self.isAdmin = function(cb) {
       self.whenUserLoaded(function() {
         cb(self.isRole(self.userData.access, self.roles.admin));
       });
     };
     // ---------------------------------------------------------------
     self.isUser = function(cb) {
       self.whenUserLoaded(function() {
         cb(self.isRole(self.userData.access, self.roles.user));
       });
     };
     // ---------------------------------------------------------------
     self.isUpdater = function(cb) {
       self.whenUserLoaded(function() {
         cb(self.isRole(self.userData.access, self.roles.updater));
       });
     };
     // ---------------------------------------------------------------
     self.isRole = function(access, role) {
       return (access & role) === role;
     };
     // ---------------------------------------------------------------
   }]);

})();