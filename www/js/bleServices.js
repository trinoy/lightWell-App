angular.module('bgw.bleServices', [])

  .factory('bleService', function ($q, $ionicPopup, $interval) {

    var clock = null;
    return {

      devices: [],
      devicesMetaData: [],

      startClock: function (fn) {
        if (clock === null) {
          clock = $interval(fn, 5000);
        }
      },
      stopClock: function () {
        if (clock !== null) {
          $interval.cancel(clock);
          clock = null;
        }
      },

      scan: function () {
        var that = this;
        var deferred = $q.defer();
        that.devices.length = 0;
        var options = {serviceUUIDs: ['00001800-0000-1000-8000-00805f9b34fb']};
        evothings.ble.startScan(onDeviceFound, onScanError, options);

        function onDeviceFound(device) {
          that.devices.push(device);
        }

        function onScanError(reason) {
          console.log("ERROR: " + reason);
          deferred.reject(reason);
        }


        setTimeout(function () {
          evothings.ble.stopScan();
          deferred.resolve();
        }, 4000);

        return deferred.promise;
      }
    }
  });
