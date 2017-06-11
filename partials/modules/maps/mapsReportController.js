/**
   * Maps Report Controller
   *
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
(function(){
  'use strict';
  angular.module('ecclesia.maps').controller('mapsAdminCtrl', [
    '$rootScope', '$scope', 'mapsService', 'currentAuth', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$routeParams', '$firebaseObject', '$location', '$mdDialog',
  function ($rootScope, $scope, mapsService, currentAuth, $mdSidenav, $mdBottomSheet, $log, $q, $routeParams, $firebaseObject, $location, $mdDialog) {
    var self = this;
    $scope.$rootScope = $rootScope;
    $rootScope.showSideNav = true;
    $scope.partialTitle = '';
    $scope.fbUrl = 'https://congmap-demo.firebaseio.com/';
    $scope.csvToArray = function() {
      mapsService.csvToArray($scope.csvVal, $scope.fbUrl);
    };
    $scope.myDate = new Date();
  $scope.minDate = new Date(
      $scope.myDate.getFullYear(),
      $scope.myDate.getMonth() - 2,
      $scope.myDate.getDate());
  $scope.maxDate = new Date(
      $scope.myDate.getFullYear(),
      $scope.myDate.getMonth() + 2,
      $scope.myDate.getDate());
  }
]);
})();