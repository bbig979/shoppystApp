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
    var _addToUserTrackArray = function(pagingInfo) {
        $rootScope.userTrackArray = $rootScope.userTrackArray.concat(pagingInfo.data);
    };
    return {
        following: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/'+ slug +'/following?page='+ pg).then(function(response){
                _addToUserTrackArray(response.data);
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        follower: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/'+ slug +'/follower?page='+ pg).then(function(response){
                _addToUserTrackArray(response.data);
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        get: function(userSlug) {
            return $http.get($rootScope.baseURL+"/api/"+userSlug).then(function(response){
                _addToUserTrackArray({data:response.data});
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        liker: function(id, pg) {
            return $http.get($rootScope.baseURL+'/api/post/'+ id +'/likers?page='+ pg).then(function(response){
                _addToUserTrackArray(response.data);
                return response.data;
            }
            ,function(error){
                $rootScope.handleHttpError(error);
            });
        },
        findFriends: function(pg) {
            return $http.get($rootScope.baseURL+'/api/find-friends?page='+ pg).then(function(response){
                _addToUserTrackArray(response.data);
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
})
.service('PostTimer', function(){
    const sec_to_expire = 60 * 60 * 24;
    const sec_in_one_hour = 60 * 60;
    const sec_in_one_min = 60;
    const two_third = 2/3;
    const one_third = 1/3;

    this.elapsed = function(created_at){
        return this._secPassed(created_at) > sec_to_expire;
    }
    this.icon = function(created_at){
        var sec_passed = this._secPassed(created_at);
        var sec_remains = sec_to_expire - sec_passed;

        if(sec_remains < 0){
            return "fa-eye-slash"
        }
        else if(sec_remains / sec_to_expire > two_third){
            return "fa-hourglass-start";
        }
        else if(sec_remains / sec_to_expire > one_third){
            return "fa-hourglass-half";
        }
        else{
            return "fa-hourglass-end";
        }
    }
    this.timeLeft = function(created_at){
        var sec_passed = this._secPassed(created_at);
        var sec_remains = sec_to_expire - sec_passed;

        if(sec_remains < 0){
            return 'private';
        }
        if(sec_remains < sec_in_one_hour){
            return Math.floor(sec_remains / sec_in_one_min) + 'm Left';
        }
        return Math.floor(sec_remains / sec_in_one_hour) + 'h Left';
    }
    this._secPassed = function(created_at){
        var t = created_at.split(/[- :]/);
        t = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
        var now = new Date();
        return Math.floor((
            new Date(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds()
            ) - new Date(t)) / 1000);
    }
})
.factory('CameraPictues', function(){
    var _picture_array = [];
    return {
        get: function(){
            return _picture_array;
        },
        set: function(pic){
            _picture_array.push(pic);
        },
        reset: function(){
            _picture_array = [];
        },
        remove: function(pic){
            for(var i = 0; i < _picture_array.length; i++){
                if(_picture_array[i] == pic){
                    _picture_array.splice(i, 1);
                }
            }
        }
    }
})
.factory('ComparePosts', function($http, FetchPosts, $rootScope, $q){
    var _post_array = [];
    var _post_id_array = [];
    var _is_post_added_map = [];
    var _last_filter_gender = null;
    var _last_filter_age_group = null;
    var _gender_list = [
        {value: 'all', label: 'All'},
        {value: 'male', label: 'Male'},
        {value: 'female', label: 'Female'}
    ];
    var _age_list = [
        {value: 'all', label: 'All'},
        {value: 'teens', label: '10-20'},
        {value: 'twenties', label: '20-30'},
        {value: 'thirties', label: '30-40'},
        {value: 'forties', label: '40-50'},
        {value: 'fifties', label: 'Above 50'}
    ];

    return {
        refresh: function(){
            var deferred = $q.defer();
            this.sort(_last_filter_gender, _last_filter_age_group).then(function() {
                deferred.resolve();
            });
            return deferred.promise;
        },
        sort: function(gender, age_group){
            var deferred = $q.defer();
            var prev_this = this;
            this._fetch().then(function() {
                var target_key = prev_this._getTargetKeyForPostAnalytic(gender, age_group);
console.log(target_key);
console.log(_post_array);
                _post_array.sort(function(a, b){
                    var keyA = a.post_analytic[0][target_key];
                    var keyB = b.post_analytic[0][target_key];
                    if(keyA < keyB) return 1;
                    if(keyA > keyB) return -1;
                    return 0;
                });
                deferred.resolve();
            });
            this._logLastFilters(gender, age_group);
            return deferred.promise;
        },
        partialLikes: function(post_id){
            var target_key = this._getTargetKeyForPostAnalytic(_last_filter_gender, _last_filter_age_group);
            for(var i = 0; i < _post_array.length; i++){
                this_post = _post_array[i];
                if(post_id == this_post.id){
                    return this_post.post_analytic[0][target_key];
                }
            }
        },
        toggle: function(post_id){
            var deferred = $q.defer();
            if (_post_id_array.indexOf(post_id) != -1) {
                _post_id_array.splice(_post_id_array.indexOf(post_id), 1);
                _is_post_added_map[post_id] = false;
                this._removeFromPostArray(post_id);
            }
            else{
                _post_id_array.push(post_id);
                _is_post_added_map[post_id] = true;
                // Context: when to refresh posts in compare
                // Option: B
                /*
                this._setLastFiltersIfNull();
                this.sort(_last_filter_gender, _last_filter_age_group).then(function(){
                    deferred.resolve();
                });
                */
            }
            localStorage.setItem('post_id_array', JSON.stringify(_post_id_array));
            return deferred.promise;
        },
        get: function(){
            return _post_array;
        },
        has: function(post_id){
            return _is_post_added_map[post_id];
        },
        length: function(){
            if(_post_id_array.length == 0){
                this._restoreFromLocalStorage();
            }
            return _post_id_array.length;
        },
        getGenderList: function(){
            return _gender_list;
        },
        getAgeList: function(){
            return _age_list;
        },
        getLastFilters: function(){
            this._setLastFiltersIfNull();
            return {
                gender: this._getOption(_last_filter_gender, _gender_list),
                age: this._getOption(_last_filter_age_group, _age_list),
            }
        },
        _restoreFromLocalStorage: function(){
            if(localStorage.getItem('post_id_array')){
                _post_id_array = JSON.parse(localStorage.getItem('post_id_array'));
                for(var i = 0; i < _post_id_array.length; i++){
                    _is_post_added_map[_post_id_array[i]] = true;
                }
            }
        },
        _getOption: function(needle, haystack){
            for(var i = 0; i < haystack.length; i++){
                option = haystack[i];
                if(option.value == needle){
                    return option;
                }
            }
        },
        _fetch: function(){
            var deferred = $q.defer();
            var prev_this = this;
            if(_post_id_array.length == 0){
                deferred.resolve();
                return deferred.promise;
            }
            FetchPosts.compare(_post_id_array).then(function(response){
                posts = response;
                for (index = 0; index < posts.length; ++index) {
                    posts[index].created_from = $rootScope.calculateCreatedFrom(posts[index].created_at);
                    posts[index].time_icon = $rootScope.calculateGetTimeIcon(posts[index].created_from);
                    posts[index].created_from = $rootScope.manipulateCreatedFrom(posts[index].created_from);
                    prev_this._setTotalFieldsInPostAnalytic(posts[index].post_analytic);
                }
                _post_array = posts;
                deferred.resolve();
            });
            return deferred.promise;
        },
        _setPlaceHolderIfPostAnalyticIsEmpty: function(post_analytic){
            if(post_analytic[0] === undefined){
                post_analytic[0] = [];
            }
        },
        _setTotalFieldsInPostAnalytic: function(post_analytic){
            this._setPlaceHolderIfPostAnalyticIsEmpty(post_analytic);
            post_analytic[0].dummy_total_key = 1;
            post_analytic[0].total_all = posts[index].like_count;
            post_analytic[0].total_gender =
                post_analytic[0].male +
                post_analytic[0].female;
            post_analytic[0].total_age_group =
                post_analytic[0].teens +
                post_analytic[0].twenties +
                post_analytic[0].thirties +
                post_analytic[0].forties +
                post_analytic[0].fifties;
        },
        _removeFromPostArray: function(post_id){
            for(var i = 0; i < _post_array.length; i++){
                this_post = _post_array[i];
                if(post_id == this_post.id){
                    _post_array.splice(i, 1);
                    return;
                }
            }
        },
        _setLastFiltersIfNull: function(){
            if(_last_filter_gender == null) {
                _last_filter_gender = localStorage.getItem('last_filter_gender');
                _last_filter_age_group = localStorage.getItem('last_filter_age_group');
                if(_last_filter_gender == null) {
                    var user_obj = JSON.parse(localStorage.getItem('user'));
                    var user_gender = user_obj.gender;
                    if(user_gender == 'male'){
                        _last_filter_gender = 'female';
                    }
                    else{
                        _last_filter_gender = 'male';
                    }
                    _last_filter_age_group = 'all';
                }
            }
        },
        _logLastFilters: function(gender, age_group){
            localStorage.setItem('last_filter_gender', gender);
            localStorage.setItem('last_filter_age_group', age_group);
            _last_filter_gender = gender;
            _last_filter_age_group = age_group;
        },
        _getTargetKeyForPostAnalytic: function(gender, age_group){
            if(gender == 'all' && age_group == 'all'){
                return 'total_all';
            }
            if(gender == 'all' && age_group != 'all'){
                return age_group;
            }
            if(gender != 'all' && age_group == 'all'){
                return gender;
            }
            return gender + '_' + age_group;
        },
        _getTotalKeyForPostAnalytic: function(gender, age_group){
            if(gender == 'all' && age_group == 'all'){
                return 'dummy_total_key';
            }
            if(gender == 'all' && age_group != 'all'){
                return 'total_age_group';
            }
            return 'total_gender';
        }
    }
});
