angular.module('starter.services', [])
.filter('unsafe', function($sce){
   return function(val){
       return $sce.trustAsHtml(val);
   }
})
.directive('loading',   ['$http' ,function ($http)
{
    return {
        restrict: 'A',
        link: function (scope, elm, attrs)
        {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };

            scope.$watch(scope.isLoading, function (v)
            {
                if(v){
                    elm.show();
                }else{
                    elm.hide();
                }
            });
        }
    };

}])
.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
.factory('FetchPosts', function($http) {
    return {
        following: function(pg) {
            return $http.get("http://localhost:8888/api/home?page="+pg).then(function(response){
                return response.data.data;
            });
        },
        school: function(pg, id) {
            return $http.get("http://localhost:8888/api/school/"+id+"/post?page="+pg).then(function(response){
                return response.data.data;
            });
        },
        get: function(postID){
            return $http.get("http://localhost:8888/api/post/"+postID).then(function(response){
                return response.data;
            });
        },
        new: function(pg, search_term){
            console.log("http://localhost:8888/api/explore?page="+pg+"&search_term="+search_term);
            return $http.get("http://localhost:8888/api/explore?page="+pg+"&search_term="+search_term).then(function(response){
                return response.data.data;
            });
        }
    };
})
.factory('FetchLikers', function($http) {
    return {
        all: function(id, pg) {
            return $http.get('http://localhost:8888/api/post/'+ id +'/likers?page='+ pg).then(function(response){
                return response.data.data;
            });
        }
    };
})
.factory('FetchSchools', function($http) {
    return {
        ranking: function(pg) {
            return $http.get('http://localhost:8888/api/ranking/school?page='+pg).then(function(response){
                return response.data.data;
            });
        }
    };
})
.factory('Modified', function() {
    modified = {};
    modified.index = -1;
    modified.like = 0;
    modified.comment = 0;
    return {
        get: function(){
            return modified;
        },
        reset: function(){
            modified = {};
            modified.index = -1;
            modified.like = 0;
            modified.comment = 0;
        }
    };
})
.factory('Focus', function($timeout, $window) {
    return function(id) {
        // http://stackoverflow.com/questions/25596399/set-element-focus-in-angular-way
        //
        // timeout makes sure that it is invoked after any other event has been triggered.
        // e.g. click events that need to run before the focus or
        // inputs elements that are in a disabled state but are enabled when those events
        // are triggered.
        $timeout(function() {
            var element = $window.document.getElementById(id);
            if(element)
                element.focus();
        });
    };
});