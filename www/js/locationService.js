/**
 * Created by trino on 4/12/2017.
 */
angular.module('bgw.locationService', [])

  .factory('locationService', function ($interval) {
    var clock = null;
    var service = {
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
      }
    };
    return service;
  });
