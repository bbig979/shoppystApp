angular.module('starter.controllers', [])

.run(function($rootScope, $ionicTabsDelegate, $state, $cordovaImagePicker, $ionicPlatform) {
    $rootScope.clientVersion = '1.0';
    $rootScope.baseURL = 'http://localhost:8000';
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
    }
    $rootScope.goPostLikers = function(id){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.post-likers-'+tab,{postId: id});
    }

    $rootScope.goAccount = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-'+tab,{accountSlug: slug});
    };

    $rootScope.goSchoolDetail = function(id, name){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.school-detail-'+tab,{schoolId: id, schoolName: name});
    }
    $rootScope.goAccountFollowing = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-following-'+tab,{userSlug: slug});
    }
    $rootScope.goAccountFollower = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-follower-'+tab,{userSlug: slug});
    }
    $rootScope.goAccountLiked = function(slug){
        var tab = $rootScope.routeTab($ionicTabsDelegate.selectedIndex());
        $state.go('tab.account-liked-'+tab,{userSlug: slug});
    }
    $rootScope.goAccountOption = function(id){
        $state.go('tab.option-account',{userId: id});
    };



    function UploadPicture(imageURI) {
        $rootScope.PicSourece  = document.getElementById('smallimage');
        if (imageURI.substring(0,21)=="content://com.android") {
            var photo_split=imageURI.split("%3A");
            imageURI="content://media/external/images/media/"+photo_split[1];
        }
        $rootScope.ImageURI =  imageURI;
        $rootScope.PicSourece.src = $rootScope.ImageURI;
        $rootScope.apply();
    }
    $rootScope.openCamera = function(){
        var options = {
            maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
            width: 800,
            height: 800,
            quality: 100            // Higher is better
        };
     
        $cordovaImagePicker.getPictures(options).then(function (results) {
                    // Loop through acquired images
            for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]);   // Print image URI
            }
        }, function(error) {
            console.log('Error: ' + JSON.stringify(error));    // In case of error
        });
    }
})

.controller('AuthCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope) {

    $scope.loginData = {}
    $scope.loginError = false;
    $scope.loginErrorText;

    $scope.login = function() {

        var credentials = {
            email: $scope.loginData.email,
            password: $scope.loginData.password
        }

        console.log(credentials);

        $auth.login(credentials).then(function() {
            // Return an $http request for the authenticated user
            $http.get($rootScope.baseURL+'/api/authenticate/user').success(function(response){
                // Stringify the retured data
                var user = JSON.stringify(response.user);

                // Set the stringified user data into local storage
                localStorage.setItem('user', user);

                // Getting current user data from local storage
                $rootScope.currentUser = response.user;
                // $rootScope.currentUser = localStorage.setItem('user');;

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $state.go('tab.home');
            })
                .error(function(){
                    $scope.loginError = true;
                    $scope.loginErrorText = error.data.error;
                    console.log($scope.loginErrorText);
                })
        });
    }

    $scope.authenticate = function(provider) {
        $auth.authenticate(provider);
    };

})
.controller('AuthLogoutCtrl', function($scope, $location, $stateParams, $ionicHistory, $http, $state, $auth, $rootScope) {
    $auth.logout();
    $state.go('tab.home');
})
.controller('HomeCtrl', function($scope, FetchPosts, $http, Modified, $state, $rootScope) {
    $scope.posts = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
/*
$scope.test = Modified.get();
if($scope.test.index > -1){
    $scope.posts[$scope.test.index].likes_count.aggregate++;
}
console.log($scope.test);
*/
    FetchPosts.following($scope.page).then(function(posts){
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
        });
    };
    $scope.likeClicked = function($event,post){
        $event.preventDefault();
        if(post.user_liked){
            post.likes_count.aggregate--;
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/unlike').success(function(){
            });
        }
        else{
            post.likes_count.aggregate++;
            $http.get($rootScope.baseURL+'/api/post/'+post.id+'/like').success(function(){
            });
        }
        post.user_liked = !post.user_liked;
    };
    $scope.commentsPage = function(id){
        $state.go('tab.post-comments-home',{postId: id});
    };
})

.controller('PostLikersCtrl', function($scope, $stateParams, $http, $location, FetchLikers, $rootScope) {
    $scope.likes = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;
    var user = JSON.parse(localStorage.getItem('user'));

    FetchLikers.all($stateParams.postId, $scope.page).then(function(likes){
        $scope.likes = likes;
        $scope.page++;
    });
    $scope.loadMore = function() {
        FetchLikers.all($stateParams.postId, $scope.page).then(function(likes){
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
            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ like.user.slug +'/follow').success(function(){
            });
        }
        like.user.following_check = !like.user.following_check;
    };
    $scope.notMe = function(like) {
        return (like.user.id != user.id);
    };
})

