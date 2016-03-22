angular.module('starter.controllers', [])

.run(function($rootScope, $ionicTabsDelegate, $state) {
    $rootScope.clientVersion = '1.0';
    $rootScope.baseURL = 'http://localhost:8888';
    $rootScope.photoPath = function(file_name, size) {
        return helper_generatePhotoPath( $rootScope.baseURL, file_name, size );
    };
    $rootScope.currentTab = function(){
        return $ionicTabsDelegate.selectedIndex();
    };
    $rootScope.routeTab = function(id){
        var tab = 'notAssigned';
        switch(id){
            case 0:
                tab = 'home';
                break;
            case 1:
                tab = 'explore';
                break;
            case 3:
                tab = 'ranking';
                break;
            case 4:
                tab = 'account';
                break;
            default:
                tab = 'newTab';
        }
        return tab;
    };
    $rootScope.linkHashTag = function(str){
        if(str){
            var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
            str = str.replace(/(#[a-z\d-_]+)/ig, "<a href='#/tab/explore/$1/"+tab+"'>$1</a>");
            str = str.replace(/(\/#)/g, "/");
            return str;
        }
    };
    $rootScope.goPostDetail = function(id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-detail-'+tab,{postId: id});
    };
    $rootScope.goPostLikers = function(id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-likers-'+tab,{postId: id});
    };
    $rootScope.goMyAccount = function(){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-'+tab);
    };
    $rootScope.goAccount = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-'+tab,{accountSlug: slug});
    };
    $rootScope.goSchoolDetail = function(id, name){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.school-detail-'+tab,{schoolId: id, schoolName: name});
    };
    $rootScope.goAccountFollowing = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-following-'+tab,{userSlug: slug});
    };
    $rootScope.goAccountFollower = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-follower-'+tab,{userSlug: slug});
    };
    $rootScope.goAccountLiked = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-liked-'+tab,{userSlug: slug});
    };
    $rootScope.goAccountNotification = function(){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-notification-'+tab);
    };
    $rootScope.handleHttpError = function(error){
        if(typeof (error.error) != undefined && error.error == "token_not_provided"){
            $state.go('auth');
        }
        else if(typeof (error.data) != undefined && typeof (error.data.error) != undefined && error.data.error == "token_not_provided"){
            $state.go('auth');
        }
    };
    $rootScope.getCurrentUser = function(){
        var user = JSON.parse(localStorage.getItem('user'));
        if(user){
            return user;
        }
        $state.go('auth');
    }
    $rootScope.showNotification = function(){
        var exception = 'auth, register, register2';
        if(exception.indexOf($state.current.name) > -1){
            return false;
        }
        return true;
    };
})


.controller('RegisterCtrl', function($scope, $ionicHistory, $state, $rootScope, $http, $auth, $ionicLoading) {

    $scope.register = function(){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });

        $state.go('register2');
    }
    $scope.fbLogin = function() {
        $ionicLoading.show();
        $auth.authenticate('facebook').then(function() {
            // Return an $http request for the authenticated user
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $ionicLoading.hide();

                $state.go('tab.home');
            })
            .error(function(){
                $scope.loginError = true;
                $scope.loginErrorText = error.data.error;
                console.log($scope.loginErrorText);
            })
        });
    };
})

.controller('Register2Ctrl', function($scope) {

})

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope, $ionicLoading) {

    $scope.loginData = {};
    $scope.loginError = false;
    $scope.loginErrorText;

    $scope.login = function() {

        $ionicLoading.show();

        var credentials = {
            email: $scope.loginData.email,
            password: $scope.loginData.password
        }

        $auth.login(credentials).then(function() {
            // Return an $http request for the authenticated user
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $ionicLoading.hide();

                $state.go('tab.home');
            })
            .error(function(){
                $scope.loginError = true;
                $scope.loginErrorText = error.data.error;
                console.log($scope.loginErrorText);
            })
        });
    };

    $scope.fbLogin = function() {
        $ionicLoading.show();
        $auth.authenticate('facebook').then(function() {
            // Return an $http request for the authenticated user
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $ionicLoading.hide();

                $state.go('tab.home');
            })
            .error(function(){
                $scope.loginError = true;
                $scope.loginErrorText = error.data.error;
                console.log($scope.loginErrorText);
            })
        });
    };

})

