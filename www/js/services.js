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
.factory('FetchPosts', function($http, $rootScope) {
    return {
        following: function(pg) {
            return $http.get($rootScope.baseURL+"/api/home?page="+pg).then(function(response){
                return response.data.data;
            });
        },
        school: function(pg, id) {
            return $http.get($rootScope.baseURL+"/api/school/"+id+"/post?page="+pg).then(function(response){
                return response.data.data;
            });
        },
        get: function(postID){
            return $http.get($rootScope.baseURL+"/api/post/"+postID).then(function(response){
                return response.data;
            });
        },
        new: function(pg, search_term){
            return $http.get($rootScope.baseURL+"/api/explore?page="+pg+"&search_term="+search_term).then(function(response){
                return response.data.data;
            });
        },
        liked: function(slug, pg){
            return $http.get($rootScope.baseURL+"/api/"+slug+"/liked?page="+pg).then(function(response){
                return response.data.data;
            });
        }
    };
})
.factory('FetchLikers', function($http, $rootScope) {
    return {
        all: function(id, pg) {
            return $http.get($rootScope.baseURL+'/api/post/'+ id +'/likers?page='+ pg).then(function(response){
                return response.data.data;
            });
        }
    };
})
.factory('FetchUsers', function($http, $rootScope) {
    return {
        following: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/'+ slug +'/following?page='+ pg).then(function(response){
                return response.data.data;
            });
        },
        follower: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/'+ slug +'/follower?page='+ pg).then(function(response){
                return response.data.data;
            });
        },
        findFriends: function(pg) {
            return $http.get($rootScope.baseURL+'/api/find-friends?page='+ pg).then(function(response){
                return response.data.data;
            });
        }
    };
})
.factory('FetchSchools', function($http, $rootScope) {
    return {
        ranking: function(pg) {
            return $http.get($rootScope.baseURL+'/api/ranking/school?page='+pg).then(function(response){
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
})
.factory('FetchUser', function($http, $rootScope) {
    return {
        get: function(userSlug) {
            return $http.get($rootScope.baseURL+"/api/"+userSlug).then(function(response){
                return response.data;
            });
        }
    };
})
.factory('FetchUserPosts', function($http, $rootScope) {
    return {
        get: function(userSlug, pg) {
            return $http.get($rootScope.baseURL+"/api/"+userSlug+"/post?page="+pg).then(function(response){
                return response.data;
            });
        }
    };
});