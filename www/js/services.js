angular.module('starter.services', [])
.filter('unsafe', function($sce){
   return function(val){
       return $sce.trustAsHtml(val);
   }
})
.directive('loading', ['$http' ,function ($http)
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
    var _addToPostTrackArray = function(pagingInfo) {
        $rootScope.postTrackArray = $rootScope.postTrackArray.concat(pagingInfo.data);
    };
    return {
        following: function(pg) {
            return $http.get($rootScope.baseURL+"/api/home?page="+pg).then(function(response){
                _addToPostTrackArray(response.data);
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        school: function(pg, id) {
            return $http.get($rootScope.baseURL+"/api/school/"+id+"/post?page="+pg).then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        get: function(postID){
            return $http.get($rootScope.baseURL+"/api/post/"+postID).then(function(response){
                _addToPostTrackArray({data:response.data});
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        new: function(pg, search_term){
            return $http.get($rootScope.baseURL+"/api/explore?page="+pg+"&search_term="+search_term).then(function(response){
                _addToPostTrackArray(response.data);
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        sample: function(count){
            return $http.get($rootScope.baseURL+"/api/explore/sample?count="+count).then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        user: function(userSlug, tab, pg) {
            return $http.get($rootScope.baseURL+"/api/"+userSlug+"/post?tab="+tab+"&page="+pg).then(function(response){
                _addToPostTrackArray(response.data);
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        liked: function(slug, pg){
            return $http.get($rootScope.baseURL+"/api/"+slug+"/liked?page="+pg).then(function(response){
                return response.data.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        compare: function(postIDArray){
            return $http.get($rootScope.baseURL+"/api/compare/"+postIDArray.join(",")).then(function(response){
                _addToPostTrackArray({data:response.data});
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        }
    };
})
.factory('FetchOccasions', function($http, $rootScope) {
    return {
        get: function() {
            return $http.get($rootScope.baseURL+'/api/occasion').then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        }
    };
})
.factory('FetchUsers', function($http, $rootScope) {
    return {
        following: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/'+ slug +'/following?page='+ pg).then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        follower: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/'+ slug +'/follower?page='+ pg).then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        get: function(userSlug) {
            return $http.get($rootScope.baseURL+"/api/"+userSlug).then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        liker: function(id, pg) {
            return $http.get($rootScope.baseURL+'/api/post/'+ id +'/likers?page='+ pg).then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
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
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        }
    };
})
.factory('FetchNotifications', function($http, $rootScope) {
    return {
        new: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/'+slug+'/notification?page='+pg).then(function(response){
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
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
