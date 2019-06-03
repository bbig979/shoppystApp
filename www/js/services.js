angular.module('starter.services', [])
.filter('unsafe', function($sce){
   return function(val){
       return $sce.trustAsHtml(val);
   }
})
// ref: https://medium.com/one-tap-software/show-an-ionic-1-spinner-while-online-images-load-8dd65fa51efc
.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                //call the function that was passed
                scope.$apply(attrs.imageonload);
            });
        }
    };
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
.directive('scrollWatch', function(SlideHeader) {
    return function(scope, elem, attr) {
        var cushion_for_subtle_scroll_up = 150;
        var start_position = 500;
        var this_scroll_scope_id = scope.$parent.$id;

        SlideHeader.setCurrentScrollScopeId(this_scroll_scope_id);
        SlideHeader.setShouldHide(this_scroll_scope_id, false);
        SlideHeader.setPreviousScrollPosition(this_scroll_scope_id, 0);

        elem.bind('scroll', function(e) {
            if(e.originalEvent.detail === undefined){
                return;
            }
            if(e.originalEvent.detail.scrollTop === undefined){
                return;
            }
            var current_scroll_position = e.originalEvent.detail.scrollTop;
            var previous_scroll_position = SlideHeader.getPreviousScrollPosition(this_scroll_scope_id);

            if (previous_scroll_position == current_scroll_position) {
                return;
            }
            if (current_scroll_position < start_position) {
                SlideHeader.setShouldHide(this_scroll_scope_id, false);
                scope.$apply();
                return;
            }

            if (previous_scroll_position > current_scroll_position) {
                if(previous_scroll_position - current_scroll_position < cushion_for_subtle_scroll_up){
                    return;
                }
                SlideHeader.setShouldHide(this_scroll_scope_id, false);
            }
            else{
                SlideHeader.setShouldHide(this_scroll_scope_id, true);
            }

            SlideHeader.setPreviousScrollPosition(this_scroll_scope_id, current_scroll_position)
            scope.$apply();
        });
    };
})
.factory('SlideHeader', function(){
    var current_scroll_scope_id;
    var should_hide_map = [];
    var previous_scroll_position_map = [];
    return {
        viewEntered: function(scope){
            if(should_hide_map[scope.$id] !== undefined){
                this._enable(scope);
            }
            else{
                this._disable();
            }
            this.setShouldHide(current_scroll_scope_id, false);
        },
        _enable: function(scope){
            if(scope.scroll_scope_id){
                current_scroll_scope_id = scope.scroll_scope_id;
            }
            else{
                scope.scroll_scope_id = current_scroll_scope_id;
            }

        },
        _disable: function(){
            current_scroll_scope_id = 0;
        },
        getCurrentScrollScopeId: function(scroll_scope_id){
            return current_scroll_scope_id;
        },
        setCurrentScrollScopeId: function(scroll_scope_id){
            current_scroll_scope_id = scroll_scope_id;
        },
        getShouldHide: function(){
            return should_hide_map[current_scroll_scope_id];
        },
        setShouldHide: function(scope_id, value){
            should_hide_map[scope_id] = value;
        },
        getPreviousScrollPosition: function(scope_id){
            return previous_scroll_position_map[scope_id];
        },
        setPreviousScrollPosition: function(scope_id, value){
            previous_scroll_position_map[scope_id] = value;
        }
    }
})
.factory('Config', function($q, $http, $rootScope){
    var data = {};
    return {
        init: function(){
            var deferred = $q.defer();
            $http.get($rootScope.baseURL+'/api/config').success(function(response){
                data = response;
                deferred.resolve();
            });
            return deferred.promise;
        },
        get: function(key){
            if(data == null || typeof data[key] === 'undefined'){
                return null;
            }
            return data[key];
        }
    }
})
.factory('BlockerMessage', function(Tutorial, $rootScope, Config) {
    var message = '';
    var is_needed = false;
    return {
        init: function(){
            if(this._isInfoIncompleted()){
                message = 'We need your age and gender to give accurate feedback.';
                is_needed = true;
                return;
            }
            if(this._isNewVersionAvailable()){
                message = "New version is available. Let's update an app!";
                is_needed = true;
                return;
            }
            is_needed = false;
        },
        get: function(){
            return message;
        },
        isNeeded: function(){
            if(Tutorial.isTriggered()){
                return false;
            }
            return is_needed;
        },
        _isInfoIncompleted: function(){
            return false;
            if(localStorage.getItem('user')){
                var user = JSON.parse(localStorage.getItem('user'));
                return user.age == 0 || user.gender == "";
            }
            return false;
        },
        _isNewVersionAvailable: function(){
            if(Config.get('version') == null){
                return false;
            }
            return Config.get('version') != $rootScope.clientVersion;
        }
    };
})
.factory('FetchPhoto', function($http, $rootScope, Vote){
    return {
        getList: function(postID){
            return $http.get($rootScope.baseURL+"/api/post/"+postID+"/vote").then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
    };
})
.factory('BusinessObjectList', function($timeout, $rootScope, preloader, PostComment, FetchPosts, GoalBO, $q, Util){
    return {
        reset: function($scope){
            var config = $scope.business_object_list_config;

            $scope.scope_start_timestamp = Math.floor(Date.now() / 1000);
            $scope.is_pagination_done = false;
            $scope.page = 1;
            $scope.list = [];
            $scope.preloaded_response = [];
            $scope.is_list_loading = true;
            $scope.is_result_empty = false;

            if(config.callback && typeof config.callback === "function") {
                config.callback();
            }
        },
        _fetch: function($scope){
            var config = $scope.business_object_list_config;

            if('comment' == config.type){
                return PostComment[config.method]($scope.post_id, $scope.scope_start_timestamp, $scope.page);
            }
            else if('post' == config.type){
                return FetchPosts.index(this._buildRequestObject($scope));
            }
            else if('goal' == config.type){
                return GoalBO.index(this._buildRequestObject($scope));
            }
        },
        _buildRequestObject: function($scope){
            var config = $scope.business_object_list_config;

            return {
                type : config.type,
                method : config.method,
                page : $scope.page,
                scope_start_timestamp : $scope.scope_start_timestamp,
                profile_user_slug : $scope.profile_user_slug,
                search_type : $scope.search_type,
                search_term : $scope.search_term,
                hash : $scope.hash,
                search_filter_serialized : Util.serialize($scope.search_filter),
            };
        },
        preload: function($scope){
            if(! $scope.is_pagination_done){
                var this_factory = this;

                this_factory._fetch($scope).then(function(response){
                    $scope.preloaded_response = response;
                    var image_array = this_factory._getImageArray(response.data);
                    preloader.preloadImages(image_array);
                });
            }
        },
        load: function($scope){
            var this_factory = this;
            var config = $scope.business_object_list_config;
            var deferred = $q.defer();

            this_factory._fetch($scope).then(function(response){
                this_factory.render($scope, response);
                deferred.resolve();
                if(config.preload){
                    this_factory.preload($scope, response);
                }
            });
            return deferred.promise;
        },
        render: function($scope, response){
            if($scope.page == 1){
                if(response.data.length == 0){
                    $scope.is_result_empty = true;
                }
            }
            else{
                $timeout(function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }

            if(!response.next_page_url){
                $scope.is_pagination_done = true;
            }
            $scope.list = $scope.list.concat(response.data);
            $scope.page++;
            $scope.is_list_loading = false;
        },
        _getImageArray: function(data){
            var image_array = [];
            for(var i=0; i<data.length; i++){
                image_array.push( $rootScope.photoPath( data[i].user.profile_img_path, 's' ));
                for(var j=0; j<data[i].photos.length; j++){
                    image_array.push( $rootScope.photoPath( data[i].photos[j].img_path, 'm' ));
                }
            }
            return image_array;
        }
    }
})
.factory('PostComment', function($http, $rootScope, $q){
    return {
        fetch: function(post_id, scope_start_timestamp, page){
            return $http.get($rootScope.baseURL+"/api/post/"+post_id+"/comment?scope_start_timestamp="+scope_start_timestamp+"&page="+page).then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        delete: function(comment){
            $http.post($rootScope.baseURL+'/api/comment/'+comment.id+'/delete').success(function(){
                // do nothing
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        },
        report: function(comment){
            $http.post($rootScope.baseURL+'/api/comment/'+comment.id+'/report', {
                content: comment.content
            })
            .success(function(){
                // do nothing
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
            });
        },
        submit: function(message, post_id, parent_id = 0){
            var deferred = $q.defer();
            var url = $rootScope.baseURL+'/api/post/'+post_id+'/comment/create';
            if(parent_id){
                url = $rootScope.baseURL+'/api/post/'+post_id+'/comment/'+parent_id+'/reply/create';
            }

            $http({
                method : 'POST',
                url : url,
                data : {comment:message}
            })
            .success(function(data, status){
                deferred.resolve(data);
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
                deferred.reject();
            });
            return deferred.promise;
        },
        insert: function(new_comment, comments, parent_id){
            if(parent_id){
                for (var i=0; i<comments.length; i++) {
                    if(comments[i].id == parent_id){
                        comments[i].replies.unshift(new_comment);
                    }
                }
            }
            else{
                comments.unshift(new_comment);
            }
        }
    };
})
.factory('PostCard', function(Vote, $rootScope, $ionicActionSheet, $ionicPopup, $ionicLoading, $http, $state, UxAnalytics, PostShare, DeepLink){
    return {
        commentCount: function(post){
            var comment_count = 0;
            if(post.comment_info && post.comment_info.count){
                comment_count = post.comment_info.count;
            }
            return this._countSummaryText(comment_count, 'Comment');
        },
        voteCount: function(post){
            var vote_count = 0;
            for(var i=0; i< post.photos.length; i++){
                var photo = post.photos[i];
                if(photo.vote_info && photo.vote_info.count){
                    vote_count += photo.vote_info.count;
                }
            }
            return this._countSummaryText(vote_count, 'Vote');
        },
        voteToggle: function(photo){
            Vote.toggle(photo);
        },
        moreOption: function(list, index, is_mine = false, account_info = null){
            var action = 'report';
            var action_pascal_case = 'Report';
            var buttons = [];
            if(is_mine){
                action = 'delete';
                action_pascal_case = 'Delete';
                buttons = [
                    { text: 'Edit' }
                ];
            }
            $ionicActionSheet.show({
                buttons: buttons,
                destructiveText: action_pascal_case,
                cancelText: 'Cancel',
                cancel: function() {

                },
                buttonClicked: function(button_index) {
                    switch (button_index){
                        case 0:
                            $state.go('tab.post-edit',{post: list[index]});
                            return true;
                    }
                },
                destructiveButtonClicked: function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: action_pascal_case,
                        template: 'Are you sure you want to '+action+' this post?'
                    });

                    confirmPopup.then(function(res) {
                        if(res) {
                            $ionicLoading.show();
                            $http.post($rootScope.baseURL+'/api/post/'+list[index].id+'/'+action).success(function(){
                                $ionicLoading.hide();
                                list.splice(index,1);
                                if(is_mine){
                                    account_info.posts_count--;
                                }
                                return true;
                            })
                            .error(function(data, status){
                                $rootScope.handleHttpError(data, status);
                            });
                        }
                    });
                    return true;
                }
            });
        },
        share: function(post) {
            UxAnalytics.startScreen('share-post');
            $ionicLoading.show();
            PostShare.getHash(post.id).then(function(hash){
                if(hash){
                    DeepLink.share($rootScope.baseURL + '/s/' + hash);
/*
                    var options = {
                        //message: 'Choose your favorite outfit!',
                        //subject: 'Choose Your Favorite Outfit!',
                        url: $rootScope.baseURL + '/s/' + hash
                    }
                    var onSuccess = function(result) {
                        console.log($rootScope.baseURL + '/s/' + hash);
                        console.log("Shared to app: " + result.app);
                        PostShare.update(hash, result.app);
                    }
                    var onError = function(msg) {
                        console.log("Sharing failed with message: " + msg);
                    }
                    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
*/
                }
                else{
                    $rootScope.popupMessage('Oops', 'You cannot send other\'s outfit');
                }
                $ionicLoading.hide();
            });
        },
        _countSummaryText: function(count, domain){
            if(count == 0){
                return '';
            }
            else if(count == 1){
                return ' · ' + count + ' ' + domain;
            }
            else{
                return ' · ' + count + ' ' + domain + 's';
            }
        }
    };
})
.factory('FCMHandler', function($http, $rootScope, $q) {
    return {
        storeNewToken: function() {
            var deferred = $q.defer();

            $http({
                method : 'POST',
                url : $rootScope.baseURL+"/api/fcm",
                data : {
                    type: noAngularVar_device,
                    token: noAngularVar_fcmToken
                }
            })
            .success(function(data, status){
                deferred.resolve(data);
            })
            .error(function(data, status){
                deferred.reject();
            });

            return deferred.promise;
        },
        registerNewToken: function() {
            if(this.isNewTokenFound()){
                this.storeNewToken().then(function(response){
                    localStorage.setItem('fcm_token', noAngularVar_fcmToken);
                });
            }
        },
        isNewTokenFound: function() {
            return noAngularVar_fcmToken != null &&
                   noAngularVar_fcmToken != localStorage.getItem('fcm_token');
        }
    };
})
.factory('Util', function() {
    return {
        serialize: function(obj) {
            var parts = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
                }
            }
            return "?" + parts.join('&');
        },
        numberWithCommas: function(x) {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        }
    };
})
.factory('FetchPosts', function($http, $rootScope, PostTimer, Util) {
    var _addToPostTrackArray = function(pagingInfo) {
        $rootScope.postTrackArray = $rootScope.postTrackArray.concat(pagingInfo.data);
    };
    return {
        index: function(arg_info) {
            var this_factory = this;
            return $http.get($rootScope.baseURL+"/api/post"+Util.serialize(arg_info)).then(function(response){
                _addToPostTrackArray(response.data);
                this_factory.addDisplayAttr(response.data.data);
                console.log(response.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        following: function($scope) {
            var this_factory = this;
            return $http.get($rootScope.baseURL+"/api/home?page="+$scope.page+"&scope_start_timestamp="+$scope.scope_start_timestamp).then(function(response){
                _addToPostTrackArray(response.data);
                this_factory.addDisplayAttr(response.data.data);
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
            var this_factory = this;
            return $http.get($rootScope.baseURL+"/api/post/"+postID).then(function(response){
                if(response.data.length > 0){
                    _addToPostTrackArray({data:response.data});
                    this_factory.addDisplayAttr([response.data]);
                }
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        new: function($scope){
            var this_factory = this;
            return $http.get($rootScope.baseURL+"/api/explore?page="+$scope.page+"&search_term="+$scope.search_term+"&search_type="+$scope.search_type+"&scope_start_timestamp="+$scope.scope_start_timestamp).then(function(response){
                _addToPostTrackArray(response.data);
                this_factory.addDisplayAttr(response.data.data);
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
        user: function(userSlug, tab, pg, last_align_class, last_set_ids) {
            var this_factory = this;
            return $http.get($rootScope.baseURL+"/api/user/"+userSlug+"/post?tab="+tab+"&page="+pg).then(function(response){
                _addToPostTrackArray(response.data);
                this_factory.addDisplayAttr(response.data.data);
                this_factory.addAlignClass(response.data.data, last_align_class, last_set_ids);
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
        },
        addDisplayAttr: function(posts){
            for(var i=0; i<posts.length; i++){
                var post = posts[i];
                post.display_time = PostTimer.timeLeft(post.created_at, post.visibility);
                post.display_time += ' · ' + post.visibility.charAt(0).toUpperCase() + post.visibility.slice(1);
                post.display_icon = PostTimer.icon(post.created_at);
                post.display_share = true;
                if(post.visibility != 'permanent' && post.display_time.indexOf('Left') == -1){
                    post.display_share = false;
                }
            }
        },
        addAlignClass: function(posts, last_align_class, last_set_ids){
            for(var i=0; i<posts.length; i++){
                var post = posts[i];

                var current_align_class = last_align_class;
                if(last_set_ids != post.post_id_csv){
                    current_align_class = (last_align_class == 'left-align') ? 'right-align' : 'left-align';
                }
                post.align_class = current_align_class;

                last_set_ids = post.post_id_csv;
                last_align_class = post.align_class;
            }
        }
    };
})
.factory('PostShare', function($http, $rootScope) {
    return {
        getHash: function(post_id) {
            return $http.get($rootScope.baseURL+"/api/post/"+post_id+'/share').then(function(response){
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
.factory('FetchGoals', function($http, $rootScope, Util) {
    return {
        get: function() {
            return $http.get($rootScope.baseURL+'/api/goal').then(function(response){
                return response.data;
            }
            ,function(){
                // this is not user triggered
            });
        }
    };
})
.factory('GoalBO', function($http, $rootScope, Util, $q) {
    return {
        create: function(search_term){
            var deferred = $q.defer();

            $http({
                method : 'POST',
                url : $rootScope.baseURL+"/api/goal/create",
                data : {search_term:search_term}
            })
            .success(function(data, status){
                deferred.resolve(data);
            })
            .error(function(data, status){
                $rootScope.handleHttpError(data, status);
                deferred.reject();
            });

            return deferred.promise;
        },
        index: function(arg_info) {
            var this_factory = this;
            return $http.get($rootScope.baseURL+"/api/goals"+Util.serialize(arg_info)).then(function(response){
                this_factory.addDisplayAttr(response.data.data);
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        addDisplayAttr: function(goals){
            for(var i=0; i<goals.length; i++){
                var goal = goals[i];
                goal.display_count = Util.numberWithCommas(goal.count);
            }
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

.factory('FetchSettings', function($http, $rootScope) {
    return {
        get: function(_setting_key) {
            return $http.get($rootScope.baseURL+'/api/config/'+ _setting_key).then(function(response){
                return response.data;
            }
            ,function(){
                // this is not user triggered
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
    const sec_in_one_week = 60 * 60 * 24 * 7
    const sec_in_one_day = 60 * 60 * 24;
    const sec_in_one_hour = 60 * 60;
    const sec_in_one_min = 60;
    const two_third = 2/3;
    const one_third = 1/3;

    this.elapsed = function(created_at){
        // @todo delete line below before launch
        return false;
        return this._secPassed(created_at) > sec_in_one_day;
    }
    this.icon = function(created_at){
        var sec_passed = this._secPassed(created_at);
        var sec_remains = sec_in_one_day - sec_passed;

        if(sec_remains < 0){
            return "fa-calendar";
        }
        if(sec_remains / sec_in_one_day > two_third){
            return "fa-hourglass-start";
        }
        if(sec_remains / sec_in_one_day > one_third){
            return "fa-hourglass-half";
        }
        return "fa-hourglass-end";
    }
    this.timeLeft = function(created_at, visibility){
        var sec_passed = this._secPassed(created_at);
        var sec_remains = sec_in_one_day - sec_passed;
        var plural_notation = '';

        if(sec_remains < 0 || visibility == 'permanent'){
            if(sec_remains >= -1 * sec_in_one_week){
                return moment(created_at + "-00:00").fromNow();
            }
            return moment(created_at + "-00:00").format('LL');
        }
        if(sec_remains < sec_in_one_hour){
            var min_remains = Math.floor(sec_remains / sec_in_one_min);
            if(min_remains > 1){
                plural_notation = 's';
            }
            return min_remains + ' minute' + plural_notation + ' Left';
        }
        var hour_remains = Math.floor(sec_remains / sec_in_one_hour);
        if(hour_remains > 1){
            plural_notation = 's';
        }
        return hour_remains + ' hour' + plural_notation + ' Left';
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
.service('Tutorial', function(){
    var _dummy_tutorial = {"marker" : {"position" : {}}};
    var _tutorials = null;
    var _current_tutorial = _dummy_tutorial;
    var _current_group = '';
    var _current_id = '';
    this.init = function(json_data){
        _tutorials = json_data;
    }
    this.triggerIfNotCompleted = function(group){
        // @todo
        // check flag in current user and return if is_tutorial_completed is true
        if(! localStorage.getItem(group) && _tutorials != null){
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
.factory('FetchNotifications', function($http, $timeout, $rootScope, $q){
    var last_moved_timestmap_milisec = 0;

    return {
        new: function(slug, pg) {
            return $http.get($rootScope.baseURL+'/api/user/'+slug+'/notification?page='+pg).then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        check: function(_slug){
            var deferred = $q.defer();
            var this_factory = this;
            $http({
                method : 'GET',
                url : $rootScope.baseURL+'/api/user/'+_slug+'/notification/count'
            })
            .success(function(response){
                deferred.resolve(response);
            })
            .error(function(data, status){
                deferred.resolve("fail");
            });

            return deferred.promise;
        },
        stateChanged: function(_slug, _need_to_stay_idle_milisec){
            var deferred = $q.defer();
            var this_factory = this;
            last_moved_timestmap_milisec = Date.now();
            $timeout(
                function(){
                    stayed_idle_milisec = Date.now() - last_moved_timestmap_milisec;
                    if(stayed_idle_milisec >= _need_to_stay_idle_milisec){
                        this_factory.check(_slug).then(function(response){
                            deferred.resolve(response);
                        });
                    }
                }, _need_to_stay_idle_milisec
            )
            return deferred.promise;
        }
    }
})
.factory('FetchSearchResult', function($http, $timeout, $rootScope, $q){
    var last_typed_timestmap_milisec = 0;

    return {
        check: function(_most_recent_post_id, _search_term, _search_type, _page){
            var deferred = $q.defer();
            var this_factory = this;
            var search_term = _search_term;
            if (_search_term == "")
            {
                search_term = "_top_posts";
            }
            $http({
                method : 'GET',
                url : $rootScope.baseURL+'/api/search/'+search_term+'/'+_search_type+"?page="+_page+"&from_id="+_most_recent_post_id
            })
            .success(function(response){
                deferred.resolve(response);
            })
            .error(function(data, status){
                deferred.resolve("fail");
            });

            return deferred.promise;
        },
        typed: function(_most_recent_post_id, _search_term, _search_type, _page, _need_to_stay_idle_milisec){
            var deferred = $q.defer();
            var this_factory = this;
            last_typed_timestmap_milisec = Date.now();
            $timeout(
                function(){
                    stayed_idle_milisec = Date.now() - last_typed_timestmap_milisec;
                    if(stayed_idle_milisec >= _need_to_stay_idle_milisec){
                        this_factory.check(_most_recent_post_id, _search_term, _search_type, _page).then(function(response){
                            deferred.resolve(response);
                        });
                    }
                }, _need_to_stay_idle_milisec
            )
            return deferred.promise;
        }
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
                    deferred.resolve(data.username[0]);
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
            return data.username != undefined;
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
            for(var i = 0; i < _picture_array.length; i++){
                if(_picture_array[i] == pic){
                    return;
                }
            }
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
// problem : Appsee is not available when testing in web browser.
// cause : Default behavior of Ionic
// solution : skip if Appsee is not available
.factory('UxAnalytics', function(){
    return {
        startScreen: function(screen) {
            if(typeof Appsee !== 'undefined'){
                Appsee.startScreen(screen);
            }
        },
        setUserId: function(user_id){
            if(typeof Appsee !== 'undefined'){
                Appsee.setUserId(user_id);
            }
        }
    }
})
.factory('DirtyHack', function($ionicScrollDelegate){
    return {
        // problem : in android, "horizontal scroll" of first content rarely works
        // cause : ionic recognize "horizontal scroll" as "pull to refresh"
        // solution : move 1 pixel down so that ionic recognize it as "horizontal scroll"
        preventZeroTop: function(time = 500) {
            var position = $ionicScrollDelegate.getScrollPosition();
            if(position.top == 0){
                setTimeout(function(){
                    $ionicScrollDelegate.scrollTo(0, 1, false);
                }, time);
            }
        }
    }
})
.factory('DeepLink', function($state, $ionicHistory, $rootScope){
    var stash = null;
    return {
        share: function(url) {
            var hash = this._getHashFromUrl(url);
            var properties = {
                canonicalIdentifier: hash,
                canonicalUrl: url,
            }

            var branchUniversalObj = null

            Branch.createBranchUniversalObject(properties).then(function (res) {
                branchUniversalObj = res;
                // optional fields
                var analytics = {}

                // optional fields
                var properties = {
                    $fallback_url: url,
                }

                var message = 'Check out these outfit ideas';

                // optional listeners (must be called before showShareSheet)
                branchUniversalObj.onShareSheetLaunched(function (res) {
                  // android only
                  console.log(res)
                })
                branchUniversalObj.onShareSheetDismissed(function (res) {
                  console.log(res)
                })
                branchUniversalObj.onLinkShareResponse(function (res) {
                  console.log(res)
                })
                branchUniversalObj.onChannelSelected(function (res) {
                  // android only
                  console.log(res)
                })

                // share sheet
                branchUniversalObj.showShareSheet(analytics, properties, message);
            }).catch(function (err) {
                alert('Error: ' + JSON.stringify(err));
            })
        },
        open: function(data) {
            var hash = this._getHashFromUrl(data.$fallback_url);
            if($rootScope.currentUser){
                this._openPostFromHash(hash);
            }
            else{
                this._storeHashInStash(hash);
            }
        },
        openIfStashed: function() {
            var hash = this._fetchHashFromStash();
            if(hash){
                this._openPostFromHash(hash);
                return true;
            }
            return false;
        },
        _storeHashInStash: function(hash) {
            stash = hash
        },
        _fetchHashFromStash: function() {
            // empty stash
            var hash = stash;
            stash = null;

            return hash;
        },
        _getHashFromUrl: function(url) {
            var url_piece_array = url.split("/");
            var last_index = url_piece_array.length - 1;
            return url_piece_array[last_index];
        },
        _openPostFromHash: function(hash){
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                historyRoot: true
            });

            $state.go('tab.post-detail', {hash: hash});
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
.factory('ImageUpload', function($http){
    return {
        _getBlobImageByURL: function(url) {
            var dfd = new $.Deferred();
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function() {
            dfd.resolve(xhr.response);
            };
            xhr.open('GET', url);
            xhr.send();
            return dfd.promise();
        },
        send: function(image_url, post_url, success, fail, data){
            this._getBlobImageByURL(image_url).then(function(imgBlob){
                $http({
                  method: 'POST',
                  url: post_url,
                  headers: {
                      'Content-Type': undefined
                  },
                  data: data,
                  transformRequest: function (data, headersGetter) {
                      var formData = new FormData();
                      angular.forEach(data, function (value, key) {
                          if(typeof value !== "undefined"){
                              formData.append(key, value);
                          }
                      });
                      var imgName = image_url.substr(image_url.lastIndexOf('/') + 1);
                      formData.append('image', imgBlob, imgName);
                      return formData;
                  }
                })
                .success(success)
                .error(fail);
            });
        }
    }
})
.factory('VoteResult', function($http, FetchPhoto, $q){
    return {
        getCount: function(filter_gender, filter_age_group, photo_id, photo_array){
            var target_key = this._getTargetKeyForPhotoAnalytic(filter_gender, filter_age_group);
            for(var i = 0; i < photo_array.length; i++){
                this_photo = photo_array[i];
                if(photo_id == this_photo.id){
                    return this_photo.photo_analytic[target_key];
                }
            }
        },
        getTopPhotoId: function(filter_gender, filter_age_group, photo_array){
            var target_key = this._getTargetKeyForPhotoAnalytic(filter_gender, filter_age_group);
            var top_vote_count = 0;
            var top_photo_id;
            for(var i = 0; i < photo_array.length; i++){
                this_photo = photo_array[i];
                if(top_vote_count <= parseInt(this_photo.photo_analytic[target_key])){
                    top_photo_id = this_photo.id;
                    top_vote_count = parseInt(this_photo.photo_analytic[target_key]);
                }
            }
            if(top_vote_count == 0){
                return 0;
            }
            return top_photo_id;
        },
        fetch: function(post_id){
            var deferred = $q.defer();
            var this_factory = this;
            FetchPhoto.getList(post_id).then(function(response){
                var photo_array = response.photos;
                for (index = 0; index < photo_array.length; ++index) {
                    for(var j = 0; j < response.photo_analytic_array.length; ++j){
                        if(response.photo_analytic_array[j].id == photo_array[index].id){
                            photo_array[index].photo_analytic = response.photo_analytic_array[j];
                        }
                    }
                    photo_array[index].vote_count = 0;
                    if(photo_array[index].vote_info){
                        photo_array[index].vote_count = photo_array[index].vote_info.count;
                    }
                    this_factory._setTotalFieldsInPhotoAnalytic(photo_array[index]);
                }
                deferred.resolve(photo_array);
            });
            return deferred.promise;
        },
        _setPlaceHolderIfPhotoAnalyticIsEmpty: function(photo_analytic){
            if(photo_analytic === undefined){
                photo_analytic = [];
            }
        },
        _setTotalFieldsInPhotoAnalytic: function(photo){
            photo_analytic = photo.photo_analytic;
            this._setPlaceHolderIfPhotoAnalyticIsEmpty(photo_analytic);
            photo_analytic.dummy_total_key = 1;
            photo_analytic.total_all = photo.vote_count;
            photo_analytic.total_gender =
                photo_analytic.male +
                photo_analytic.female;
            photo_analytic.total_age_group =
                photo_analytic.teens +
                photo_analytic.twenties +
                photo_analytic.thirties +
                photo_analytic.forties +
                photo_analytic.fifties;
        },
        _getTargetKeyForPhotoAnalytic: function(gender, age_group){
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
})
.factory('SearchFilter', function($stateParams, $ionicScrollDelegate) {
    var _filter_info = {};

    return {
        init: function(){
            _filter_info[ this._getSearchId() ] = {
                visible: false,
                age: 'all',
                gender: 'all',
            };
        },
        set: function(key, val){
            _filter_info[ this._getSearchId() ][key] = val;
        },
        get: function(key) {
            return _filter_info[ this._getSearchId() ][key];
        },
        getAllInfo: function(){
            return _filter_info[ this._getSearchId() ];
        },
        isDefault: function() {
            if(_filter_info[ this._getSearchId() ]){
                return _filter_info[ this._getSearchId() ].age == 'all' &&
                    _filter_info[ this._getSearchId() ].gender == 'all';
            }
            return true;
        },
        toggleVisibility: function() {
            _filter_info[ this._getSearchId() ].visible = ! _filter_info[ this._getSearchId() ].visible;
            if(_filter_info[ this._getSearchId() ].visible){
                $ionicScrollDelegate.scrollTo(0, 1 ,true);
            }
        },
        isVisible: function() {
            if(_filter_info[ this._getSearchId() ]){
                return _filter_info[ this._getSearchId() ].visible;
            }
            return false;
        },
        _getSearchId(){
            return $stateParams.type + '_' + $stateParams.searchTerm;
        },
    };
})
.factory('LoyaltyPoints', function($http, $rootScope) {
    return {
        visit: function(){
            var interval = 6;
            var current_timestamp = Math.floor(Date.now() / 1000);
            var last_timestamp = 0;
            if(localStorage.getItem('timestamp_loyalty_point_visit')){
                last_timestamp = localStorage.getItem('timestamp_loyalty_point_visit');
            }

            if(last_timestamp + 60 * interval <= current_timestamp){
                localStorage.setItem('timestamp_loyalty_point_visit', current_timestamp);
                this.create('App visit after ' + interval + ' hours', 1);
            }
        },
        summary: function() {
            return $http.get($rootScope.baseURL+'/api/loyalty_points/summary').then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        create: function(description, points) {
            return $http.post($rootScope.baseURL+'/api/loyalty_points/create?description=' + description + '&points=' + points).then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        },
        convert: function() {
            return $http.post($rootScope.baseURL+'/api/loyalty_points/convert').then(function(response){
                return response.data;
            }
            ,function(response){
                $rootScope.handleHttpError(response.data, response.status);
            });
        }
    };
})
.factory('Vote', function($http, $rootScope){
    return {
        toggle: function(photo){
            if(photo.user_liked){
                $http.get($rootScope.baseURL+'/api/photo/'+photo.id+'/unvote').success(function(){
                })
                .error(function(data, status){
                    $rootScope.handleHttpError(data, status);
                });

                photo.vote_info.count--;
                if(photo.vote_info.count == 0){
                    photo.vote_info = null;
                }
            }
            else{
                $http.get($rootScope.baseURL+'/api/photo/'+photo.id+'/vote').success(function(){
                })
                .error(function(data, status){
                    $rootScope.handleHttpError(data, status);
                });
                if(photo.vote_info){
                    photo.vote_info.count++;
                }
                else{
                    photo.vote_info = {count: 1};
                }
            }
            photo.user_liked = ! photo.user_liked;
        },
        /*
        trackAndUpdateVote: function(photo){
            for(i = 0; i < $rootScope.postTrackArray.length; i++){
                thisPost = $rootScope.postTrackArray[i];
                if(post.id == thisPost.id){
                    if(thisPost.user_liked){
                        thisPost.likes_count.aggregate--;
                        if(thisPost.likes_count.aggregate == 0){
                            thisPost.likes_count = null;
                        }
                    }
                    else{
                        if(thisPost.likes_count){
                            thisPost.likes_count.aggregate++;
                        }
                        else{
                            thisPost.likes_count = {aggregate: 1};
                        }
                    }
                    thisPost.user_liked = !thisPost.user_liked;
                }
            }
        }
        */
    }
})
// ref : https://github.com/dabit3/angular-easy-image-preloader
.factory('preloader', function( $q, $rootScope ) {
    // I manage the preloading of image objects. Accepts an array of image URLs.
    function Preloader( imageLocations ) {
        // I am the image SRC values to preload.
        this.imageLocations = imageLocations;
        // As the images load, we'll need to keep track of the load/error
        // counts when announing the progress on the loading.
        this.imageCount = this.imageLocations.length;
        this.loadCount = 0;
        this.errorCount = 0;
        // I am the possible states that the preloader can be in.
        this.states = {
            PENDING: 1,
            LOADING: 2,
            RESOLVED: 3,
            REJECTED: 4
        };
        // I keep track of the current state of the preloader.
        this.state = this.states.PENDING;
        // When loading the images, a promise will be returned to indicate
        // when the loading has completed (and / or progressed).
        this.deferred = $q.defer();
        this.promise = this.deferred.promise;
    }
    // ---
    // STATIC METHODS.
    // ---
    // I reload the given images [Array] and return a promise. The promise
    // will be resolved with the array of image locations.
    Preloader.preloadImages = function( imageLocations ) {
        var preloader = new Preloader( imageLocations );
        return( preloader.load() );
    };
    // ---
    // INSTANCE METHODS.
    // ---
    Preloader.prototype = {
        // Best practice for "instnceof" operator.
        constructor: Preloader,
        // ---
        // PUBLIC METHODS.
        // ---
        // I determine if the preloader has started loading images yet.
        isInitiated: function isInitiated() {
            return( this.state !== this.states.PENDING );
        },
        // I determine if the preloader has failed to load all of the images.
        isRejected: function isRejected() {
            return( this.state === this.states.REJECTED );
        },
        // I determine if the preloader has successfully loaded all of the images.
        isResolved: function isResolved() {
            return( this.state === this.states.RESOLVED );
        },
        // I initiate the preload of the images. Returns a promise.
        load: function load() {
            // If the images are already loading, return the existing promise.
            if ( this.isInitiated() ) {
                return( this.promise );
            }
            this.state = this.states.LOADING;
            for ( var i = 0 ; i < this.imageCount ; i++ ) {
                this.loadImageLocation( this.imageLocations[ i ] );
            }
            // Return the deferred promise for the load event.
            return( this.promise );
        },
        // ---
        // PRIVATE METHODS.
        // ---
        // I handle the load-failure of the given image location.
        handleImageError: function handleImageError( imageLocation ) {
            this.errorCount++;
            // If the preload action has already failed, ignore further action.
            if ( this.isRejected() ) {
                return;
            }
            this.state = this.states.REJECTED;
            this.deferred.reject( imageLocation );
        },
        // I handle the load-success of the given image location.
        handleImageLoad: function handleImageLoad( imageLocation ) {
            this.loadCount++;
            // If the preload action has already failed, ignore further action.
            if ( this.isRejected() ) {
                return;
            }
            // Notify the progress of the overall deferred. This is different
            // than Resolving the deferred - you can call notify many times
            // before the ultimate resolution (or rejection) of the deferred.
            this.deferred.notify({
                percent: Math.ceil( this.loadCount / this.imageCount * 100 ),
                imageLocation: imageLocation
            });
            // If all of the images have loaded, we can resolve the deferred
            // value that we returned to the calling context.
            if ( this.loadCount === this.imageCount ) {
                this.state = this.states.RESOLVED;
                this.deferred.resolve( this.imageLocations );
            }
        },
        // I load the given image location and then wire the load / error
        // events back into the preloader instance.
        // --
        // NOTE: The load/error events trigger a $digest.
        loadImageLocation: function loadImageLocation( imageLocation ) {
            var preloader = this;
            // When it comes to creating the image object, it is critical that
            // we bind the event handlers BEFORE we actually set the image
            // source. Failure to do so will prevent the events from proper
            // triggering in some browsers.
            // --
            // The below removes a dependency on jQuery, based on a comment
            // on Ben Nadel's original blog by user Adriaan:
            // http://www.bennadel.com/members/11887-adriaan.htm
            var image = angular.element( new Image() )
                .bind('load', function( event ) {
                    // Since the load event is asynchronous, we have to
                    // tell AngularJS that something changed.
                    $rootScope.$apply(
                        function() {
                            preloader.handleImageLoad( event.target.src );
                            // Clean up object reference to help with the
                            // garbage collection in the closure.
                            preloader = image = event = null;
                        }
                    );
                })
                .bind('error', function( event ) {
                    // Since the load event is asynchronous, we have to
                    // tell AngularJS that something changed.
                    $rootScope.$apply(
                        function() {
                            preloader.handleImageError( event.target.src );
                            // Clean up object reference to help with the
                            // garbage collection in the closure.
                            preloader = image = event = null;
                        }
                    );
                })
                .attr( 'src', imageLocation )
            ;
        }
    };
    // Return the factory instance.
    return( Preloader );
});
