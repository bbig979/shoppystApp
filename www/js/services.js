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
        following: function(mostRecentPostID, pg) {
            return $http.get($rootScope.baseURL+"/api/home?page="+pg+"&from_id="+mostRecentPostID).then(function(response){
                _addToPostTrackArray(response.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        school: function(pg, id) {
            return $http.get($rootScope.baseURL+"/api/school/"+id+"/post?page="+pg).then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        get: function(postID){
            return $http.get($rootScope.baseURL+"/api/post/"+postID).then(function(response){
                _addToPostTrackArray({data:response.data});
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        new: function(mostRecentPostID, pg, search_term){
            return $http.get($rootScope.baseURL+"/api/explore?page="+pg+"&search_term="+search_term+"&from_id="+mostRecentPostID).then(function(response){
                _addToPostTrackArray(response.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        checkNewer: function(domain, mostRecentPostID){
            return $http.post($rootScope.baseURL+"/api/post/check-newer?&domain="+domain+"&from_id="+mostRecentPostID).then(function(response){
                return response.data;
            }
            ,function(response){
                // this is not user triggered
            });
        },
        sample: function(count){
            return $http.get($rootScope.baseURL+"/api/explore/sample?count="+count).then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        user: function(userSlug, tab, pg) {
            return $http.get($rootScope.baseURL+"/api/user/"+userSlug+"/post?tab="+tab+"&page="+pg).then(function(response){
                _addToPostTrackArray(response.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        liked: function(slug, pg){
            return $http.get($rootScope.baseURL+"/api/user/"+slug+"/liked?page="+pg).then(function(response){
                return response.data.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        compare: function(postIDArray){
            return $http.get($rootScope.baseURL+"/api/compare/"+postIDArray.join(",")).then(function(response){
                _addToPostTrackArray({data:response.data});
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        }
    };
})
.factory('FetchShareLink', function($http, $rootScope) {
    return {
        get: function(post_id_csv) {
            return $http.get($rootScope.baseURL+"/api/compare/"+post_id_csv+'/share').then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        update:function(id, channel) {
            $http({
                method : 'POST',
                url : $rootScope.baseURL+"/api/share/"+id+'/edit',
                data : {channel:channel}
            })
            .success(function(response){
                //
            })
            .error(function(error){
                // this is not user triggered
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
            ,function(){
                // this is not user triggered
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
            return $http.get($rootScope.baseURL+'/api/user/'+ slug +'/following?page='+ pg).then(function(response){
                _addToUserTrackArray(response.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        follower: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/user/'+ slug +'/follower?page='+ pg).then(function(response){
                _addToUserTrackArray(response.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        get: function(userSlug) {
            return $http.get($rootScope.baseURL+"/api/user/"+userSlug).then(function(response){
                _addToUserTrackArray({data:response.data});
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        liker: function(id, pg) {
            return $http.get($rootScope.baseURL+'/api/post/'+ id +'/likers?page='+ pg).then(function(response){
                _addToUserTrackArray(response.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
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
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        }
    };
})
.factory('FetchNotifications', function($http, $rootScope) {
    return {
        new: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/user/'+slug+'/notification?page='+pg).then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
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
        // @todo delete line below before launch
        return false;
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
.service('Wait', function(){
    this.miliSec = function(ms){
        var start = Date.now(), now = start;
        while (now - start < ms) {
           now = Date.now();
        }
    }
})
.service('RestartApp', function($state, $timeout){
    this.go = function(state){
        // problem: when A log out and log in as B, old data remains and causes problems
        //          ex. profile still shows A instead of B
        //          - clearCache and clearHistory alone not working
        // solution: reload the app on log in page
        $state.go(state).then(function(){
            $timeout(function(){
                window.location.reload();
            },100);
        });
    }
})
.service('LocalJson', function($http){
    var url = "";
    if (ionic.Platform.isAndroid()) {
        url = "/android_asset/www/";
    }
    this.get = function(file_name){
        return $http.get(url + 'data/' + file_name + '.json').then(function (response) {
            return response.data;
        });
    }
})
.service('Tutorial', function(LocalJson){
    var _dummy_tutorial = {"marker" : {"position" : {}}};
    var _tutorials;
    LocalJson.get('tutorials').then(function(json_data){
        _tutorials = json_data;
    });
    var _current_tutorial = _dummy_tutorial;
    var _current_group = '';
    var _current_id = '';
    this.triggerIfNotCompleted = function(group){
        // @todo
        // check flag in current user and return if is_tutorial_completed is true
        if(!localStorage.getItem(group)){
            _current_group = group;
            this.trigger(1);
        }
    }
    this.trigger = function(id){
        _current_id = id;
        _current_tutorial = _tutorials[_current_group][_current_id];
    }
    this.getTitle = function(){
        return _current_tutorial.title;
    }
    this.getMessage = function(){
        return _current_tutorial.message;
    }
    this.getHorizontalPosition = function(){
        return _current_tutorial.marker.position.horizontal;
    }
    this.getVerticalPosition = function(){
        return _current_tutorial.marker.position.vertical;
    }
    this.isTriggered = function(){
        return _current_id != '';
    }
    this.isTherePrevious = function(){
        if(_current_id){
            var previous_id = _current_id - 1;
            return typeof _tutorials[_current_group][previous_id] !== 'undefined';
        }
        return false;
    }
    this.isMarkerArrow = function(){
        return _current_tutorial.marker.type == 'arrow';
    }
    this.isMarkerNone = function(){
        return _current_tutorial.marker.type == 'none';
    }
    this.getCustomMarker = function(){
        return _current_tutorial.marker.type;
    }
    this.next = function(){
        var next_id = _current_id + 1;
        if(typeof _tutorials[_current_group][next_id] !== 'undefined'){
            this.trigger(next_id);
        }
        else{
            localStorage.setItem(_current_group, true);
            if(this._isThisUserCompletedTutorials()){
                // @todo
                // set flag in user db if tutorials are completed
            }
            _current_tutorial = _dummy_tutorial;
            _current_group = '';
            _current_id = '';
        }
    }
    this._isThisUserCompletedTutorials = function(){
        for (var group in _tutorials) {
            if(!localStorage.getItem(group)){
                return false;
            }
        }
        return true;
    }
    this.previous = function(){
        var previous_id = _current_id - 1;
        this.trigger(previous_id);
    }
    this.isHighlightNeeded = function(){
        return (
            typeof _current_tutorial.marker.highlight !== 'undefined' &&
            _current_tutorial.marker.highlight
        )
    }
})
.factory('UsernameAvailability', function($http, $timeout, $rootScope, $q){
    var last_typed_timestmap_milisec = 0;
    var need_to_stay_idle_milisec = 2000;

    return {
        check: function(username){
            var deferred = $q.defer();
            var this_factory = this;
            $http({
                method : 'POST',
                url : $rootScope.baseURL+'/api/register2/validate/username',
                data : {username:username}
            })
            .success(function(){
                deferred.resolve('success');
            })
            .error(function(data, status){
                if(this_factory.isFailed(data)){
                    deferred.resolve('fail');
                }
            });
            return deferred.promise;
        },
        typed: function(username){
            var deferred = $q.defer();
            var this_factory = this;
            last_typed_timestmap_milisec = Date.now();
            $timeout(
                function(){
                    stayed_idle_milisec = Date.now() - last_typed_timestmap_milisec;
                    if(stayed_idle_milisec >= need_to_stay_idle_milisec){
                        this_factory.check(username).then(function(response){
                            deferred.resolve(response);
                        });
                    }
                }, need_to_stay_idle_milisec
            )
            return deferred.promise;
        },
        isFailed: function(data){
            return data.username != undefined && data.username[0] == 'The username is not available';
        }
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
                    return;
                }
            }
        }
    }
})
.factory('ScrollingDetector', function($ionicScrollDelegate){
    var _current_position;
    var _last_position;
    var _prev_is_going_down;
    return {
        isGoingDown: function(){
            if(_current_position){
                if(_last_position == _current_position){
                    return _prev_is_going_down;
                }
                var is_going_down = _last_position < _current_position;
                _prev_is_going_down = is_going_down;
                console.log(is_going_down);
                return is_going_down;
            }
        },
        record: function(pic){
            _last_position = _current_position;
            _current_position = $ionicScrollDelegate.getScrollPosition().top;
        }
    }
})
.factory('NewPost', function($rootScope, $q, FetchPosts){
    var _default_flags = {
        "from_id" : 0, // just for logging purpose
        "is_available" : false
    }
    var _flags_map = {
        "explore" : $rootScope.cloneObj(_default_flags),
        "following" : $rootScope.cloneObj(_default_flags)
    }
    return {
        isAvailable: function(domain, from_id){
            var deferred = $q.defer();
            _flags_map[domain].from_id = from_id;
            if(_flags_map[domain].is_available){
                deferred.resolve(true);
                return deferred.promise;
            }
            else{
                FetchPosts.checkNewer(domain, from_id).then(function(response){
                    _flags_map[domain].is_available = response;
                    deferred.resolve(response);
                });
                return deferred.promise;
            }
        },
        resetFlags: function(domain){
            _flags_map[domain] = $rootScope.cloneObj(_default_flags);
        },
        log: function(){
            console.log($rootScope.cloneObj(_flags_map));
        }
    }
})
.factory('ComparePosts', function($http, FetchPosts, FetchShareLink, $rootScope, $q, PostTimer){
    var _post_array = [];
    var _post_id_array = [];
    var _is_post_added_map = [];
    var _last_filter_gender = null;
    var _last_filter_age_group = null;

    return {
        share: function(){
            var deferred = $q.defer();
            if(_post_id_array.length == 0){
                deferred.resolve();
                return deferred.promise;
            }
            FetchShareLink.get(_post_id_array).then(function(response){
                deferred.resolve(response);
            });
            return deferred.promise;
        },
        refresh: function(){
            var deferred = $q.defer();
            this.sort(_last_filter_gender, _last_filter_age_group).then(function() {
                deferred.resolve();
            });
            return deferred.promise;
        },
        sort: function(gender, age_group){
            var deferred = $q.defer();
            var this_factory = this;
            this._fetch().then(function() {
                var target_key = this_factory._getTargetKeyForPostAnalytic(gender, age_group);
console.log(target_key);
console.log(_post_array);
                _post_array.sort(function(a, b){
                    var keyA = parseInt(a.post_analytic[0][target_key]);
                    var keyB = parseInt(b.post_analytic[0][target_key]);
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
            if (_post_id_array.indexOf(post_id) != -1) {
                _post_id_array.splice(_post_id_array.indexOf(post_id), 1);
                _is_post_added_map[post_id] = false;
                this._removeFromPostArray(post_id);
            }
            else{
                _post_id_array.push(post_id);
                _is_post_added_map[post_id] = true;
            }
            localStorage.setItem('post_id_array', JSON.stringify(_post_id_array));
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
        reset: function(){
            _post_array = [];
            _post_id_array = [];
            _is_post_added_map = [];
        },
        getLastFilters: function(){
            this._setLastFiltersIfNull();
            return {
                gender: _last_filter_gender,
                age: _last_filter_age_group,
            }
        },
        isFriendsSelected: function(){
            return _last_filter_gender == 'friends';
        },
        isAnyPostExpired: function(){
            for(var i = 0; i < _post_array.length; i++){
                if(PostTimer.elapsed(_post_array[i].created_at)){
                    return true;
                }
            }
            return false;
        },
        _restoreFromLocalStorage: function(){
            if(localStorage.getItem('post_id_array')){
                _post_id_array = JSON.parse(localStorage.getItem('post_id_array'));
                for(var i = 0; i < _post_id_array.length; i++){
                    _is_post_added_map[_post_id_array[i]] = true;
                }
            }
        },
        _fetch: function(){
            var deferred = $q.defer();
            var this_factory = this;
            if(_post_id_array.length == 0){
                deferred.resolve();
                return deferred.promise;
            }
            FetchPosts.compare(_post_id_array).then(function(response){
                posts = response;
                for (index = 0; index < posts.length; ++index) {
                    this_factory._setTotalFieldsInPostAnalytic(posts[index].post_analytic);
                }
                _post_array = posts;
                this_factory._syncClientIfDeleted(posts);
                deferred.resolve();
            });
            return deferred.promise;
        },
        _syncClientIfDeleted: function(posts){
            if(posts.length != _post_id_array.length){
                for (var i = 0; i < _post_id_array.length; i++) {
                    var found = false;
                    for(var j = 0; j < posts.length; j++){
                        if(posts[j].id == _post_id_array[i]){
                            found = true;
                            break;
                        }
                    }
                    if(!found){
                        this.toggle(_post_id_array[i]);
                        i--;
                    }
                }
            }
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
            if(gender == 'friends'){
                return gender;
            }
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
})
.factory('ComparePostSet', function($http, FetchPosts, FetchShareLink, $q){
    return {
        share: function(post_id_csv){
            var deferred = $q.defer();
            FetchShareLink.get(post_id_csv).then(function(response){
                deferred.resolve(response);
            });
            return deferred.promise;
        },
        sort: function(gender, age_group, post_array){
            var this_factory = this;
            var target_key = this_factory._getTargetKeyForPostAnalytic(gender, age_group);
            post_array.sort(function(a, b){
                var keyA = parseInt(a.post_analytic[0][target_key]);
                var keyB = parseInt(b.post_analytic[0][target_key]);
                if(keyA < keyB) return 1;
                if(keyA > keyB) return -1;
                return 0;
            });
        },
        partialLikes: function(filter_gender, filter_age_group, post_id, post_array){
            var target_key = this._getTargetKeyForPostAnalytic(filter_gender, filter_age_group);
            for(var i = 0; i < post_array.length; i++){
                this_post = post_array[i];
                if(post_id == this_post.id){
                    return this_post.post_analytic[0][target_key];
                }
            }
        },
        fetch: function(post_id_array){
            var deferred = $q.defer();
            var this_factory = this;
            FetchPosts.compare(post_id_array).then(function(response){
                post_array = response;
                for (index = 0; index < post_array.length; ++index) {
                    this_factory._setTotalFieldsInPostAnalytic(post_array[index]);
                }
                deferred.resolve(post_array);
            });
            return deferred.promise;
        },
        _setPlaceHolderIfPostAnalyticIsEmpty: function(post_analytic){
            if(post_analytic[0] === undefined){
                post_analytic[0] = [];
            }
        },
        _setTotalFieldsInPostAnalytic: function(post){
            post_analytic = post.post_analytic;
            this._setPlaceHolderIfPostAnalyticIsEmpty(post_analytic);
            post_analytic[0].dummy_total_key = 1;
            post_analytic[0].total_all = post.like_count;
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
        _getTargetKeyForPostAnalytic: function(gender, age_group){
            if(gender == 'friends'){
                return gender;
            }
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
        }
    }
});
