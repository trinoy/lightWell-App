angular.module('bgw.dataservices', [])

  .factory('wellService', function ($q,$http, $timeout) {

    return {

      devicesMetaData: [],
      uploadData: function (wellId, wellReading) {
        //return $http.put("http://bgw-server.herokuapp.com/api/bgw/well/byId/"+wellId, wellReading);
        var req = {
          method: 'PUT',
          url: "http://lightwell-server.herokuapp.com/api/bgw/well/byId/" + wellId,
          data: wellReading,
          headers: {'Content-Type': 'application/json'}
        }
        return $http(req);
      },

      getWellClusters: function () {
        var that = this;
        var req = {
          method: 'GET',
          url: "http://lightwell-server.herokuapp.com/api/bgw/wellCluster",
          //data: wellReading,
          headers: {'Content-Type': 'application/json'}
        };
        return $http(req);
      },

      getWellLastReadingByName: function (wellName) {
        var that = this;
        var req = {
          method: 'GET',
          url: "http://lightwell-server.herokuapp.com/api/bgw/well/lastReading/" + wellName,
          //data: wellReading,
          headers: {'Content-Type': 'application/json'}
        };
        return $http(req);
      },

      getWellMetaData: function () {
        var that = this;
        //that.devicesMetaData.length = 0;
        var deferred = $q.defer();

        if (that.devicesMetaData.length == 0) {
          that.getWellClusters()
            .success(function (wellZones) {
              console.log("fetch success");
              that.devicesMetaData = wellZones;
              deferred.resolve(wellZones);
            })
            .error(function (error) {
              console.log(error);
              deferred.reject(error);
            });
        }
        else {
          $timeout(function () {
            deferred.resolve(that.devicesMetaData);
          }, 500);
        }
        return deferred.promise;
      }
    };
  });
