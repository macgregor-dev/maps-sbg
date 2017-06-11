/**
   * Maps Service
   *
   * Uses embedded, hard-coded data model; acts asynchronously to simulate
   * remote data service call(s).
   *
   * @returns {{loadAll: Function}}
   * @constructor
   */
(function(){
  'use strict';

  angular.module('ecclesia.maps')
  .service('mapsService', [
            '$q','$firebaseObject', '$firebaseArray', '$log', 'authService', '$filter',
   function ($q, $firebaseObject, $firebaseArray, $log, authService, $filter) {
     var self = this;
     self.fbMapsUrl = "<%- @moduleConfig.maps.fireBase.baseUrl + @moduleConfig.maps.fireBase.mapsUriPart%>";
     self.fbAddressUrl = "<%- @moduleConfig.maps.fireBase.baseUrl +  @moduleConfig.maps.fireBase.addressUriPart%>";
     self.fbAssgnUrl = "<%- @moduleConfig.maps.fireBase.baseUrl +  @moduleConfig.maps.fireBase.assignedMapUriPart %>";
     self.fbActiveMapsUrl = "<%- @moduleConfig.maps.fireBase.baseUrl +  @moduleConfig.maps.fireBase.activeMapsUriPart %>";
     self.fbFsgUrl = "<%- @moduleConfig.maps.fireBase.baseUrl +  @moduleConfig.maps.fireBase.fsgUriPart %>";
     self.fbUsersUrl = "<%- @moduleConfig.auth.fireBase.usersUrl %>";
     self.fbStatusUrl = "<%- @moduleConfig.maps.fireBase.baseUrl @moduleConfig.maps.fireBase.statusUriPart %>";
     
     self.mapCache = self.userData = self.currentAuth;
     
     // Data...
     self.statuses = [{
        code:0,
        description:'Not Done'
      }, {
        code:1,
        description:'Done'
      },{
        code:2,
        description:'Drop'
      },{
        code:3,
        description:'NH-1'
      }, {
        code:4,
        description:'NH-2'
      },{
        code:5,
        description:'DNC'
      },
// removed due to confusion of 'Not English'
//                      {
//        code:6,
//        description:"NE"
//      },
      {
        code:7,
        description:"PW"
      }];
     
     self.dropStatuses = [
       self.statuses[2].code,
       self.statuses[5].code,
       self.statuses[6].code
     ];
     // ---------------------------------------------------------------
     // method definitions..
     // ---------------------------------------------------------------
     self.getMap = function(mapId, cb) {
      if (!self.mapCache) 
        self.mapCache = {};
      if (!mapCache[mapId]) {
        self.mapCache[mapId] = $firebaseObject(new Firebase(self.fbMapsUrl + mapId));
        self.mapCache[mapId].$loaded().then(function(){
          cb(mapId, self.mapCache[mapId]);
        });
      } else {
        cb(mapId, self.mapCache[mapId]);
      }
     };
     // ---------------------------------------------------------------
     self.loadAssignedMap = function(mapId, cb) {
      self.getMap(mapId, function(mapId, mapData) {
        self.mapObj = {mapId: mapId, mapData: mapData};
        self.fbMap = mapData;
        self.mapObj.addresses = [];
        self.mapObj.addressesCtr = 0;
        self.getMapAssgn(mapId, function(fbAssgnRef) {
          self.mapObj.assgn = fbAssgnRef;
          var fbRef = self.getAddrArrRef(mapId);
          if (typeof self.mapObj.mapData.addresses == 'string') {
            var addStr = self.mapObj.mapData.addresses;
            // old map record, create new address array
            self.csvToArray(addStr, fbRef, self.loadAdds, cb);
          } else {
            self.loadAdds(fbRef, cb);
          }
        });
      });
      
    };
    // ---------------------------------------------------------------
    self.getAddrArrRef = function(mapId) {
      var fbAddUrl = self.fbMapsUrl + mapId + '/addresses';
      var fbRef = $firebaseArray(new Firebase(fbAddUrl));
      return fbRef;
    };
    // ---------------------------------------------------------------
    self.loadAdds = function(mapAddrRef, cb) {
      self.mapObj.addrRef = mapAddrRef;
      mapAddrRef.$loaded().then(function() {
        self.mapObj.addressesNum = mapAddrRef.length;
        angular.forEach(mapAddrRef, function(addRefId) {
            var addId = addRefId.$value;
            self.getAdd(self.mapObj.mapId, addId, function(mapId, addId, fbAddData) {
            self.mapObj.addressesCtr++;
            var addObj = {addId: addId, addData: fbAddData, mapAddRef: addRefId};  // start with 'not done'
            // check if this address is already in the assignment
            if (!self.mapObj.assgn.address) {
              self.mapObj.assgn.address = {};
            }
            if (!self.mapObj.assgn.address[addId]) {
              self.mapObj.assgn.address[addId] = 0;
            }
            self.mapObj.addresses.push(addObj);
            if (self.mapObj.addressesCtr == self.mapObj.addressesNum) {
              self.mapObj.ready = true;
              cb(self.mapObj);
            }  
          });
        });
      });
    };
    // ---------------------------------------------------------------
    self.convertLetterToNumber = function(str) {
      var out = 0, len = str.length;
      for (var pos = 0; pos < len; pos++) {
        out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
      }
      return out + 100000;
    };
    // ---------------------------------------------------------------
    self.loadMyMaps = function(cb) {
      self.allMapsList = [];
      self.mapListCtr = 0;
      self.getActiveMaps(function(activeMaps) {
        if (!activeMaps) {
          $log.error("Active maps is null.");
          return;
        }
        self.mapListNum = activeMaps.length;
        if (self.mapListNum == 0) {
          cb(self.allMapsList);
          return;
        }
        for (var i=0; i<activeMaps.length; i++) {
          self.getMap(activeMaps[i].$value, function(mapId, mapData) {
            self.allMapsList.push({id: mapId, data:mapData});
            self.mapListCtr++;
            if (self.mapListCtr == self.mapListNum) {
              cb(self.allMapsList);
            }
          });
        }
      });
//      var mapIds = self.userData.maps.split(','); 
//      self.mapListNum = mapIds.length;
//      for (var i=0; i<mapIds.length; i++) {
//        self.getMap(mapIds[i], function(mapId, mapData) {
//          self.myMapList.push({id: mapId, data:mapData});
//          self.mapListCtr++;
//          if (self.mapListCtr == self.mapListNum) {
//            cb(self.myMapList);
//          }
//        });
//      }
    };
    // ---------------------------------------------------------------
    self.getActiveMaps = function(cb) {
      if (!self.activeMaps) {
        console.log("Getting active maps...");
        self.activeMaps = $firebaseArray(new Firebase(self.fbActiveMapsUrl));
        self.activeMaps.$loaded().then(function(ref){
          cb(ref);
        }, function(err) {
          $log.error(err);
          cb(null);
        });
      } else {
        console.log("Returning cached active maps...");
        cb(self.activeMaps); 
      }
    };
    // ---------------------------------------------------------------
    self.getStartedMaps = function(cb) {
     // no caching...
      self.getMapAssgnList(function(startedList) {
        var startedCtr = 0;
        self.startedMaps = [];
        if (startedList.length==0) {
          cb(self.startedMaps);
          return;
        }
        for (var x=0; x < startedList.length; x++) {
          self.getMap(startedList[x].$value, function(mapId, mapRef){
            self.startedMaps.push({id:mapId, data:mapRef});
            startedCtr++;
            if (startedCtr==startedList.length) {
              cb(self.startedMaps);
              return;
            }
          });
        }
      });
   
    };
    // ---------------------------------------------------------------
    self.getMap = function(mapId, cb) {
      if (!self.mapCache) 
        self.mapCache = {};
      if (!self.mapCache[mapId]) {
        self.mapCache[mapId] = $firebaseObject(new Firebase(self.fbMapsUrl + mapId));
        self.mapCache[mapId].$loaded().then(function(){
          cb(mapId, self.mapCache[mapId]);
        });
      } else {
        cb(mapId, self.mapCache[mapId]);
      }
    };
    // ---------------------------------------------------------------
    self.getAdd = function(mapId, addId, cb) {
      if (!self.addCache) 
        self.addCache = {};
      if (!self.addCache[addId]) {
        self.addCache[addId] = $firebaseObject(new Firebase(self.fbAddressUrl+addId));
        self.addCache[addId].$loaded().then(function(){
          var needSave = false;
          // if string, convert house and unit # to numeric
//          if (angular.isDefined(self.addCache[addId].unit) && angular.isString(self.addCache[addId].unit)) {
//            if (self.addCache[addId].unit != "") {
//              if (isNaN(self.addCache[addId].unit)) {
//                needSave = false;
//              } else {
//                self.addCache[addId].unit = parseInt(self.addCache[addId].unit, 10);    
//                needSave = true;
//              }
//            } else {
//              self.addCache[addId].unit = -9; // special value that will be filtered in the UI
//              needSave = true;
//            }
//          }
//          if (angular.isDefined(self.addCache[addId].hnum) && angular.isString(self.addCache[addId].hnum) && self.addCache[addId].hnum != "" && !isNaN(self.addCache[addId].hnum)) {
//            self.addCache[addId].hnum = parseInt(self.addCache[addId].hnum, 10);
//            needSave = true;
//          }
          if (needSave) {
            self.addCache[addId].$save().then(function(addRef) {
              cb(mapId, addId, self.addCache[addId]);
            }, function (err) {
              $log.error("Failed to convert numeric to text:" + addId);
              cb(mapId, addId, self.addCache[addId]);
            });
          } else {
            cb(mapId, addId, self.addCache[addId]);  
          }
        });
      } else {
        cb(mapId, addId, self.addCache[addId]);
      } 
    };
    // ---------------------------------------------------------------
    self.getMapAssgn = function(mapId, cb) {
      // get active assignment
      var fbActiveAssgn  = $firebaseObject(new Firebase(self.fbAssgnUrl + 'active/'+mapId));
      fbActiveAssgn.$loaded().then(function(data) {
        cb(fbActiveAssgn);
      }, function(error) {
        $log.error(error);
        cb(null);
      });
    };
    // ---------------------------------------------------------------
     self.getMapAssgnList = function(cb) {
       if (!self.mapAssgnList) {
         self.mapAssgnListRef = $firebaseArray(new Firebase(self.fbAssgnUrl+'list'));
         self.mapAssgnListRef.$loaded().then(function(ref) {
           cb(self.mapAssgnListRef);
         }, function(error) {
           console.log(error);
           cb(null);
         });
       } else {
         cb(self.mapAssgnListRef);
       }
     };
    // ---------------------------------------------------------------
     self.startMapAssgn = function(mapAssgn, cb) {
       self.getMapAssgnList(function(mapListRef) {
         if (!mapListRef) {
           return;
         }
         if (self.getRefInArr(self.mapObj.mapId, mapListRef)) {
           $log.error("Map already stared, ignoring.");
           return;
         }
         mapAssgn.started = moment().format();
         mapAssgn.expiry = moment().add(1, 'months').format();
         mapAssgn.lastSaved = self.getLastSaved();
         if (!mapAssgn.owner) {
           mapAssgn.owner = authService.getUserInfoMin();
         }
         mapAssgn.$save().then(function(ref) {
           mapListRef.$add(self.mapObj.mapId).then(function(lRef) {
             cb(ref);
           }, function(lErr) {
             $log.error();
             cb(null);
           });
         }, function (error) {
           $log.error(error);
           cb(null);
         });
       });
     };
    
    // ---------------------------------------------------------------
    self.getLastSaved = function() {
      var infoMin = angular.copy(authService.getUserInfoMin());
      infoMin.when = moment().format();
      return infoMin;
    };
    // ---------------------------------------------------------------
    self.getRefInArr = function(val, ref) {
      for (var i=0; i<ref.length; i++) {
        if (ref[i].$value == val) {
          return ref[i];
        }
      }
      return null;
    };
    // ---------------------------------------------------------------
    self.setMapExpiry = function(mapObj, expiryDate, cb) {
      mapObj.assgn.expiry = moment(expiryDate).format();
      mapObj.assgn.$save().then(cb());
    };
    // ---------------------------------------------------------------
    self.stopMapAssgn = function(mapObj, compDate, cb) {
      // set the completion date, move the object to the archive area, remove from assigned list
      mapObj.assgn.completed = compDate ? moment(compDate).format() : moment().format();
      self.saveStatus(mapObj.assgn, function(r) {
        if (r == null) {
          cb(null);
          return;
        }
        var adds = null;
        for (var i=0; i<mapObj.addresses.length; i++) {
          var addId = mapObj.addresses[i].addId;
          var removed = false;
          for (var m=0; m<self.dropStatuses.length; m++) {
            if (self.dropStatuses[m] == mapObj.assgn.address[addId]) { 
              // Addresses in the drop status will not be visible next time
              $log.info("Address removed from map:" + addId);
              removed = true;
            }
          }
          if (!removed) 
            adds = adds ? adds + ',' + addId : addId;
        }
        mapObj.mapData.addresses = adds;
        mapObj.mapData.lastCompleted = mapObj.assgn.completed;
        mapObj.mapData.$save().then(function(mapRef) {
          // moving object...
          var newArchive = $firebaseObject(new Firebase(self.fbAssgnUrl + 'archive/' + mapObj.mapId + '/' + self.getNewId()));
          newArchive.$loaded().then(function(nRef) {
            newArchive.started = mapObj.assgn.started;
            newArchive.expiry = mapObj.assgn.expiry;
            newArchive.completed = mapObj.assgn.completed;
            newArchive.address = mapObj.assgn.address;
            newArchive.owner = mapObj.assgn.owner;
            newArchive.lastSaved = mapObj.assgn.lastSaved;
            newArchive.$save().then(function(nSref) {
              // delete original object, not waiting...
              mapObj.assgn.$remove();
              // remove from list...
              self.getMapAssgnList(function(listRef) {
                if (!listRef) return;
                var mapAssgnListItemRef = self.getRefInArr(self.mapObj.mapId, listRef);
                // remove from list, not waiting...
                listRef.$remove(mapAssgnListItemRef); 
                cb(true);
              });
            }, function(nSerr) {
              $log.error(nSerr);
              cb(null);
            });
          }, function(nErr) {
            $log.error(nErr);
            cb(null);
          });
        }, function(err) {
          $log.error(err);
          cb(null);
        });   
      });
      
    };
    // ---------------------------------------------------------------
    self.deleteAdd = function(mapObj, addr, cb, deleteAddr) {
      console.log(mapObj);
      var fbUrl = mapObj.mapData.$ref().toString() + '/addresses';
      console.log(fbUrl);
      var fbRef = $firebaseArray(new Firebase(fbUrl));
      console.log(addr.mapAddRef);
      fbRef.$loaded().then(function() {
        fbRef.$remove(fbRef.$indexFor(addr.mapAddRef.$id)).then(function() {
          $log.debug("Deleted map reference");
          if (mapObj.assgn != null && mapObj.assgn.started != null) {
            delete mapObj.assgn.address[addr.addId];
            mapObj.assgn.$save().then(function(assgnRef) {
              $log.debug("deleted assignment");
            }, function(assgnErr) {
              $log.error(assgnErr) 
            });
          }
          if (deleteAddr) {
            // delete address...
            addr.addData.$remove().then(function(ref) {
              $log.debug("deleted address");
              cb();
            }, function(addErr) {
              $log.error(addErr);
            }); 
          } else {
            cb();
          }
        });
      });
    };
    // ---------------------------------------------------------------
    self.saveEditAdd = function(add, cb) {
      add.lSt = add.st.toLowerCase();
      add.$save().then(function(ref) {
        cb();
      }, function(err) {
        $log.error(err);
      });
    };
    // ---------------------------------------------------------------
     self.mapAddBump = function(goUp, add, idx) {
       var curPriority = add.mapAddRef.$priority;
       if (goUp) {
         if (curPriority == 0) {
            $log.debug("First element already, ignoring...");
            return; 
         }
         add.mapAddRef.$priority = --add.mapAddRef.$priority;
         var curIdx = self.mapObj.addrRef.$indexFor(add.mapAddRef.$id);
         var upElem = self.mapObj.addrRef[curIdx-1];
         upElem.$priority = ++upElem.$priority;
         // saving
         self.mapObj.addrRef.$save(add.mapAddRef);  
         self.mapObj.addrRef.$save(upElem);  
       } else {
         if (curPriority == self.mapObj.addrRef.length-1) {
           $log.debug("Already the last, ignoring..");
           return;
         }
         add.mapAddRef.$priority = ++add.mapAddRef.$priority;
         var curIdx = self.mapObj.addrRef.$indexFor(add.mapAddRef.$id);
         var upElem = self.mapObj.addrRef[curIdx+1];
         upElem.$priority = --upElem.$priority;
         // saving
         self.mapObj.addrRef.$save(add.mapAddRef);  
         self.mapObj.addrRef.$save(upElem);  
       }
     };
    // ---------------------------------------------------------------
    self.saveNewAdd = function(mapId, newAdd, cb) {
      self.getNewMapAddRef(mapId, function(newAddId, newMapRef, error) {
        if (error) {
          $log.error(error);
          return cb(null);
        }
        newMapRef.burb = newAdd.burb;
        if (newAdd.unit && newAdd.unit != undefined)
          newMapRef.unit = newAdd.unit;
        
        newMapRef.hnum = newAdd.hnum;
        newMapRef.st = newAdd.st;
        newMapRef.lSt = newAdd.st.toLocaleLowerCase();
        newMapRef.ubd = newAdd.ubd;
        newMapRef.pcode = newAdd.pcode;
        newMapRef.state = newAdd.state;
        // save the new address at
        // 1. mapAddresses.mapId.adressId.address.addressId 
        $log.debug(newMapRef);
        newMapRef.$save().then(function(data) {
          $log.debug("Successfully saved address: "+ newAddId);
          $log.debug("Adding to map...");
          // 2. maps.mapId.addresses (comma delim)
          var mapAddrRef = self.getAddrArrRef(mapId);
          var priority = mapAddrRef.length;
          $log.debug("Addr added to array...");
          mapAddrRef.$add(newAddId).then(function(newAddRef) {
            // set priority
            var elemArr = mapAddrRef.$getRecord(newAddRef.key());
            $log.debug("Setting priority: "+ mapAddrRef.length);
            elemArr.$priority = mapAddrRef.length;
            mapAddrRef.$save(elemArr).then(function() {
              $log.debug("Added to map");
              self.newMapRef.$destroy();
              self.newAddId = null;
              cb(true);
            }, function(addErr) {
              $log.error(addErr);
            });
          });
          
        }, function(error) {
          $log.error(error);
          cb(null);
          newMapRef.$destroy();
        });
        // destroy the temp references
      });
      
    };
    // ---------------------------------------------------------------
    self.getNewId = function() {
      var id = rangen.id(5, 'an');
      $log.debug("Generated new ID: " + id);
      return id;
    };
    // ---------------------------------------------------------------
    self.getNewMapAddRef = function(mapId, cb) {
      self.newAddId = self.getNewId();
      self.newMapRef = $firebaseObject(new Firebase(self.fbAddressUrl +self.newAddId));
      var valAddIdFn = function(data) {
        if (self.newMapRef.st != null) {
          // means the address id isn't unique, do it again
          self.newMapRef.$destroy();
          self.newAddId = self.getNewId();
          self.newMapRef = $firebaseObject(new Firebase(self.fbAddressUrl + self.newAddId));
        } else {
          cb(self.newAddId, self.newMapRef);
        }
      };
      self.newMapRef.$loaded().then(valAddIdFn, function(error) {
        cb(null, null, error);
      });      
    };
    // ---------------------------------------------------------------
    
    // ---------------------------------------------------------------
    self.saveStatus = function(assgnRef, cb) {
      assgnRef.lastSaved = self.getLastSaved();
      assgnRef.$save().then(function(ref) {
        cb(ref);
      }, function(error) {
        $log.error(error);
        cb(null);
      });
    };
    // ---------------------------------------------------------------
    self.csvToArray = function(val, fbRef, cb, cb2) {
      var arr = val.split(',');
      var ctr = 0;
      var arrToAdd = [];
      if (arr.length == 0) {
        arrToAdd.push({priority:0, e:val}); 
      } else {
        for (var i=0; i < arr.length; i++) {
          var obj = {priority:i, e:arr[i]};
          arrToAdd.push(obj);
        }
      }
      for (var i=0; i < arrToAdd.length; i++) {
        var curElem = arrToAdd[i];
        fbRef.$add(curElem.e).then(function(ref) {
          var elemArr = fbRef.$getRecord(ref.key());
          var arrEntryFound = $filter('filter')(arrToAdd, {e: elemArr.$value}, true);
          if (arrEntryFound.length) {
            elemArr.$priority = arrEntryFound[0].priority;
          }
          fbRef.$save(elemArr);
          // warning: not thread-safe after this...
          ctr++;
          if (ctr == arr.length) {
            console.log("COmpleted push...");
            if (cb) {
              cb(fbRef, cb2);
            } 
          }
        }, function(err) { 
          console.log(err);
        });
      }
    };
    // ----------------------------------------------------------------
    self.getFsgList = function(cb) {
      // TODO: convert from CSV to FB list
      if (!self.fsgListRef) {
        var fbObj = $firebaseObject(new Firebase(self.fbFsgUrl + 'list'));
        fbObj.$loaded(function(d) {
          if (typeof fbObj.$value == 'string') {
            $log.debug("Is string...");
            var listStr = fbObj.$value;
            self.fsgListRef = $firebaseArray(fbObj.$ref());
            var fsgArr = listStr.indexOf(',') == -1 ? [listStr] : listStr.split(',');
            for (var i=0; i<fsgArr.length; i++) {
              $log.debug("Adding: " + fsgArr[i]);
              self.fsgListRef.$add(fsgArr[i]);
            }
          } else {
            self.fsgListRef = $firebaseArray(fbObj.$ref());
          }
          self.fsgListRef.$loaded().then(function(fsgRef){
            cb(self.fsgListRef);
          });  
        });
      } else {
        cb(self.fsgListRef);
      }
    };
    // ----------------------------------------------------------------
    self.moveMapToFsg = function(mapId, mapRef, fromFsg, toFsg, cb) {
      mapRef.lName = mapRef.name.toLocaleLowerCase();
      mapRef.$save().then(function() {
        if (toFsg == fromFsg) {
          $log.debug("Map not moved.");
          cb();
          return;
        }
        var fromFsgMapListRef = $firebaseArray(new Firebase(self.fbFsgUrl + fromFsg));
        var toFsgMapListRef = $firebaseArray(new Firebase(self.fbFsgUrl + toFsg));
        toFsgMapListRef.$loaded().then(function() {
          toFsgMapListRef.$add(mapId).then(function() {
            fromFsgMapListRef.$loaded().then(function() {
              var filter = $filter('filter');
              var toRemove = filter(fromFsgMapListRef, {$value:mapId}, false)[0];
              fromFsgMapListRef.$remove(toRemove).then(function() {
                self.fsgMapList[fromFsg] = null;
                self.fsgMapList[toFsg] = null;
                cb();
              });
            }, function(err) {
              $log.error("Error saving source group");
              $log.error(err);
            });
          }, function(err) {
            $log.error("Error saving target group");
            $log.error(err); 
          });
        });
      }, function(err) {
        $log.error("Error saving map");
        $log.error(err);
      });
    };
    // ----------------------------------------------------------------
    self.getFsgMapList = function(fsgName, cb) {
      // TODO: convert from CSV to FB List
      if (!self.fsgMapList) self.fsgMapList = {};
      if (!self.fsgMapList[fsgName]) {
        self.fsgMapList[fsgName] = [];
        var fsgMapListRef = $firebaseObject(new Firebase(self.fbFsgUrl + fsgName));
        var fbMapListArr = null;
        fsgMapListRef.$loaded().then(function(fsgMapList){
          if (typeof fsgMapListRef.$value == 'string') {
            var fsgMapArr = fsgMapList.$value.split(',');
            fbMapListArr = $firebaseArray(fsgMapListRef.$ref());
            for (var x=0; x < fsgMapArr.length; x++ ) {
              fbMapListArr.$add(fsgMapArr[x]);
            }
          } else {
            fbMapListArr = $firebaseArray(fsgMapListRef.$ref());
          }
          var fsgMapCtr = 0;
          fbMapListArr.$loaded().then(function(d) {
            for (var x=0; x < fbMapListArr.length; x++ ) {
              self.getMap(fbMapListArr[x].$value, function(mapId, mapData){
                self.fsgMapList[fsgName].push({id:mapId, data:mapData});
                fsgMapCtr ++;
                if (fsgMapCtr == fbMapListArr.length) {
                  cb(fsgName, self.fsgMapList[fsgName]);  
                }
              });
            }                            
          });
          
        });
      } else {
        cb(fsgName, self.fsgMapList[fsgName]);
      }
    };
    // ----------------------------------------------------------------
    self.clearCache = function() {
      self.mapObj = null;
      self.mapCache = null;
      self.fsgMapList = null;
      self.fsgListRef = null;
      self.userData = null;
      self.mapAssgnList = null;
      self.activeMaps = null;
    };
    // ----------------------------------------------------------------
    self.findByTerm = function(url, term, param, cb, isExactSearch) {
      // TODO: determine if we need to clean up later...
      var ref = $firebaseObject(new Firebase(url));
      var searchRes = [];
      var onValueAdd = ref.$ref().orderByChild(term).startAt(param, term).on("value", function(snapshot) {
        snapshot.forEach(function(data) {
          if (isExactSearch) {
            if (data.val()[term] == param) {
              searchRes.push({key: data.key(), rawdata:data, value: data.val()});  
            }
          } else {
            if ((data.val()[term] + "").indexOf(param) != -1) {
              searchRes.push({key: data.key(), rawdata:data, value: data.val()});  
            }
          }
          
        });
        cb(searchRes);
        ref.$ref().off('value', onValueAdd);
      });
    };
    // ----------------------------------------------------------------
    self.findMapByLowerName = function(param, cb) {
      self.findByTerm(self.fbMapsUrl, 'lName', param, cb);
    };
    // ----------------------------------------------------------------
    self.findStreetLower = function(param, cb) {
      self.findByTerm(self.fbAddressUrl, 'lSt', param, cb);
    };
    // ----------------------------------------------------------------
    self.findMapByNum = function(param, cb) {
      self.findByTerm(self.fbMapsUrl, 'terId', param, cb, true);
    };
    // ----------------------------------------------------------------
    self.getFsgOfMap = function(mapId, cb) {
      if (!arrCache) {
        self.getFsgList(function(fsgList) {
          self.fsgNameList = fsgList;
          self.getFsgOfMap(mapId, cb);
          return;
        });  
      } else {
        if (!self.fsgMapIdList) {
          self.fsgMapIdList = {};
        }
        for (var x=0; x<arrCache.length; x++) {
          if (!self.fsgMapIdList[arrCache[x]]) {
            self.fsgMapIdList[arrCache[x]] = [];
            var fsgMapListRef = $firebaseObject(new Firebase(self.fbFsgUrl + fsgName));
            fsgMapListRef.$loaded().then(function(fsgMapList){
              self.fsgMapIdList[arrCache[x]] = fsgMapList.$value.split(',');
              
            });
          }
        }
      } 
      
    };
    
    // ----------------------------------------------------------------
    self.moveAddToMap = function(addId, targetMapObj, targetId, cb) {
      var fbAddUrl = self.fbMapsUrl + targetId + '/addresses';
      console.log(fbAddUrl);
      var fbRef = $firebaseArray(new Firebase(fbAddUrl));
      var moveFn = function(addId) { return function(fbRef, cb2) {
        var priority = fbRef.length;
        fbRef.$add(addId).then(function(ref) {
          var elemArr = fbRef.$getRecord(ref.key());
          elemArr.$priority = priority;
          fbRef.$save(elemArr).then(function() {
            cb2();
          });
        });
      }};
      if (typeof targetMapObj.addresses == 'string') {
        var addStr = targetMapObj.addresses;
        // old map record, create new address array
        self.csvToArray(addStr, fbRef, moveFn(addId), cb);
      } else {
        moveFn(addId)(fbRef, cb);
      }
    };
    // ----------------------------------------------------------------
//    self.isActive = function(cb) {
//      var statObj = $firebaseObject(new Firebase(self.fbStatusUrl));
//      statObj.$loaded().then(function(data) {
//        var isActive = data.$value == 'active';
//        statObj.$destroy();
//        cb(isActive);
//      });
//      
//    };
   }]); // ******** end mapService **********
  
})();