.controller('PostDetailCtrl', function($scope, $stateParams, FetchPosts, $http, Focus, $rootScope, Modified) {
    $scope.post = 0; // sloppy hack for not loaded check
    $scope.comment = {};
    $scope.liked = false;
    $scope.saved = false;
    $scope.likesCount = 0;
    $scope.commentsHiddenCount = 0;
    $scope.page = 2;
    $scope.clientVersionUpToDate = true;
    var user = JSON.parse(localStorage.getItem('user'));
/*
var test = Modified.get();
test.index = 0;
test.like = 1;
console.log(test);
*/
    $http.get($rootScope.baseURL+'/api/latest/client/version').success(function(version){
        if(version != $rootScope.clientVersion){
            $scope.clientVersionUpToDate = false;
            console.log('update');
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
        $http({
            method : 'POST',
            url : $rootScope.baseURL+'/api/post/'+$scope.post.id+'/comment/create',
            data : {comment:$scope.comment.content}
        })
        .success(function(response){
            response.user = user;
            $scope.post.latest_ten_comments.push(response);
        });
        $scope.comment.content = '';
    };
    $scope.remComment = function($index){
        $http.get($rootScope.baseURL+'/api/comment/'+$scope.post.latest_ten_comments[$index].id+'/delete').success(function(){
            $scope.post.latest_ten_comments.splice($index, 1);
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
            });
        }
    };
    $scope.ownComment = function($index){
        return user.id == $scope.post.latest_ten_comments[$index].user.id;
    };
    $scope.focusComment = function(){
        Focus('comment');
    };
    $scope.likeClicked = function(){
        if($scope.liked){
            $scope.likesCount--;
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/unlike').success(function(){
            });
        }
        else{
            $scope.likesCount++;
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/like').success(function(){
            });
        }
        $scope.liked = !$scope.liked;
    };
    $scope.loadProfile = function(slug){
        //$location.path('#/tab/home');
    };
    /*
    $scope.saveClicked = function(){
        if($scope.liked){
            $http.get($rootScope.baseURL+'/api/post/'+$scope.post.id+'/unsave').success(function(){
            });
        }
        else{
            $http.post($rootScope.baseURL+'/api/post/'+$scope.post.id+'/save').success(function(){
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

.controller('AccountCtrl', function($scope, $stateParams, FetchUser, FetchUserPosts, $http, $state, $location) {
    $scope.page = 1;
    $scope.isMyAccount = false;
    var user = JSON.parse(localStorage.getItem('user'));
    if (!$stateParams.accountSlug)
    {
        var slug = user.slug;
        $scope.isMyAccount = true;
    }
    else
    {
        var slug = $stateParams.accountSlug;
    }

    FetchUser.get(slug).then(function(user){
        $scope.user = user;
    });
    FetchUserPosts.get(slug, $scope.page).then(function(posts){
        $scope.posts = posts;
    });
    $scope.goChangeProfilePicture = function(){
        $state.go('tab.change-profile-picture');
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
            });
        }
        else {
            $http.get('http://localhost:8000/api/'+ like.slug +'/follow').success(function(){
            });
        }
        like.following_check = !like.following_check;
    };
    $scope.notMe = function(like) {
        return !$scope.isMyAccount;
    };
})
.controller('OptionCtrl', function($scope, $stateParams, $http, $state, $location, $ionicPopup) {
    $scope.goAccountEdit = function(id){
        $state.go('tab.edit-account');
    };
    $scope.goFindFriends = function(id){
        $state.go('tab.find-friends');
    };
    $scope.goInviteFriends = function(id){
        $state.go('tab.invite-friends');
    };
    $scope.goChangePassword = function(id){
        $state.go('tab.change-password');
    };
    $scope.logout = function(id){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Log Out',
            template: 'Are you sure to log out?'
        });

        confirmPopup.then(function(res) {
            if(res) {
                $state.go('auth.logout');
            }
        });


        
    };
})
.controller('AccountEditCtrl', function($scope, $stateParams, FetchUser, $http, $state, $location, $rootScope, $ionicPopup) {
    var user = JSON.parse(localStorage.getItem('user'));
    FetchUser.get(user.slug).then(function(user){
        $scope.user = user;
        var data = { first_name : $scope.user.first_name,
            first_name : $scope.user.first_name,
            last_name : $scope.user.last_name,
            slug : $scope.user.slug,
            facebook : $scope.user.social_networks.facebook,
            twitter : $scope.user.social_networks.twitter,
            instagram : $scope.user.social_networks.instagram,
            pinterest : $scope.user.social_networks.pinterest
        };
        $scope.user_info = data;
    });

    $scope.updateProfile = function(user){
        Object.toparams = function ObjecttoParams(obj)
        {
            var p =[];
            for (var key in obj)
            {
                p.push(key + '=' + encodeURIComponent(obj[key]));
            }
            return p.join('&');
        };

        $http({
            url: $rootScope.baseURL + '/api/' + $scope.user.slug + '/edit',
            method: "POST",
            data: Object.toparams(user),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data, status, headers, config)
        {
            var alertPopup = $ionicPopup.alert({
                title: 'Profile Has been updated',
                template: 'Profile Has been updated'
            });
            $ionicHistory.goBack();
        }).error(function (data, status, headers, config) 
        {
            var alertPopup = $ionicPopup.alert({
                title: 'Error Occurred. Try Again.',
                template: 'Error Occurred. Try Again.'
            });
        });
    };
})
.controller('ChangePasswordCtrl', function($scope, $stateParams, $http, $state, $location, $ionicPopup, $rootScope) {
    var user = JSON.parse(localStorage.getItem('user'));
    $scope.changePassword = function(pwd){
        Object.toparams = function ObjecttoParams(obj)
        {
            var p =[];
            for (var key in obj)
            {
                p.push(key + '=' + encodeURIComponent(obj[key]));
            }
            return p.join('&');
        };

        $http({
            url: $rootScope.baseURL + '/api/' + user.slug + '/password/edit',
            method: "POST",
            data: Object.toparams(pwd),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data, status, headers, config)
        {
            var alertPopup = $ionicPopup.alert({
                title: 'Profile Has been updated',
                template: 'Profile Has been updated'
            });
            $ionicHistory.goBack();
        }).error(function (data, status, headers, config) 
        {
            console.log(status);
            var alertPopup = $ionicPopup.alert({
                title: 'Error Occurred. Try Again.',
                template: 'Error Occurred. Try Again.'
            });
        });
    };
})
.controller('ChangeProfilePictureCtrl', function($scope, $stateParams, $http, $state, $location, $ionicPopup) {
})
.controller('FindFriendsCtrl', function($scope, $stateParams, FetchUsers, $http, $rootScope) {
    $scope.users = [];
    $scope.page = 1;
    $scope.noMoreItemsAvailable = false;

    FetchUsers.findFriends($scope.page).then(function(users){
        $scope.users = users;
        $scope.page++;
    });

    $scope.loadMore = function() {
        FetchUsers.findFriends($scope.page).then(function(users){
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
        FetchUsers.findFriends($scope.page).then(function(users){
            $scope.users = users;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.page++;
            $scope.noMoreItemsAvailable = false;
        });
    };
    $scope.followToggle = function(user) {
        if(user.following_check){
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/unfollow').success(function(){

            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){

            });
        }
        user.following_check = !user.following_check;
    };
})
.controller('InviteFriendsCtrl', function($scope, $stateParams, $http, $state, $location, $ionicPopup, $rootScope, $ionicHistory) {
    $scope.sendInvitation = function(email){
        param = {'email' : email};
        Object.toparams = function ObjecttoParams(obj)
        {
            var p =[];
            for (var key in obj)
            {
                p.push(key + '=' + encodeURIComponent(obj[key]));
            }
            return p.join('&');
        };
        $http({
            url: $rootScope.baseURL + '/api/invite-friends',
            method: "POST",
            data: Object.toparams(param),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data, status, headers, config)
        {
            var alertPopup = $ionicPopup.alert({
                title: 'Invitation has been sent',
                template: 'Invitation has been sent'
            });
            $ionicHistory.goBack();
        }).error(function (data, status, headers, config) 
        {
            var alertPopup = $ionicPopup.alert({
                title: 'Error Occurred. Try Again.',
                template: 'Error Occurred. Try Again.'
            });
            $ionicHistory.goBack();
        });
    };
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

            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){

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

            });
        }
        else{
            $http.get($rootScope.baseURL+'/api/'+ user.slug +'/follow').success(function(){

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
});
