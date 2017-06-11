(function(){
  'use strict';

  angular.module('mainApp.sample')
         .service('sampleService', ['$q', '$firebaseObject', '$firebaseArray', SampleService]);

  /**
   * Sample Service
   * @returns {{loadAll: Function}}
   * @constructor
   */
  function SampleService($q, $firebaseObject, $firebaseArray){
  }

})();