.controller('HomeCtrl', function($scope, FetchPosts, $http, Modified, $state, $rootScope) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.noResult = false;
/*
$scope.test = Modified.get();
if($scope.test.index > -1){
    $scope.posts[$scope.test.index].likes_count.aggregate++;
}
console.log($scope.test);
*/
    FetchPosts.following($scope.page).then(function(posts){
        if(posts && posts.length == 0){
            $scope.noResult = true;
        }
        $scope.posts = posts;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchPosts.following($scope.page).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.following($scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
            $scope.noResult = false;
            if(posts.length == 0){
                $scope.noResult = true;
            }
        });
    };
    $scope.likeClicked = function($event,post){
        $event.preventDefault();
        if(post.user_liked){
            post.likes_count.aggregate--;
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/unlike').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            post.likes_count.aggregate++;
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/like').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        post.user_liked = !post.user_liked;
    };
    $scope.commentsPage = function(id){
        $state.go('tab.post-comments-home',{postId: id});
    };
})

.controller('PostLikersCtrl', function($scope, $stateParams, $http, $location, FetchUsers, $rootScope) {
    $scope.likes = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    var user = $rootScope.getCurrentUser();

    FetchUsers.liker($stateParams.postId, $scope.page).then(function(likes){
        $scope.likes = likes;
        $scope.page++;
    });
    $scope.loadMore = function() {
        FetchUsers.liker($stateParams.postId, $scope.page).then(function(likes){
            $scope.likes = $scope.likes.concat(likes);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( likes.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.followToggle = function(like) {
        if(like.user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ like.user.slug +'/unfollow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ like.user.slug +'/follow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        like.user.following_check = !like.user.following_check;
    };
    $scope.notMe = function(like) {
        return (like.user.id != user.id);
    };
})

.controller('PostDetailCtrl', function($scope, $stateParams, FetchPosts, $http, Focus, $rootScope, Modified, $ionicActionSheet) {
    $scope.post = 0; // sloppy hack for not loaded check
    $scope.comment = {};
    $scope.liked = false;
    $scope.saved = false;
    $scope.likesCount = 0;
    $scope.commentsHiddenCount = 0;
    $scope.page = 2;
    $scope.clientVersionUpToDate = true;
    $scope.commentSubmitting = false;
    var user = $rootScope.getCurrentUser();
/*
var test = Modified.get();
test.index = 0;
test.like = 1;
console.log(test);
*/
    $http.get($rootScope.baseURL+'/api/latest/client/version').success(function(version){
        if(version != $rootScope.clientVersion){
            $scope.clientVersionUpToDate = false;
        }
    });
    FetchPosts.get($stateParams.postId).then(function(post){
        post.latest_ten_comments.reverse();
        var commentsCount = 0;
        if(post.comments_count){
            commentsCount = post.comments_count.aggregate;
        }
        $scope.commentsHiddenCount = commentsCount - post.latest_ten_comments.length;
        $scope.post = post;
        if(post.user_liked){
            $scope.liked = true;
        }
        if(post.likes_count){
            $scope.likesCount = post.likes_count.aggregate;
        }
    });
    $scope.submitComment = function(){
        $scope.commentSubmitting = true;
        $http({
            method : 'POST',
            url : $rootScope.baseURL+'/api/post/'+$scope.post.id+'/comment/create',
            data : {comment:$scope.comment.content}
        })
        .success(function(response){
            response.user = user;
            $scope.post.latest_ten_comments.push(response);
            $scope.commentSubmitting = false;
            $('.dynamic-comment-count#'+$scope.post.id).html(parseInt($('.dynamic-comment-count#'+$scope.post.id).html(), 10)+1);
        })
        .error(function(error){
            $rootScope.handleHttpError(error);
        });
        $scope.comment.content = '';
    };
    $scope.remComment = function($index){
        $http.get($rootScope.baseURL+'/api/comment/'+$scope.post.latest_ten_comments[$index].id+'/delete').success(function(){
            $scope.post.latest_ten_comments.splice($index, 1);
            $('.dynamic-comment-count#'+$scope.post.id).html(parseInt($('.dynamic-comment-count#'+$scope.post.id).html(), 10)-1);
        })
        .error(function(error){
            $rootScope.handleHttpError(error);
        });
    };
    $scope.loadMoreComments = function(){
        if($scope.commentsHiddenCount > 0){
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/comment?page='+$scope.page).success(function(response){
                $scope.post.latest_ten_comments = response.data.reverse().concat($scope.post.latest_ten_comments);
                $scope.commentsHiddenCount -= response.data.length;
                if($scope.commentsHiddenCount < 0){
                    $scope.commentsHiddenCount = 0;
                }
                $scope.page++;
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
    };
    $scope.ownComment = function($index){
        return user.id == $scope.post.latest_ten_comments[$index].user.id;
    };
    $scope.ownPost = function(){
        if($scope.post){
            return user.id == $scope.post.user.id;
        }
    };
    $scope.focusComment = function(){
        Focus('comment');
    };
    $scope.likeClicked = function(){
        if($scope.liked){
            $scope.likesCount--;
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/unlike').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $scope.likesCount++;
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/like').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        $scope.liked = !$scope.liked;
    };
    $scope.moreOption = function(){
        $ionicActionSheet.show({
            titleText: 'More Options',
            buttons: [
                { text: 'Edit' },
            ],
            destructiveText: 'Delete',
            cancelText: 'Cancel',
            cancel: function() {
                console.log('CANCELLED');
            },
            buttonClicked: function(index) {
                console.log('BUTTON CLICKED', index);
                return true;
            },
            destructiveButtonClicked: function() {
                console.log('DESTRUCT');
                return true;
            }
        });
    };
    /*
    $scope.saveClicked = function(){
        if($scope.liked){
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/unsave').success(function(){
            })
             .error(function(error){
                $rootScope.handleHttpError(error);
             });
        }
        else{
            $http.post($rootScope.baseURL+'/api/post/'+$scope.post.id+'/save').success(function(){
            })
             .error(function(error){
                $rootScope.handleHttpError(error);
             });
        }
        $scope.saved = !$scope.saved;
    };
    */
})

.controller('PostExploreCtrl', function($scope, FetchPosts, $stateParams, $state, Focus, $ionicTabsDelegate) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.new($scope.page, $stateParams.searchTerm).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
    $scope.submitSearch = function(search_term) {
        $state.go('tab.explore-explore',{searchTerm: search_term});
    };
    $scope.noSearchTerm = function() {
       return !$stateParams.searchTerm;
    };
    $scope.focusSearch = function(){
        Focus('search');
    }
    $scope.tagSearchTerm = function(){
        if($stateParams.searchTerm){
            var temp = $stateParams.searchTerm.split(' ');
            return '#'+temp.join(' #');
        }
    }
})

.controller('RankingCtrl', function($scope, FetchSchools) {
    $scope.schools = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchSchools.ranking($scope.page).then(function(schools){
        $scope.schools = schools;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchSchools.ranking($scope.page).then(function(schools){
            $scope.schools = $scope.schools.concat(schools);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( schools.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchSchools.ranking($scope.page).then(function(schools){
            $scope.schools = schools;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
})

.controller('SchoolCtrl', function($scope, FetchPosts, $stateParams) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    $scope.schoolName = $stateParams.schoolName;

    FetchPosts.school($scope.page, $stateParams.schoolId).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchPosts.school($scope.page, $stateParams.schoolId).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.school($scope.page, $stateParams.schoolId).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
})

.controller('AccountCtrl', function($scope, $stateParams, FetchUsers, FetchPosts, $http, $state, $rootScope) {
    $scope.page = 1;
    $scope.isMyAccount = false;
    $scope.posts = [];
    $scope.noMoreItemsAvailable = false;

    var user = $rootScope.getCurrentUser();
    if (!$stateParams.accountSlug)
    {
        var slug = user.slug;
        $scope.isMyAccount = true;
    }
    else
    {
        var slug = $stateParams.accountSlug;
    }

    FetchUsers.get(slug).then(function(user){
        $scope.user = user;
    });
    FetchPosts.user(slug, $scope.page).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
    });
    $scope.goAccountOption = function(id){
        $state.go('tab.option-account',{userId: id});
    };
    $scope.goAccountSocialNetwork = function(type){
        if (type == 'facebook')
        {
            window.open('https://www.facebook.com/'+$scope.user.social_networks.facebook, '_system');
        }
        else if (type == 'twitter')
        {
            window.open('https://www.twitter.com/'+$scope.user.social_networks.twitter, '_system');
        }
        else if (type == 'instagram')
        {
            window.open('https://www.instagram.com/'+$scope.user.social_networks.instagram, '_system');
        }
        else if (type == 'pinterest')
        {
            window.open('https://www.pinterest.com/'+$scope.user.social_networks.pinterest, '_system');
        }
    };
    $scope.followToggle = function(like) {
        if(like.following_check){
            $http.get('http://localhost:8000/api/'+ like.slug +'/unfollow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else {
            $http.get('http://localhost:8000/api/'+ like.slug +'/follow').success(function(){
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        like.following_check = !like.following_check;
    };
    $scope.notMe = function(like) {
        return !$scope.isMyAccount;
    };
    $scope.loadMore = function() {
        FetchPosts.user(slug, $scope.page).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.user(slug, $scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
})
.controller('OptionCtrl', function($scope, $stateParams, $http, $state, $location) {
})
.controller('FollowingCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope) {
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchUsers.following($stateParams.userSlug, $scope.page).then(function(users){
        $scope.users = users;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchUsers.following($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = $scope.users.concat(users);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( users.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchUsers.following($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)-1);
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)+1);
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        user.following_check = !user.following_check;
    };
})
.controller('FollowerCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope) {
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(users){
        $scope.users = users;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = $scope.users.concat(users);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( users.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchUsers.follower($stateParams.userSlug, $scope.page).then(function(users){
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)-1);
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){
                $('.dynamic-following-count').html(parseInt($('.dynamic-following-count').html(), 10)+1);
            })
            .error(function(error){
                $rootScope.handleHttpError(error);
            });
        }
        user.following_check = !user.following_check;
    };
})
.controller('LikedCtrl', function($scope, $stateParams, FetchPosts) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchPosts.liked($stateParams.userSlug, $scope.page).then(function(posts){
        $scope.posts = posts;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchPosts.liked($stateParams.userSlug, $scope.page).then(function(posts){
            $scope.posts = $scope.posts.concat(posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( posts.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchPosts.liked($stateParams.userSlug, $scope.page).then(function(posts){
            $scope.posts = posts;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
})
.controller('NotificationCtrl', function($scope, FetchNotifications, $rootScope) {
    var user = $rootScope.getCurrentUser();
    $scope.notifications = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchNotifications.new(user.slug, $scope.page).then(function(notifications){
        $scope.notifications = notifications;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchNotifications.new(user.slug, $scope.page).then(function(notifications){
            $scope.notifications = $scope.notifications.concat(notifications);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.page++;
            if ( notifications.length == 0 ) {
                $scope.noMoreItemsAvailable = true;
            }
        });
    };
    $scope.doRefresh = function() {
        $scope.page = 1;
        FetchNotifications.new(user.slug, $scope.page).then(function(notifications){
            $scope.notifications = notifications;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
});
