angular.module('bgw.guideServices', [])

  .factory('Guide', function ($http) {

    return {

      getGuides : function(){
        var req = {
          method: 'GET',
          url: "http://lightwell-server.herokuapp.com/api/bgw/guides/guide",
          headers: {'Content-Type': 'application/json'}
        };
        return $http(req);
      }



    };
  });
